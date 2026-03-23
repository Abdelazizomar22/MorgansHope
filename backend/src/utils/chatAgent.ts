import axios from 'axios';
import type User from '../models/User';
import type AnalysisResult from '../models/AnalysisResult';

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

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-1.5-flash';

const detectArabic = (text: string) => /[\u0600-\u06FF]/.test(text);

const normalizeText = (text: string) => text.trim().toLowerCase();

const summarizeUser = (user: InstanceType<typeof User>, ar: boolean) => {
  const parts = [
    `${user.firstName} ${user.lastName}`.trim(),
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

  const confidence = Math.round(Number(analysis.confidence) * 100);
  return ar
    ? `آخر تحليل للمستخدم: نوع الصورة ${analysis.imageType}، التصنيف ${analysis.classification}، الثقة ${confidence}%، ${analysis.isMalignant ? 'وقد تحتاج الحالة إلى متابعة عالية الأهمية' : analysis.hasFindings ? 'وتوجد ملاحظات تحتاج متابعة' : 'ولا توجد ملاحظات خطيرة واضحة'}.`
    : `Latest user analysis: ${analysis.imageType} scan, classification ${analysis.classification}, confidence ${confidence}%, and ${analysis.isMalignant ? 'the case may require high-priority follow-up' : analysis.hasFindings ? 'there are findings that need follow-up' : 'there are no obvious high-risk findings'}.`;
};

function buildSystemPrompt(ar: boolean, userSummary: string, analysisSummary: string) {
  if (ar) {
    return [
      'أنت وكيل طبي ذكي داخل منصة Morgan\'s Hope.',
      'دورك: فهم سؤال المستخدم، الرد بلغة واضحة وهادئة، وتقديم إرشاد طبي معلوماتي فقط بدون تشخيص نهائي.',
      'النطاق الأساسي للمنصة: صحة الرئة، سرطان الرئة، تفسير نتائج الفحص، التوجيه بعد التحليل، وشرح كيفية استخدام المنصة.',
      'قواعد صارمة:',
      '- لا تعطِ تشخيصًا نهائيًا أو جرعات أدوية.',
      '- إذا كانت الحالة تبدو خطيرة أو توجد أعراض إنذار، انصح بسرعة بمراجعة طبيب أو طوارئ.',
      '- إذا سأل عن أمر خارج نطاق الرئة، أجب بمعلومة عامة قصيرة ثم وضّح أن المنصة تركز حاليًا على صحة الرئة.',
      '- استعمل نقاطًا واضحة عند الحاجة.',
      '- لو سأل عن نتيجة تحليل، استخدم سياق المستخدم ونتيجته الأخيرة إن وُجدت.',
      `ملخص المستخدم: ${userSummary || 'غير متوفر'}`,
      `ملخص آخر تحليل: ${analysisSummary}`,
      'أسلوب الرد: دافئ، مختصر، منظم، وعملي.',
    ].join('\n');
  }

  return [
    'You are the Morgan\'s Hope Smart Medical Assistant.',
    'Your job is to understand the user, respond calmly, and provide informational medical guidance only, never a final diagnosis.',
    'Platform focus: lung health, lung cancer screening, respiratory education, scan result explanation, next-step guidance, and platform help.',
    'Hard rules:',
    '- Never provide a final diagnosis or medication dosing.',
    '- If the case sounds urgent or contains red-flag symptoms, advise prompt review by a physician or emergency care.',
    '- If the question is outside lung health, answer briefly and clarify that Morgan\'s Hope currently focuses on lung health.',
    '- Use bullet points when helpful.',
    '- If asked about scan results, use the available user and latest-analysis context carefully.',
    `User summary: ${userSummary || 'Unavailable'}`,
    `Latest analysis summary: ${analysisSummary}`,
    'Response style: warm, structured, practical, and not alarmist.',
  ].join('\n');
}

function getHeuristicReply(message: string, ar: boolean, analysis?: InstanceType<typeof AnalysisResult> | null) {
  const text = normalizeText(message);

  if (/hello|hi|hey|مرحبا|اهلا|السلام|ازيك/.test(text)) {
    return ar
      ? 'مرحبًا، أنا مساعد Morgan\'s Hope الذكي. أقدر أساعدك في أسئلة صحة الرئة، تفسير نتائج الفحص، أو كيفية استخدام المنصة.'
      : 'Hello, I am the Morgan\'s Hope smart assistant. I can help with lung-health questions, scan result explanations, and platform guidance.';
  }

  if (/result|report|analysis|scan|نتيجة|تحليل|تقرير|أشعة/.test(text) && analysis) {
    const confidence = Math.round(Number(analysis.confidence) * 100);
    return ar
      ? `آخر نتيجة متاحة لديك تشير إلى ${analysis.classification} بنسبة ثقة ${confidence}%. ${analysis.isMalignant ? 'هذه النتيجة تستحق متابعة سريعة مع طبيب مختص.' : analysis.hasFindings ? 'يوجد ما يستحق المراجعة الطبية والمتابعة.' : 'لا تظهر ملاحظات خطيرة واضحة في آخر نتيجة.'} إذا أردت، أستطيع شرح معنى النتيجة أو الخطوة التالية.`
      : `Your latest available result shows ${analysis.classification} with ${confidence}% confidence. ${analysis.isMalignant ? 'This deserves prompt follow-up with a specialist.' : analysis.hasFindings ? 'There are findings worth medical review and follow-up.' : 'There are no clearly high-risk findings in the latest result.'} If you want, I can explain what this result means or suggest the next step.`;
  }

  if (/symptom|symptoms|cough|breath|pain|fever|عرض|اعراض|سعال|كحة|تنفس|ألم|حمى/.test(text)) {
    return ar
      ? 'لو عندك أعراض تنفسية مستمرة مثل كحة لا تتحسن، ضيق نفس، ألم صدر، أو فقدان وزن غير مبرر، فالأفضل مراجعة طبيب صدرية. إذا أحببت، اكتب لي الأعراض وسأرتبها لك بشكل أوضح.'
      : 'If you have persistent respiratory symptoms such as a cough that does not improve, shortness of breath, chest pain, or unexplained weight loss, it is best to see a chest physician. If you want, tell me the symptoms and I will help organize them clearly.';
  }

  if (/upload|how.*use|website|platform|رفع|استخدم|المنصة|الموقع/.test(text)) {
    return ar
      ? 'يمكنك استخدام المنصة برفع صورة CT أو X-ray من صفحة الرفع، ثم سيظهر لك التصنيف والنتيجة والتوصية التالية. إذا أردت، أشرح لك الخطوات واحدة واحدة.'
      : 'You can use the platform by uploading a CT or X-ray image from the upload page, then viewing the classification, result, and recommended next step. If you want, I can walk you through it step by step.';
  }

  return ar
    ? 'أقدر أساعدك بشكل أفضل إذا كتبت سؤالك بصورة محددة أكثر، مثل: شرح نتيجة تحليل، أعراض تقلقك، أو كيفية استخدام المنصة.'
    : 'I can help better if you ask a more specific question, such as explaining a scan result, discussing concerning symptoms, or how to use the platform.';
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
    ...history.slice(-8).map((item) => ({
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

export async function generateChatReply({
  message,
  history,
  user,
  latestAnalysis,
}: GenerateChatReplyInput): Promise<string> {
  const ar = detectArabic(message);
  const userSummary = summarizeUser(user, ar);
  const analysisSummary = summarizeAnalysis(latestAnalysis, ar);
  const heuristic = getHeuristicReply(message, ar, latestAnalysis);

  if (!GEMINI_API_KEY) {
    return heuristic;
  }

  try {
    const reply = await callGemini(buildSystemPrompt(ar, userSummary, analysisSummary), history, message);
    return reply || heuristic;
  } catch (error) {
    console.error('Chat agent fallback triggered:', error);
    return heuristic;
  }
}
