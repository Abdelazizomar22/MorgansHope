import { HiShieldCheck, HiDocumentText } from 'react-icons/hi2';
import { useState, useEffect } from 'react';

interface DisclaimerModalProps {
  lang: 'en' | 'ar';
  onAccept: () => void;
  onDecline: () => void;
  subtitle?: string;
  acceptLabel?: string;
}

const rules = (t: (en: string, ar: string) => string) => [
  {
    heading: t('AI-Powered Preliminary Analysis Only', 'تحليل أولي بالذكاء الاصطناعي فقط'),
    body: t(
      'This platform provides AI-powered preliminary analysis only and does not constitute medical advice.',
      'تقدم هذه المنصة تحليلات أولية بمساعدة الذكاء الاصطناعي فقط ولا تشكل نصيحة طبية.'
    ),
  },
  {
    heading: t('Not a Replacement for Medical Consultation', 'ليس بديلاً عن الاستشارة الطبية'),
    body: t(
      'Results and insights from this tool must not replace consultation with a licensed physician or specialist.',
      'يجب ألا تحل نتائج هذه الأداة محل استشارة الطبيب المرخص أو الاختصاصي.'
    ),
  },
  {
    heading: t('Data Use and Confidentiality', 'استخدام البيانات وسريتها'),
    body: t(
      'Your medical data will be used exclusively for research purposes within this platform and kept strictly confidential.',
      'ستُستخدم بياناتك الطبية حصريًا لأغراض البحث داخل هذه المنصة وتُحفظ سرية تامة.'
    ),
  },
  {
    heading: t('Medical Emergencies', 'حالات الطوارئ الطبية'),
    body: t(
      'In case of a medical emergency, please contact your local emergency services immediately.',
      'في حالة الطوارئ الطبية، يرجى الاتصال بخدمات الطوارئ المحلية فورًا.'
    ),
  },
  {
    heading: t('Terms and Privacy Consent', 'الموافقة على الشروط والخصوصية'),
    body: t(
      'By proceeding, you consent to our Terms of Service and Privacy Policy.',
      'بالمتابعة، فإنك توافق على شروط الخدمة وسياسة الخصوصية.'
    ),
  },
];

const acknowledgments = (t: (en: string, ar: string) => string) => [
  {
    icon: <HiShieldCheck size={20} />,
    text: t('I have read and understood the disclaimer.', 'لقد قرأت إخلاء المسؤولية وأفهمه جيدًا.'),
  },
  {
    icon: <HiDocumentText size={20} />,
    text: t('This tool is not a substitute for professional medical care.', 'هذه الأداة ليست بديلاً عن الرعاية الطبية المتخصصة.'),
  },
];

export default function DisclaimerModal({ lang, onAccept, onDecline, subtitle, acceptLabel }: DisclaimerModalProps) {
  const ar = lang === 'ar';
  const t = (en: string, arText: string) => ar ? arText : en;
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 720);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  return (
    <div className="auth-modal-overlay" dir={ar ? 'rtl' : 'ltr'}>
      <div
        className="auth-modal-card"
        style={{ maxWidth: 720 }}
      >
        {/* Header — no close button */}
        <div className="auth-modal-header">
          <div className="auth-modal-icon">
            <HiShieldCheck size={28} />
          </div>
          <h2 className="auth-modal-title">
            {t('Medical Research Disclaimer', 'إخلاء المسؤولية الطبية')}
          </h2>
          <p className="auth-modal-subtitle">
            {subtitle || t('Please read and accept before continuing', 'يرجى القراءة والموافقة قبل المتابعة')}
          </p>
        </div>

        {/* Rules Section */}
        <div style={{ padding: '0 32px', marginTop: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1.2, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 10 }}>
            {t('Important Disclaimers', 'إخلاء مسؤولية هام')}
          </div>
          <div
            className="auth-consent-scroll"
            style={{
              height: isMobile ? 220 : 280,
              padding: '16px 20px',
              border: '1px solid var(--card-border)',
              borderRadius: 14,
              background: 'color-mix(in srgb, var(--card-bg) 98%, var(--primary))',
              overflowY: 'auto',
            }}
          >
            {rules(t).map((rule, i) => (
              <div key={i} style={{ marginBottom: 20 }}>
                <strong style={{ display: 'block', fontSize: '0.95rem', color: 'var(--text-main)', marginBottom: 4 }}>
                  {rule.heading}
                </strong>
                <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.7 }}>
                  {rule.body}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Acknowledgments Checklist */}
        <div style={{ padding: '0 32px', marginTop: 24 }}>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1.2, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 10 }}>
            {t('Terms and Conditions', 'الشروط والأحكام')}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {acknowledgments(t).map((item, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '12px 16px',
                  background: 'color-mix(in srgb, var(--card-bg) 96%, var(--primary))',
                  border: '1px solid var(--card-border)',
                  borderRadius: 12,
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: 'rgba(var(--primary-rgb), 0.08)',
                    color: 'var(--primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {item.icon}
                </div>
                <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)', lineHeight: 1.4 }}>
                  {item.text}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="auth-modal-actions" style={{ justifyContent: 'flex-end' }}>
          <button className="auth-modal-decline" onClick={onDecline} style={{ flex: 'none', padding: '0 28px' }}>
            {t('Decline', 'رفض')}
          </button>
          <button className="auth-modal-accept" onClick={onAccept} style={{ flex: 'none', padding: '0 28px' }}>
            {acceptLabel || t('I Understand and Accept', 'أوافق وأتابع')}
          </button>
        </div>
      </div>
    </div>
  );
}
