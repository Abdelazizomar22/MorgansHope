import { useState } from 'react';
import { MotionFade } from '../components/animations/MotionFade';
import { MotionHoverScale } from '../components/animations/MotionHoverScale';
import { MotionPageTransition } from '../components/animations/MotionPageTransition';

interface ContactPageProps { lang: 'en' | 'ar'; }

// Icons
const IconPhone = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);
const IconMail = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" />
  </svg>
);
const IconMapPin = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
  </svg>
);

export function ContactPage({ lang }: ContactPageProps) {
  const ar = lang === 'ar';
  const t = (en: string, arText: string) => ar ? arText : en;

  const [form, setForm] = useState({ name: '', phone: '', email: '', message: '' });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!form.name || !form.email || !form.phone) return;
    setLoading(true);
    try {
      await emailjs.send(
        'service_morganshope',
        'template_contact',
        {
          from_name: form.name,
          from_email: form.email,
          phone: form.phone,
          message: form.message || 'No message provided',
          to_email: 'abdelaziz.omar405@gmail.com',
        },
        'YOUR_PUBLIC_KEY'
      );
      setSent(true);
    } catch (error) {
      console.error('Email error:', error);
      alert(t('Failed to send. Please try again.', 'فشل الإرسال. حاول مجدداً.'));
    } finally {
      setLoading(false);
    }
  };

  const contactCards = [
    {
      icon: <IconPhone />,
      label: t("Talk to our support experts", "تحدث مع خبرائنا للدعم"),
      value: "+1 (123) 456-7890",
      bg: "var(--card-bg)"
    },
    {
      icon: <IconMail />,
      label: t("Send your queries", "أرسل استفساراتك"),
      value: "hello@morganshope.com",
      bg: "var(--card-bg)"
    },
    {
      icon: <IconMapPin />,
      label: t("Where to find us", "أين تجدنا"),
      value: t("Cairo, Giza, Egypt", "القاهرة، الجيزة، مصر"),
      bg: "var(--card-bg)"
    }
  ];

  return (
    <MotionPageTransition>
      <div dir={ar ? 'rtl' : 'ltr'} style={{
        minHeight: '100vh',
        background: 'var(--bg-main)',
        color: 'var(--text-main)',
        padding: '100px 40px',
        fontFamily: ar ? "'Cairo', sans-serif" : "'Sora', sans-serif"
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>

          {/* Top Contact Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: 24,
            marginBottom: 80
          }}>
            {contactCards.map((card, i) => (
              <MotionFade key={i} direction="up" delay={i * 0.1}>
                <div style={{
                  background: card.bg,
                  border: '1px solid var(--card-border)',
                  borderRadius: 24,
                  padding: '30px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  minHeight: '180px',
                  justifyContent: 'center'
                }}>
                  <div style={{
                    background: 'var(--primary)',
                    color: 'white',
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 16
                  }}>
                    {card.icon}
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8, fontWeight: 600 }}>
                    {card.label}
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-main)' }}>
                    {card.value}
                  </div>
                </div>
              </MotionFade>
            ))}
          </div>

          {/* Bottom Section: Wide Form */}
          <div style={{ width: '100%' }}>
            {/* Form Section */}
            <MotionFade direction="up">
              <div style={{
                background: 'var(--card-bg)',
                borderRadius: 32,
                padding: '50px',
                boxShadow: '0 4px 24px var(--shadow-main)',
                border: '1px solid var(--card-border)',
                width: '100%'
              }}>
                {sent ? (
                  <div style={{ textAlign: 'center', padding: '60px 0' }}>
                    <h2 style={{ fontSize: 32, fontWeight: 800, color: 'var(--text-main)', marginBottom: 16 }}>
                      {t("Message Sent!", "تم الإرسال!")}
                    </h2>
                    <p style={{ color: 'var(--text-muted)', marginBottom: 30, fontSize: 18 }}>
                      {t("Thank you for reaching out. We'll get back to you as soon as possible.", "شكراً لتواصلك معنا. سنقوم بالرد عليك في أقرب وقت ممكن.")}
                    </p>
                    <button
                      onClick={() => setSent(false)}
                      style={{
                        background: 'var(--primary-dark)',
                        color: 'white',
                        border: 'none',
                        padding: '14px 40px',
                        borderRadius: 14,
                        fontWeight: 700,
                        fontSize: 16,
                        cursor: 'pointer'
                      }}
                    >
                      {t("Send Another Message", "إرسال رسالة أخرى")}
                    </button>
                  </div>
                ) : (
                  <>
                    <h2 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-main)', marginBottom: 30, textAlign: ar ? 'right' : 'left' }}>
                      {t("Send us a message", "أرسل لنا رسالة")}
                    </h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 30 }}>
                      <div style={{ gridColumn: 'span 1' }}>
                        <label style={{ display: 'block', fontSize: 14, fontWeight: 700, color: 'var(--text-main)', marginBottom: 8 }}>
                          {t("Name*", "الاسم*")}
                        </label>
                        <input
                          type="text"
                          placeholder={t("Enter your full name", "أدخل اسمك الكامل")}
                          value={form.name}
                          onChange={(e) => setForm({ ...form, name: e.target.value })}
                          style={{
                            width: '100%',
                            padding: '16px 20px',
                            borderRadius: 14,
                            border: '1px solid var(--card-border)',
                            background: 'var(--bg-main)',
                            color: 'var(--text-main)',
                            fontSize: 15,
                            outline: 'none'
                          }}
                        />
                      </div>

                      <div style={{ gridColumn: 'span 1' }}>
                        <label style={{ display: 'block', fontSize: 14, fontWeight: 700, color: 'var(--text-main)', marginBottom: 8 }}>
                          {t("Phone no*", "رقم الهاتف*")}
                        </label>
                        <input
                          type="tel"
                          placeholder={t("Enter your phone number", "أدخل رقم هاتفك")}
                          value={form.phone}
                          onChange={(e) => setForm({ ...form, phone: e.target.value })}
                          style={{
                            width: '100%',
                            padding: '16px 20px',
                            borderRadius: 14,
                            border: '1px solid var(--card-border)',
                            background: 'var(--bg-main)',
                            color: 'var(--text-main)',
                            fontSize: 15,
                            outline: 'none'
                          }}
                        />
                      </div>

                      <div style={{ gridColumn: '1 / -1' }}>
                        <label style={{ display: 'block', fontSize: 14, fontWeight: 700, color: 'var(--text-main)', marginBottom: 8 }}>
                          {t("Email*", "البريد الإلكتروني*")}
                        </label>
                        <input
                          type="email"
                          placeholder={t("Enter your email address", "أدخل بريدك الإلكتروني")}
                          value={form.email}
                          onChange={(e) => setForm({ ...form, email: e.target.value })}
                          style={{
                            width: '100%',
                            padding: '16px 20px',
                            borderRadius: 14,
                            border: '1px solid var(--card-border)',
                            background: 'var(--bg-main)',
                            color: 'var(--text-main)',
                            fontSize: 15,
                            outline: 'none'
                          }}
                        />
                      </div>

                      <div style={{ gridColumn: '1 / -1' }}>
                        <label style={{ display: 'block', fontSize: 14, fontWeight: 700, color: 'var(--text-main)', marginBottom: 8 }}>
                          {t("Message", "الرسالة")}
                        </label>
                        <textarea
                          rows={5}
                          placeholder={t("Enter your message here", "اكتب رسالتك هنا")}
                          value={form.message}
                          onChange={(e) => setForm({ ...form, message: e.target.value })}
                          style={{
                            width: '100%',
                            padding: '16px 20px',
                            borderRadius: 14,
                            border: '1px solid var(--card-border)',
                            background: 'var(--bg-main)',
                            color: 'var(--text-main)',
                            fontSize: 15,
                            outline: 'none',
                            resize: 'none'
                          }}
                        />
                      </div>

                      <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: ar ? 'flex-start' : 'flex-end' }}>
                        <button
                          onClick={handleSend}
                          disabled={loading || !form.name || !form.email || !form.phone}
                          style={{
                            background: loading ? '#9ca3af' : 'var(--primary)',
                            color: 'white',
                            border: 'none',
                            padding: '18px 60px',
                            borderRadius: 14,
                            fontWeight: 800,
                            fontSize: 16,
                            cursor: loading ? 'not-allowed' : 'pointer',
                            transition: 'all 0.2s',
                            boxShadow: loading ? 'none' : '0 4px 12px var(--shadow-main)'
                          }}
                          onMouseEnter={e => !loading && ((e.currentTarget.style.transform = 'translateY(-2px)'), (e.currentTarget.style.background = 'var(--primary-dark)'))}
                          onMouseLeave={e => !loading && ((e.currentTarget.style.transform = 'translateY(0)'), (e.currentTarget.style.background = 'var(--primary)'))}
                        >
                          {loading ? t("Sending...", "جاري الإرسال...") : t("Submit Message", "إرسال الرسالة")}
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </MotionFade>
          </div>

        </div>
      </div>
    </MotionPageTransition>
  );
}
