import axios from 'axios';
import type User from '../models/User';
import type AnalysisResult from '../models/AnalysisResult';
import { retryWithBackoff } from './retryWithBackoff';

export interface ChatTurn {
  role: 'user' | 'assistant';
  content: string;
}

interface GenerateChatReplyInput {
  message: string;
  history: ChatTurn[];
  user: InstanceType<typeof User>;
  latestAnalysis?: InstanceType<typeof AnalysisResult> | null;
}

type CommandIntent = 'explain_result' | 'summarize_case' | 'next_step' | 'urgent_care' | 'general';

interface TriageResult {
  level: 'emergency' | 'urgent' | 'routine';
  matchedSignals: string[];
}

const GROQ_API_KEY = process.env.GROQ_API_KEY || '';
const GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || '';
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || 'google/gemma-3-27b-it:free';
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://morgans-hope.vercel.app';

const detectArabic = (text: string) => /[\u0600-\u06FF]/.test(text);

const normalizeText = (text: string) => text.trim().toLowerCase();

const formatPercent = (value?: number | string | null) => {
  const num = Number(value);
  if (Number.isNaN(num)) return null;
  return `${Math.round(num * 100)}%`;
};

const summarizeUser = (user: InstanceType<typeof User>, ar: boolean) => {
  const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim();
  const parts = [
    fullName || null,
    user.age ? (ar ? `العمر ${user.age}` : `age ${user.age}`) : null,
    user.gender ? (ar ? `النوع ${user.gender}` : `gender ${user.gender}`) : null,
    user.smokingHistory ? (ar ? `تاريخ التدخين ${user.smokingHistory}` : `smoking history ${user.smokingHistory}`) : null,
    user.medicalHistory ? (ar ? `التاريخ المرضي: ${user.medicalHistory}` : `medical history: ${user.medicalHistory}`) : null,
  ].filter(Boolean);

  return parts.join(ar ? '، ' : ', ');
};

const summarizeAnalysis = (analysis?: InstanceType<typeof AnalysisResult> | null, ar = false) => {
  if (!analysis) {
    return ar ? 'لا توجد نتيجة تحليل حديثة مرتبطة بالمستخدم.' : 'There is no recent scan result linked to this user.';
  }

  const confidence = formatPercent(analysis.confidence) || (ar ? 'غير متاح' : 'not available');

  if (ar) {
    return [
      `آخر تحليل: نوع الصورة ${analysis.imageType || 'غير محدد'}`,
      `التصنيف ${analysis.classification || 'غير متاح'}`,
      `الثقة ${confidence}`,
      analysis.isMalignant
        ? 'الحالة تبدو عالية الخطورة وتحتاج متابعة سريعة'
        : analysis.hasFindings
          ? 'توجد ملاحظات تحتاج متابعة'
          : 'لا توجد ملاحظات خطيرة واضحة',
    ].join('، ');
  }

  return [
    `Latest analysis: ${analysis.imageType || 'unspecified'} scan`,
    `classification ${analysis.classification || 'unavailable'}`,
    `confidence ${confidence}`,
    analysis.isMalignant
      ? 'the case looks high risk and needs prompt follow-up'
      : analysis.hasFindings
        ? 'there are findings that need follow-up'
        : 'there are no obvious high-risk findings',
  ].join(', ');
};

const inferConversationMemory = (history: ChatTurn[], ar: boolean) => {
  const recentUserMessages = history
    .filter((item) => item.role === 'user')
    .slice(-6)
    .map((item) => item.content.trim())
    .filter(Boolean);

  if (!recentUserMessages.length) {
    return ar ? 'لا توجد ذاكرة محادثة سابقة مهمة.' : 'No important prior conversation memory.';
  }

  const joined = normalizeText(recentUserMessages.join(' '));
  const topics: string[] = [];

  if (/result|analysis|report|scan|نتيجة|تحليل|تقرير|أشعة/.test(joined)) {
    topics.push(ar ? 'سأل من قبل عن نتيجة التحليل أو التقرير' : 'previously asked about scan results or reports');
  }
  if (/symptom|symptoms|cough|breath|pain|fever|blood|عرض|أعراض|سعال|كحة|تنفس|ضيق|ألم|حمى|دم/.test(joined)) {
    topics.push(ar ? 'تحدث من قبل عن أعراض أو علامات تقلقه' : 'previously discussed symptoms or warning signs');
  }
  if (/use|upload|platform|website|رفع|استخدم|منصة|موقع/.test(joined)) {
    topics.push(ar ? 'طلب مساعدة في استخدام المنصة' : 'asked for help using the platform');
  }
  if (/doctor|urgent|emergency|طبيب|طوارئ|فورا|فوراً|عاجل/.test(joined)) {
    topics.push(ar ? 'كان مهتما بمعرفة متى يحتاج لمراجعة طبية عاجلة' : 'was concerned about when urgent medical review is needed');
  }

  const lastUserMessage = recentUserMessages[recentUserMessages.length - 1];
  const lastSnippet = lastUserMessage.length > 140 ? `${lastUserMessage.slice(0, 137)}...` : lastUserMessage;

  if (!topics.length) {
    return ar ? `آخر ما قاله المستخدم: ${lastSnippet}` : `Most recent user context: ${lastSnippet}`;
  }

  return ar
    ? `ذاكرة المحادثة: ${topics.join('، ')}. آخر رسالة للمستخدم: ${lastSnippet}`
    : `Conversation memory: ${topics.join(', ')}. Latest user message: ${lastSnippet}`;
};

const inferCommandIntent = (message: string): CommandIntent => {
  const text = normalizeText(message);

  if (/explain.*result|explain.*analysis|شرح.*نتيجة|اشرح.*نتيجة|اشرح.*تحليل|شرح.*تحليل/.test(text)) {
    return 'explain_result';
  }
  if (/summarize.*case|summarize.*status|summary|لخص.*حالتي|لخص.*وضعي|ملخص.*حالتي|تلخيص.*حالتي/.test(text)) {
    return 'summarize_case';
  }
  if (/next step|what should i do|what do i do now|الخطوة التالية|ماذا أفعل الآن|اعمل ايه|اعمل ماذا/.test(text)) {
    return 'next_step';
  }
  if (/urgent|emergency|go to hospital|seek care|طوارئ|عاجل|مستشفى|أراجع الطبيب فور|متى أراجع الطبيب/.test(text)) {
    return 'urgent_care';
  }

  return 'general';
};

const detectTriage = (message: string, history: ChatTurn[]): TriageResult => {
  const text = normalizeText(
    [history.filter((item) => item.role === 'user').slice(-2).map((item) => item.content).join(' '), message]
      .filter(Boolean)
      .join(' ')
  );

  const emergencySignals = [
    { pattern: /coughing blood|blood in sputum|نفث دم|سعال دم|كحة دم|دم مع الكحة/, label: 'blood' },
    { pattern: /can'?t breathe|unable to breathe|severe shortness of breath|اختناق|مش عارف اتنفس|ضيق نفس شديد/, label: 'breathing difficulty' },
    { pattern: /blue lips|confused|passed out|fainted|إغماء|فقدان وعي|ازرقاق/, label: 'critical instability' },
    { pattern: /severe chest pain|crushing chest pain|ألم صدر شديد/, label: 'severe chest pain' },
  ];

  const urgentSignals = [
    { pattern: /persistent cough|chronic cough|سعال مستمر|كحة مستمرة/, label: 'persistent cough' },
    { pattern: /shortness of breath|ضيق نفس/, label: 'shortness of breath' },
    { pattern: /unexplained weight loss|فقدان وزن غير مبرر/, label: 'weight loss' },
    { pattern: /fever|حمى|حرارة/, label: 'fever' },
    { pattern: /hoarseness|بحة/, label: 'hoarseness' },
    { pattern: /smoker|smoking|مدخن|تدخين/, label: 'smoking exposure' },
  ];

  const matchedEmergency = emergencySignals.filter((item) => item.pattern.test(text)).map((item) => item.label);
  if (matchedEmergency.length) {
    return { level: 'emergency', matchedSignals: matchedEmergency };
  }

  const matchedUrgent = urgentSignals.filter((item) => item.pattern.test(text)).map((item) => item.label);
  if (matchedUrgent.length >= 2 || /urgent|عاجل|فورا|فوراً|طوارئ/.test(text)) {
    return { level: 'urgent', matchedSignals: matchedUrgent };
  }

  return { level: 'routine', matchedSignals: matchedUrgent };
};

const getCaseSummary = (
  ar: boolean,
  user: InstanceType<typeof User>,
  latestAnalysis?: InstanceType<typeof AnalysisResult> | null,
  triage?: TriageResult,
) => {
  const base = summarizeUser(user, ar) || (ar ? 'لا توجد بيانات كثيرة في الملف الشخصي.' : 'There is limited profile data available.');
  const analysisSummary = summarizeAnalysis(latestAnalysis, ar);

  if (ar) {
    return [
      'هذا ملخص حالتك الحالي:',
      `- بياناتك: ${base}`,
      `- آخر تحليل: ${analysisSummary}`,
      `- مستوى المتابعة الحالي: ${triage?.level === 'emergency'
        ? 'حالة تستدعي الطوارئ'
        : triage?.level === 'urgent'
          ? 'تحتاج مراجعة طبية قريبة'
          : 'لا توجد علامة طارئة واضحة من الرسالة الحالية'
      }`,
    ].join('\n');
  }

  return [
    'Here is your current case summary:',
    `- Profile: ${base}`,
    `- Latest analysis: ${analysisSummary}`,
    `- Current urgency: ${triage?.level === 'emergency'
      ? 'seek emergency care'
      : triage?.level === 'urgent'
        ? 'arrange prompt medical review'
        : 'no clear emergency signal from the current message'
    }`,
  ].join('\n');
};

const getExplainResultReply = (ar: boolean, analysis?: InstanceType<typeof AnalysisResult> | null) => {
  if (!analysis) {
    return ar
      ? 'لا أرى نتيجة تحليل حديثة في حسابك الآن. بعد رفع فحص مكتمل، أستطيع شرح النتيجة ومعنى التصنيف والخطوة التالية.'
      : 'I do not see a recent completed analysis in your account yet. Once you have one, I can explain the result, the classification, and the likely next step.';
  }

  const confidence = formatPercent(analysis.confidence) || (ar ? 'غير متاح' : 'not available');

  if (ar) {
    return [
      'هذا شرح مبسط لآخر نتيجة لديك:',
      `- نوع الفحص: ${analysis.imageType || 'غير محدد'}`,
      `- التصنيف: ${analysis.classification || 'غير متاح'}`,
      `- درجة الثقة: ${confidence}`,
      `- ماذا يعني هذا؟ ${analysis.isMalignant
        ? 'النتيجة تبدو مقلقة وتحتاج مراجعة سريعة مع طبيب مختص لتأكيدها.'
        : analysis.hasFindings
          ? 'هناك ملاحظات تحتاج متابعة طبية، لكنها ليست تشخيصًا نهائيًا وحدها.'
          : 'لا توجد إشارة عالية الخطورة واضحة في آخر تحليل، مع بقاء المتابعة الطبية حسب الأعراض.'
      }`,
      '- مهم: هذه أداة مساعدة ولا تغني عن تقييم الطبيب أو التقرير الرسمي.',
    ].join('\n');
  }

  return [
    'Here is a simple explanation of your latest result:',
    `- Scan type: ${analysis.imageType || 'unspecified'}`,
    `- Classification: ${analysis.classification || 'unavailable'}`,
    `- Confidence: ${confidence}`,
    `- What it likely means: ${analysis.isMalignant
      ? 'the result looks concerning and deserves prompt specialist review for confirmation.'
      : analysis.hasFindings
        ? 'there are findings worth medical follow-up, but this is not a final diagnosis by itself.'
        : 'there is no clearly high-risk signal in the latest analysis, while symptoms still matter.'
    }`,
    '- Important: this tool is supportive only and does not replace a physician or an official report.',
  ].join('\n');
};

const getNextStepReply = (
  ar: boolean,
  analysis?: InstanceType<typeof AnalysisResult> | null,
  triage?: TriageResult,
) => {
  if (triage?.level === 'emergency') {
    return ar
      ? 'بناءً على الأعراض المذكورة، الخطوة التالية هي طلب رعاية طارئة فورًا أو التوجه لأقرب طوارئ الآن، خاصة إذا كان هناك ضيق نفس شديد أو دم مع السعال أو ألم صدر شديد.'
      : 'Based on the symptoms mentioned, the next step is to seek emergency care now, especially if there is severe shortness of breath, coughing blood, or severe chest pain.';
  }

  if (triage?.level === 'urgent' || analysis?.isMalignant) {
    return ar
      ? [
        'الخطوة التالية الأنسب غالبًا:',
        '- احجز مراجعة قريبة مع طبيب صدرية أو أورام.',
        '- احتفظ بالتقرير أو صورة الفحص الأخيرة لعرضها على الطبيب.',
        '- اكتب الأعراض ومدة كل عرض وأي تاريخ تدخين أو مرض مزمن.',
        '- إذا ساء التنفس أو ظهر دم مع السعال، تحرك للطوارئ فورًا.',
      ].join('\n')
      : [
        'The most appropriate next step is usually:',
        '- Arrange a prompt visit with a pulmonologist or relevant specialist.',
        '- Keep your latest scan/report available for review.',
        '- Write down your symptoms, duration, smoking history, and chronic conditions.',
        '- If breathing worsens or blood appears with coughing, seek emergency care immediately.',
      ].join('\n');
  }

  if (analysis?.hasFindings) {
    return ar
      ? [
        'الخطوة التالية المقترحة:',
        '- راجع طبيبك خلال وقت قريب لقراءة النتيجة في سياق الأعراض.',
        '- تابع أي أعراض مستمرة مثل الكحة أو ضيق النفس أو نقص الوزن.',
        '- لو تحب، أقدر ألخص لك النتيجة بشكل أبسط قبل الزيارة.',
      ].join('\n')
      : [
        'Suggested next step:',
        '- Review the result with your doctor soon so it can be interpreted with your symptoms.',
        '- Monitor persistent symptoms such as cough, breathlessness, or weight loss.',
        '- If you want, I can simplify the result further before your visit.',
      ].join('\n');
  }

  return ar
    ? [
      'الخطوة التالية المقترحة:',
      '- استمر في المتابعة حسب الأعراض وتوصيات طبيبك.',
      '- إذا ظهر سعال مستمر أو ضيق نفس أو فقدان وزن غير مبرر، احجز مراجعة طبية.',
      '- أقدر أيضًا أشرح لك متى تصبح الأعراض مقلقة أكثر.',
    ].join('\n')
    : [
      'Suggested next step:',
      '- Continue routine follow-up based on your symptoms and your doctor’s advice.',
      '- If you develop persistent cough, shortness of breath, or unexplained weight loss, book a medical review.',
      '- I can also explain which warning signs should raise more concern.',
    ].join('\n');
};

const getUrgentCareReply = (ar: boolean, triage: TriageResult) => {
  if (triage.level === 'emergency') {
    return ar
      ? 'هناك مؤشرات مقلقة في رسالتك. إذا كان لديك ضيق نفس شديد، سعال مصحوب بدم، ألم صدر شديد، أو إغماء، فتوجه للطوارئ أو اطلب مساعدة طبية عاجلة الآن.'
      : 'Your message includes worrying signals. If you have severe shortness of breath, coughing blood, severe chest pain, or fainting, go to emergency care now.';
  }

  if (triage.level === 'urgent') {
    return ar
      ? 'الأعراض المذكورة تستحق مراجعة طبية قريبة خلال أقرب وقت، خصوصًا إذا كانت مستمرة أو تزداد سوءًا. لو ظهر ضيق نفس شديد أو دم مع السعال، تحرك للطوارئ فورًا.'
      : 'The symptoms mentioned deserve prompt medical review soon, especially if they are persistent or worsening. If severe shortness of breath or blood with coughing appears, seek emergency care immediately.';
  }

  return ar
    ? 'لا توجد علامة طارئة واضحة في الرسالة الحالية، لكن إذا ظهرت أعراض مثل ضيق نفس شديد، دم مع السعال، ألم صدر شديد، أو إغماء، فهذه مؤشرات تستدعي رعاية عاجلة.'
    : 'There is no clear emergency signal in the current message, but symptoms like severe shortness of breath, coughing blood, severe chest pain, or fainting should trigger urgent medical care.';
};

function buildSystemPrompt(
  ar: boolean,
  userSummary: string,
  analysisSummary: string,
  memorySummary: string,
  triage: TriageResult,
  intent: CommandIntent,
) {
  if (ar) {
    return [
      'أنت وكيل طبي ذكي داخل منصة Morgan\'s Hope.',
      'مهمتك تقديم مساعدة معلوماتية عملية ومطمئنة في مجال صحة الرئة دون إعطاء تشخيص نهائي.',
      'ركز على: شرح النتائج، تلخيص الحالة، اقتراح الخطوة التالية، فرز الأعراض الخطيرة، ومساعدة المستخدم في استخدام المنصة.',
      'قواعد صارمة:',
      '- لا تعطي تشخيصًا نهائيًا أو جرعات أدوية.',
      '- إذا ظهرت أعراض إنذارية خطيرة فاذكر الحاجة لمراجعة عاجلة أو طوارئ بوضوح.',
      '- استخدم سياق المستخدم وذاكرة المحادثة وآخر تحليل إن وجد.',
      '- إذا طلب المستخدم أمرًا واضحًا مثل شرح آخر نتيجة أو تلخيص الحالة أو الخطوة التالية، نفذ المطلوب مباشرة.',
      `ملخص المستخدم: ${userSummary || 'غير متوفر'}`,
      `ملخص آخر تحليل: ${analysisSummary}`,
      `ذاكرة المحادثة: ${memorySummary}`,
      `تصنيف الخطورة الحالي: ${triage.level}${triage.matchedSignals.length ? ` (${triage.matchedSignals.join(', ')})` : ''}`,
      `نية الرسالة الحالية: ${intent}`,
      'أسلوب الرد: عربي واضح، قصير نسبيًا، منظم بنقاط عند الحاجة، وعملي.',
    ].join('\n');
  }

  return [
    'You are the Morgan\'s Hope smart medical agent.',
    'Provide practical, calm, informational guidance focused on lung health without giving a final diagnosis.',
    'Focus areas: result explanation, case summarization, next-step guidance, triage for risky symptoms, and platform help.',
    'Hard rules:',
    '- Never provide a final diagnosis or medication dosing.',
    '- If red-flag symptoms are present, clearly advise urgent review or emergency care.',
    '- Use user context, conversation memory, and the latest analysis when available.',
    '- If the user requests a direct command like explain latest result, summarize my case, or suggest next step, fulfill it directly.',
    `User summary: ${userSummary || 'Unavailable'}`,
    `Latest analysis summary: ${analysisSummary}`,
    `Conversation memory: ${memorySummary}`,
    `Current triage: ${triage.level}${triage.matchedSignals.length ? ` (${triage.matchedSignals.join(', ')})` : ''}`,
    `Current intent: ${intent}`,
    'Response style: warm, concise, structured, and practical.',
  ].join('\n');
}

function getHeuristicReply(
  message: string,
  ar: boolean,
  user: InstanceType<typeof User>,
  analysis?: InstanceType<typeof AnalysisResult> | null,
  history: ChatTurn[] = [],
) {
  const text = normalizeText(message);
  const intent = inferCommandIntent(message);
  const triage = detectTriage(message, history);

  if (intent === 'explain_result') {
    return getExplainResultReply(ar, analysis);
  }

  if (intent === 'summarize_case') {
    return getCaseSummary(ar, user, analysis, triage);
  }

  if (intent === 'next_step') {
    return getNextStepReply(ar, analysis, triage);
  }

  if (intent === 'urgent_care') {
    return getUrgentCareReply(ar, triage);
  }

  if (/hello|hi|hey|مرحبا|اهلا|أهلا|السلام|ازيك|ازيكم/.test(text)) {
    return ar
      ? 'مرحبًا، أنا مساعد Morgan\'s Hope الذكي. أستطيع شرح آخر نتيجة، تلخيص حالتك، اقتراح الخطوة التالية، أو توضيح متى تحتاج مراجعة عاجلة.'
      : 'Hello, I am the Morgan\'s Hope smart assistant. I can explain your latest result, summarize your case, suggest the next step, or help clarify when urgent review is needed.';
  }

  if (/result|report|analysis|scan|نتيجة|تحليل|تقرير|أشعة/.test(text) && analysis) {
    return getExplainResultReply(ar, analysis);
  }

  if (/symptom|symptoms|cough|breath|pain|fever|blood|عرض|أعراض|سعال|كحة|تنفس|ضيق|ألم|حمى|دم/.test(text)) {
    return getUrgentCareReply(ar, triage);
  }

  if (/upload|how.*use|website|platform|رفع|استخدم|المنصة|الموقع/.test(text)) {
    return ar
      ? 'يمكنك استخدام المنصة برفع صورة CT أو X-ray من صفحة الرفع، ثم ستظهر النتيجة والتصنيف والتوصية التالية. وإذا أردت، أشرح لك أيضًا كيف تقرأ النتيجة أو ماذا تفعل بعدها.'
      : 'You can use the platform by uploading a CT or X-ray image from the upload page, then reviewing the result, classification, and recommended next step. I can also explain how to read the result or what to do after it.';
  }

  return ar
    ? 'أقدر أساعدك بشكل أدق إذا اخترت واحدًا من هذه الطلبات: شرح آخر نتيجة، تلخيص حالتي، اقتراح الخطوة التالية، أو متى أحتاج مراجعة عاجلة.'
    : 'I can help more precisely if you ask for one of these: explain my latest result, summarize my case, suggest the next step, or tell me when urgent care is needed.';
}

async function callGemini(systemPrompt: string, history: ChatTurn[], message: string) {
  const contents = [
    {
      role: 'user',
      parts: [{ text: systemPrompt }],
    },
    {
      role: 'model',
      parts: [{ text: 'Understood. I will respond as the Morgan\'s Hope smart medical assistant.' }],
    },
    ...history.slice(-10).map((item) => ({
      role: item.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: item.content }],
    })),
    {
      role: 'user',
      parts: [{ text: message }],
    },
  ];

  const response = await axios.post(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
    { contents },
    { timeout: 20000, headers: { 'Content-Type': 'application/json' } },
  );

  return response.data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
}

async function callGroq(systemPrompt: string, history: ChatTurn[], message: string) {
  const messages = [
    { role: 'system', content: systemPrompt },
    ...history.slice(-10).map((item) => ({ role: item.role, content: item.content })),
    { role: 'user', content: message },
  ];

  const response = await retryWithBackoff(() =>
    axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: GROQ_MODEL,
        messages,
        temperature: 0.35,
      },
      {
        timeout: 20000,
        headers: {
          Authorization: `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
      },
    )
  );

  return response.data?.choices?.[0]?.message?.content?.trim() || '';
}

async function callOpenRouter(systemPrompt: string, history: ChatTurn[], message: string) {
  const messages = [
    { role: 'system', content: systemPrompt },
    ...history.slice(-10).map((item) => ({ role: item.role, content: item.content })),
    { role: 'user', content: message },
  ];

  const response = await retryWithBackoff(() =>
    axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: OPENROUTER_MODEL,
        messages,
        temperature: 0.35,
      },
      {
        timeout: 20000,
        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': FRONTEND_URL,
          'X-Title': "Morgan's Hope",
        },
      },
    )
  );

  return response.data?.choices?.[0]?.message?.content?.trim() || '';
}

export async function generateChatReply({
  message,
  history,
  user,
  latestAnalysis,
}: GenerateChatReplyInput): Promise<string> {
  const ar = detectArabic(`${message} ${history.map((item) => item.content).join(' ')}`);
  const intent = inferCommandIntent(message);
  const triage = detectTriage(message, history);
  const userSummary = summarizeUser(user, ar);
  const analysisSummary = summarizeAnalysis(latestAnalysis, ar);
  const memorySummary = inferConversationMemory(history, ar);
  const heuristic = getHeuristicReply(message, ar, user, latestAnalysis, history);

  const systemPrompt = buildSystemPrompt(ar, userSummary, analysisSummary, memorySummary, triage, intent);

  if (GROQ_API_KEY) {
    try {
      const reply = await callGroq(systemPrompt, history, message);
      if (reply) return reply + '\n\n_[Groq]_';
    } catch (error) {
      console.error('Groq chat fallback triggered:', error);
    }
  }

  if (OPENROUTER_API_KEY) {
    try {
      const reply = await callOpenRouter(systemPrompt, history, message);
      if (reply) return reply + '\n\n_[OpenRouter]_';
    } catch (error) {
      console.error('OpenRouter chat fallback triggered:', error);
    }
  }

  if (GEMINI_API_KEY) {
    try {
      const reply = await callGemini(systemPrompt, history, message);
      if (reply) return reply + '\n\n_[Gemini]_';
    } catch (error) {
      console.error('Gemini chat fallback triggered:', error);
    }
  }

  return heuristic + '\n\n_[Local]_';
}
