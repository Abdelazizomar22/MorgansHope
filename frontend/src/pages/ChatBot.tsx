import React, { useEffect, useRef, useState } from 'react';
import { getLocalResponse } from '../utils/medicalKnowledge';
import { chatApi } from '../utils/api';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  createdAt?: string;
}

interface ChatBotProps {
  lang: 'en' | 'ar';
}

const formatMessage = (text: string) => {
  let f = text.replace(/^### (.*$)/gim, '<h3 style="color:var(--primary);margin:10px 0 5px 0;font-size:17px;">$1</h3>');
  f = f.replace(/^#### (.*$)/gim, '<h4 style="color:var(--primary);margin:8px 0 4px 0;font-size:15px;">$1</h4>');
  f = f.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  f = f.replace(/^\* (.*$)/gim, '<li style="margin-left:18px;margin-bottom:3px;">$1</li>');
  f = f.replace(/\n/g, '<br/>');
  return f;
};

const formatTime = (dateStr?: string) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const formatDateLabel = (dateStr: string, prevDateStr?: string) => {
  const d = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  const sameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

  if (prevDateStr && sameDay(d, new Date(prevDateStr))) return null;

  if (sameDay(d, today)) return 'Today';
  if (sameDay(d, yesterday)) return 'Yesterday';
  return d.toLocaleDateString([], { day: 'numeric', month: 'long', year: 'numeric' });
};

export default function ChatBot({ lang }: ChatBotProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);
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

  // Load chat history on mount
  useEffect(() => {
    (async () => {
      try {
        const res = await chatApi.getHistory();
        const history: Message[] = (res?.data?.data || []).map((m: any) => ({
          role: m.role,
          content: m.content,
          createdAt: m.createdAt,
        }));
        setMessages(history);
      } catch {
        // silently ignore — user may not be logged in yet
      } finally {
        setHistoryLoaded(true);
      }
    })();
  }, []);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo({ top: containerRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  const sendMessage = async (e?: React.FormEvent, preset?: string) => {
    if (e) e.preventDefault();
    const messageText = (preset ?? input).trim();
    if (!messageText || isLoading) return;

    const now = new Date().toISOString();
    const userMessage: Message = { role: 'user', content: messageText, createdAt: now };
    const nextMessages = [...messages, userMessage];
    const localReply = getLocalResponse(messageText);

    setMessages(nextMessages);
    setInput('');
    setIsLoading(true);

    try {
      const response = await chatApi.send({
        message: messageText,
        history: nextMessages.slice(-10).map((item) => ({ role: item.role, content: item.content })),
      });
      const replyText =
        response?.data?.data?.reply?.trim()
        || localReply
        || t('Sorry, I could not generate a reply right now.', 'عذرًا، لم أستطع توليد رد الآن.');

      setMessages((prev) => [...prev, { role: 'assistant', content: replyText, createdAt: new Date().toISOString() }]);
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
          : backendMessage || t('Unable to reach AI service right now.', 'تعذر الوصول للخدمة الآن، حاول مرة أخرى.');

      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: localReply || greetingFallback || friendlyError, createdAt: new Date().toISOString() },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
  <main style={{
 	backgroundImage: `url(/images/common/flowers-2.jpeg)`,
 	backgroundRepeat: "no-repeat",
 	backgroundSize: "cover"
  }}>
    <div
      dir={ar ? 'rtl' : 'ltr'}
      style={{
        maxWidth: 920,
        margin: isMobile ? '0 auto' : '0 auto',
        padding: isMobile ? '40px' : '80px',
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
            'Ask about your latest analysis, case summary, next steps, or warning signs.',
            'اسأل عن آخر تحليل، ملخص الحالة، الخطوة التالية، أو علامات الخطر.'
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
          gap: 4,
          boxShadow: '0 10px 30px var(--shadow-main)',
          scrollBehavior: 'smooth',
        }}
      >
        {messages.length === 0 && historyLoaded && (
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

        {messages.map((msg, idx) => {
          const dateLabel = msg.createdAt
            ? formatDateLabel(msg.createdAt, messages[idx - 1]?.createdAt)
            : null;
          const isUser = msg.role === 'user';

          return (
            <React.Fragment key={idx}>
              {dateLabel && (
                <div style={{ textAlign: 'center', margin: '14px 0 6px' }}>
                  <span
                    style={{
                      background: 'var(--card-border)',
                      color: 'var(--text-muted)',
                      fontSize: 12,
                      padding: '3px 12px',
                      borderRadius: 999,
                    }}
                  >
                    {dateLabel}
                  </span>
                </div>
              )}

              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: isUser ? (ar ? 'flex-start' : 'flex-end') : (ar ? 'flex-end' : 'flex-start'),
                  marginBottom: 6,
                }}
              >
                <div
                  style={{
                    background: isUser ? 'var(--primary)' : 'var(--card-border)',
                    color: isUser ? 'white' : 'var(--text-main)',
                    padding: '12px 16px',
                    borderRadius: isUser ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                    maxWidth: '80%',
                    lineHeight: 1.65,
                    fontSize: 15,
                  }}
                >
                  <div dangerouslySetInnerHTML={{ __html: formatMessage(msg.content) }} />
                </div>
                {msg.createdAt && (
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3, paddingInline: 4 }}>
                    {formatTime(msg.createdAt)}
                  </span>
                )}
              </div>
            </React.Fragment>
          );
        })}

        {isLoading && (
          <div
            style={{
              alignSelf: ar ? 'flex-end' : 'flex-start',
              background: 'var(--card-border)',
              padding: '12px 20px',
              borderRadius: '20px 20px 20px 4px',
              color: 'var(--text-muted)',
              fontSize: 14,
            }}
          >
            <span style={{ display: 'inline-flex', gap: 4 }}>
              <span style={{ animation: 'bounce 1s infinite 0s' }}>●</span>
              <span style={{ animation: 'bounce 1s infinite 0.2s' }}>●</span>
              <span style={{ animation: 'bounce 1s infinite 0.4s' }}>●</span>
            </span>
          </div>
        )}
      </div>

      <form
        onSubmit={sendMessage}
        style={{
          marginTop: 16,
          display: 'flex',
          gap: 10,
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
          placeholder={t('Type a message…', 'اكتب رسالتك…')}
          style={{
            flex: 1,
            padding: '12px 18px',
            borderRadius: 14,
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
          disabled={isLoading || !input.trim()}
          style={{
            padding: '0 28px',
            background: isLoading || !input.trim() ? 'var(--text-muted)' : 'var(--primary)',
            color: 'white',
            border: 'none',
            borderRadius: 14,
            cursor: isLoading || !input.trim() ? 'not-allowed' : 'pointer',
            fontWeight: 700,
            fontSize: 15,
            fontFamily: 'inherit',
            transition: 'background 0.2s',
          }}
        >
          {t('Send', 'إرسال')}
        </button>
      </form>

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); opacity: 0.4; }
          50% { transform: translateY(-4px); opacity: 1; }
        }
      `}</style>
    </div>
  </main>
  );
}
