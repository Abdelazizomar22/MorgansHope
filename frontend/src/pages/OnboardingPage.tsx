import { useEffect, useState, type ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiEnvelope, HiExclamationCircle } from 'react-icons/hi2';
import { useAuth, VERIFICATION_NOTICE_KEY } from '../context/AuthContext';
import { authApi } from '../utils/api';
import DisclaimerModal from '../components/DisclaimerModal';

const IconAlert = () => <HiExclamationCircle size={15} />;
const IconMail = () => <HiEnvelope size={15} />;

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { user, updateUser, refreshUser, logout } = useAuth();
  const [lang] = useState<'en' | 'ar'>('en');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    phone: user?.phone || '',
    age: user?.age ? String(user.age) : '',
    gender: user?.gender || '',
    smokingHistory: user?.smokingHistory || '',
  });
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationLoading, setVerificationLoading] = useState(false);
  const [verificationNotice, setVerificationNotice] = useState('');
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [resendAvailableIn, setResendAvailableIn] = useState(0);

  const ar = lang === 'ar';
  const t = (en: string, arText: string) => (ar ? arText : en);
  const needsEmailVerification = Boolean(user?.authProvider === 'local' && user?.emailVerified !== true);
  const needsDisclaimer = Boolean(user && user.emailVerified === true && user.acceptedDisclaimer !== true);
  const emailTarget = user?.email || '';

  useEffect(() => {
    const storedNotice = sessionStorage.getItem(VERIFICATION_NOTICE_KEY);
    if (storedNotice) {
      setVerificationNotice(storedNotice);
      setIsCodeSent(true);
      setResendAvailableIn(60);
      sessionStorage.removeItem(VERIFICATION_NOTICE_KEY);
    }
  }, []);

  useEffect(() => {
    if (resendAvailableIn <= 0) return undefined;
    const timer = window.setInterval(() => {
      setResendAvailableIn((seconds) => Math.max(0, seconds - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [resendAvailableIn]);

  const bind = (key: string) => ({
    value: (form as Record<string, string>)[key],
    onChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm({ ...form, [key]: e.target.value }),
  });

  const handleVerifyEmail = async () => {
    if (!verificationCode.trim()) {
      setError(t('Please enter the verification code first.', 'Please enter the verification code first.'));
      return;
    }

    setVerificationLoading(true);
    setError('');
    setVerificationNotice('');

    try {
      const verified = await authApi.verifyContact(verificationCode.trim());
      if (verified.data.data) updateUser(verified.data.data);
      await refreshUser();
      setVerificationCode('');
      setVerificationNotice(t('Email verified successfully.', 'Email verified successfully.'));
    } catch (err: any) {
      setError(
        err?.response?.data?.message
        || err?.message
        || t('Verification failed. Please check the code and try again.', 'Verification failed. Please check the code and try again.'),
      );
    } finally {
      setVerificationLoading(false);
    }
  };

  const handleSendEmailCode = async () => {
    setVerificationLoading(true);
    setError('');
    setVerificationNotice('');

    try {
      const response = await authApi.resendVerification('email');
      setIsCodeSent(true);
      setResendAvailableIn(60);
      setVerificationNotice(
        response.data.data?.devCode
          ? `Verification code sent to ${emailTarget}. Dev code: ${response.data.data.devCode}`
          : `A verification code was sent to ${emailTarget}.`,
      );
      await refreshUser();
    } catch (err: any) {
      setError(
        err?.response?.data?.message
        || err?.message
        || t('Could not send verification code right now.', 'Could not send verification code right now.'),
      );
    } finally {
      setVerificationLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (needsEmailVerification) {
      setError(t('Please verify your email address before completing setup.', 'Please verify your email address before completing setup.'));
      return;
    }

    if (user?.acceptedDisclaimer !== true) {
      setError(t('Please accept the medical disclaimer before completing setup.', 'Please accept the medical disclaimer before completing setup.'));
      return;
    }

    setLoading(true);
    setError('');

    try {
      const updated = await authApi.updateProfile({
        phone: form.phone.trim() || undefined,
        age: form.age ? Number(form.age) : undefined,
        gender: form.gender ? form.gender as 'male' | 'female' | 'other' : undefined,
        smokingHistory: form.smokingHistory ? form.smokingHistory as 'never' | 'former' | 'current' : undefined,
        onboardingCompleted: true,
      });
      if (updated.data.data) updateUser(updated.data.data);
      await refreshUser();
      navigate('/', { replace: true });
    } catch {
      setError(t('Something went wrong. You can update your profile later.', 'حدث خطأ ما. يمكنك تحديث ملفك لاحقًا.'));
    } finally {
      setLoading(false);
    }
  };

  const handleUseAnotherAccount = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const handleAcceptDisclaimer = async () => {
    setLoading(true);
    setError('');
    try {
      const updated = await authApi.updateProfile({ acceptedDisclaimer: true });
      if (updated.data.data) updateUser(updated.data.data);
      await refreshUser();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Could not save your acceptance. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeclineDisclaimer = async () => {
    await logout();
    navigate('/', { replace: true });
  };

  const handleSkip = async () => {
    if (needsEmailVerification) {
      setError(t('Please verify your email address before continuing.', 'Please verify your email address before continuing.'));
      return;
    }

    if (user?.acceptedDisclaimer !== true) {
      setError(t('Please accept the medical disclaimer before continuing.', 'Please accept the medical disclaimer before continuing.'));
      return;
    }

    try {
      const updated = await authApi.updateProfile({ onboardingCompleted: true });
      if (updated.data.data) updateUser(updated.data.data);
    } catch {
      // Non-blocking.
    }

    navigate('/', { replace: true });
  };

  const selectStyle = {
    width: '100%',
    padding: '13px 14px',
    borderRadius: 14,
    border: '1.5px solid var(--card-border)',
    fontSize: 14.5,
    outline: 'none',
    background: 'var(--card-bg)',
    color: 'var(--text-main)',
    fontFamily: 'inherit',
    cursor: 'pointer',
  } as React.CSSProperties;

  const inputStyle = { ...selectStyle };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(circle at 80% 20%, rgba(var(--primary-rgb),0.08), transparent 30%), var(--bg-main)',
        padding: '40px 16px',
        fontFamily: "'Sora', sans-serif",
      }}
    >
      {needsDisclaimer && (
        <DisclaimerModal
          lang={lang}
          onAccept={handleAcceptDisclaimer}
          onDecline={handleDeclineDisclaimer}
          subtitle="Your account is verified. Please review and accept before entering Morgan's Hope."
        />
      )}
      <div style={{ width: '100%', maxWidth: 520 }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <h1 style={{ margin: '0 0 10px', color: 'var(--text-main)', fontSize: 'clamp(1.7rem, 4vw, 2.1rem)', fontWeight: 900, letterSpacing: '-0.04em' }}>
            {t('Complete your profile', 'أكمل ملفك الشخصي')}
          </h1>
          <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.97rem', lineHeight: 1.7, maxWidth: 380, marginLeft: 'auto', marginRight: 'auto' }}>
            {t(
              'Help us personalize your experience with a few quick details. You can always update these later.',
              'ساعدنا في تخصيص تجربتك ببيانات سريعة. يمكنك تحديثها لاحقًا.',
            )}
          </p>
          {needsEmailVerification && (
            <button
              type="button"
              onClick={handleUseAnotherAccount}
              style={{ marginTop: 14, background: 'transparent', border: 'none', color: 'var(--primary)', fontSize: '0.82rem', fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit' }}
            >
              {t('Use a different account', 'استخدم حسابًا آخر')}
            </button>
          )}
        </div>

        <div
          style={{
            background: 'var(--card-bg)',
            border: '1px solid color-mix(in srgb, var(--primary) 10%, var(--card-border))',
            borderRadius: 28,
            padding: '32px 28px',
            boxShadow: '0 24px 64px rgba(15,23,42,0.08), inset 0 1px 0 rgba(255,255,255,0.4)',
          }}
        >
          {error && (
            <div style={{ background: 'rgba(239,68,68,0.06)', border: '1.5px solid #fca5a5', borderRadius: 14, padding: '12px 14px', color: '#dc2626', fontSize: 13, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
              <IconAlert />
              <span>{error}</span>
            </div>
          )}

          {needsEmailVerification && (
            <div
              style={{
                background: 'linear-gradient(135deg, rgba(var(--primary-rgb),0.08), rgba(255,255,255,0.72))',
                border: '1.5px solid rgba(var(--primary-rgb),0.18)',
                borderRadius: 18,
                padding: '16px 16px 18px',
                marginBottom: 22,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 12, background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <IconMail />
                </div>
                <div>
                  <h3 style={{ margin: '0 0 4px', color: 'var(--text-main)', fontSize: '0.98rem', fontWeight: 850 }}>
                    {t('Verify your email', 'تحقق من بريدك الإلكتروني')}
                  </h3>
                  <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.82rem', lineHeight: 1.6 }}>
                    {t(
                      `Enter the 6-digit code sent to ${emailTarget}. It expires in 5 minutes.`,
                      `أدخل الكود المكون من 6 أرقام المرسل إلى ${emailTarget} لتفعيل حسابك والمتابعة.`,
                    )}
                  </p>
                </div>
              </div>

              {verificationNotice && (
                <div style={{ color: '#166534', background: 'rgba(22,101,52,0.08)', border: '1px solid rgba(22,101,52,0.16)', borderRadius: 12, padding: '9px 11px', fontSize: 12.5, fontWeight: 700, marginBottom: 12 }}>
                  {verificationNotice}
                </div>
              )}

              <button
                type="button"
                onClick={handleSendEmailCode}
                disabled={verificationLoading || resendAvailableIn > 0}
                style={{ width: '100%', minHeight: 44, border: '1.5px solid var(--primary)', borderRadius: 14, background: 'rgba(var(--primary-rgb),0.08)', color: 'var(--primary)', fontWeight: 850, cursor: verificationLoading || resendAvailableIn > 0 ? 'default' : 'pointer', opacity: verificationLoading || resendAvailableIn > 0 ? 0.7 : 1, fontFamily: 'inherit', marginBottom: 10 }}
              >
                {resendAvailableIn > 0
                  ? `Resend in ${resendAvailableIn}s`
                  : isCodeSent
                    ? t('Resend verification code', 'إعادة إرسال كود التحقق')
                    : t('Send verification code', 'إرسال كود التحقق')}
              </button>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 10 }}>
                <input
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  onKeyDown={(e) => e.key === 'Enter' && handleVerifyEmail()}
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  placeholder="123456"
                  style={{ ...inputStyle, letterSpacing: '0.22em', fontWeight: 800, textAlign: 'center' }}
                />
                <button
                  type="button"
                  onClick={handleVerifyEmail}
                  disabled={verificationLoading}
                  style={{ border: 'none', borderRadius: 14, background: 'var(--primary)', color: '#fff', padding: '0 16px', fontWeight: 800, cursor: verificationLoading ? 'default' : 'pointer', opacity: verificationLoading ? 0.7 : 1, fontFamily: 'inherit' }}
                >
                  {t('Verify', 'تحقق')}
                </button>
              </div>
            </div>
          )}

          <div style={{ marginBottom: 18 }}>
            <label style={{ display: 'block', marginBottom: 7, color: 'var(--text-main)', fontSize: '0.82rem', fontWeight: 700 }}>
              {t('Phone number', 'رقم الهاتف')}{' '}
              <span style={{ color: 'var(--text-muted)', fontWeight: 500, fontSize: '0.74rem' }}>({t('optional', 'اختياري')})</span>
            </label>
            <input
              {...bind('phone')}
              type="tel"
              placeholder={t('e.g. +201234567890', 'مثال: +201234567890')}
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: 18 }}>
            <label style={{ display: 'block', marginBottom: 7, color: 'var(--text-main)', fontSize: '0.82rem', fontWeight: 700 }}>
              {t('Age', 'العمر')}{' '}
              <span style={{ color: 'var(--text-muted)', fontWeight: 500, fontSize: '0.74rem' }}>({t('optional', 'اختياري')})</span>
            </label>
            <input
              {...bind('age')}
              type="number"
              min="0"
              max="120"
              placeholder={t('e.g. 45', 'مثال: 45')}
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: 18 }}>
            <label style={{ display: 'block', marginBottom: 7, color: 'var(--text-main)', fontSize: '0.82rem', fontWeight: 700 }}>
              {t('Gender', 'النوع')}{' '}
              <span style={{ color: 'var(--text-muted)', fontWeight: 500, fontSize: '0.74rem' }}>({t('optional', 'اختياري')})</span>
            </label>
            <select {...bind('gender')} style={selectStyle}>
              <option value="">{t('Select gender', 'اختر النوع')}</option>
              <option value="male">{t('Male', 'ذكر')}</option>
              <option value="female">{t('Female', 'أنثى')}</option>
              <option value="other">{t('Other / Prefer not to say', 'أخرى / أفضل عدم الإفصاح')}</option>
            </select>
          </div>

          <div style={{ marginBottom: 28 }}>
            <label style={{ display: 'block', marginBottom: 7, color: 'var(--text-main)', fontSize: '0.82rem', fontWeight: 700 }}>
              {t('Smoking history', 'تاريخ التدخين')}{' '}
              <span style={{ color: 'var(--text-muted)', fontWeight: 500, fontSize: '0.74rem' }}>({t('optional', 'اختياري')})</span>
            </label>
            <select {...bind('smokingHistory')} style={selectStyle}>
              <option value="">{t('Select option', 'اختر')}</option>
              <option value="never">{t('Never smoked', 'لم أدخن قط')}</option>
              <option value="former">{t('Former smoker', 'مدخن سابق')}</option>
              <option value="current">{t('Current smoker', 'مدخن حالي')}</option>
            </select>
          </div>

          <button
            id="onboarding-submit-btn"
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            style={{
              width: '100%',
              minHeight: 52,
              borderRadius: 14,
              border: 'none',
              background: 'linear-gradient(135deg, var(--primary-dark), var(--primary))',
              color: '#fff',
              fontSize: '0.97rem',
              fontWeight: 800,
              cursor: loading ? 'default' : 'pointer',
              opacity: loading ? 0.7 : 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              boxShadow: '0 16px 36px rgba(var(--primary-rgb),0.25)',
              fontFamily: 'inherit',
            }}
          >
            {loading ? (
              <>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M21 12a9 9 0 11-6.219-8.56">
                    <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="0.8s" repeatCount="indefinite" />
                  </path>
                </svg>
                {t('Saving...', 'جارٍ الحفظ...')}
              </>
            ) : t('Complete Setup', 'إتمام الإعداد')}
          </button>

          <div style={{ textAlign: 'center', marginTop: 16 }}>
            <button
              type="button"
              onClick={handleSkip}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.84rem', fontWeight: 600, cursor: 'pointer', padding: 0 }}
            >
              {t('Skip for now - I will do this later', 'تخطى الآن - سأفعل هذا لاحقًا')}
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 24 }}>
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              style={{
                height: 6,
                borderRadius: 999,
                background: n <= 3 ? 'var(--primary)' : 'var(--card-border)',
                width: n === 3 ? 28 : 8,
                transition: 'all 0.3s ease',
                opacity: n === 3 ? 1 : 0.35,
              }}
            />
          ))}
        </div>
        <p style={{ textAlign: 'center', marginTop: 10, color: 'var(--text-muted)', fontSize: '0.78rem' }}>
          {t('Step 3 of 3 - Final step', 'الخطوة 3 من 3 - الخطوة الأخيرة')}
        </p>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&display=swap');
        select option { background: var(--card-bg); color: var(--text-main); }
      `}</style>
    </div>
  );
}
