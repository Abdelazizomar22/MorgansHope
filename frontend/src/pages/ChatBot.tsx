import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { getLocalResponse } from '../utils/medicalKnowledge';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

interface ChatBotProps {
    lang: 'en' | 'ar';
}

const SYSTEM_PROMPT = `أنت مساعد طبي لمنصة مورجان هوب لكشف سرطان الرئة.
رد بنفس لغة السؤال (عربي أو إنجليزي).
تخصصك: سرطان الرئة (عندنا موديل شغال).
قريباً: Pneumonia, Tuberculosis, COPD, Pulmonary Fibrosis.
قواعد: لا تعطي جرعات أدوية. دايماً انصح بزيارة دكتور.`;

// Simple Markdown Formatter Helper
const formatMessage = (text: string) => {
    // Replace ### Headers
    let formatted = text.replace(/^### (.*$)/gim, '<h3 style="color:var(--primary);margin:10px 0 5px 0;font-size:18px;">$1</h3>');
    // Replace #### Headers
    formatted = formatted.replace(/^#### (.*$)/gim, '<h4 style="color:var(--primary);margin:8px 0 4px 0;font-size:16px;">$1</h4>');
    // Replace **Bold**
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    // Replace * Bullet points
    formatted = formatted.replace(/^\* (.*$)/gim, '<li style="margin-left:20px;margin-bottom:4px;">$1</li>');
    // Replace newlines with <br/>
    formatted = formatted.replace(/\n/g, '<br/>');

    return formatted;
};

export default function ChatBot({ lang }: ChatBotProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const { theme } = useTheme();
    const ar = lang === 'ar';

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    const t = (en: string, arText: string) => ar ? arText : en;

    const sendMessage = async (e: React.FormEvent, retryCount = 0) => {
        if (e) e.preventDefault();
        if (!input.trim() && retryCount === 0) return;
        if (isLoading && retryCount === 0) return;

        const currentInput = input;
        if (retryCount === 0) {
            const userMessage = { role: 'user' as const, content: input };
            setMessages(prev => [...prev, userMessage]);
            setInput('');
        }

        setIsLoading(true);

        // 1. Try Local Knowledge Base first (Fast, Free, & Detailed)
        const localReply = getLocalResponse(currentInput);
        if (localReply) {
            setTimeout(() => {
                setMessages(prev => [...prev, { role: 'assistant', content: localReply }]);
                setIsLoading(false);
            }, 800); // Slight delay for "Thinking" feel
            return;
        }

        try {
            // 2. Fallback to Gemini API
            const SYSTEM_PROMPT = `You are Morgan's Hope AI Assistant — a specialized medical chatbot embedded in the Morgan's Hope platform, an AI-powered lung cancer early detection web application (graduation project 2025/2026).

YOUR IDENTITY & SCOPE:
- You are a medical information assistant focused on respiratory health, lung diseases, and AI diagnostics
- Morgan's Hope currently supports: CT Scan analysis (6 classes: Normal, Benign, Adenocarcinoma, Squamous Cell, Large Cell, Small Cell) and X-Ray analysis (binary: Normal / Nodule-Mass)
- The platform uses deep learning models with 99%+ accuracy for lung cancer screening ONLY
- For any other disease type (heart, kidney, diabetes, etc.), you provide general medical information but always clarify: "Morgan's Hope currently focuses on lung health. Support for [disease] screening may be added in future updates."

CRITICAL RULES:
1. NEVER say the platform "diagnoses" — always say it "screens" or "detects patterns" — final diagnosis requires a doctor
2. NEVER claim the platform supports diseases it doesn't (heart disease, diabetes, etc.) — say "coming soon" or "not yet available"
3. When discussing scan results, be empathetic and calm — patients may be anxious
4. Always recommend consulting a real doctor for any medical decision
5. You can discuss: lung cancer types, symptoms, TB, pneumonia, COPD, and general respiratory health
6. If asked about the AI models, explain they are deep learning CNN models trained on medical imaging datasets
7. Keep responses clear, warm, and non-alarming — this is a medical platform, not a chatbot playground

RESPONSE STYLE:
- Be concise but thorough
- Use simple language — patients are not always doctors
- Structure responses with bullet points when listing symptoms/steps
- Always end serious medical topics with "Please consult a qualified physician for a proper diagnosis"`;

            const conversationHistory = [
                { role: 'user', parts: [{ text: SYSTEM_PROMPT }] },
                { role: 'model', parts: [{ text: "Understood. I am Morgan's Hope AI Assistant, ready to help with lung health questions and platform guidance." }] },
                ...[...messages, { role: 'user', content: currentInput }].map(m => ({
                    role: m.role === 'assistant' ? 'model' : 'user',
                    parts: [{ text: m.content }]
                }))
            ];

            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-latest:generateContent?key=${import.meta.env.VITE_GEMINI_API_KEY}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ contents: conversationHistory })
                }
            );

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const msg = errorData.error?.message || '';

                // If Rate Limited, try ONE retry after a delay
                if ((msg.toLowerCase().includes('quota') || msg.toLowerCase().includes('limit')) && retryCount < 1) {
                    setTimeout(() => sendMessage(null as any, retryCount + 1), 2000);
                    return;
                }

                throw new Error(msg || 'Gemini API Request Failed');
            }

            const data = await response.json();
            const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response from AI.';
            setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
        } catch (error: any) {
            console.error('Error sending message:', error);
            let errorMsg = '';
            if (error.message.includes('QUOTA') || error.message.includes('limit')) {
                errorMsg = t('Our AI is busy. Please try asking about specific diseases like "Cancer" or "TB" for an instant response, or wait a moment.', 'المساعد الذكي مشغول حالياً. يرجى تجربة السؤال عن أمراض محددة مثل "السرطان" أو "السل" للحصول على رد فوري، أو الانتظار قليلاً.');
            } else {
                errorMsg = t('Sorry, I encountered an error. ', 'عذراً، حدث خطأ. ') + (error.message || '');
            }
            setMessages(prev => [...prev, { role: 'assistant', content: errorMsg }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div dir={ar ? 'rtl' : 'ltr'} style={{
            maxWidth: 900,
            margin: isMobile ? '10px auto' : '20px auto',
            padding: isMobile ? '0 10px' : '0 20px',
            fontFamily: ar ? "'Cairo', sans-serif" : "'Sora', sans-serif",
            height: isMobile ? 'calc(100vh - 100px)' : 'calc(100vh - 120px)',
            display: 'flex',
            flexDirection: 'column'
        }}>
            <div style={{ marginBottom: 15, textAlign: 'center' }}>
                <h1 style={{ color: 'var(--primary)', fontWeight: 800, fontSize: isMobile ? 24 : 28, marginBottom: 5 }}>
                    {t("Morgan's Hope Assistant", 'مساعد مورجان هوب الذكي')}
                </h1>
                <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
                    {t('Advanced medical advisor for lung health and AI diagnostics.', 'مستشار طبي متقدم لصحة الرئة والتشخيص بالذكاء الاصطناعي.')}
                </p>
            </div>

            <div style={{
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
                scrollBehavior: 'smooth'
            }}>
                {messages.length === 0 && (
                    <div style={{ textAlign: 'center', color: 'var(--text-muted)', margin: 'auto', maxWidth: 400 }}>
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
                        <p style={{ fontSize: 14, opacity: 0.7 }}>
                            {t('Ask me about lung cancer symptoms, tuberculosis treatment, or how our AI models work.', 'اسألني عن أعراض سرطان الرئة، علاج السل، أو كيف تعمل نماذج الذكاء الاصطناعي الخاصة بنا.')}
                        </p>
                    </div>
                )}

                {messages.map((msg, idx) => (
                    <div key={idx} style={{
                        alignSelf: msg.role === 'user' ? (ar ? 'flex-start' : 'flex-end') : (ar ? 'flex-end' : 'flex-start'),
                        background: msg.role === 'user' ? 'var(--primary)' : 'var(--card-border)',
                        color: msg.role === 'user' ? 'white' : 'var(--text-main)',
                        padding: '15px 20px',
                        borderRadius: msg.role === 'user' ? '20px 20px 0 20px' : '20px 20px 20px 0',
                        maxWidth: '85%',
                        lineHeight: 1.6,
                        fontSize: 15,
                        boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                        transition: 'all 0.3s ease'
                    }}>
                        <div dangerouslySetInnerHTML={{ __html: formatMessage(msg.content) }} />
                    </div>
                ))}

                {isLoading && (
                    <div style={{
                        alignSelf: ar ? 'flex-end' : 'flex-start',
                        background: 'var(--card-border)',
                        padding: '15px 25px',
                        borderRadius: '20px 20px 20px 0',
                        color: 'var(--text-muted)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10
                    }}>
                        <span style={{ fontSize: 13, fontWeight: 600 }}>{t('Thinking', 'يفكر')}</span>
                        <div className="typing-indicator">
                            <span>.</span><span>.</span><span>.</span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={sendMessage} style={{
                marginTop: 20,
                display: 'flex',
                gap: 12,
                background: 'var(--card-bg)',
                padding: '8px',
                borderRadius: 20,
                border: '1px solid var(--card-border)',
                boxShadow: '0 5px 15px var(--shadow-main)'
            }}>
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={t('Ask me anything about lung health...', 'اسألني أي شيء عن صحة الرئة...')}
                    style={{
                        flex: 1,
                        padding: '12px 20px',
                        borderRadius: 15,
                        border: 'none',
                        background: 'transparent',
                        color: 'var(--text-main)',
                        outline: 'none',
                        fontSize: 15,
                        fontFamily: 'inherit'
                    }}
                />
                <button type="submit" disabled={isLoading} style={{
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
                    boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                }}>
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
