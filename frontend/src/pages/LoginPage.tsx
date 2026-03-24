import { useEffect, useState, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { AuthLayout, AuthSection } from '../components/auth/AuthLayout';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

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

const IconAlert = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

const IconSun = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5" />
    <line x1="12" y1="1" x2="12" y2="3" />
    <line x1="12" y1="21" x2="12" y2="23" />
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
    <line x1="1" y1="12" x2="3" y2="12" />
    <line x1="21" y1="12" x2="23" y2="12" />
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
  </svg>
);

const IconMoon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

export default function LoginPage() {
  const { login, completeSocialLogin } = useAuth();
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
  const googleAuthUrl = import.meta.env.VITE_GOOGLE_AUTH_URL || `${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/auth/google`;

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const socialToken = params.get('token');
    const googleAuth = params.get('googleAuth');
    const socialError = params.get('message');

    if (googleAuth === 'error' && socialError) {
      setError(socialError);
      window.history.replaceState({}, document.title, window.location.pathname);
      return;
    }

    if (googleAuth === 'success' && socialToken) {
      setLoading(true);
      completeSocialLogin(socialToken)
        .catch(() => {
          setError(t('Google sign-in could not be completed. Please try again.', 'تعذر إكمال تسجيل الدخول عبر Google. حاول مرة أخرى.'));
        })
        .finally(() => {
          setLoading(false);
          window.history.replaceState({}, document.title, window.location.pathname);
        });
    }
  }, [completeSocialLogin]);

  const handleSubmit = async () => {
    if (!email || !pass) {
      setError(t('Please fill in all fields.', 'يرجى ملء جميع الحقول.'));
      return;
    }

    setLoading(true);
    setError('');

    try {
      await login(email, pass, rememberMe);
    } catch (err: any) {
      if (!err?.response) {
        setError(t('Cannot connect to server. Is the backend running on port 3000?', 'لا يمكن الاتصال بالخادم. هل الـ backend يعمل على المنفذ 3000؟'));
        return;
      }

      const msg = err.response?.data?.message;
      const details = err.response?.data?.errors;
      const text = details?.length ? details.map((item: { message: string }) => item.message).join('. ') : msg;
      setError(text || t('Invalid email or password.', 'البريد الإلكتروني أو كلمة المرور غير صحيحة.'));
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = (field: string, customPadding?: string): CSSProperties => ({
    width: '100%',
    padding: customPadding || (ar ? '12px 44px 12px 16px' : '12px 16px 12px 44px'),
    borderRadius: 16,
    border: `1.5px solid ${focused === field ? 'var(--primary)' : 'var(--card-border)'}`,
    fontSize: 14,
    lineHeight: 1.4,
    outline: 'none',
    background: 'var(--card-bg)',
    color: 'var(--text-main)',
    boxShadow: focused === field ? '0 0 0 4px rgba(var(--primary-rgb),0.1)' : 'none',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
  });

  const iconWrap = (field: string): CSSProperties => ({
    position: 'absolute',
    [ar ? 'right' : 'left']: 15,
    top: '50%',
    transform: 'translateY(-50%)',
    width: 18,
    height: 18,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    lineHeight: 0,
    color: focused === field ? 'var(--primary)' : 'var(--text-muted)',
    pointerEvents: 'none',
    transition: 'color 0.2s ease',
  });

  return (
    <>
      <AuthLayout
        dir={ar ? 'rtl' : 'ltr'}
        fontFamily={ar ? "'Cairo', sans-serif" : "'Sora', sans-serif"}
        langToggleLabel={ar ? 'EN' : 'عربي'}
        onToggleLang={() => setLang(ar ? 'en' : 'ar')}
        onToggleTheme={toggleTheme}
        themeToggleIcon={theme === 'light' ? <IconMoon /> : <IconSun />}
        brandSlogan={t('"A Second Chance for Every Breath"', '"فرصة ثانية لكل نفس"')}
        formBadge={t('Sign In', 'تسجيل الدخول')}
        formTitle={t('Access your account', 'ادخل إلى حسابك')}
        formDescription={t('Sign in to continue to your dashboard and medical tools.', 'سجل الدخول للمتابعة إلى لوحة التحكم والأدوات الطبية.')}
        formMaxWidth={460}
      >
        {error && (
          <div style={{ background: 'rgba(239,68,68,0.06)', border: '1.5px solid #fca5a5', borderRadius: 16, padding: '12px 14px', color: '#dc2626', fontSize: 13, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <IconAlert />
            <span>{error}</span>
          </div>
        )}

        <AuthSection
          badge={t('Account', 'الحساب')}
          title={t('Email and password', 'البريد وكلمة المرور')}
          description={t('Enter your email and password to continue.', 'أدخل بريدك الإلكتروني وكلمة المرور للمتابعة.')}
        >
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ marginBottom: 16 }}>
              <label className="auth-field-label">{t('Email', 'البريد الإلكتروني')}</label>
              <div className="auth-input-shell">
                <div style={iconWrap('email')}>
                  <IconMail />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                  placeholder="example@email.com"
                  onFocus={() => setFocused('email')}
                  onBlur={() => setFocused('')}
                  style={inputStyle('email')}
                />
              </div>
            </div>

            <div>
              <label className="auth-field-label">{t('Password', 'كلمة المرور')}</label>
              <div className="auth-input-shell">
                <div style={iconWrap('pass')}>
                  <IconLock />
                </div>
                <input
                  type={showPass ? 'text' : 'password'}
                  value={pass}
                  onChange={(e) => setPass(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                  placeholder={t('Password', 'كلمة المرور')}
                  onFocus={() => setFocused('pass')}
                  onBlur={() => setFocused('')}
                  style={{ ...inputStyle('pass', '12px 44px 12px 44px'), letterSpacing: '0.18em' }}
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

            <div className="auth-checkbox-row" style={{ marginTop: 16, paddingLeft: ar ? 0 : 10, paddingRight: ar ? 10 : 0 }}>
              <input type="checkbox" id="rememberMe" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />
              <label htmlFor="rememberMe" style={{ cursor: 'pointer' }}>
                {t('Keep me signed in', 'إبقني مسجلًا')}
              </label>
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
              {t('Signing in...', 'جارٍ تسجيل الدخول...')}
            </>
          ) : (
            t('Sign In', 'تسجيل الدخول')
          )}
        </button>

        <div style={{ marginTop: 12, textAlign: ar ? 'right' : 'left' }}>
          <a href="#" className="auth-inline-link">
            {t('Forgot password?', 'نسيت كلمة المرور؟')}
          </a>
        </div>

        <div className="auth-divider">
          <span>{t('Or sign in with', 'أو سجل الدخول عبر')}</span>
        </div>

        <button
          type="button"
          className="auth-secondary-button"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9, cursor: 'pointer' }}
          onClick={() => {
            if (!googleAuthUrl) {
              setError(t('Google sign-in is not configured for this deployment yet.', 'تسجيل الدخول عبر Google غير مُعد لهذا الإصدار بعد.'));
              return;
            }
            window.location.href = googleAuthUrl;
          }}
        >
          <svg width="17" height="17" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          {t('Google', 'Google')}
        </button>

        <div className="auth-note-card" style={{ marginTop: 16 }}>
          <div style={{ color: 'var(--primary)', flexShrink: 0 }}>
            <IconShield size={15} />
          </div>
          <p>{t('Your data stays encrypted and protected inside the platform.', 'بياناتك تبقى مشفرة ومحمية داخل المنصة.')}</p>
        </div>

        <p className="auth-footer-text">
          {t("Don't have an account?", 'ليس لديك حساب؟')}{' '}
          <Link to="/register">{t('Create account', 'إنشاء حساب')}</Link>
        </p>
      </AuthLayout>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=Cairo:wght@400;600;700;800;900&display=swap');
        input::placeholder { color: #94a3b8; letter-spacing: 0; }
        input[type="password"] {
          appearance: none;
          -webkit-appearance: none;
          font-family: inherit;
        }
      `}</style>
    </>
  );
}
