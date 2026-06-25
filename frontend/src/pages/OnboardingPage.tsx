import { useEffect, useMemo, useRef, useState, type ChangeEvent, type KeyboardEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HiArrowPath,
  HiCalendarDays,
  HiCheck,
  HiEnvelope,
  HiExclamationCircle,
  HiPhone,
  HiShieldCheck,
  HiUser,
} from 'react-icons/hi2';
import { useAuth, VERIFICATION_NOTICE_KEY } from '../context/AuthContext';
import DisclaimerModal from '../components/DisclaimerModal';
import { authApi } from '../utils/api';

const OTP_LENGTH = 6;

const IconAlert = () => <HiExclamationCircle size={16} />;

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { user, updateUser, refreshUser, logout } = useAuth();
  const [lang] = useState<'en' | 'ar'>('en');
  const ar = lang === 'ar';
  const t = (en: string, arText: string) => (ar ? arText : en);

  const [loading, setLoading] = useState(false);
  const [verificationLoading, setVerificationLoading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [otp, setOtp] = useState(Array.from({ length: OTP_LENGTH }, () => ''));
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [resendAvailableIn, setResendAvailableIn] = useState(0);
  const [verifiedJustNow, setVerifiedJustNow] = useState(false);
  const otpRefs = useRef<Array<HTMLInputElement | null>>([]);

  const [form, setForm] = useState({
    phone: user?.phone || '',
    age: user?.age ? String(user.age) : '',
    gender: user?.gender || '',
    smokingHistory: user?.smokingHistory || '',
  });

  const emailTarget = user?.email || '';
  const emailVerified = Boolean(user?.authProvider !== 'local' || user?.emailVerified === true || verifiedJustNow);
  const needsEmailVerification = Boolean(user?.authProvider === 'local' && !emailVerified);
  const needsDisclaimer = Boolean(user && emailVerified && user.acceptedDisclaimer !== true);
  const verificationCode = otp.join('');

  useEffect(() => {
    const storedNotice = sessionStorage.getItem(VERIFICATION_NOTICE_KEY);
    if (!storedNotice) return;

    setNotice(storedNotice);
    setIsCodeSent(true);
    setResendAvailableIn(45);
    sessionStorage.removeItem(VERIFICATION_NOTICE_KEY);
  }, []);

  useEffect(() => {
    if (!user) return;
    setForm({
      phone: user.phone || '',
      age: user.age ? String(user.age) : '',
      gender: user.gender || '',
      smokingHistory: user.smokingHistory || '',
    });
  }, [user?.id]);

  useEffect(() => {
    if (resendAvailableIn <= 0) return undefined;
    const timer = window.setInterval(() => {
      setResendAvailableIn((seconds) => Math.max(0, seconds - 1));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [resendAvailableIn]);

  useEffect(() => {
    if (!user) return;
    if (emailVerified && user.acceptedDisclaimer === true && user.onboardingCompleted === true) {
      navigate('/', { replace: true });
    }
  }, [emailVerified, navigate, user]);

  const bind = (key: keyof typeof form) => ({
    value: form[key],
    onChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((current) => ({ ...current, [key]: e.target.value })),
  });

  const inputBaseClass =
    'h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#006B5B] focus:ring-4 focus:ring-emerald-100';

  const selectClass = `${inputBaseClass} cursor-pointer appearance-none`;

  const stepState = useMemo(
    () => [
      { label: t('Account Info', 'معلومات الحساب'), done: true, active: false },
      { label: t('Consent', 'الموافقة'), done: true, active: false },
      { label: t('Complete', 'الإكمال'), done: emailVerified, active: true },
    ],
    [emailVerified, t],
  );

  const handleOtpChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    setOtp((current) => {
      const next = [...current];
      next[index] = digit;
      return next;
    });

    if (digit && index < OTP_LENGTH - 1) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, OTP_LENGTH).split('');
    if (!digits.length) return;

    setOtp(Array.from({ length: OTP_LENGTH }, (_, index) => digits[index] || ''));
    otpRefs.current[Math.min(digits.length, OTP_LENGTH) - 1]?.focus();
  };

  const handleVerifyEmail = async () => {
    if (verificationCode.length !== OTP_LENGTH) {
      setError(t('Please enter the 6-digit verification code first.', 'يرجى إدخال كود التحقق المكون من 6 أرقام أولا.'));
      return;
    }

    setVerificationLoading(true);
    setError('');
    setNotice('');

    try {
      const verified = await authApi.verifyContact(verificationCode);
      if (verified.data.data) updateUser(verified.data.data);
      setVerifiedJustNow(true);
      setOtp(Array.from({ length: OTP_LENGTH }, () => ''));
      setNotice(t('Email verified. Add a few optional details or skip for now.', 'تم تفعيل البريد. يمكنك إضافة بيانات اختيارية أو تخطيها الآن.'));
      await refreshUser();
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          t('Verification failed. Please check the code and try again.', 'فشل التحقق. راجع الكود وحاول مرة أخرى.'),
      );
    } finally {
      setVerificationLoading(false);
    }
  };

  const handleSendEmailCode = async () => {
    setVerificationLoading(true);
    setError('');
    setNotice('');

    try {
      const response = await authApi.resendVerification('email');
      setIsCodeSent(true);
      setResendAvailableIn(45);
      setNotice(
        response.data.data?.devCode
          ? `Verification code sent to ${emailTarget}. Dev code: ${response.data.data.devCode}`
          : `A 6-digit code was sent to ${emailTarget}.`,
      );
      await refreshUser();
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          t('Could not send verification code right now.', 'تعذر إرسال كود التحقق الآن.'),
      );
    } finally {
      setVerificationLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!emailVerified) {
      setError(t('Please verify your email address before completing setup.', 'يرجى تفعيل البريد الإلكتروني قبل إتمام الإعداد.'));
      return;
    }

    if (user?.acceptedDisclaimer !== true) {
      setError(t('Please accept the medical disclaimer before entering Morgan\'s Hope.', 'يرجى قبول التنبيه الطبي قبل دخول Morgan\'s Hope.'));
      return;
    }

    setLoading(true);
    setError('');

    try {
      const updated = await authApi.updateProfile({
        phone: form.phone.trim() || undefined,
        age: form.age ? Number(form.age) : undefined,
        gender: form.gender ? (form.gender as 'male' | 'female' | 'other') : undefined,
        smokingHistory: form.smokingHistory ? (form.smokingHistory as 'never' | 'former' | 'current') : undefined,
        onboardingCompleted: true,
      });
      if (updated.data.data) updateUser(updated.data.data);
      await refreshUser();
      navigate('/', { replace: true });
    } catch (err: any) {
      setError(err?.response?.data?.message || t('Something went wrong. You can update your profile later.', 'حدث خطأ ما. يمكنك تحديث ملفك لاحقا.'));
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = async () => {
    if (!emailVerified) {
      setError(t('Please verify your email address before continuing.', 'يرجى تفعيل البريد الإلكتروني قبل المتابعة.'));
      return;
    }

    if (user?.acceptedDisclaimer !== true) {
      setError(t('Please accept the medical disclaimer before continuing.', 'يرجى قبول التنبيه الطبي قبل المتابعة.'));
      return;
    }

    setLoading(true);
    setError('');

    try {
      const updated = await authApi.updateProfile({ onboardingCompleted: true });
      if (updated.data.data) updateUser(updated.data.data);
      await refreshUser();
    } catch {
      // Optional profile data should never block entry after email verification.
    } finally {
      setLoading(false);
    }

    navigate('/', { replace: true });
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

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f7faf9] px-4 py-8 font-['Sora',sans-serif] text-slate-950">
      {needsDisclaimer && (
        <DisclaimerModal
          lang={lang}
          onAccept={handleAcceptDisclaimer}
          onDecline={handleDeclineDisclaimer}
          subtitle="Your account is verified. Please review and accept before entering Morgan's Hope."
        />
      )}

      <div className="pointer-events-none absolute inset-0 opacity-70">
        <div className="absolute -left-28 top-24 h-80 w-80 rounded-full bg-emerald-100 blur-3xl" />
        <div className="absolute -right-24 bottom-8 h-96 w-96 rounded-full bg-teal-100 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_35%,rgba(255,255,255,0.8),transparent_16%),radial-gradient(circle_at_75%_18%,rgba(255,255,255,0.75),transparent_14%)]" />
      </div>

      <main className="relative z-10 mx-auto flex min-h-[calc(100vh-64px)] w-full max-w-[760px] flex-col items-center justify-center">
        <div className="mb-8 flex flex-col items-center text-center">
          <img src="/logo-v2.png" alt="Morgan's Hope" className="theme-logo h-20 w-20 object-contain" />
          <h1 className="mt-4 text-4xl font-black tracking-[-0.05em] text-[#063f35] sm:text-5xl">
            {t('Complete your profile', 'أكمل ملفك الشخصي')}
          </h1>
          <p className="mt-3 max-w-xl text-sm font-semibold leading-7 text-slate-500 sm:text-base">
            {t(
              'Help us personalize your experience with a few optional details. You can update them anytime.',
              'ساعدنا في تخصيص تجربتك ببعض البيانات الاختيارية. يمكنك تحديثها في أي وقت.',
            )}
          </p>
        </div>

        <div className="mb-8 flex w-full max-w-[520px] items-center justify-between">
          {stepState.map((step, index) => (
            <div key={step.label} className="flex flex-1 items-center">
              <div className="flex flex-col items-center gap-2">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full border text-sm font-black shadow-sm ${
                    step.active
                      ? 'border-[#064f43] bg-[#064f43] text-white'
                      : step.done
                        ? 'border-[#0d8a75] bg-white text-[#0d8a75]'
                        : 'border-slate-200 bg-white text-slate-400'
                  }`}
                >
                  {step.done && !step.active ? <HiCheck className="h-5 w-5" /> : index + 1}
                </div>
                <span className={`text-xs font-black ${step.active ? 'text-[#064f43]' : 'text-slate-500'}`}>
                  {step.label}
                </span>
              </div>
              {index < stepState.length - 1 && <div className="mx-3 mt-[-22px] h-px flex-1 bg-slate-200" />}
            </div>
          ))}
        </div>

        <section className="w-full rounded-[28px] border border-slate-200 bg-white/92 p-6 shadow-2xl shadow-slate-950/10 backdrop-blur sm:p-9">
          {error && (
            <div className="mb-5 flex items-start gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold leading-6 text-red-600">
              <IconAlert />
              <span>{error}</span>
            </div>
          )}

          {notice && (
            <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold leading-6 text-emerald-800">
              {notice}
            </div>
          )}

          {needsEmailVerification ? (
            <div>
              <div className="mb-7 flex items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0a5a4c] to-[#073f35] text-white shadow-lg shadow-emerald-950/20">
                  <HiEnvelope className="h-7 w-7" />
                </div>
                <div>
                  <h2 className="text-2xl font-black tracking-[-0.03em] text-slate-950">
                    {t('Verify your email', 'فعّل بريدك الإلكتروني')}
                  </h2>
                  <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">
                    {t(
                      `We've sent a 6-digit code to ${emailTarget}.`,
                      `أرسلنا كودا مكونا من 6 أرقام إلى ${emailTarget}.`,
                    )}
                  </p>
                </div>
              </div>

              <div className="mb-7 grid grid-cols-6 gap-3">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(element) => {
                      otpRefs.current[index] = element;
                    }}
                    value={digit}
                    onChange={(event) => handleOtpChange(index, event.target.value)}
                    onKeyDown={(event) => handleOtpKeyDown(index, event)}
                    onPaste={(event) => {
                      event.preventDefault();
                      handleOtpPaste(event.clipboardData.getData('text'));
                    }}
                    inputMode="numeric"
                    autoComplete={index === 0 ? 'one-time-code' : 'off'}
                    aria-label={`Verification digit ${index + 1}`}
                    className="h-16 rounded-xl border border-slate-200 bg-white text-center text-2xl font-black text-slate-600 outline-none transition focus:border-[#006B5B] focus:ring-4 focus:ring-emerald-100"
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={handleVerifyEmail}
                disabled={verificationLoading}
                className="flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#064f43] to-[#007866] text-base font-black text-white shadow-xl shadow-emerald-950/20 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
              >
                {verificationLoading ? <HiArrowPath className="h-5 w-5 animate-spin" /> : null}
                {t('Verify', 'تفعيل')}
              </button>

              <div className="mt-5 text-center text-sm font-semibold text-slate-500">
                {t("Didn't receive the code?", 'لم يصلك الكود؟')}{' '}
                <button
                  type="button"
                  onClick={handleSendEmailCode}
                  disabled={verificationLoading || resendAvailableIn > 0}
                  className="font-black text-[#007866] disabled:cursor-not-allowed disabled:text-slate-400"
                >
                  {resendAvailableIn > 0
                    ? t(`Resend in ${resendAvailableIn}s`, `إعادة الإرسال خلال ${resendAvailableIn}ث`)
                    : isCodeSent
                      ? t('Resend code', 'إعادة إرسال الكود')
                      : t('Send code', 'إرسال الكود')}
                </button>
              </div>

              <div className="my-7 flex items-center gap-4 text-xs font-semibold text-slate-400">
                <span className="h-px flex-1 bg-slate-200" />
                {t('or', 'أو')}
                <span className="h-px flex-1 bg-slate-200" />
              </div>

              <button
                type="button"
                onClick={handleUseAnotherAccount}
                className="mx-auto flex items-center justify-center gap-2 text-sm font-black text-[#007866] transition hover:text-[#064f43]"
              >
                <HiArrowPath className="h-4 w-4" />
                {t('Use a different email', 'استخدم بريدا آخر')}
              </button>
            </div>
          ) : (
            <div>
              <div className="mb-6 flex items-start gap-4 rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-5">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#079276] to-[#0a5a4c] text-white shadow-lg shadow-emerald-950/15">
                  <HiCheck className="h-7 w-7" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-950">{t('Email verified', 'تم تفعيل البريد')}</h2>
                  <p className="mt-1 text-sm font-semibold leading-6 text-slate-500">
                    {t(
                      'Your account is ready. Add a few optional details to personalize your experience.',
                      'حسابك جاهز. أضف بعض البيانات الاختيارية لتخصيص تجربتك.',
                    )}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <label className="block">
                  <span className="mb-2 block text-sm font-black text-slate-700">
                    {t('Phone number', 'رقم الهاتف')}{' '}
                    <span className="font-semibold text-slate-400">({t('optional', 'اختياري')})</span>
                  </span>
                  <div className="relative">
                    <HiPhone className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                    <input {...bind('phone')} type="tel" placeholder="(555) 123-4567" className={`${inputBaseClass} pl-12`} />
                  </div>
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-black text-slate-700">
                    {t('Age', 'العمر')}{' '}
                    <span className="font-semibold text-slate-400">({t('optional', 'اختياري')})</span>
                  </span>
                  <div className="relative">
                    <HiCalendarDays className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                    <input {...bind('age')} type="number" min="0" max="120" placeholder={t('Enter your age', 'أدخل عمرك')} className={`${inputBaseClass} pl-12`} />
                  </div>
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-black text-slate-700">
                    {t('Gender', 'النوع')}{' '}
                    <span className="font-semibold text-slate-400">({t('optional', 'اختياري')})</span>
                  </span>
                  <div className="relative">
                    <HiUser className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                    <select {...bind('gender')} className={`${selectClass} pl-12`}>
                      <option value="">{t('Select your gender', 'اختر النوع')}</option>
                      <option value="male">{t('Male', 'ذكر')}</option>
                      <option value="female">{t('Female', 'أنثى')}</option>
                      <option value="other">{t('Other / Prefer not to say', 'أخرى / أفضل عدم الإفصاح')}</option>
                    </select>
                  </div>
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-black text-slate-700">
                    {t('Smoking history', 'تاريخ التدخين')}{' '}
                    <span className="font-semibold text-slate-400">({t('optional', 'اختياري')})</span>
                  </span>
                  <div className="relative">
                    <HiShieldCheck className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                    <select {...bind('smokingHistory')} className={`${selectClass} pl-12`}>
                      <option value="">{t('Select an option', 'اختر')}</option>
                      <option value="never">{t('Never smoked', 'لم أدخن قط')}</option>
                      <option value="former">{t('Former smoker', 'مدخن سابق')}</option>
                      <option value="current">{t('Current smoker', 'مدخن حالي')}</option>
                    </select>
                  </div>
                </label>
              </div>

              <button
                id="onboarding-submit-btn"
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="mt-6 flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#064f43] to-[#007866] text-base font-black text-white shadow-xl shadow-emerald-950/20 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
              >
                {loading ? <HiArrowPath className="h-5 w-5 animate-spin" /> : null}
                {t('Complete Setup', 'إتمام الإعداد')}
              </button>

              <button
                type="button"
                onClick={handleSkip}
                disabled={loading}
                className="mx-auto mt-5 block text-sm font-black text-[#007866] transition hover:text-[#064f43] disabled:cursor-not-allowed disabled:text-slate-400"
              >
                {t('Skip for now — I will do this later', 'تخطي الآن — سأفعل ذلك لاحقا')}
              </button>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
