import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

// ── SVG Icons ─────────────────────────────────────────────────────────────────
const IconShield = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);
const IconLock = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
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
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
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
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);
const IconAlert = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);
const IconSun = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" /></svg>;
const IconMoon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>;


const LungIcon = () => (
  <img src="/logo.png" alt="Morgan's Hope Logo" className="theme-logo" style={{ width: 180, height: 180, objectFit: 'contain', transform: 'scale(1.2)', margin: '-16px 0' }} />
);

const strength = (p: string) => {
  let s = 0;
  if (p.length >= 8) s++;
  if (/[A-Z]/.test(p)) s++;
  if (/[a-z]/.test(p)) s++;
  if (/\d/.test(p)) s++;
  return s;
};

const STRENGTH_LABELS_EN = ['', 'Weak', 'Fair', 'Good', 'Strong'];
const STRENGTH_LABELS_AR = ['', 'ضعيفة', 'مقبولة', 'جيدة', 'قوية'];
const STRENGTH_COLORS = ['', '#ef4444', '#f97316', '#eab308', '#22c55e'];
const STRENGTH_BG = ['', 'rgba(239,68,68,0.08)', 'rgba(249,115,22,0.08)', 'rgba(234,179,8,0.08)', 'rgba(34,197,94,0.08)'];

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [lang, setLang] = useState<'en' | 'ar'>('en');
  const ar = lang === 'ar';
  const t = (en: string, arText: string) => ar ? arText : en;

  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', password: '', confirmPassword: '', age: '', gender: '', smokingHistory: '', medicalHistory: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [focused, setFocused] = useState('');

  const passStrength = strength(form.password);
  const passwordsMatch = form.password && form.confirmPassword && form.password === form.confirmPassword;

  const handleSubmit = async () => {
    if (!form.firstName || !form.lastName || !form.email || !form.password || !form.confirmPassword) {
      setError(t('Please fill in all required fields.', 'يرجى ملء جميع الحقول الإلزامية.')); return;
    }
    if (form.password !== form.confirmPassword) {
      setError(t('Passwords do not match.', 'كلمتا المرور غير متطابقتين.')); return;
    }
    if (passStrength < 3) {
      setError(t('Password is too weak. Use uppercase, lowercase, and numbers.', 'كلمة المرور ضعيفة. استخدم أحرفاً كبيرة وصغيرة وأرقاماً.')); return;
    }
    if (!agreed) {
      setError(t('You must accept the medical disclaimer to continue.', 'يجب الموافقة على إخلاء المسؤولية الطبي للمتابعة.')); return;
    }
    setLoading(true); setError('');
    try {
      await register({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        password: form.password,
        confirmPassword: form.confirmPassword,
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
        setError(t('Cannot connect to server. Is the backend running on port 3000?', 'لا يمكن الاتصال بالسيرفر. هل الـ Backend شغال على المنفذ 3000؟'));
        return;
      }
      const msg = err.response?.data?.message;
      const details = err.response?.data?.errors;
      setError(details?.length ? details.map((e: { message: string }) => e.message).join('. ') : (msg || t('Registration failed. Please try again.', 'فشل التسجيل. يرجى المحاولة مرة أخرى.')));
    } finally { setLoading(false); }
  };

  const f = (key: string): any => ({
    value: (form as any)[key],
    onChange: (e: any) => setForm({ ...form, [key]: e.target.value }),
    onFocus: () => setFocused(key),
    onBlur: () => setFocused(''),
  });

  const inputStyle = (field: string, extraPad?: string): React.CSSProperties => ({
    width: '100%',
    padding: extraPad || (ar ? '11px 40px 11px 14px' : '11px 14px 11px 40px'),
    borderRadius: 9,
    border: `1.5px solid ${focused === field ? 'var(--primary)' : 'var(--card-border)'}`,
    fontSize: 13.5, fontFamily: 'inherit', outline: 'none',
    boxSizing: 'border-box' as const, background: 'var(--card-bg)', color: 'var(--text-main)',
    boxShadow: focused === field ? '0 0 0 3px rgba(var(--primary-rgb),0.09)' : 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  });

  const iconPos = (field: string): React.CSSProperties => ({
    position: 'absolute', [ar ? 'right' : 'left']: 12,
    top: '50%', transform: 'translateY(-50%)',
    color: focused === field ? 'var(--primary)' : 'var(--text-muted)',
    pointerEvents: 'none', transition: 'color 0.2s',
  });

  const reqIcon = (condition: boolean) => (
    <span style={{ color: condition ? 'var(--primary-light)' : 'var(--text-muted)' }}>
      {condition ? <IconCheck /> : <IconX />}
    </span>
  );

  const requirements = [
    { ok: form.password.length >= 8, en: '8+ characters', ar: '8 أحرف على الأقل' },
    { ok: /[A-Z]/.test(form.password), en: 'Uppercase letter', ar: 'حرف كبير (A-Z)' },
    { ok: /[a-z]/.test(form.password), en: 'Lowercase letter', ar: 'حرف صغير (a-z)' },
    { ok: /\d/.test(form.password), en: 'Number (0-9)', ar: 'رقم (0-9)' },
  ];

  return (
    <div dir={ar ? 'rtl' : 'ltr'} className="grid grid-cols-1 lg:grid-cols-2" style={{ minHeight: '100vh', background: 'var(--bg-main)', fontFamily: ar ? "'Cairo', sans-serif" : "'Sora', sans-serif" }}>

      {/* ── LEFT PANEL ────────────────────────────────────────────────── */}
      <div className="flex flex-col justify-center items-center py-10 px-6 lg:py-[60px] lg:px-[40px] text-white relative overflow-hidden h-full min-h-[300px]"
        style={{ padding: '20px 20px', background: 'var(--panel-gradient)' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)', backgroundSize: '44px 44px' }} />
        <div style={{ position: 'absolute', width: 360, height: 360, borderRadius: '50%', background: 'radial-gradient(circle, rgba(var(--primary-light-rgb),0.11) 0%, transparent 70%)', top: '5%', left: '-15%', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', width: 280, height: 280, borderRadius: '50%', background: 'radial-gradient(circle, rgba(var(--primary-light-rgb),0.09) 0%, transparent 70%)', bottom: '5%', right: '-8%', pointerEvents: 'none' }} />
        {[340, 255, 175].map((s, i) => (
          <div key={i} style={{ position: 'absolute', width: s, height: s, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.055)', top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }} />
        ))}

        <div style={{ position: 'relative', textAlign: 'center', maxWidth: 310 }}>
          <div style={{ marginBottom: 28, display: 'flex', justifyContent: 'center' }}><LungIcon /></div>
          <h1 style={{ fontSize: 28, fontWeight: 800, margin: '0 0 6px', letterSpacing: -0.4, lineHeight: 1.1 }}>
            <span style={{ color: 'white' }}>Morgan's </span>
            <span style={{ color: 'white', opacity: 0.85 }}>Hope</span>
          </h1>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', fontStyle: 'italic', marginBottom: 32, letterSpacing: 0.3 }}>
            {t('"A Second Chance for Every Breath"', '"فرصة ثانية لكل نَفَس"')}
          </p>



          <div style={{ marginTop: 22, display: 'inline-flex', alignItems: 'center', gap: 7, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 99, padding: '7px 16px' }}>
            <div style={{ color: '#ffffff' }}><IconShield size={15} /></div>
            <span style={{ fontSize: 10.5, fontWeight: 700, color: '#ffffff', letterSpacing: 0.8, textTransform: 'uppercase' as const }}>{t('256-BIT SSL ENCRYPTED', 'مشفر بـ SSL 256-BIT')}</span>
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL (FORM) ────────────────────────────────────────── */}
      <div className="flex flex-col justify-center items-center relative overflow-y-auto"
        style={{ padding: '40px 24px', background: 'var(--bg-main)' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 30% 20%, rgba(var(--primary-rgb),0.04) 0%, transparent 60%), radial-gradient(ellipse at 80% 80%, rgba(var(--primary-rgb),0.03) 0%, transparent 50%)', pointerEvents: 'none' }} />

        {/* Toggles — fixed top corner */}
        <div style={{ position: 'fixed', top: 16, [ar ? 'left' : 'right']: 16, display: 'flex', gap: 8, zIndex: 2000 }}>
          <button onClick={toggleTheme} style={{ background: 'var(--card-bg)', border: '1.5px solid var(--card-border)', borderRadius: 7, padding: '7px', cursor: 'pointer', color: 'var(--text-main)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 4px var(--shadow-main)' }}>
            {theme === 'light' ? <IconMoon /> : <IconSun />}
          </button>
          <button onClick={() => setLang(ar ? 'en' : 'ar')} style={{ background: 'var(--card-bg)', border: '1.5px solid var(--card-border)', borderRadius: 7, padding: '5px 13px', cursor: 'pointer', color: 'var(--accent-color)', fontWeight: 700, fontSize: 12, fontFamily: 'inherit', letterSpacing: 0.5, boxShadow: '0 1px 4px var(--shadow-main)' }}>
            {ar ? 'EN' : 'عربي'}
          </button>
        </div>

        <div style={{ width: '100%', maxWidth: 400, position: 'relative' }}>

          {/* Heading */}
          <div style={{ marginBottom: 22 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--primary)', borderRadius: 6, padding: '6px 12px', marginBottom: 12, boxShadow: '0 2px 8px var(--shadow-main)' }}>
              <div style={{ color: '#ffffff' }}><IconShield size={13} /></div>
              <span style={{ fontSize: 11, fontWeight: 800, color: '#ffffff', letterSpacing: 1.2, textTransform: 'uppercase' as const }}>{t('Create Secure Account', 'إنشاء حساب آمن')}</span>
            </div>
            <h2 style={{ fontSize: 26, fontWeight: 900, color: 'var(--text-main)', margin: '0 0 6px', letterSpacing: -0.4 }}>{t('Start your health journey', 'ابدأ رحلتك الصحية')}</h2>
            <p style={{ color: 'var(--primary)', fontSize: 14, fontWeight: 600, margin: 0, lineHeight: 1.55 }}>{t('Free account · No credit card required · Results in seconds.', 'حساب مجاني · لا يلزم بطاقة ائتمان · نتائج في ثوانٍ.')}</p>
          </div>

          {/* Error */}
          {error && (
            <div style={{ background: 'rgba(239,68,68,0.05)', border: '1.5px solid #fca5a5', borderRadius: 10, padding: '10px 14px', color: '#dc2626', fontSize: 13, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <IconAlert />{error}
            </div>
          )}

          {/* Name row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-[13px]">
            {[
              { key: 'firstName', en: 'First Name', ar: 'الاسم الأول', ph: ar ? 'أحمد' : 'John' },
              { key: 'lastName', en: 'Last Name', ar: 'اسم العائلة', ph: ar ? 'حسن' : 'Doe' },
            ].map(({ key, en, ar: arLabel, ph }) => (
              <div key={key}>
                <label style={{ display: 'block', fontWeight: 700, color: 'var(--text-main)', fontSize: 12.5, marginBottom: 5, letterSpacing: 0.2 }}>{t(en, arLabel)}</label>
                <div style={{ position: 'relative' }}>
                  <div style={iconPos(key)}><IconUser /></div>
                  <input {...f(key)} placeholder={ph} style={inputStyle(key)} />
                </div>
              </div>
            ))}
          </div>

          {/* Email */}
          <div style={{ marginBottom: 13 }}>
            <label style={{ display: 'block', fontWeight: 700, color: 'var(--text-main)', fontSize: 12.5, marginBottom: 5, letterSpacing: 0.2 }}>{t('Email Address', 'البريد الإلكتروني')}</label>
            <div style={{ position: 'relative' }}>
              <div style={iconPos('email')}><IconMail /></div>
              <input {...f('email')} type="email" placeholder="example@email.com" style={inputStyle('email')} />
            </div>
          </div>

          {/* Phone */}
          <div style={{ marginBottom: 13 }}>
            <label style={{ display: 'block', fontWeight: 700, color: 'var(--text-main)', fontSize: 12.5, marginBottom: 5, letterSpacing: 0.2 }}>
              {t('Phone', 'الهاتف')}{' '}
              <span style={{ fontWeight: 500, color: 'var(--text-muted)', fontSize: 11 }}>({t('optional', 'اختياري')})</span>
            </label>
            <div style={{ position: 'relative' }}>
              <div style={iconPos('phone')}><IconPhone /></div>
              <input {...f('phone')} type="tel" placeholder="+20 1XX XXX XXXX" style={inputStyle('phone')} />
            </div>
          </div>

          {/* Age & Gender row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-[13px]">
            <div>
              <label style={{ display: 'block', fontWeight: 700, color: 'var(--text-main)', fontSize: 12.5, marginBottom: 5, letterSpacing: 0.2 }}>
                {t('Age', 'العمر')}{' '}
                <span style={{ fontWeight: 500, color: 'var(--text-muted)', fontSize: 11 }}>({t('optional', 'اختياري')})</span>
              </label>
              <input {...f('age')} type="number" min="0" max="150" placeholder={t('e.g. 45', 'مثلاً 45')} style={{ ...inputStyle('age', '11px 14px 11px 14px'), paddingRight: 14, paddingLeft: 14 }} />
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: 700, color: 'var(--text-main)', fontSize: 12.5, marginBottom: 5, letterSpacing: 0.2 }}>
                {t('Gender', 'الجنس')}{' '}
                <span style={{ fontWeight: 500, color: 'var(--text-muted)', fontSize: 11 }}>({t('optional', 'اختياري')})</span>
              </label>
              <select {...f('gender')} style={{ ...inputStyle('gender', '11px 14px 11px 14px'), paddingRight: 14, paddingLeft: 14, appearance: 'none' }}>
                <option value="">{t('Select', 'اختر')}</option>
                <option value="male">{t('Male', 'ذكر')}</option>
                <option value="female">{t('Female', 'أنثى')}</option>
              </select>
            </div>
          </div>

          {/* Smoking History */}
          <div style={{ marginTop: 13, marginBottom: 13 }}>
            <label style={{ display: 'block', fontWeight: 700, color: 'var(--text-main)', fontSize: 12.5, marginBottom: 5, letterSpacing: 0.2 }}>
              {t('Smoking History', 'تاريخ التدخين')}{' '}
              <span style={{ fontWeight: 500, color: 'var(--text-muted)', fontSize: 11 }}>({t('optional', 'اختياري')})</span>
            </label>
            <select {...f('smokingHistory')} style={{ ...inputStyle('smokingHistory', '11px 14px 11px 14px'), paddingRight: 14, paddingLeft: 14, appearance: 'none', width: '100%' }}>
              <option value="">{t('Select History', 'اختر الحالة')}</option>
              <option value="never">{t('Never Smoked', 'لم أدخن أبداً')}</option>
              <option value="former">{t('Former Smoker', 'مدخن سابق')}</option>
              <option value="current">{t('Current Smoker', 'مدخن حالي')}</option>
            </select>
          </div>

          {/* Medical History */}
          <div style={{ marginBottom: 13 }}>
            <label style={{ display: 'block', fontWeight: 700, color: 'var(--text-main)', fontSize: 12.5, marginBottom: 5, letterSpacing: 0.2 }}>
              {t('Medical History', 'التاريخ المرضي')}{' '}
              <span style={{ fontWeight: 500, color: 'var(--text-muted)', fontSize: 11 }}>({t('optional', 'اختياري')})</span>
            </label>
            <textarea
              {...f('medicalHistory')}
              placeholder={t('e.g. Previous surgeries, chronic diseases...', 'مثلاً: جراحات سابقة، أمراض مزمنة...')}
              style={{ ...inputStyle('medicalHistory', '11px 14px'), height: 80, resize: 'none' }}
            />
          </div>

          {/* Password */}
          <div style={{ marginBottom: 13 }}>
            <label style={{ display: 'block', fontWeight: 700, color: 'var(--text-main)', fontSize: 12.5, marginBottom: 5, letterSpacing: 0.2 }}>{t('Password', 'كلمة المرور')}</label>
            <div style={{ position: 'relative' }}>
              <div style={iconPos('password')}><IconLock /></div>
              <input {...f('password')} type={showPass ? 'text' : 'password'} placeholder="••••••••" style={inputStyle('password', ar ? '11px 40px 11px 40px' : '11px 40px 11px 40px')} />
              <button onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', [ar ? 'left' : 'right']: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 0, display: 'flex', alignItems: 'center' }}>
                <IconEye open={showPass} />
              </button>
            </div>

            {/* Strength bar */}
            {form.password && (
              <div style={{ marginTop: 8 }}>
                <div style={{ display: 'flex', gap: 4, marginBottom: 6 }}>
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} style={{ flex: 1, height: 4, borderRadius: 99, background: i <= passStrength ? STRENGTH_COLORS[passStrength] : '#e4eaf3', transition: 'background 0.3s' }} />
                  ))}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontSize: 11.5, fontWeight: 700, color: STRENGTH_COLORS[passStrength] }}>
                    {ar ? STRENGTH_LABELS_AR[passStrength] : STRENGTH_LABELS_EN[passStrength]}
                  </span>
                </div>
                {/* Requirement chips */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-2 gap-y-1">
                  {requirements.map((req, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: req.ok ? '#16a34a' : '#94a3b8', fontWeight: req.ok ? 600 : 500 }}>
                      {reqIcon(req.ok)}{ar ? req.ar : req.en}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontWeight: 700, color: 'var(--text-main)', fontSize: 12.5, marginBottom: 5, letterSpacing: 0.2 }}>{t('Confirm Password', 'تأكيد كلمة المرور')}</label>
            <input
              {...f('confirmPassword')}
              type={showPass ? 'text' : 'password'}
              placeholder="••••••••"
              style={{ ...inputStyle('confirmPassword', ar ? '11px 14px' : '11px 14px'), paddingLeft: 14, paddingRight: 14, border: `1.5px solid ${form.confirmPassword ? (passwordsMatch ? 'var(--primary-light)' : '#ef4444') : (focused === 'confirmPassword' ? 'var(--primary)' : 'var(--card-border)')}` }}
            />
            {form.confirmPassword && (
              <div style={{ fontSize: 11.5, fontWeight: 600, marginTop: 5, color: passwordsMatch ? 'var(--primary-light)' : '#ef4444', display: 'flex', alignItems: 'center', gap: 5 }}>
                {passwordsMatch ? <IconCheck /> : <IconX />}
                {passwordsMatch ? t('Passwords match', 'كلمتا المرور متطابقتان') : t('Passwords do not match', 'كلمتا المرور غير متطابقتين')}
              </div>
            )}
          </div>

          {/* Disclaimer */}
          <div style={{ background: 'var(--bg-main)', border: '1.5px solid var(--card-border)', borderRadius: 10, padding: '14px 16px', display: 'flex', gap: 12, marginBottom: 20 }}>
            <div onClick={() => setAgreed(!agreed)} style={{ width: 18, height: 18, borderRadius: 4, border: `2px solid ${agreed ? 'var(--primary)' : 'var(--text-muted)'}`, background: agreed ? 'var(--primary)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, marginTop: 2, transition: 'all 0.2s' }}>
              {agreed && <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>}
            </div>
            <p style={{ fontSize: 12, color: 'var(--text-main)', margin: 0, lineHeight: 1.65, fontWeight: 500 }}>
              <span style={{ fontWeight: 700, color: '#d97706', display: 'flex', alignItems: 'center', gap: 6 }}>
                <IconAlert />
                {t('Medical Disclaimer: ', 'إخلاء مسؤولية طبي: ')}
              </span>
              {t(
                'I understand this AI tool provides preliminary diagnostic assistance only and does not replace a qualified physician\'s judgment.',
                'أفهم أن هذه الأداة تقدم مساعدة تشخيصية أولية فقط ولا تغني عن رأي الطبيب المختص.'
              )}
            </p>
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{ width: '100%', padding: '13.5px 0', borderRadius: 10, border: 'none', background: loading ? 'var(--card-border)' : 'linear-gradient(135deg, var(--primary-dark) 0%, var(--primary) 100%)', color: loading ? 'var(--text-muted)' : 'white', fontWeight: 700, fontSize: 14.5, cursor: loading ? 'default' : 'pointer', boxShadow: loading ? 'none' : '0 4px 18px var(--shadow-hover)', fontFamily: 'inherit', letterSpacing: 0.2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'all 0.2s' }}
          >
            {loading
              ? <><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M21 12a9 9 0 11-6.219-8.56"><animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="0.8s" repeatCount="indefinite" /></path></svg>{t('Creating account...', 'جاري الإنشاء...')}</>
              : t('Create Secure Account', 'إنشاء الحساب الآمن')}
          </button>

          {/* Privacy note */}
          <div style={{ marginTop: 14, padding: '10px 13px', background: 'rgba(var(--primary-light-rgb),0.06)', border: '1px solid rgba(var(--primary-light-rgb),0.18)', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ color: 'var(--primary-light)', flexShrink: 0 }}><IconShield size={13} /></div>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
              {t('Your data is fully encrypted.', 'بياناتك مشفرة تماماً.')}
            </p>
          </div>

          <p style={{ textAlign: 'center', marginTop: 18, fontSize: 13, color: 'var(--text-muted)' }}>
            {t('Already have an account?', 'لديك حساب بالفعل؟')}{' '}
            <Link to="/login" style={{ color: 'var(--accent-color)', fontWeight: 800, textDecoration: 'none' }}>{t('Sign in', 'تسجيل الدخول')}</Link>
          </p>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=Cairo:wght@400;600;700;800;900&display=swap');
        * { box-sizing: border-box; }
        input::placeholder { color: #b4bfce; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 10px; }

      `}</style>
    </div>
  );
}
