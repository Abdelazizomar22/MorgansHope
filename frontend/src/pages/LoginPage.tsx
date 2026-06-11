import { useEffect, useState, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { AuthPage } from '../components/ui/auth-page';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { GOOGLE_AUTH_URL } from '../utils/env';
import { HiEnvelope, HiLockClosed, HiExclamationCircle } from 'react-icons/hi2';
import DisclaimerModal from '../components/DisclaimerModal';

// ─── Icons ───────────────────────────────────────────────────────────────────

const IconMail = () => <HiEnvelope size={17} />;

const IconLock = () => <HiLockClosed size={17} />;

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

const IconAlert = () => <HiExclamationCircle size={15} />;

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function LoginPage() {
  const { login, completeSocialLogin } = useAuth();
  const { lang, toggleLang, t } = useLanguage();
  const [identifier, setIdentifier] = useState('');
  const [pass, setPass] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [focused, setFocused] = useState('');
  const [showConsentModal, setShowConsentModal] = useState(false);

  const ar = lang === 'ar';
  const googleAuthUrl = GOOGLE_AUTH_URL;

  // Handle Google OAuth callback
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const socialToken = params.get('token');
    const googleAuth = params.get('googleAuth');
    const socialError = params.get('message');
    const authError = params.get('authError');

    if (authError) {
      const decodedAuthError = decodeURIComponent(authError).toLowerCase();
      if (decodedAuthError.includes('redirect_uri_mismatch')) {
        setError(t(
          'Google sign-in configuration mismatch (redirect URI). Please contact support.',
          'إعداد Google Sign-In غير متطابق. برجاء التواصل مع الدعم.'
        ));
      } else {
        setError(t(
          'Google sign-in failed due to OAuth configuration. Please try again later.',
          'فشل تسجيل الدخول عبر Google. حاول مرة أخرى لاحقًا.'
        ));
      }
      window.history.replaceState({}, document.title, window.location.pathname);
      return;
    }

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
    if (!identifier || !pass) {
      setError(t('Please fill in all fields.', 'يرجى ملء جميع الحقول.'));
      return;
    }
    setLoading(true);
    setError('');
    try {
      await login(identifier, pass, rememberMe);
    } catch (err: any) {
      if (!err?.response) {
        setError(t('Cannot connect to the backend right now. Please try again in a moment.', 'لا يمكن الاتصال بالخادم حاليًا. حاول مرة أخرى بعد لحظات.'));
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

  const handleGoogleClick = () => {
    if (!googleAuthUrl) {
      setError(t('Google sign-in is not configured for this deployment yet.', 'تسجيل الدخول عبر Google غير مُعد بعد.'));
      return;
    }
    setShowConsentModal(true);
  };

  const handleConsentAccept = () => {
    setShowConsentModal(false);
    window.location.href = googleAuthUrl;
  };

  const inputStyle = (field: string, extraPadding?: string): CSSProperties => ({
    width: '100%',
    padding: extraPadding || (ar ? '13px 44px 13px 16px' : '13px 16px 13px 44px'),
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

  const iconWrap = (field: string): CSSProperties => ({
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

  return (
    <>
      {showConsentModal && (
        <DisclaimerModal
          lang={lang}
          onAccept={handleConsentAccept}
          onDecline={() => setShowConsentModal(false)}
          subtitle={t('Please read and accept before continuing', 'يرجى القراءة والموافقة قبل المتابعة')}
          acceptLabel={t('I Agree & Continue', 'أوافق وأتابع')}
        />
      )}

      <AuthPage
        title={t('Welcome back', 'أهلاً بك مجدداً')}
        description={t('Secure, AI-powered medical platform.', 'منصة طبية آمنة ومدعومة بالذكاء الاصطناعي.')}
        lang={lang}
        onLangToggle={toggleLang}
      >
        {/* Error */}
        {error && (
          <div style={{ background: 'rgba(239,68,68,0.06)', border: '1.5px solid #fca5a5', borderRadius: 14, padding: '12px 14px', color: '#dc2626', fontSize: 13, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
            <IconAlert />
            <span>{error}</span>
          </div>
        )}

        {/* Email or phone */}
        <div style={{ marginBottom: 16 }}>
          <label className="auth-field-label">{t('Email address', 'البريد الإلكتروني')}</label>
          <div className="auth-input-shell">
            <div style={iconWrap('email')}><IconMail /></div>
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              placeholder="example@email.com"
              onFocus={() => setFocused('email')}
              onBlur={() => setFocused('')}
              style={inputStyle('email')}
            />
          </div>
        </div>

        {/* Password */}
        <div style={{ marginBottom: 12 }}>
          <label className="auth-field-label">{t('Password', 'كلمة المرور')}</label>
          <div className="auth-input-shell">
            <div style={iconWrap('pass')}><IconLock /></div>
            <input
              type={showPass ? 'text' : 'password'}
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              placeholder={t('Your password', 'كلمة المرور')}
              onFocus={() => setFocused('pass')}
              onBlur={() => setFocused('')}
              style={{ ...inputStyle('pass', '13px 44px 13px 44px'), letterSpacing: showPass ? 'normal' : '0.18em' }}
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

        {/* Remember / Forgot */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
          <label className="auth-checkbox-row" style={{ margin: 0, cursor: 'pointer' }}>
            <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />
            <span>{t('Keep me signed in', 'إبقني مسجلًا')}</span>
          </label>
          <a href="#" className="auth-inline-link" style={{ fontSize: 13 }}>
            {t('Forgot password?', 'نسيت كلمة المرور؟')}
          </a>
        </div>

        {/* Sign In Button */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          className="auth-primary-button"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: loading ? 'default' : 'pointer' }}
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
          ) : t('Sign In', 'تسجيل الدخول')}
        </button>

        {/* Divider */}
        <div className="auth-divider" style={{ margin: '20px 0' }}>
          <span>{t('Or continue with', 'أو تابع عبر')}</span>
        </div>

        {/* Google Button */}
        <button
          id="google-signin-btn"
          type="button"
          className="auth-secondary-button"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, cursor: 'pointer' }}
          onClick={handleGoogleClick}
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          {t('Continue with Google', 'المتابعة عبر Google')}
        </button>

        <p className="auth-footer-text">
          {t("Don't have an account?", 'ليس لديك حساب؟')}{' '}
          <Link to="/register">{t('Create account', 'إنشاء حساب')}</Link>
        </p>
      </AuthPage>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=Cairo:wght@400;600;700;800;900&display=swap');
        input::placeholder { color: #94a3b8; letter-spacing: 0; }
        input[type="password"] { appearance: none; -webkit-appearance: none; font-family: inherit; }
        input[type="password"]::-ms-reveal, input[type="password"]::-ms-clear { display: none; }
      `}</style>
    </>
  );
}
