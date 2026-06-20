import { HiCheck } from 'react-icons/hi2';
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
    heading: t('AI-Assisted Preliminary Screening Only', 'فحص أولي بمساعدة الذكاء الاصطناعي فقط'),
    body: t(
      "Morgan's Hope provides AI-powered preliminary screening support. It does not provide a final diagnosis, medical advice, treatment plan, or prescription.",
      "يقدّم Morgan's Hope دعم فحص أولي بالذكاء الاصطناعي. ولا يقدّم تشخيصاً نهائياً، أو نصيحة طبية، أو خطة علاج، أو وصفة طبية."
    ),
  },
  {
    heading: t('Not a Replacement for Medical Consultation', 'ليس بديلاً عن الاستشارة الطبية'),
    body: t(
      'Results and insights from the platform must be reviewed by a licensed physician or specialist before any medical decision is made.',
      'يجب مراجعة نتائج المنصة ورؤاها من قبل طبيب مرخص أو أخصائي قبل اتخاذ أي قرار طبي.'
    ),
  },
  {
    heading: t('Data Use and Confidentiality', 'استخدام البيانات وسريتها'),
    body: t(
      'Uploaded scans and account information are used to provide platform functionality, generate analysis results, and create reports. Your medical data is handled confidentially and is not sold or shared for advertising.',
      'تُستخدم الصور المرفوعة ومعلومات الحساب لتقديم وظائف المنصة، وإنشاء نتائج التحليل، وإصدار التقارير. تُعامل بياناتك الطبية بسرية تامة ولا تُباع أو تُشارك لأغراض إعلانية.'
    ),
  },
  {
    heading: t('Medical Emergencies', 'حالات الطوارئ الطبية'),
    body: t(
      "Morgan's Hope is not an emergency service. If you experience severe symptoms such as chest pain, severe shortness of breath, coughing blood, fainting, or confusion, contact local emergency services immediately.",
      "Morgan's Hope ليست خدمة طوارئ. إذا شعرت بأعراض شديدة مثل ألم في الصدر، أو ضيق شديد في التنفس، أو سعال مصحوب بدم، أو إغماء، أو ارتباك، فتواصل فوراً مع خدمات الطوارئ المحلية."
    ),
  },
  {
    heading: t('Terms and Privacy Consent', 'الموافقة على الشروط والخصوصية'),
    body: t(
      'By proceeding, you agree to the platform Terms of Service and Privacy Policy, including the processing of uploaded scans for AI-assisted analysis and report generation.',
      'بالمتابعة، فإنك توافق على شروط الخدمة وسياسة الخصوصية الخاصة بالمنصة، بما في ذلك معالجة الصور المرفوعة لأغراض التحليل بالذكاء الاصطناعي وإنشاء التقارير.'
    ),
  },
];

const consentItems = (t: (en: string, ar: string) => string) => [
  {
    text: t('I have read and understood the medical disclaimer.', 'لقد قرأت إخلاء المسؤولية الطبية وفهمته.'),
  },
  {
    text: t("I understand that Morgan's Hope is not a substitute for professional medical care.", "أتفهم أن Morgan's Hope ليست بديلاً عن الرعاية الطبية المتخصصة."),
  },
  {
    text: t('I understand that results must be reviewed by a qualified physician or specialist.', 'أتفهم أنه يجب مراجعة النتائج من قبل طبيب أو أخصائي مؤهل.'),
  },
  {
    text: t('I agree to the Terms of Service and Privacy Policy.', 'أوافق على شروط الخدمة وسياسة الخصوصية.'),
  },
  {
    text: t(
      'I consent to the processing of my uploaded scans and account information for platform analysis and report generation.',
      'أوافق على معالجة الصور المرفوعة ومعلومات حسابي لأغراض التحليل وإنشاء التقارير داخل المنصة.'
    ),
  },
];

export default function DisclaimerModal({ lang, onAccept, onDecline, subtitle, acceptLabel }: DisclaimerModalProps) {
  const ar = lang === 'ar';
  const t = (en: string, arText: string) => ar ? arText : en;
  const [isMobile, setIsMobile] = useState(false);
  const items = consentItems(t);
  const [checked, setChecked] = useState<boolean[]>(Array(items.length).fill(false));
  const allChecked = checked.every(Boolean);
  const toggleCheck = (i: number) => setChecked(prev => prev.map((v, idx) => idx === i ? !v : v));

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
              {t('Medical Use & Consent Disclaimer', 'إخلاء المسؤولية الطبية والموافقة')}
            </h2>
            <p className="auth-modal-subtitle">
              {subtitle || t('Step 2 of 3 - Please read carefully before proceeding', 'الخطوة 2 من 3 - يرجى القراءة بعناية قبل المتابعة')}
            </p>
            <p className="auth-modal-subtitle" style={{ textAlign: ar ? 'right' : 'left', marginTop: '10px' }}>
              {t(
                'Before using Morgan\'s Hope, please read and accept the following medical and privacy terms. By selecting "I Understand and Accept", you acknowledge that the platform provides AI-assisted preliminary screening support only and does not replace professional medical consultation.',
                'قبل استخدام Morgan\'s Hope، يرجى قراءة الشروط الطبية وشروط الخصوصية التالية والموافقة عليها. وباختيارك "أفهم وأوافق"، فإنك تقر بأن المنصة تقدّم دعم فحص أولي بمساعدة الذكاء الاصطناعي فقط، ولا تحل محل الاستشارة الطبية المتخصصة.'
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

            {/* Consent Checklist */}
            <div style={{ padding: '0 32px', marginTop: 24 }}>
              <div style={{ fontSize: 11, letterSpacing: 1.2, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 10 }}>
                {t('Terms and Conditions', 'الشروط والأحكام')}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {items.map((item, i) => (
                  <label
                    key={i}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '12px 16px',
                      borderRadius: 12,
                      cursor: 'pointer',
                    }}
                  >
                    <div
                      onClick={(e) => { e.preventDefault(); toggleCheck(i); }}
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: 4,
                        border: '1.5px solid var(--card-border)',
                        background: checked[i] ? 'var(--primary)' : 'transparent',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        transition: 'all 0.15s ease',
                        cursor: 'pointer',
                      }}
                    >
                      {checked[i] && <HiCheck size={16} color="#fff" />}
                    </div>
                    <span style={{ fontSize: '0.9rem', color: 'var(--text-main)', lineHeight: 1.4, userSelect: 'none' }}>
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
              style={{ flex: 'none', padding: '0 28px', opacity: allChecked ? 1 : 0.5, cursor: allChecked ? 'pointer' : 'not-allowed' }}
            >
              {acceptLabel || t('I Understand and Accept', 'أوافق وأتابع')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
