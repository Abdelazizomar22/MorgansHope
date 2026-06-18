import { useEffect, useState } from 'react';
import { MotionFade } from '../components/animations/MotionFade';
import { MotionHoverScale } from '../components/animations/MotionHoverScale';
import { MotionPageTransition } from '../components/animations/MotionPageTransition';
import { HiPhone, HiEnvelope, HiMapPin, HiCheck } from 'react-icons/hi2';
import { contactApi } from '../utils/api';

interface ContactPageProps { lang: 'en' | 'ar'; }

const IconPhone = () => <HiPhone size={24} />;
const IconMail = () => <HiEnvelope size={24} />;
const IconMapPin = () => <HiMapPin size={24} />;
const IconCheck = () => <HiCheck size={28} />;

export function ContactPage({ lang }: ContactPageProps) {
  const ar = lang === 'ar';
  const t = (en: string, arText: string) => ar ? arText : en;

  const [form, setForm] = useState({ name: '', phone: '', email: '', message: '' });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSend = async () => {
    if (!form.name || !form.email || !form.message) return;

    try {
      setLoading(true);
      setError('');
      await contactApi.send({
        name: form.name.trim(),
        phone: form.phone.trim() || undefined,
        email: form.email.trim(),
        message: form.message.trim(),
      });
      setSent(true);
      setForm({ name: '', phone: '', email: '', message: '' });
    } catch (err: any) {
      const details = err?.response?.data?.message || err?.message;
      setError(
        details
          ? `Failed to send your message. ${String(details)}`
          : t('Failed to send your message. Please try again.', 'فشل إرسال رسالتك. حاول مرة أخرى.'),
      );
    } finally {
      setLoading(false);
    }
  };

  const contactCards = [
    {
      icon: <IconPhone />,
      label: t('Talk to our support experts', 'تحدث مع خبرائنا للدعم'),
      value: '0235169531',
    },
    {
      icon: <IconMail />,
      label: t('Send your queries', 'أرسل استفساراتك'),
      value: 'morganshope40@gmail.com',
    },
    {
      icon: <IconMapPin />,
      label: t('Where to find us', 'أين تجدنا'),
      value: t('6th of October City, Giza, Egypt', 'مدينة 6 أكتوبر، الجيزة، مصر'),
    },
  ];

  const inputClass = 'w-full placeholder:text-[var(--text-muted)] outline-none border-[var(--input-border)] border transition-colors duration-300 focus:border-[var(--input-focus)]';

  return (
    <MotionPageTransition>
      <div
        style={{
          minHeight: '100vh',
          background:
            'radial-gradient(circle at 12% 18%, rgba(var(--primary-rgb),0.08), transparent 22%), radial-gradient(circle at 88% 14%, rgba(var(--primary-rgb),0.06), transparent 20%), linear-gradient(180deg, color-mix(in srgb, var(--primary) 4%, var(--bg-main)) 0%, var(--bg-main) 100%)',
          color: 'var(--text-main)',
          padding: isMobile ? '52px 18px' : '90px 40px',
          fontFamily: ar ? "'Cairo', sans-serif" : "'Sora', sans-serif",
        }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: isMobile ? 32 : 42, maxWidth: 760, marginInline: 'auto' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 14px',
                borderRadius: 999,
                background: 'color-mix(in srgb, var(--primary) 10%, var(--card-bg))',
                color: 'var(--primary-dark)',
                fontSize: 12,
                fontWeight: 800,
                letterSpacing: 0.5,
                textTransform: 'uppercase',
                marginBottom: 16,
              }}
            >
              {t("Contact Morgan's Hope", "تواصل مع Morgan's Hope")}
            </div>
            <h1 style={{ fontSize: isMobile ? 32 : 46, fontWeight: 900, letterSpacing: '-0.04em', color: 'var(--primary-dark)', margin: 0 }}>
              {t('Reach the Right Team, Fast', 'تواصل مع الفريق المناسب بسرعة')}
            </h1>
            <p style={{ margin: '14px auto 0', maxWidth: 700, color: 'var(--text-muted)', fontSize: isMobile ? 15 : 18, lineHeight: 1.85 }}>
              {t(
                'Questions, feedback, or follow-up after a result? Send us a message and we will get back to you as soon as possible.',
                'هل لديك سؤال أو ملاحظة أو متابعة بعد نتيجة؟ أرسل لنا رسالتك وسنرد عليك في أقرب وقت ممكن.',
              )}
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24, marginBottom: 44 }}>
            {contactCards.map((card, index) => (
              <MotionFade key={index} direction="up" delay={index * 0.08}>
                <div
                  style={{
                    background: 'linear-gradient(180deg, color-mix(in srgb, var(--primary) 4%, var(--card-bg)) 0%, var(--card-bg) 100%)',
                    border: '1px solid var(--card-border)',
                    borderRadius: 24,
                    padding: '28px 24px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    minHeight: 190,
                    justifyContent: 'center',
                    boxShadow: '0 12px 34px var(--shadow-main)',
                  }}
                >
                  <div
                    style={{
                      background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
                      color: 'white',
                      width: 56,
                      height: 56,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: 18,
                      boxShadow: '0 12px 24px rgba(var(--primary-rgb),0.22)',
                    }}
                  >
                    {card.icon}
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 10, fontWeight: 700 }}>
                    {card.label}
                  </div>
                  {card.value.includes('@') ? (
                    <a href={`mailto:${card.value}`} style={{ fontSize: isMobile ? 22 : 18, fontWeight: 900, color: 'var(--text-main)', textDecoration: 'none', lineHeight: 1.45 }}>
                      {card.value}
                    </a>
                  ) : (
                    <div style={{ fontSize: isMobile ? 22 : 18, fontWeight: 900, color: 'var(--text-main)', lineHeight: 1.45 }}>
                      {card.value}
                    </div>
                  )}
                </div>
              </MotionFade>
            ))}
          </div>

          <MotionFade direction="up">
            <div
              style={{
                background: 'var(--card-bg)',
                borderRadius: 32,
                padding: isMobile ? '28px 18px' : '44px',
                boxShadow: '0 18px 40px var(--shadow-main)',
                border: '1px solid var(--card-border)',
              }}
            >
              {sent ? (
                <div
                  style={{
                    borderRadius: 28,
                    border: '1px solid color-mix(in srgb, var(--primary) 18%, var(--card-border))',
                    background: 'linear-gradient(180deg, color-mix(in srgb, var(--primary) 8%, var(--card-bg)) 0%, var(--card-bg) 100%)',
                    padding: isMobile ? '34px 20px' : '44px 42px',
                    textAlign: 'center',
                  }}
                >
                  <div
                    style={{
                      width: 74,
                      height: 74,
                      margin: '0 auto 18px',
                      borderRadius: '50%',
                      display: 'grid',
                      placeItems: 'center',
                      background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
                      color: '#fff',
                      boxShadow: '0 16px 30px rgba(var(--primary-rgb),0.28)',
                    }}
                  >
                    <IconCheck />
                  </div>
                  <h2 style={{ fontSize: isMobile ? 28 : 34, fontWeight: 900, color: 'var(--primary-dark)', marginBottom: 12, letterSpacing: '-0.03em' }}>
                    {t('Message Sent!', 'تم الإرسال بنجاح!')}
                  </h2>
                  <p style={{ color: 'var(--text-muted)', margin: '0 auto 22px', fontSize: isMobile ? 15 : 17, lineHeight: 1.8, maxWidth: 640 }}>
                    {t(
                      "Your message has been delivered to the Morgan's Hope inbox. We'll review it and get back to you as soon as possible.",
                      "وصلت رسالتك إلى بريد Morgan's Hope بنجاح. سنراجعها ونرد عليك في أقرب وقت ممكن.",
                    )}
                  </p>
                  <button
                    onClick={() => setSent(false)}
                    style={{
                      background: 'linear-gradient(135deg, var(--primary-dark), var(--primary))',
                      color: 'white',
                      border: 'none',
                      padding: isMobile ? '14px 24px' : '15px 34px',
                      borderRadius: 16,
                      fontWeight: 800,
                      fontSize: 16,
                      cursor: 'pointer',
                    }}
                  >
                    {t('Send Another Message', 'إرسال رسالة أخرى')}
                  </button>
                </div>
              ) : (
                <>
                  <h2 style={{ fontSize: 24, fontWeight: 800, color: 'var(--primary-dark)', marginBottom: 30, textAlign: isMobile ? 'center' : 'start' }}>
                    {t('Send us a message', 'أرسل لنا رسالة')}
                  </h2>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: isMobile ? 20 : 30 }}>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <label style={{ display: 'block', fontSize: 14, fontWeight: 700, color: 'var(--primary-dark)', marginBottom: 8 }}>
                        {t('Name*', 'الاسم*')}
                      </label>
                      <input
                        type="text"
                        placeholder={t('Enter your full name', 'أدخل اسمك الكامل')}
                        value={form.name}
                        className={inputClass}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        style={{ padding: '16px 20px', borderRadius: 14 }}
                      />
                    </div>

                    <div style={{ gridColumn: '1 / -1' }}>
                      <label style={{ display: 'block', fontSize: 14, fontWeight: 700, color: 'var(--primary-dark)', marginBottom: 8 }}>
                        {t('Phone Number', 'رقم الهاتف')}
                      </label>
                      <input
                        type="tel"
                        className={inputClass}
                        placeholder={t('Enter your phone number', 'أدخل رقم هاتفك')}
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        style={{ padding: '16px 20px', borderRadius: 14, fontSize: 15, outline: 'none' }}
                      />
                    </div>

                    <div style={{ gridColumn: '1 / -1' }}>
                      <label style={{ display: 'block', fontSize: 14, fontWeight: 700, color: 'var(--primary-dark)', marginBottom: 8 }}>
                        {t('Email*', 'البريد الإلكتروني*')}
                      </label>
                      <input
                        type="email"
                        placeholder={t('Enter your email address', 'أدخل بريدك الإلكتروني')}
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        className={inputClass}
                        style={{ padding: '16px 20px', borderRadius: 14, fontSize: 15, outline: 'none' }}
                      />
                    </div>

                    <div style={{ gridColumn: '1 / -1' }}>
                      <label style={{ display: 'block', fontSize: 14, fontWeight: 700, color: 'var(--primary-dark)', marginBottom: 8 }}>
                        {t('Message*', 'الرسالة*')}
                      </label>
                      <textarea
                        rows={5}
                        placeholder={t('Enter your message here', 'اكتب رسالتك هنا')}
                        value={form.message}
                        className={inputClass}
                        onChange={(e) => setForm({ ...form, message: e.target.value })}
                        style={{ padding: '16px 20px', borderRadius: 14, fontSize: 15, resize: 'none' }}
                      />
                    </div>

                    <div style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', alignItems: ar ? 'flex-start' : 'flex-end', gap: 10 }}>
                      {error && <div style={{ color: '#dc3545', fontSize: 13, fontWeight: 700 }}>{error}</div>}
                      <MotionHoverScale>
                        <button
                          onClick={handleSend}
                          disabled={loading || !form.name || !form.email || !form.message}
                          style={{
                            background: loading ? '#9ca3af' : 'linear-gradient(135deg, var(--primary-dark), var(--primary))',
                            color: 'white',
                            border: 'none',
                            padding: '18px 60px',
                            borderRadius: 16,
                            fontWeight: 800,
                            fontSize: 16,
                            cursor: loading ? 'not-allowed' : 'pointer',
                            boxShadow: loading ? 'none' : '0 10px 24px rgba(var(--primary-rgb),0.22)',
                          }}
                        >
                          {loading ? t('Sending...', 'جارٍ الإرسال...') : t('Submit Message', 'إرسال الرسالة')}
                        </button>
                      </MotionHoverScale>
                    </div>
                  </div>
                </>
              )}
            </div>
          </MotionFade>
        </div>
      </div>
    </MotionPageTransition>
  );
}
