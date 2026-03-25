import React, { useEffect, useRef, useState } from 'react';
import { getLocalResponse } from '../utils/medicalKnowledge';
import { chatApi } from '../utils/api';

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
  const containerRef = useRef<HTMLDivElement>(null);
  const ar = lang === 'ar';

  const t = (en: string, arText: string) => (ar ? arText : en);

  const quickPrompts = ar
    ? ['اشرح آخر نتيجة تحليل', 'لخص حالتي', 'ما الخطوة التالية؟', 'متى أحتاج مراجعة عاجلة؟']
    : ['Explain my latest result', 'Summarize my case', 'What should I do next?', 'When should I seek urgent care?'];

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
      const response = await chatApi.send({
        message: messageText,
        history: nextHistory.slice(-10).map((item) => ({ role: item.role, content: item.content })),
      });
      const reply =
        response?.data?.data?.reply?.trim()
        || localReply
        || t('Sorry, I could not generate a reply right now.', 'عذرًا، لم أستطع توليد رد الآن.');
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
    } catch (error: any) {
      const normalizedInput = messageText.toLowerCase();
      const greetingFallback =
        /hello|hi|hey|how are you|ازيك|كيف حالك|مرحبا|اهلا|أهلا/.test(normalizedInput)
          ? t(
            "Hello! I'm here to help with your results, symptoms, and next medical steps.",
            'أهلًا! أنا هنا لمساعدتك في النتائج والأعراض والخطوة الطبية التالية.'
          )
          : null;

      const status = error?.response?.status;
      const backendMessage = String(error?.response?.data?.message || '').trim();
      const friendlyError =
        status === 401
          ? t('Please sign in again to continue chatting.', 'من فضلك سجل الدخول مرة أخرى علشان تكمل المحادثة.')
          : backendMessage
            || t('Unable to reach AI service right now. Please try again in a moment.', 'تعذر الوصول لخدمة الذكاء الاصطناعي الآن. حاول مرة أخرى بعد قليل.');

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
          {t("Morgan's Hope Smart Assistant", "مساعد Morgan's Hope الذكي")}
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
            <p style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-main)', marginBottom: 10 }}>
              {t('How can I help you today?', 'كيف يمكنني مساعدتك اليوم؟')}
            </p>
            <p style={{ fontSize: 14, opacity: 0.7, marginBottom: 18 }}>
              {t(
                'Ask about your latest analysis, case summary, next step, or warning signs.',
                'اسأل عن آخر تحليل، ملخص الحالة، الخطوة التالية، أو علامات الخطر.'
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
            }}
          >
            {t('Thinking...', 'جاري التفكير...')}
          </div>
        )}
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
          placeholder={t('Ask your question...', 'اكتب سؤالك...')}
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
          }}
        >
          {t('Send', 'إرسال')}
        </button>
      </form>
    </div>
  );
}
