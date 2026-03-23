import React, { useEffect, useRef, useState } from 'react';
import { useTheme } from '../context/ThemeContext';
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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();
  const ar = lang === 'ar';

  const t = (en: string, arText: string) => ar ? arText : en;

  const quickPrompts = ar
    ? [
      'اشرح آخر نتيجة تحليل',
      'ما أعراض سرطان الرئة؟',
      'متى أراجع الطبيب فورًا؟',
      'كيف أستخدم المنصة؟',
    ]
    : [
      'Explain my latest result',
      'What are the symptoms of lung cancer?',
      'When should I seek urgent care?',
      'How do I use the platform?',
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

    setMessages(nextHistory);
    setInput('');
    setIsLoading(true);

    try {
      const response = await chatApi.send({
        message: messageText,
        history: messages.slice(-8),
      });

      const reply = response.data.data?.reply || t('Sorry, I could not generate a reply right now.', 'عذرًا، لم أستطع توليد رد الآن.');
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
    } catch (error: any) {
      const apiMessage = error?.response?.data?.message;
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: apiMessage || t('Sorry, something went wrong while contacting the assistant.', 'عذرًا، حدث خطأ أثناء التواصل مع المساعد.'),
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
            'A stronger medical assistant for lung-health questions, result explanation, and next-step guidance.',
            'مساعد أقوى لأسئلة صحة الرئة، وشرح النتائج، واقتراح الخطوة التالية.'
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
                'Ask about symptoms, your latest analysis, warning signs, or how to use the platform.',
                'اسأل عن الأعراض، أو آخر نتيجة تحليل، أو علامات الخطر، أو كيفية استخدام المنصة.'
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
          placeholder={t('Ask me anything about lung health or your results...', 'اسألني أي شيء عن صحة الرئة أو نتائجك...')}
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
