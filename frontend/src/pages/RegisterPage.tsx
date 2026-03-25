import { useState, type ChangeEvent, type CSSProperties } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthLayout, AuthSection } from '../components/auth/AuthLayout';
import { useAuth } from '../context/AuthContext';

const IconShield = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const IconLock = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const IconMail = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

const IconPhone = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.4 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.88a16 16 0 0 0 6.16 6.16l.95-.95a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);

const IconUser = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
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

const IconX = () => (
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

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const toggleTheme = () => {};
  const [lang, setLang] = useState<'en' | 'ar'>('en');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [focused, setFocused] = useState('');
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    age: '',
    gender: '',
    smokingHistory: '',
    medicalHistory: '',
  });

  const ar = lang === 'ar';
  const t = (en: string, arText: string) => ar ? arText : en;

  const passStrength = strength(form.password);
  const passwordsMatch = Boolean(form.password && form.confirmPassword && form.password === form.confirmPassword);
  const strengthColors = STRENGTH_COLORS;
  const successTone = { border: 'rgba(22,101,52,0.22)', bg: 'rgba(22,101,52,0.08)', text: '#166534' };

  const handleSubmit = async () => {
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

    if (!agreed) {
      setError(t('You must accept the medical notice to continue.', 'يجب الموافقة على الملاحظة الطبية للمتابعة.'));
      return;
    }

    setLoading(true);
    setError('');

    try {
      await register({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        password: form.password,
        confirmPassword: form.confirmPassword,
        acceptedDisclaimer: agreed,
        phone: form.phone || undefined,
        age: form.age ? parseInt(form.age, 10) : undefined,
        gender: (form.gender || undefined) as 'male' | 'female' | 'other' | undefined,
        smokingHistory: (form.smokingHistory || undefined) as 'never' | 'former' | 'current' | undefined,
        medicalHistory: form.medicalHistory || undefined,
        role: (window as any).isAdminDev ? 'admin' : 'user',
      });
      navigate('/');
    } catch (err: any) {
      if (!err?.response) {
        setError(t('Cannot connect to server. Is the backend running on port 3000?', 'لا يمكن الاتصال بالخادم. هل الـ backend يعمل على المنفذ 3000؟'));
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
    onChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setForm({ ...form, [key]: e.target.value }),
    onFocus: () => setFocused(key),
    onBlur: () => setFocused(''),
  });

  const inputStyle = (field: string, customPadding?: string): CSSProperties => ({
    width: '100%',
    padding: customPadding || (ar ? '12px 44px 12px 16px' : '12px 16px 12px 44px'),
    borderRadius: 16,
    border: `1.5px solid ${focused === field ? 'var(--primary)' : 'var(--card-border)'}`,
    fontSize: 14,
    outline: 'none',
    background: 'var(--card-bg)',
    color: 'var(--text-main)',
    boxShadow: focused === field ? '0 0 0 4px rgba(var(--primary-rgb),0.1)' : 'none',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
  });

  const iconPos = (field: string): CSSProperties => ({
    position: 'absolute',
    [ar ? 'right' : 'left']: 15,
    top: '50%',
    transform: 'translateY(-50%)',
    color: focused === field ? 'var(--primary)' : 'var(--text-muted)',
    pointerEvents: 'none',
    transition: 'color 0.2s ease',
  });

  const requirementChip = (ok: boolean, text: string) => (
    <div
      key={text}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 7,
        padding: '10px 12px',
        borderRadius: 14,
        border: `1px solid ${ok ? successTone.border : 'var(--card-border)'}`,
        background: ok ? successTone.bg : 'var(--card-bg)',
        color: ok ? successTone.text : 'var(--text-muted)',
        fontSize: 12,
        fontWeight: ok ? 700 : 600,
      }}
    >
      {ok ? <IconCheck /> : <IconX />}
      <span>{text}</span>
    </div>
  );

  const requirements = [
    { ok: form.password.length >= 8, text: t('8+ characters', '8 أحرف على الأقل') },
    { ok: /[A-Z]/.test(form.password), text: t('Uppercase letter', 'حرف كبير') },
    { ok: /[a-z]/.test(form.password), text: t('Lowercase letter', 'حرف صغير') },
    { ok: /\d/.test(form.password), text: t('Number', 'رقم') },
  ];

  return (
    <>
      <AuthLayout
        dir={ar ? 'rtl' : 'ltr'}
        fontFamily={ar ? "'Cairo', sans-serif" : "'Sora', sans-serif"}
        langToggleLabel={ar ? 'EN' : 'عربي'}
        onToggleLang={() => setLang(ar ? 'en' : 'ar')}
        onToggleTheme={toggleTheme}
        themeToggleIcon={null}
        brandSlogan={t('"A Second Chance for Every Breath"', '"فرصة ثانية لكل نفس"')}
        formBadge={t('Create Account', 'إنشاء حساب')}
        formTitle={t('Set up your account', 'أنشئ حسابك')}
        formDescription={t('Add your basic details, optional profile information, and a secure password.', 'أدخل بياناتك الأساسية وبعض المعلومات الاختيارية ثم أنشئ كلمة مرور آمنة.')}
        formMaxWidth={560}
      >
        {error && (
          <div style={{ background: 'rgba(239,68,68,0.06)', border: '1.5px solid #fca5a5', borderRadius: 16, padding: '12px 14px', color: '#dc2626', fontSize: 13, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <IconAlert />
            <span>{error}</span>
          </div>
        )}

        <AuthSection
          badge={t('Basic info', 'البيانات الأساسية')}
          title={t('Account details', 'بيانات الحساب')}
          description={t('Enter the required details to create your account.', 'أدخل البيانات المطلوبة لإنشاء الحساب.')}
        >
          <div className="auth-grid-two" style={{ marginBottom: 12 }}>
            {[
              { key: 'firstName', label: t('First name', 'الاسم الأول'), placeholder: ar ? 'أحمد' : 'John' },
              { key: 'lastName', label: t('Last name', 'اسم العائلة'), placeholder: ar ? 'حسن' : 'Doe' },
            ].map((field) => (
              <div key={field.key}>
                <label className="auth-field-label">{field.label}</label>
                <div className="auth-input-shell">
                  <div style={iconPos(field.key)}>
                    <IconUser />
                  </div>
                  <input {...bind(field.key)} placeholder={field.placeholder} style={inputStyle(field.key)} />
                </div>
              </div>
            ))}
          </div>

          <div>
            <label className="auth-field-label">{t('Email', 'البريد الإلكتروني')}</label>
            <div className="auth-input-shell">
              <div style={iconPos('email')}>
                <IconMail />
              </div>
              <input {...bind('email')} type="email" placeholder="example@email.com" style={inputStyle('email')} />
            </div>
          </div>
        </AuthSection>

        <AuthSection
          badge={t('Profile', 'الملف الشخصي')}
          title={t('Additional information', 'معلومات إضافية')}
          description={t('You can add these optional details now or update them later from your profile.', 'يمكنك إضافة هذه البيانات الاختيارية الآن أو تعديلها لاحقًا من الملف الشخصي.')}
        >
          <div style={{ marginBottom: 12 }}>
            <label className="auth-field-label">
              {t('Phone', 'الهاتف')} <span className="auth-label-meta">({t('optional', 'اختياري')})</span>
            </label>
            <div className="auth-input-shell">
              <div style={iconPos('phone')}>
                <IconPhone />
              </div>
              <input {...bind('phone')} type="tel" placeholder="+20 1XX XXX XXXX" style={inputStyle('phone')} />
            </div>
          </div>

          <div className="auth-grid-two" style={{ marginBottom: 12 }}>
            <div>
              <label className="auth-field-label">
                {t('Age', 'العمر')} <span className="auth-label-meta">({t('optional', 'اختياري')})</span>
              </label>
              <input {...bind('age')} type="number" min="0" max="150" placeholder={t('e.g. 45', 'مثال: 45')} style={inputStyle('age', '12px 14px')} />
            </div>

            <div>
              <label className="auth-field-label">
                {t('Gender', 'النوع')} <span className="auth-label-meta">({t('optional', 'اختياري')})</span>
              </label>
              <select {...bind('gender')} style={inputStyle('gender', '12px 14px')}>
                <option value="">{t('Select', 'اختر')}</option>
                <option value="male">{t('Male', 'ذكر')}</option>
                <option value="female">{t('Female', 'أنثى')}</option>
                <option value="other">{t('Other', 'أخرى')}</option>
              </select>
            </div>
          </div>

          <div style={{ marginBottom: 12 }}>
            <label className="auth-field-label">
              {t('Smoking history', 'تاريخ التدخين')} <span className="auth-label-meta">({t('optional', 'اختياري')})</span>
            </label>
            <select {...bind('smokingHistory')} style={inputStyle('smokingHistory', '12px 14px')}>
              <option value="">{t('Select', 'اختر')}</option>
              <option value="never">{t('Never smoked', 'لم أدخن')}</option>
              <option value="former">{t('Former smoker', 'مدخن سابق')}</option>
              <option value="current">{t('Current smoker', 'مدخن حالي')}</option>
            </select>
          </div>

          <div>
            <label className="auth-field-label">
              {t('Medical history', 'التاريخ المرضي')} <span className="auth-label-meta">({t('optional', 'اختياري')})</span>
            </label>
            <textarea
              {...bind('medicalHistory')}
              placeholder={t('e.g. previous surgeries, chronic diseases...', 'مثل: عمليات سابقة أو أمراض مزمنة...')}
              style={{ ...inputStyle('medicalHistory', '12px 14px'), minHeight: 96, resize: 'vertical' }}
            />
          </div>
        </AuthSection>

        <AuthSection
          badge={t('Security', 'الأمان')}
          title={t('Set your password', 'أنشئ كلمة المرور')}
          description={t('Choose a password, confirm it, and review the medical notice before creating the account.', 'اختر كلمة مرور مناسبة وأكدها ثم راجع الملاحظة الطبية قبل إنشاء الحساب.')}
        >
          <div style={{ marginBottom: 12 }}>
            <label className="auth-field-label">{t('Password', 'كلمة المرور')}</label>
            <div className="auth-input-shell">
              <div style={iconPos('password')}>
                <IconLock />
              </div>
              <input
                {...bind('password')}
                type={showPass ? 'text' : 'password'}
                placeholder={t('Password', 'كلمة المرور')}
                style={{ ...inputStyle('password', '12px 44px 12px 44px'), letterSpacing: showPass ? 'normal' : '0.18em' }}
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

          {!!form.password && (
            <div style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', gap: 5, marginBottom: 10 }}>
                {[1, 2, 3, 4].map((item) => (
                  <div key={item} style={{ flex: 1, height: 6, borderRadius: 999, background: item <= passStrength ? strengthColors[passStrength] : 'var(--card-border)', transition: 'background 0.25s ease' }} />
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <span style={{ color: strengthColors[passStrength], fontSize: 12, fontWeight: 800 }}>
                  {ar ? STRENGTH_LABELS_AR[passStrength] : STRENGTH_LABELS_EN[passStrength]}
                </span>
              </div>

              <div className="auth-grid-two">
                {requirements.map((item) => requirementChip(item.ok, item.text))}
              </div>
            </div>
          )}

          <div style={{ marginBottom: 14 }}>
            <label className="auth-field-label">{t('Confirm password', 'تأكيد كلمة المرور')}</label>
            <div className="auth-input-shell">
              <input
                {...bind('confirmPassword')}
                type={showPass ? 'text' : 'password'}
                placeholder={t('Confirm password', 'تأكيد كلمة المرور')}
                style={{
                  ...inputStyle('confirmPassword', '12px 14px'),
                  letterSpacing: showPass ? 'normal' : '0.18em',
                  border: form.confirmPassword
                    ? (passwordsMatch ? '1.5px solid #22c55e' : '1.5px solid #ef4444')
                    : (focused === 'confirmPassword' ? '1.5px solid var(--primary)' : '1.5px solid var(--card-border)'),
                }}
              />
            </div>

            {!!form.confirmPassword && (
              <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color: passwordsMatch ? '#16a34a' : '#ef4444' }}>
                {passwordsMatch ? <IconCheck /> : <IconX />}
                <span>{passwordsMatch ? t('Passwords match', 'كلمتا المرور متطابقتان') : t('Passwords do not match', 'كلمتا المرور غير متطابقتين')}</span>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: 12, padding: '14px', borderRadius: 18, border: '1px solid var(--card-border)', background: 'rgba(var(--primary-rgb),0.04)' }}>
            <button
              type="button"
              onClick={() => setAgreed(!agreed)}
              style={{ width: 22, height: 22, borderRadius: 6, border: `2px solid ${agreed ? 'var(--primary)' : 'var(--text-muted)'}`, background: agreed ? 'var(--primary)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, marginTop: 2 }}
              aria-label={t('Toggle medical notice agreement', 'تبديل الموافقة على الملاحظة الطبية')}
            >
              {agreed && (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </button>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6, color: '#d97706', fontWeight: 800, fontSize: 12 }}>
                <IconAlert />
                <span>{t('Medical notice', 'ملاحظة طبية')}</span>
              </div>
              <p style={{ margin: 0, fontSize: 12.5, lineHeight: 1.7, color: 'var(--text-main)' }}>
                {t(
                  'I understand that this tool offers preliminary support only and does not replace a doctor.',
                  'أفهم أن هذه الأداة تقدم مساعدة أولية فقط ولا تغني عن مراجعة الطبيب.'
                )}
              </p>
            </div>
          </div>
        </AuthSection>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          className="auth-primary-button"
          style={{ marginTop: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: loading ? 'default' : 'pointer' }}
        >
          {loading ? (
            <>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                <path d="M21 12a9 9 0 11-6.219-8.56">
                  <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="0.8s" repeatCount="indefinite" />
                </path>
              </svg>
              {t('Creating account...', 'جارٍ إنشاء الحساب...')}
            </>
          ) : (
            t('Create account', 'إنشاء الحساب')
          )}
        </button>

        <div className="auth-note-card" style={{ marginTop: 16 }}>
          <div style={{ color: 'var(--primary)', flexShrink: 0 }}>
            <IconShield size={15} />
          </div>
          <p>{t('Your profile information stays encrypted and protected.', 'بيانات ملفك تبقى مشفرة ومحمية.')}</p>
        </div>

        <p className="auth-footer-text">
          {t('Already have an account?', 'لديك حساب بالفعل؟')}{' '}
          <Link to="/login">{t('Sign in', 'تسجيل الدخول')}</Link>
        </p>
      </AuthLayout>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=Cairo:wght@400;600;700;800;900&display=swap');
        input::placeholder,
        textarea::placeholder { color: #94a3b8; letter-spacing: 0; }
        input[type="password"] {
          appearance: none;
          -webkit-appearance: none;
          font-family: inherit;
        }
        input[type="password"]::-ms-reveal,
        input[type="password"]::-ms-clear {
          display: none;
        }
      `}</style>
    </>
  );
}
