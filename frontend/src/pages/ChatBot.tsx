import React, { useEffect, useRef, useState } from 'react';
import { getLocalResponse } from '../utils/medicalKnowledge';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatBotProps {
  lang: 'en' | 'ar';
}

const formatMessage = (text: string) => {
  let formatted = text.replace(/^### (.*$)/gim, '<h3 style="color:var(--primary);margin:10px 0 5px 0;font-size:18px;">$1</h3>');
  formatted = formatted.replace(/^#### (.*$)/gim, '<h4 style="color:var(--primary);margin:8px 0 4px 0;font-size:16px;">$1</h4>');
  formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  formatted = formatted.replace(/^\* (.*$)/gim, '<li style="margin-left:20px;margin-bottom:4px;">$1</li>');
  formatted = formatted.replace(/\n/g, '<br/>');
  return formatted;
};

export default function ChatBot({ lang }: ChatBotProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const ar = lang === 'ar';

  const t = (en: string, arText: string) => ar ? arText : en;
  const openRouterKey = import.meta.env.VITE_OPENROUTER_API_KEY;

  const systemPrompt = ar
    ? [
      'أنت وكيل طبي ذكي داخل منصة Morgan\'s Hope.',
      'قدّم مساعدة معلوماتية عملية ومطمئنة في مجال صحة الرئة دون إعطاء تشخيص نهائي.',
      'ركّز على: شرح النتائج، تلخيص الحالة، اقتراح الخطوة التالية، وفرز الأعراض الخطيرة.',
      'قواعد صارمة:',
      '- لا تعطي تشخيصًا نهائيًا أو جرعات أدوية.',
      '- إذا ظهرت أعراض إنذارية خطيرة، وضّح الحاجة إلى مراجعة عاجلة أو طوارئ.',
      '- هذا نظام فحص أولي بالذكاء الاصطناعي ولا يغني عن الطبيب.',
      'أسلوب الرد: عربي واضح، قصير نسبيًا، عملي ومنظم.',
    ].join('\n')
    : [
      'You are the Morgan\'s Hope smart medical agent.',
      'Provide practical and calm informational guidance focused on lung health without giving a final diagnosis.',
      'Focus on: result explanation, case summarization, next-step guidance, and triage for risky symptoms.',
      'Hard rules:',
      '- Never provide a final diagnosis or medication dosing.',
      '- If red-flag symptoms are present, clearly advise urgent review or emergency care.',
      '- This is an AI screening tool and does not replace a physician.',
      'Response style: warm, concise, practical, and structured.',
    ].join('\n');

  const quickPrompts = ar
    ? [
      'اشرح آخر نتيجة تحليل',
      'لخص حالتي',
      'ما الخطوة التالية؟',
      'متى أحتاج مراجعة عاجلة؟',
    ]
    : [
      'Explain my latest result',
      'Summarize my case',
      'What should I do next?',
      'When should I seek urgent care?',
    ];

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages, isLoading]);

  const sendMessage = async (e?: React.FormEvent, preset?: string) => {
    if (e) e.preventDefault();
    const messageText = (preset ?? input).trim();
    if (!messageText || isLoading) return;

    const userMessage: Message = { role: 'user', content: messageText };
    const nextHistory = [...messages, userMessage];
    const localReply = getLocalResponse(messageText);

    setMessages(nextHistory);
    setInput('');
    setIsLoading(true);

    try {
      if (!openRouterKey) {
        if (localReply) {
          setMessages((prev) => [...prev, { role: 'assistant', content: localReply }]);
          return;
        }
        throw new Error(t('OpenRouter API key is missing. Please set VITE_OPENROUTER_API_KEY.', 'مفتاح OpenRouter غير موجود. من فضلك أضف VITE_OPENROUTER_API_KEY.'));
      }

      const apiMessages = [
        { role: 'system', content: systemPrompt },
        ...(localReply ? [{ role: 'system' as const, content: `Local medical context:\n${localReply}` }] : []),
        ...nextHistory.slice(-10).map((item) => ({ role: item.role, content: item.content })),
      ];

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${openRouterKey}`,
          'HTTP-Referer': 'https://morgans-hope.vercel.app',
          'X-Title': "Morgan's Hope",
        },
        body: JSON.stringify({
          model: 'meta-llama/llama-3.3-70b-instruct:free',
          messages: apiMessages,
          temperature: 0.35,
        }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        const apiError = data?.error?.message || data?.message || t('OpenRouter request failed.', 'فشل الاتصال بـ OpenRouter.');
        throw new Error(apiError);
      }

      const reply = data?.choices?.[0]?.message?.content?.trim() || localReply || t('Sorry, I could not generate a reply right now.', 'عذرًا، لم أستطع توليد رد الآن.');
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
    } catch (error: any) {
      const normalizedInput = messageText.toLowerCase();
      const greetingFallback =
        /hello|hi|hey|how are you|ازيك|كيف حالك|مرحبا|اهلا|أهلا/.test(normalizedInput)
          ? t(
            "Hello! I'm here to help with your results, symptoms, and next medical steps. Ask me anything and I'll guide you clearly.",
            'أهلًا! أنا هنا لمساعدتك في النتائج والأعراض والخطوة الطبية التالية. اسألني أي شيء وسأرشدك بشكل واضح.'
          )
          : null;
      const rawMessage = String(error?.message || '');
      const friendlyError =
        rawMessage.includes('Provider returned error') || rawMessage.includes('OpenRouter')
          ? t(
            'The AI provider is temporarily unavailable. Please try again in a moment.',
            'مزود الذكاء الاصطناعي غير متاح مؤقتًا. حاول مرة أخرى بعد قليل.'
          )
          : t('Unable to reach AI service right now. Please try again in a moment.', 'تعذر الوصول لخدمة الذكاء الاصطناعي الآن. حاول مرة أخرى بعد قليل.');

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: localReply || greetingFallback || friendlyError,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      dir={ar ? 'rtl' : 'ltr'}
      style={{
        maxWidth: 920,
        margin: isMobile ? '10px auto' : '20px auto',
        padding: isMobile ? '0 10px' : '0 20px',
        fontFamily: ar ? "'Cairo', sans-serif" : "'Sora', sans-serif",
        height: isMobile ? 'calc(100vh - 100px)' : 'calc(100vh - 120px)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div style={{ marginBottom: 15, textAlign: 'center' }}>
        <h1 style={{ color: 'var(--primary)', fontWeight: 800, fontSize: isMobile ? 24 : 28, marginBottom: 5 }}>
          {t("Morgan's Hope Smart Assistant", 'مساعد Morgan\'s Hope الذكي')}
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 14, maxWidth: 620, margin: '0 auto' }}>
          {t(
            'A smarter agent for result explanation, case summaries, next-step guidance, and urgent-symptom triage.',
            'وكيل أذكى لشرح النتائج، تلخيص الحالة، اقتراح الخطوة التالية، وفرز الأعراض العاجلة.'
          )}
        </p>
      </div>

      <div
        ref={containerRef}
        style={{
          flex: 1,
          background: 'var(--card-bg)',
          border: '1px solid var(--card-border)',
          borderRadius: 24,
          padding: isMobile ? '16px' : '25px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
          boxShadow: '0 10px 30px var(--shadow-main)',
          scrollBehavior: 'smooth',
        }}
      >
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', margin: 'auto', maxWidth: 560 }}>
            <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'center' }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="10" rx="2" />
                <circle cx="12" cy="5" r="2" />
                <path d="M12 7v4" />
                <line x1="8" y1="16" x2="8" y2="16" />
                <line x1="16" y1="16" x2="16" y2="16" />
              </svg>
            </div>
            <p style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-main)', marginBottom: 10 }}>
              {t('How can I help you today?', 'كيف يمكنني مساعدتك اليوم؟')}
            </p>
            <p style={{ fontSize: 14, opacity: 0.7, marginBottom: 18 }}>
              {t(
                'Ask about your latest analysis, a summary of your case, the next step, or warning signs that need urgent review.',
                'اسأل عن آخر نتيجة، أو ملخص حالتك، أو الخطوة التالية، أو علامات الخطر التي تحتاج مراجعة عاجلة.'
              )}
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 10 }}>
              {quickPrompts.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => sendMessage(undefined, prompt)}
                  style={{
                    padding: '10px 14px',
                    borderRadius: 999,
                    border: '1px solid var(--card-border)',
                    background: 'var(--bg-main)',
                    color: 'var(--text-main)',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    fontSize: 13,
                    fontWeight: 700,
                  }}
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div
            key={idx}
            style={{
              alignSelf: msg.role === 'user' ? (ar ? 'flex-start' : 'flex-end') : (ar ? 'flex-end' : 'flex-start'),
              background: msg.role === 'user' ? 'var(--primary)' : 'var(--card-border)',
              color: msg.role === 'user' ? 'white' : 'var(--text-main)',
              padding: '15px 20px',
              borderRadius: msg.role === 'user' ? '20px 20px 0 20px' : '20px 20px 20px 0',
              maxWidth: '85%',
              lineHeight: 1.6,
              fontSize: 15,
              boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
              transition: 'all 0.3s ease',
            }}
          >
            <div dangerouslySetInnerHTML={{ __html: formatMessage(msg.content) }} />
          </div>
        ))}

        {isLoading && (
          <div
            style={{
              alignSelf: ar ? 'flex-end' : 'flex-start',
              background: 'var(--card-border)',
              padding: '15px 25px',
              borderRadius: '20px 20px 20px 0',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <span style={{ fontSize: 13, fontWeight: 600 }}>{t('Thinking', 'يفكر')}</span>
            <div className="typing-indicator">
              <span>.</span><span>.</span><span>.</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form
        onSubmit={sendMessage}
        style={{
          marginTop: 20,
          display: 'flex',
          gap: 12,
          background: 'var(--card-bg)',
          padding: '8px',
          borderRadius: 20,
          border: '1px solid var(--card-border)',
          boxShadow: '0 5px 15px var(--shadow-main)',
        }}
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t('Ask about your latest result, your case summary, or the next step...', 'اسأل عن آخر نتيجة، أو ملخص حالتك، أو الخطوة التالية...')}
          style={{
            flex: 1,
            padding: '12px 20px',
            borderRadius: 15,
            border: 'none',
            background: 'transparent',
            color: 'var(--text-main)',
            outline: 'none',
            fontSize: 15,
            fontFamily: 'inherit',
          }}
        />
        <button
          type="submit"
          disabled={isLoading}
          style={{
            padding: '0 30px',
            background: isLoading ? 'var(--text-muted)' : 'var(--primary)',
            color: 'white',
            border: 'none',
            borderRadius: 15,
            cursor: isLoading ? 'not-allowed' : 'pointer',
            fontWeight: 700,
            fontSize: 15,
            fontFamily: 'inherit',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
          }}
        >
          {t('Send', 'إرسال')}
        </button>
      </form>

      <style>{`
        .typing-indicator span {
          animation: blink 1.4s infinite both;
          font-weight: bold;
          font-size: 20px;
        }
        .typing-indicator span:nth-child(2) { animation-delay: 0.2s; }
        .typing-indicator span:nth-child(3) { animation-delay: 0.4s; }
        @keyframes blink {
          0% { opacity: 0.2; }
          20% { opacity: 1; }
          100% { opacity: 0.2; }
        }
        h3, h4 { margin-top: 15px !important; }
        li { margin-bottom: 8px !important; }
      `}</style>
    </div>
  );
}
