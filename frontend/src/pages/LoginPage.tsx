import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

// ── SVG Icon Components ───────────────────────────────────────────────────────
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
const IconCertificate = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="6" />
    <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" />
    <circle cx="12" cy="8" r="2" />
  </svg>
);
const IconStopwatch = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="13" r="8" />
    <path d="M12 9v4l2.5 2.5" /><path d="M10 2h4" /><path d="M12 2v3" /><path d="M19.5 6.5l-1.5 1.5" />
  </svg>
);
const IconNeural = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="4" r="1.5" /><circle cx="4" cy="12" r="1.5" /><circle cx="20" cy="12" r="1.5" /><circle cx="12" cy="20" r="1.5" /><circle cx="12" cy="12" r="2" />
    <line x1="12" y1="5.5" x2="12" y2="10" /><line x1="5.5" y1="12" x2="10" y2="12" /><line x1="14" y1="12" x2="18.5" y2="12" /><line x1="12" y1="14" x2="12" y2="18.5" />
    <line x1="13.4" y1="10.6" x2="18.5" y2="13.5" /><line x1="5.5" y1="13.5" x2="10.6" y2="10.6" />
  </svg>
);
const IconHospitalPin = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <line x1="9" y1="22" x2="9" y2="12" /><line x1="15" y1="22" x2="15" y2="12" />
    <line x1="9" y1="12" x2="15" y2="12" /><line x1="12" y1="9" x2="12" y2="15" />
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
  <img src="/logo.png" alt="Morgan's Hope Logo" className="theme-logo" style={{ width: 140, height: 140, objectFit: 'contain', transform: 'scale(1.3)', margin: '-20px 0' }} />
);

export default function LoginPage() {
  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [lang, setLang] = useState<'en' | 'ar'>('en');
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [focused, setFocused] = useState('');

  const ar = lang === 'ar';
  const t = (en: string, arText: string) => ar ? arText : en;

  const handleSubmit = async () => {
    if (!email || !pass) { setError(t('Please fill in all fields.', 'يرجى ملء جميع الحقول.')); return; }
    setLoading(true); setError('');
    try {
      await login(email, pass, rememberMe);
    } catch (err: any) {
      if (!err?.response) {
        setError(t('Cannot connect to server. Is the backend running on port 3000?', 'لا يمكن الاتصال بالسيرفر. هل الـ Backend شغال على المنفذ 3000؟'));
        return;
      }
      const msg = err.response?.data?.message;
      const details = err.response?.data?.errors;
      const text = details?.length ? details.map((e: { message: string }) => e.message).join('. ') : msg;
      setError(text || t('Invalid email or password.', 'البريد الإلكتروني أو كلمة المرور غير صحيحة.'));
    } finally { setLoading(false); }
  };

  const features = [
    { Icon: IconCertificate, en: '99.86% CT Scan Accuracy', ar: 'دقة 99.86% في تحليل CT' },
    { Icon: IconStopwatch, en: 'Fast Batch Scan Processing', ar: 'معالجة سريعة للدفعات' },
    { Icon: IconNeural, en: 'Advanced AI Neural Network', ar: 'شبكة عصبية متقدمة' },
    { Icon: IconHospitalPin, en: 'Nearest Hospital Guidance', ar: 'توجيه لأقرب مستشفى' },
  ];

  const inputStyle = (field: string): React.CSSProperties => ({
    width: '100%',
    padding: ar ? '13px 44px 13px 16px' : '13px 16px 13px 44px',
    borderRadius: 10,
    border: `1.5px solid ${focused === field ? 'var(--primary)' : 'var(--card-border)'}`,
    fontSize: 14, fontFamily: 'inherit', outline: 'none',
    boxSizing: 'border-box', background: 'var(--card-bg)', color: 'var(--text-main)',
    boxShadow: focused === field ? '0 0 0 3.5px rgba(var(--primary-rgb),0.09)' : 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  });

  const iconWrap = (field: string): React.CSSProperties => ({
    position: 'absolute', [ar ? 'right' : 'left']: 14,
    top: '50%', transform: 'translateY(-50%)',
    color: focused === field ? 'var(--primary)' : 'var(--text-muted)',
    pointerEvents: 'none', transition: 'color 0.2s',
  });

  return (
    <div dir={ar ? 'rtl' : 'ltr'} style={{ minHeight: '100vh', display: 'grid', gridTemplateColumns: '1fr 1fr', background: 'var(--bg-main)', fontFamily: ar ? "'Cairo', sans-serif" : "'Sora', sans-serif" }}>

      {/* ── LEFT: BRAND PANEL ────────────────────────────────────────── */}
      <div style={{ background: 'var(--panel-gradient)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '60px 40px', color: 'white', position: 'relative', overflow: 'hidden' }}>
        {/* Grid texture */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)', backgroundSize: '44px 44px' }} />
        {/* Glow blobs */}
        <div style={{ position: 'absolute', width: 380, height: 380, borderRadius: '50%', background: 'radial-gradient(circle, rgba(var(--primary-light-rgb),0.11) 0%, transparent 70%)', top: '5%', left: '-15%', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', width: 280, height: 280, borderRadius: '50%', background: 'radial-gradient(circle, rgba(var(--primary-light-rgb),0.09) 0%, transparent 70%)', bottom: '5%', right: '-8%', pointerEvents: 'none' }} />
        {/* Rings */}
        {[350, 265, 185].map((s, i) => (
          <div key={i} style={{ position: 'absolute', width: s, height: s, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.055)', top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }} />
        ))}


        <div style={{ position: 'relative', textAlign: 'center', maxWidth: 320 }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 12 }}>
            {t('Secure Medical Portal', 'بوابة طبية آمنة')}
          </div>
          <div style={{ marginBottom: 22, display: 'flex', justifyContent: 'center' }}><LungIcon /></div>

          <h1 style={{ fontSize: 28, fontWeight: 800, margin: '0 0 6px', letterSpacing: -0.3, lineHeight: 1.1 }}>
            <span style={{ color: 'white' }}>Morgan's </span>
            <span style={{ color: 'white', opacity: 0.85 }}>Hope</span>
          </h1>
          <p style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.8)', fontStyle: 'italic', marginBottom: 34, letterSpacing: 0.3 }}>
            {t('"Legacy of Care, Vision of Hope."', '"إرث من الرعاية، ورؤية من الأمل."')}
          </p>



          <div style={{ marginTop: 24, display: 'inline-flex', alignItems: 'center', gap: 7, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 99, padding: '7px 16px' }}>
            <div style={{ color: '#ffffff' }}><IconShield size={16} /></div>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#ffffff', letterSpacing: 0.8, textTransform: 'uppercase' as const }}>{t('256-BIT SSL ENCRYPTED', 'مشفر بـ SSL 256-BIT')}</span>
          </div>
        </div>
      </div>

      {/* ── RIGHT: FORM PANEL ────────────────────────────────────────── */}
      <div style={{ background: 'var(--bg-main)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '60px 64px', position: 'relative' }}>
        {/* Dot pattern */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(var(--text-muted) 1.2px, transparent 1.2px)', backgroundSize: '26px 26px', opacity: 0.15, pointerEvents: 'none' }} />

        {/* Toggles */}
        <div style={{ position: 'absolute', top: 22, [ar ? 'left' : 'right']: 22, display: 'flex', gap: 10, zIndex: 10 }}>
          <button onClick={toggleTheme} style={{ background: 'var(--card-bg)', border: '1.5px solid var(--card-border)', borderRadius: 7, padding: '7px', cursor: 'pointer', color: 'var(--text-main)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 4px var(--shadow-main)' }}>
            {theme === 'light' ? <IconMoon /> : <IconSun />}
          </button>
          <button onClick={() => setLang(ar ? 'en' : 'ar')} style={{ background: 'var(--card-bg)', border: '1.5px solid var(--card-border)', borderRadius: 7, padding: '5px 13px', cursor: 'pointer', color: 'var(--accent-color)', fontWeight: 700, fontSize: 12, fontFamily: 'inherit', letterSpacing: 0.5, boxShadow: '0 1px 4px var(--shadow-main)' }}>
            {ar ? 'EN' : 'عربي'}
          </button>
        </div>

        <div style={{ width: '100%', maxWidth: 370, position: 'relative' }}>
          {/* Heading */}
          <div style={{ marginBottom: 30 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--primary)', borderRadius: 6, padding: '6px 12px', marginBottom: 13, boxShadow: '0 2px 8px var(--shadow-main)' }}>
              <div style={{ color: '#ffffff' }}><IconShield size={14} /></div>
              <span style={{ fontSize: 11, fontWeight: 800, color: '#ffffff', letterSpacing: 1.2, textTransform: 'uppercase' as const }}>{t('Secure Medical Portal', 'البوابة الطبية الآمنة')}</span>
            </div>
            <h2 style={{ fontSize: 26, fontWeight: 900, color: 'var(--text-main)', margin: '0 0 7px', letterSpacing: -0.4 }}>{t('Welcome back', 'مرحباً بعودتك')}</h2>
            <p style={{ color: 'var(--primary)', fontSize: 14, fontWeight: 600, margin: 0, lineHeight: 1.6 }}>{t('Sign in to access your medical analysis dashboard.', 'سجّل دخولك للوصول للوحة التحكم الطبية.')}</p>
          </div>

          {/* Error */}
          {error && (
            <div style={{ background: 'rgba(239,68,68,0.05)', border: '1.5px solid #fca5a5', borderRadius: 10, padding: '11px 14px', color: '#dc2626', fontSize: 13, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
              <IconAlert />{error}
            </div>
          )}

          {/* Email */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontWeight: 700, color: 'var(--text-main)', fontSize: 12.5, marginBottom: 6, letterSpacing: 0.2 }}>{t('Email Address', 'البريد الإلكتروني')}</label>
            <div style={{ position: 'relative' }}>
              <div style={iconWrap('email')}><IconMail /></div>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSubmit()} placeholder="example@email.com" onFocus={() => setFocused('email')} onBlur={() => setFocused('')} style={inputStyle('email')} />
            </div>
          </div>

          {/* Password */}
          <div style={{ marginBottom: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <label style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: 12.5, letterSpacing: 0.2 }}>{t('Password', 'كلمة المرور')}</label>
              <a href="#" style={{ fontSize: 12, color: 'var(--accent-color)', fontWeight: 700, textDecoration: 'none' }}>{t('Forgot password?', 'نسيت كلمة المرور؟')}</a>
            </div>
            <div style={{ position: 'relative' }}>
              <div style={iconWrap('pass')}><IconLock /></div>
              <input type={showPass ? 'text' : 'password'} value={pass} onChange={e => setPass(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSubmit()} placeholder="••••••••" onFocus={() => setFocused('pass')} onBlur={() => setFocused('')} style={{ ...inputStyle('pass'), paddingRight: ar ? 16 : 44, paddingLeft: ar ? 44 : 44 }} />
              <button onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', [ar ? 'left' : 'right']: 13, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 0, display: 'flex', alignItems: 'center' }}>
                <IconEye open={showPass} />
              </button>
            </div>
          </div>

          {/* Remember me */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10 }}>
            <input type="checkbox" id="rememberMe" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)}
              style={{ width: 15, height: 15, accentColor: 'var(--primary)', cursor: 'pointer' }} />
            <label htmlFor="rememberMe" style={{ fontSize: 12.5, color: 'var(--text-muted)', cursor: 'pointer', fontWeight: 600 }}>
              {t('Keep me signed in for 30 days', 'ابقَ مسجلاً لمدة 30 يوماً')}
            </label>
          </div>

          {/* Sign in button */}
          <button onClick={handleSubmit} disabled={loading} style={{ width: '100%', padding: '13.5px 0', borderRadius: 10, border: 'none', background: loading ? 'var(--card-border)' : 'var(--primary)', color: loading ? 'var(--text-muted)' : 'white', fontWeight: 700, fontSize: 14.5, cursor: loading ? 'default' : 'pointer', boxShadow: loading ? 'none' : '0 4px 18px var(--shadow-hover)', fontFamily: 'inherit', letterSpacing: 0.2, marginTop: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'all 0.2s' }}>
            {loading
              ? <><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M21 12a9 9 0 11-6.219-8.56"><animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="0.8s" repeatCount="indefinite" /></path></svg>{t('Signing in...', 'جاري الدخول...')}</>
              : t('Sign In to Dashboard', 'الدخول للوحة التحكم')}
          </button>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '20px 0' }}>
            <div style={{ flex: 1, height: 1, background: 'var(--card-border)' }} />
            <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, letterSpacing: 0.5 }}>{t('OR CONTINUE WITH', 'أو تابع بـ')}</span>
            <div style={{ flex: 1, height: 1, background: 'var(--card-border)' }} />
          </div>

          {/* Google button */}
          <button
            style={{ width: '100%', padding: '11.5px 0', borderRadius: 10, border: '1.5px solid var(--card-border)', background: 'var(--card-bg)', color: 'var(--text-main)', fontWeight: 600, fontSize: 13.5, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9, boxShadow: '0 1px 4px var(--shadow-main)', transition: 'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.boxShadow = '0 2px 10px var(--shadow-hover)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--card-border)'; e.currentTarget.style.boxShadow = '0 1px 4px var(--shadow-main)'; }}
            onClick={() => setError(t('Google sign-in is not available in demo mode.', 'تسجيل الدخول بـ Google غير متاح في وضع العرض.'))}
          >
            <svg width="17" height="17" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
            {t('Continue with Google', 'المتابعة بـ Google')}
          </button>

          {/* Privacy note */}
          <div style={{ marginTop: 16, padding: '10px 13px', background: 'rgba(var(--primary-light-rgb),0.06)', border: '1px solid rgba(var(--primary-light-rgb),0.18)', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ color: 'var(--primary-light)', flexShrink: 0 }}><IconShield size={14} /></div>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0, lineHeight: 1.55 }}>
              {t('Your medical data is end-to-end encrypted and never shared with third parties.', 'بياناتك الطبية مشفرة بالكامل ولا تُشارك مع أطراف خارجية أبداً.')}
            </p>
          </div>

          <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'var(--text-muted)' }}>
            {t("Don't have an account?", 'ليس لديك حساب؟')}{' '}
            <Link to="/register" style={{ color: 'var(--accent-color)', fontWeight: 800, textDecoration: 'none' }}>{t('Create one now', 'أنشئ حساباً الآن')}</Link>
          </p>

          {/* Demo hint */}
          <div style={{ marginTop: 10, background: 'var(--card-bg)', borderRadius: 8, padding: '8px 12px', fontSize: 11.5, color: 'var(--text-muted)', border: '1px solid var(--card-border)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><circle cx="12" cy="16" r=".5" fill="currentColor" /></svg>
            <span><strong>{t('Demo:', 'تجريبي:')}</strong> admin@medtech.com / Admin@123456</span>
          </div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=Cairo:wght@400;600;700;800;900&display=swap');
        * { box-sizing: border-box; }
        input::placeholder { color: #b4bfce; }

      `}</style>
    </div>
  );
}
