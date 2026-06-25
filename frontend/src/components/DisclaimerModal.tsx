import { HiDocumentText, HiExclamationTriangle, HiHeart, HiLockClosed, HiShieldCheck } from 'react-icons/hi2';
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
    heading: t('AI-assisted screening only', 'فحص بمساعدة الذكاء الاصطناعي فقط'),
    body: t(
      'The platform supports preliminary review of supported chest scans and does not provide a final diagnosis.',
      'تدعم المنصة مراجعة أولية لصور الصدر المدعومة ولا تقدم تشخيصًا طبيًا نهائيًا.'
    ),
    icon: <HiShieldCheck size={20} />,
  },
  {
    heading: t('Physician review is required', 'مراجعة الطبيب مطلوبة'),
    body: t(
      'Do not make medical decisions based only on the AI output. Always consult a qualified physician.',
      'لا تتخذ قرارات طبية اعتمادًا على مخرجات الذكاء الاصطناعي فقط. راجع طبيبًا مؤهلًا دائمًا.'
    ),
    icon: <HiHeart size={20} />,
  },
  {
    heading: t('Privacy and data use', 'الخصوصية واستخدام البيانات'),
    body: t(
      'Uploaded scans are used to provide the requested analysis and report. Model training use requires explicit consent.',
      'تُستخدم الصور المرفوعة لتقديم التحليل والتقرير المطلوبين. استخدام البيانات لتدريب النماذج يتطلب موافقة صريحة.'
    ),
    icon: <HiLockClosed size={20} />,
  },
  {
    heading: t('Emergency symptoms', 'أعراض الطوارئ'),
    body: t(
      'For severe chest pain, severe shortness of breath, coughing blood, fainting, or confusion, contact emergency services immediately.',
      'في حالة ألم شديد بالصدر، ضيق نفس شديد، سعال مصحوب بدم، إغماء، أو ارتباك، اتصل بخدمات الطوارئ فورًا.'
    ),
    icon: <HiExclamationTriangle size={20} />,
  },
  {
    heading: t('Terms and privacy', 'الشروط والخصوصية'),
    body: t(
      'Continuing means you agree to the Terms of Service and Privacy Policy.',
      'المتابعة تعني موافقتك على شروط الخدمة وسياسة الخصوصية.'
    ),
    icon: <HiDocumentText size={20} />,
  },
];

const acknowledgments = (t: (en: string, ar: string) => string) => [
  {
    text: t(
      'I understand this tool is not a substitute for professional medical care.',
      'أفهم أن هذه الأداة ليست بديلاً عن الرعاية الطبية المتخصصة.',
    ),
  },
  {
    text: t(
      'I understand all results must be reviewed by a qualified physician.',
      'أفهم أن جميع النتائج يجب مراجعتها بواسطة طبيب مؤهل.',
    ),
  },
  {
    text: t(
      'I agree to the Terms of Service and Privacy Policy.',
      'أوافق على شروط الخدمة وسياسة الخصوصية.',
    ),
  },
];

export default function DisclaimerModal({ lang, onAccept, onDecline, subtitle, acceptLabel }: DisclaimerModalProps) {
  const ar = lang === 'ar';
  const t = (en: string, arText: string) => ar ? arText : en;
  const [isMobile, setIsMobile] = useState(false);
  const [checked, setChecked] = useState([false, false, false]);
  const allChecked = checked.every(Boolean);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 720);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  return (
    <div className="auth-modal-overlay">
      <div
        className="auth-modal-card"
        style={{ maxWidth: 720 }}
      >
        <div className="auth-modal-scroll">
          {/* Header — no close button */}
          <div className="auth-modal-header">
            <h2 className="mb-2 text-[1.5rem] md:text-[1.75rem] lg:text-[2rem] font-black text-[var(--text-main)]">
              {t('Medical Use & Consent', 'الاستخدام الطبي والموافقة')}
            </h2>
            <p className="auth-modal-subtitle">
              {subtitle || t('Step 2 of 3 - Please read before continuing', 'الخطوة 2 من 3 - يرجى القراءة قبل المتابعة')}
            </p>
            <p className="auth-modal-subtitle" style={{ textAlign: ar ? 'right' : 'left', marginTop: '10px' }}>
              {t(
                'By selecting “I understand and continue,” you confirm that Morgan’s Hope provides AI-assisted screening support only and does not replace professional medical consultation.',
                'باختيار “أفهم وأتابع”، فإنك تؤكد أن Morgan’s Hope يقدم دعم فحص بمساعدة الذكاء الاصطناعي فقط ولا يستبدل الاستشارة الطبية المتخصصة.',
              )}
            </p>
          </div>

          <div className="auth-modal-body">
            {/* Rules Section */}
            <div style={{ padding: '0 32px', marginTop: 20 }}>
              <div style={{ fontSize: 11, letterSpacing: 1.2, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 10 }}>
                {t('Important Disclaimers', 'إخلاء مسؤولية هام')}
              </div>
              <div
                className="auth-consent-scroll"
                style={{
                  padding: '16px 20px',
                  border: '1px solid var(--card-border)',
                  borderRadius: 14,
                  background: 'color-mix(in srgb, var(--card-bg) 98%, var(--primary))',
                  overflowY: 'auto',
                }}
              >
                {rules(t).map((rule, i) => (
                  <div key={i} style={{ display: 'flex', gap: 12, marginBottom: i === rules(t).length - 1 ? 0 : 18 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 12, background: 'rgba(var(--primary-rgb), 0.08)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {rule.icon}
                    </div>
                    <div>
                      <strong style={{ display: 'block', fontSize: '0.95rem', color: 'var(--text-main)', marginBottom: 4 }}>
                        {rule.heading}
                      </strong>
                      <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.7 }}>
                        {rule.body}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Acknowledgments Checklist */}
            <div style={{ padding: '0 32px', marginTop: 24 }}>
              <div style={{ fontSize: 11, letterSpacing: 1.2, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 10 }}>
                {t('Terms and Conditions', 'الشروط والأحكام')}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {acknowledgments(t).map((item, i) => (
                  <label
                    key={i}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '12px 16px',
                      borderRadius: 12,
                      cursor: 'pointer',
                      border: '1px solid var(--card-border)',
                      background: checked[i] ? 'rgba(var(--primary-rgb), 0.06)' : 'transparent',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={checked[i]}
                      onChange={(event) => {
                        const next = [...checked];
                        next[i] = event.target.checked;
                        setChecked(next);
                      }}
                      style={{ width: 18, height: 18, accentColor: 'var(--primary)', flexShrink: 0 }}
                    />
                    <span style={{ fontSize: '0.9rem', color: 'var(--text-main)', lineHeight: 1.4 }}>
                      {item.text}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="auth-modal-actions" style={{ justifyContent: 'flex-end' }}>
            <button className="auth-modal-decline" onClick={onDecline} style={{ flex: 'none', padding: '0 28px' }}>
              {t('Decline', 'رفض')}
            </button>
            <button
              className="auth-modal-accept"
              onClick={onAccept}
              disabled={!allChecked}
              style={{ flex: 'none', padding: '0 28px', opacity: allChecked ? 1 : 0.55, cursor: allChecked ? 'pointer' : 'not-allowed' }}
            >
              {acceptLabel || t('I Understand and Continue', 'أفهم وأتابع')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
