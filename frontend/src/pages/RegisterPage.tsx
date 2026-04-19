import { useState, type ChangeEvent, type CSSProperties } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthLayout } from '../components/auth/AuthLayout';
import { useAuth } from '../context/AuthContext';

// ─── Icons ────────────────────────────────────────────────────────────────────

const IconUser = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const IconMail = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

const IconLock = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const IconEye = ({ open }: { open: boolean }) => open ? (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
) : (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

const IconCheck = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const IconXSm = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const IconAlert = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

const IconXClose = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

// ─── Password strength ────────────────────────────────────────────────────────

const strength = (password: string) => {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  return score;
};

const STRENGTH_LABELS_EN = ['', 'Weak', 'Fair', 'Good', 'Strong'];
const STRENGTH_LABELS_AR = ['', 'ضعيفة', 'مقبولة', 'جيدة', 'قوية'];
const STRENGTH_COLORS = ['', '#ef4444', '#f97316', '#ca8a04', '#166534'];

// ─── Consent Modal ────────────────────────────────────────────────────────────

function ConsentModal({ onAccept, onDecline, lang }: { onAccept: () => void; onDecline: () => void; lang: 'en' | 'ar' }) {
  const [agreed, setAgreed] = useState(false);
  const ar = lang === 'ar';
  const t = (en: string, arText: string) => ar ? arText : en;

  return (
    <div className="auth-modal-overlay" dir={ar ? 'rtl' : 'ltr'}>
      <div className="auth-modal-card">
        <button onClick={onDecline} className="auth-modal-close" aria-label={t('Close', 'إغلاق')}>
          <IconXClose />
        </button>

        <div className="auth-modal-header">
          <div className="auth-modal-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <h2 className="auth-modal-title">
            {t('Medical Research Disclaimer', 'إخلاء المسؤولية الطبية')}
          </h2>
          <p className="auth-modal-subtitle">
            {t('Step 2 of 3 — Read carefully before proceeding', 'الخطوة 2 من 3 — اقرأ بعناية قبل المتابعة')}
          </p>
        </div>

        <div className="auth-consent-scroll">
          <div style={{ textAlign: 'center', marginBottom: 16, fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 700 }}>
            {t('↓ Scroll to read all', '↓ قم بالتمرير لقراءة الكل')}
          </div>
          <p>{t(
            "Morgan's Hope is an AI-assisted lung cancer research and support platform. By creating an account, you acknowledge and agree to the following:",
            "مورغان هوب هي منصة بحثية وداعمة للكشف المبكر عن سرطان الرئة بمساعدة الذكاء الاصطناعي. بإنشاء حساب، فإنك تقر وتوافق على ما يلي:"
          )}</p>
          <ul>
            <li>{t(
              "This platform provides AI-powered preliminary analysis only and does not constitute medical advice.",
              "تقدم هذه المنصة تحليلات أولية بمساعدة الذكاء الاصطناعي فقط ولا تشكل نصيحة طبية."
            )}</li>
            <li>{t(
              "Results and insights from this tool must not replace consultation with a licensed physician or specialist.",
              "يجب ألا تحل نتائج هذه الأداة محل استشارة الطبيب المرخص أو الاختصاصي."
            )}</li>
            <li>{t(
              "Your medical data will be used exclusively for research purposes within this platform and kept strictly confidential.",
              "ستُستخدم بياناتك الطبية حصريًا لأغراض البحث داخل هذه المنصة وتُحفظ سرية تامة."
            )}</li>
            <li>{t(
              "In case of a medical emergency, please contact your local emergency services immediately.",
              "في حالة الطوارئ الطبية، يرجى الاتصال بخدمات الطوارئ المحلية فورًا."
            )}</li>
            <li>{t(
              "By proceeding, you consent to our Terms of Service and Privacy Policy.",
              "بالمتابعة، فإنك توافق على شروط الخدمة وسياسة الخصوصية."
            )}</li>
          </ul>
          <div className="auth-consent-warning" style={{ marginBottom: 20 }}>
            <IconAlert />
            <span>{t(
              "This tool is not a substitute for professional medical care.",
              "هذه الأداة ليست بديلاً عن الرعاية الطبية المتخصصة."
            )}</span>
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', padding: '12px 14px', background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: 12 }}>
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              style={{ width: 18, height: 18, accentColor: 'var(--primary)', cursor: 'pointer' }}
            />
            <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)', userSelect: 'none' }}>
              {t("I have read and understood the disclaimer.", "لقد قرأت إخلاء المسؤولية وأفهمه جيدًا.")}
            </span>
          </label>
        </div>

        <div className="auth-modal-actions">
          <button className="auth-modal-decline" onClick={onDecline}>
            {t('Back', 'رجوع')}
          </button>
          <button
            className="auth-modal-accept"
            onClick={agreed ? onAccept : undefined}
            disabled={!agreed}
            style={{ opacity: agreed ? 1 : 0.5, cursor: agreed ? 'pointer' : 'not-allowed' }}
          >
            {t('I Agree — Create Account', 'أوافق — إنشاء الحساب')}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Step Indicator ───────────────────────────────────────────────────────────

function StepIndicator({ step, lang }: { step: 1 | 2 | 3; lang: 'en' | 'ar' }) {
  const ar = lang === 'ar';
  const t = (en: string, arText: string) => ar ? arText : en;
  const steps = [
    t('Account Info', 'معلومات الحساب'),
    t('Consent', 'الموافقة'),
    t('Complete', 'اكتمل'),
  ];
  return (
    <div className="auth-step-indicator" dir={ar ? 'rtl' : 'ltr'}>
      {steps.map((label, i) => {
        const n = i + 1;
        const active = step === n;
        const done = step > n;
        return (
          <div key={n} className={`auth-step-item ${active ? 'active' : ''} ${done ? 'done' : ''}`}>
            <div className="auth-step-dot">
              {done ? <IconCheck /> : <span>{n}</span>}
            </div>
            <span className="auth-step-label">{label}</span>
            {i < steps.length - 1 && <div className={`auth-step-line ${done ? 'done' : ''}`} />}
          </div>
        );
      })}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [lang, setLang] = useState<'en' | 'ar'>('en');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [focused, setFocused] = useState('');
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [consentTarget, setConsentTarget] = useState<'email' | 'google'>('email');
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const ar = lang === 'ar';
  const t = (en: string, arText: string) => ar ? arText : en;
  const googleAuthUrl = import.meta.env.VITE_GOOGLE_AUTH_URL || `${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/auth/google`;

  const passStrength = strength(form.password);
  const passwordsMatch = Boolean(form.password && form.confirmPassword && form.password === form.confirmPassword);
  const successTone = { border: 'rgba(22,101,52,0.22)', bg: 'rgba(22,101,52,0.08)', text: '#166534' };

  const handleContinue = () => {
    if (!form.firstName || !form.lastName || !form.email || !form.password || !form.confirmPassword) {
      setError(t('Please fill in all required fields.', 'يرجى ملء جميع الحقول المطلوبة.'));
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError(t('Passwords do not match.', 'كلمتا المرور غير متطابقتين.'));
      return;
    }
    if (passStrength < 3) {
      setError(t('Password is too weak. Use uppercase, lowercase, and numbers.', 'كلمة المرور ضعيفة. استخدم أحرفًا كبيرة وصغيرة وأرقامًا.'));
      return;
    }
    setError('');
    setConsentTarget('email');
    setShowConsentModal(true);
  };

  const handleGoogleClick = () => {
    if (!googleAuthUrl) {
      setError(t('Google sign-in is not configured for this deployment yet.', 'تسجيل الدخول عبر Google غير مُعد بعد.'));
      return;
    }
    setConsentTarget('google');
    setShowConsentModal(true);
  };

  const handleConsentAccept = async () => {
    setShowConsentModal(false);

    if (consentTarget === 'google') {
      window.location.href = googleAuthUrl;
      return;
    }

    setStep(2);
    setLoading(true);
    setError('');
    try {
      await register({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        password: form.password,
        confirmPassword: form.confirmPassword,
        acceptedDisclaimer: true,
        role: (window as any).isAdminDev ? 'admin' : 'user',
      });
      setStep(3);
      // Redirect to onboarding after brief delay for UX
      setTimeout(() => navigate('/onboarding'), 800);
    } catch (err: any) {
      setStep(1);
      if (!err?.response) {
        setError(t('Cannot connect to the backend right now. Please try again in a moment.', 'لا يمكن الاتصال بالخادم حاليًا. حاول مرة أخرى بعد لحظات.'));
        return;
      }
      const msg = err.response?.data?.message;
      const details = err.response?.data?.errors;
      setError(details?.length ? details.map((item: { message: string }) => item.message).join('. ') : (msg || t('Registration failed. Please try again.', 'فشل التسجيل. يرجى المحاولة مرة أخرى.')));
    } finally {
      setLoading(false);
    }
  };

  const bind = (key: string) => ({
    value: (form as Record<string, string>)[key],
    onChange: (e: ChangeEvent<HTMLInputElement>) => setForm({ ...form, [key]: e.target.value }),
    onFocus: () => setFocused(key),
    onBlur: () => setFocused(''),
  });

  const inputStyle = (field: string, customPadding?: string): CSSProperties => ({
    width: '100%',
    padding: customPadding || (ar ? '13px 44px 13px 16px' : '13px 16px 13px 44px'),
    borderRadius: 14,
    border: `1.5px solid ${focused === field ? 'var(--primary)' : 'var(--card-border)'}`,
    fontSize: 14.5,
    outline: 'none',
    background: 'var(--card-bg)',
    color: 'var(--text-main)',
    boxShadow: focused === field ? '0 0 0 4px rgba(var(--primary-rgb),0.1)' : 'none',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
    fontFamily: 'inherit',
  });

  const iconPos = (field: string): CSSProperties => ({
    position: 'absolute',
    [ar ? 'right' : 'left']: 15,
    top: '50%',
    transform: 'translateY(-50%)',
    color: focused === field ? 'var(--primary)' : 'var(--text-muted)',
    pointerEvents: 'none',
    transition: 'color 0.2s ease',
    display: 'flex',
    alignItems: 'center',
  });

  const requirements = [
    { ok: form.password.length >= 8, text: t('8+ characters', '8 أحرف على الأقل') },
    { ok: /[A-Z]/.test(form.password), text: t('Uppercase letter', 'حرف كبير') },
    { ok: /[a-z]/.test(form.password), text: t('Lowercase letter', 'حرف صغير') },
    { ok: /\d/.test(form.password), text: t('Number', 'رقم') },
  ];

  const requirementChip = (ok: boolean, text: string) => (
    <div
      key={text}
      style={{
        display: 'flex', alignItems: 'center', gap: 7,
        padding: '10px 12px', borderRadius: 14,
        border: `1px solid ${ok ? successTone.border : 'var(--card-border)'}`,
        background: ok ? successTone.bg : 'var(--card-bg)',
        color: ok ? successTone.text : 'var(--text-muted)',
        fontSize: 12, fontWeight: ok ? 700 : 600,
      }}
    >
      {ok ? <IconCheck /> : <IconXSm />}
      <span>{text}</span>
    </div>
  );

  return (
    <>
      {showConsentModal && (
        <ConsentModal
          lang={lang}
          onAccept={handleConsentAccept}
          onDecline={() => setShowConsentModal(false)}
        />
      )}

      <AuthLayout
        dir={ar ? 'rtl' : 'ltr'}
        fontFamily={ar ? "'Cairo', sans-serif" : "'Sora', sans-serif"}
        langToggleLabel={ar ? 'EN' : 'عربي'}
        onToggleLang={() => setLang(ar ? 'en' : 'ar')}
        onToggleTheme={() => { }}
        themeToggleIcon={null}
        brandSlogan={t('"A Second Chance for Every Breath"', '"فرصة ثانية لكل نفس"')}
        formBadge=""
        hideFormBadge
        formTitle={t('Create your account', 'أنشئ حسابك')}
        formDescription={t('Join thousands of patients and researchers on a mission to fight lung cancer.', 'انضم إلى آلاف المرضى والباحثين في مهمة محاربة سرطان الرئة.')}
        formMaxWidth={500}
      >
        {/* Error */}
        {error && (
          <div style={{ background: 'rgba(239,68,68,0.06)', border: '1.5px solid #fca5a5', borderRadius: 14, padding: '12px 14px', color: '#dc2626', fontSize: 13, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
            <IconAlert />
            <span>{error}</span>
          </div>
        )}

        {/* Step Indicator */}
        <StepIndicator step={step} lang={lang} />

        {/* Step 3 — Success state */}
        {step === 3 && (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(22,163,74,0.1)', border: '2px solid rgba(22,163,74,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h3 style={{ margin: '0 0 8px', color: 'var(--text-main)', fontSize: 20, fontWeight: 800 }}>
              {t('Account created!', 'تم إنشاء الحساب!')}
            </h3>
            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: 14 }}>
              {t('Redirecting you to complete your profile…', 'جارٍ تحويلك لإكمال ملفك الشخصي…')}
            </p>
          </div>
        )}

        {/* Step 1 — Form */}
        {step === 1 && (
          <>
            {/* Name fields */}
            <div className="auth-grid-two" style={{ marginBottom: 14 }}>
              {[
                { key: 'firstName', label: t('First name', 'الاسم الأول'), placeholder: ar ? 'أحمد' : 'John' },
                { key: 'lastName', label: t('Last name', 'اسم العائلة'), placeholder: ar ? 'حسن' : 'Doe' },
              ].map((field) => (
                <div key={field.key}>
                  <label className="auth-field-label">{field.label}</label>
                  <div className="auth-input-shell">
                    <div style={iconPos(field.key)}><IconUser /></div>
                    <input {...bind(field.key)} placeholder={field.placeholder} style={inputStyle(field.key)} />
                  </div>
                </div>
              ))}
            </div>

            {/* Email */}
            <div style={{ marginBottom: 14 }}>
              <label className="auth-field-label">{t('Email address', 'البريد الإلكتروني')}</label>
              <div className="auth-input-shell">
                <div style={iconPos('email')}><IconMail /></div>
                <input {...bind('email')} type="email" placeholder="example@email.com" style={inputStyle('email')} />
              </div>
            </div>

            {/* Password */}
            <div style={{ marginBottom: 10 }}>
              <label className="auth-field-label">{t('Password', 'كلمة المرور')}</label>
              <div className="auth-input-shell">
                <div style={iconPos('password')}><IconLock /></div>
                <input
                  {...bind('password')}
                  type={showPass ? 'text' : 'password'}
                  placeholder={t('Create a password', 'أنشئ كلمة مرور')}
                  style={{ ...inputStyle('password', '13px 44px 13px 44px'), letterSpacing: showPass ? 'normal' : '0.18em' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  style={{ position: 'absolute', [ar ? 'left' : 'right']: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 0, display: 'flex', alignItems: 'center' }}
                  aria-label={showPass ? t('Hide password', 'إخفاء كلمة المرور') : t('Show password', 'إظهار كلمة المرور')}
                >
                  <IconEye open={showPass} />
                </button>
              </div>
            </div>

            {/* Password strength */}
            {!!form.password && (
              <div style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', gap: 5, marginBottom: 8 }}>
                  {[1, 2, 3, 4].map((item) => (
                    <div key={item} style={{ flex: 1, height: 5, borderRadius: 999, background: item <= passStrength ? STRENGTH_COLORS[passStrength] : 'var(--card-border)', transition: 'background 0.25s ease' }} />
                  ))}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ color: STRENGTH_COLORS[passStrength], fontSize: 12, fontWeight: 800 }}>
                    {ar ? STRENGTH_LABELS_AR[passStrength] : STRENGTH_LABELS_EN[passStrength]}
                  </span>
                </div>
                <div className="auth-grid-two">
                  {requirements.map((item) => requirementChip(item.ok, item.text))}
                </div>
              </div>
            )}

            {/* Confirm password */}
            <div style={{ marginBottom: 22 }}>
              <label className="auth-field-label">{t('Confirm password', 'تأكيد كلمة المرور')}</label>
              <div className="auth-input-shell">
                <input
                  {...bind('confirmPassword')}
                  type={showPass ? 'text' : 'password'}
                  placeholder={t('Confirm your password', 'أكد كلمة المرور')}
                  style={{
                    ...inputStyle('confirmPassword', '13px 14px'),
                    letterSpacing: showPass ? 'normal' : '0.18em',
                    border: form.confirmPassword
                      ? (passwordsMatch ? '1.5px solid #22c55e' : '1.5px solid #ef4444')
                      : (focused === 'confirmPassword' ? '1.5px solid var(--primary)' : '1.5px solid var(--card-border)'),
                  }}
                />
              </div>
              {!!form.confirmPassword && (
                <div style={{ marginTop: 7, display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color: passwordsMatch ? '#16a34a' : '#ef4444' }}>
                  {passwordsMatch ? <IconCheck /> : <IconXSm />}
                  <span>{passwordsMatch ? t('Passwords match', 'كلمتا المرور متطابقتان') : t('Passwords do not match', 'كلمتا المرور غير متطابقتين')}</span>
                </div>
              )}
            </div>

            {/* Continue Button */}
            <button
              id="register-continue-btn"
              type="button"
              onClick={handleContinue}
              className="auth-primary-button"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer' }}
            >
              {t('Continue', 'متابعة')}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                {ar ? <polyline points="15 18 9 12 15 6" /> : <polyline points="9 18 15 12 9 6" />}
              </svg>
            </button>

            <div className="auth-divider">
              <span>{t('or sign up with', 'أو سجل باستخدام')}</span>
            </div>

            <button
              type="button"
              onClick={handleGoogleClick}
              className="auth-secondary-button"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, cursor: 'pointer' }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              <span>{t('Continue with Google', 'المتابعة باستخدام Google')}</span>
            </button>
          </>
        )}

        {/* Step 2 — Loading state while registering */}
        {step === 2 && loading && (
          <div style={{ textAlign: 'center', padding: '48px 0' }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round">
              <path d="M21 12a9 9 0 11-6.219-8.56">
                <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="0.8s" repeatCount="indefinite" />
              </path>
            </svg>
            <p style={{ marginTop: 16, color: 'var(--text-muted)', fontSize: 14 }}>
              {t('Creating your account…', 'جارٍ إنشاء حسابك…')}
            </p>
          </div>
        )}

        {/* Footer link */}
        {step === 1 && (
          <p className="auth-footer-text">
            {t('Already have an account?', 'لديك حساب بالفعل؟')}{' '}
            <Link to="/login">{t('Sign in', 'تسجيل الدخول')}</Link>
          </p>
        )}
      </AuthLayout>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=Cairo:wght@400;600;700;800;900&display=swap');
        input::placeholder { color: #94a3b8; letter-spacing: 0; }
        input[type="password"] { appearance: none; -webkit-appearance: none; font-family: inherit; }
        input[type="password"]::-ms-reveal, input[type="password"]::-ms-clear { display: none; }
      `}</style>
    </>
  );
}
