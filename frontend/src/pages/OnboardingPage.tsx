import { useState, type ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../utils/api';
import { HiExclamationCircle, HiPhone } from 'react-icons/hi2';

const IconAlert = () => <HiExclamationCircle size={15} />;

const IconPhone = () => <HiPhone size={15} />;

export default function OnboardingPage() {
    const navigate = useNavigate();
    const { user, updateUser, refreshUser, logout } = useAuth();
    const [lang] = useState<'en' | 'ar'>('en');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [form, setForm] = useState({
        phone: user?.phone || '',
        age: '',
        gender: '',
        smokingHistory: '',
    });
    const [verificationCode, setVerificationCode] = useState('');
    const [verificationLoading, setVerificationLoading] = useState(false);
    const [verificationNotice, setVerificationNotice] = useState('');
    const [isCodeSent, setIsCodeSent] = useState(false);

    const ar = lang === 'ar';
    const t = (en: string, arText: string) => ar ? arText : en;
    const needsPhoneVerification = Boolean(user && user.phoneVerified !== true);
    const phoneTarget = user?.phone || form.phone.trim();

    const bind = (key: string) => ({
        value: (form as Record<string, string>)[key],
        onChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm({ ...form, [key]: e.target.value }),
    });

    const handleVerifyPhoneOtp = async () => {
        if (!verificationCode.trim()) {
            setError(t('Please enter the verification code first.', 'Please enter the verification code first.'));
            return;
        }
        setVerificationLoading(true);
        setError('');
        setVerificationNotice('');
        try {
            const verified = await authApi.verifyPhoneOtp(verificationCode.trim());
            if (verified.data.data) updateUser(verified.data.data);
            await refreshUser();
            setVerificationCode('');
            setVerificationNotice(t('Phone verified successfully.', 'Phone verified successfully.'));
        } catch (err: any) {
            setError(err?.message || err?.response?.data?.message || t('Verification failed. Please check the code and try again.', 'Verification failed. Please check the code and try again.'));
        } finally {
            setVerificationLoading(false);
        }
    };

    const handleSendPhoneOtp = async () => {
        const nextPhone = form.phone.trim();
        if (nextPhone.replace(/[^\d]/g, '').length < 8) {
            setError(t('Please enter a valid phone number first.', 'Please enter a valid phone number first.'));
            return;
        }
        setVerificationLoading(true);
        setError('');
        setVerificationNotice('');
        try {
            const updated = await authApi.updateProfile({ phone: nextPhone });
            if (updated.data.data) updateUser(updated.data.data);
            const response = await authApi.sendPhoneOtp();
            setIsCodeSent(true);
            setVerificationNotice(
                response.data.data?.devCode
                    ? t(`Verification code sent to your email. Dev code: ${response.data.data.devCode}`, `Verification code sent to your email. Dev code: ${response.data.data.devCode}`)
                    : t('A verification code was sent to your email.', 'A verification code was sent to your email.')
            );
            await refreshUser();
        } catch (err: any) {
            setError(err?.message || err?.response?.data?.message || t('Could not send verification code right now.', 'Could not send verification code right now.'));
        } finally {
            setVerificationLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (needsPhoneVerification) {
            setError(t('Please verify your phone number before completing setup.', 'Please verify your phone number before completing setup.'));
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

    const handleStartOver = async () => {
        await logout();
        navigate('/register', { replace: true });
    };

    const handleSkip = async () => {
        if (needsPhoneVerification) {
            setError(t('Please verify your phone number before continuing.', 'Please verify your phone number before continuing.'));
            return;
        }
        try {
            const updated = await authApi.updateProfile({ onboardingCompleted: true });
            if (updated.data.data) updateUser(updated.data.data);
        } catch {
            // Non-blocking: the user can still continue and update profile later.
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

    const inputStyle = {
        ...selectStyle,
    };

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
            <div style={{ width: '100%', maxWidth: 520 }}>
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: 36 }}>
                    <h1 style={{ margin: '0 0 10px', color: 'var(--text-main)', fontSize: 'clamp(1.7rem, 4vw, 2.1rem)', fontWeight: 900, letterSpacing: '-0.04em' }}>
                        {t('Complete your profile', 'أكمل ملفك الشخصي')}
                    </h1>
                    <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.97rem', lineHeight: 1.7, maxWidth: 380, marginLeft: 'auto', marginRight: 'auto' }}>
                        {t(
                            'Help us personalize your experience with a few quick details. You can always update these later.',
                            'ساعدنا في تخصيص تجربتك ببيانات سريعة. يمكنك تحديثها لاحقًا.'
                        )}
                    </p>
                    {needsPhoneVerification && (
                        <button
                            type="button"
                            onClick={handleStartOver}
                            style={{ marginTop: 14, background: 'transparent', border: 'none', color: 'var(--primary)', fontSize: '0.82rem', fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit' }}
                        >
                            {t('Back to account details', 'الرجوع لبيانات الحساب')}
                        </button>
                    )}
                </div>

                {/* Card */}
                <div style={{
                    background: 'var(--card-bg)',
                    border: '1px solid color-mix(in srgb, var(--primary) 10%, var(--card-border))',
                    borderRadius: 28,
                    padding: '32px 28px',
                    boxShadow: '0 24px 64px rgba(15,23,42,0.08), inset 0 1px 0 rgba(255,255,255,0.4)',
                }}>
                    {error && (
                        <div style={{ background: 'rgba(239,68,68,0.06)', border: '1.5px solid #fca5a5', borderRadius: 14, padding: '12px 14px', color: '#dc2626', fontSize: 13, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <IconAlert /><span>{error}</span>
                        </div>
                    )}

                    {/* Phone */}
                    <div style={{ marginBottom: 18 }}>
                        <label style={{ display: 'block', marginBottom: 7, color: 'var(--text-main)', fontSize: '0.82rem', fontWeight: 700 }}>
                            {t('Phone number', 'رقم الهاتف')}{' '}
                            <span style={{ color: needsPhoneVerification ? 'var(--primary)' : 'var(--text-muted)', fontWeight: 700, fontSize: '0.74rem' }}>
                                ({needsPhoneVerification ? t('required for verification', 'مطلوب للتحقق') : t('verified', 'تم التحقق')})
                            </span>
                        </label>
                        <input
                            {...bind('phone')}
                            type="tel"
                            placeholder={t('e.g. +201234567890', 'مثال: +201234567890')}
                            style={inputStyle}
                        />
                    </div>

                    {needsPhoneVerification && (
                        <div style={{
                            background: 'linear-gradient(135deg, rgba(var(--primary-rgb),0.08), rgba(255,255,255,0.72))',
                            border: '1.5px solid rgba(var(--primary-rgb),0.18)',
                            borderRadius: 18,
                            padding: '16px 16px 18px',
                            marginBottom: 22,
                        }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
                                <div style={{ width: 36, height: 36, borderRadius: 12, background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <IconPhone />
                                </div>
                                <div>
                                    <h3 style={{ margin: '0 0 4px', color: 'var(--text-main)', fontSize: '0.98rem', fontWeight: 850 }}>
                                        {t('Verify your phone', 'Verify your phone')}
                                    </h3>
                                    <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.82rem', lineHeight: 1.6 }}>
                                        {t('We will send a 6-digit code to your email to confirm your phone number, then enter it here to continue.', 'We will send a 6-digit code to your email to confirm your phone number, then enter it here to continue.')}
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
                                onClick={handleSendPhoneOtp}
                                disabled={verificationLoading}
                                style={{ width: '100%', minHeight: 44, border: '1.5px solid var(--primary)', borderRadius: 14, background: 'rgba(var(--primary-rgb),0.08)', color: 'var(--primary)', fontWeight: 850, cursor: verificationLoading ? 'default' : 'pointer', opacity: verificationLoading ? 0.7 : 1, fontFamily: 'inherit', marginBottom: 10 }}
                            >
                                {isCodeSent ? t('Resend verification code', 'Resend verification code') : t('Send verification code', 'Send verification code')}
                            </button>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 10 }}>
                                <input
                                    value={verificationCode}
                                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    onKeyDown={(e) => e.key === 'Enter' && handleVerifyPhoneOtp()}
                                    inputMode="numeric"
                                    placeholder="123456"
                                    style={{ ...inputStyle, letterSpacing: '0.22em', fontWeight: 800, textAlign: 'center' }}
                                />
                                <button
                                    type="button"
                                    onClick={handleVerifyPhoneOtp}
                                    disabled={verificationLoading}
                                    style={{ border: 'none', borderRadius: 14, background: 'var(--primary)', color: '#fff', padding: '0 16px', fontWeight: 800, cursor: verificationLoading ? 'default' : 'pointer', opacity: verificationLoading ? 0.7 : 1, fontFamily: 'inherit' }}
                                >
                                    {t('Verify', 'Verify')}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Age */}
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

                    {/* Gender */}
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

                    {/* Smoking history */}
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

                    {/* Submit */}
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
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
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
                                {t('Saving…', 'جارٍ الحفظ…')}
                            </>
                        ) : t('Complete Setup', 'إتمام الإعداد')}
                    </button>

                    {/* Skip */}
                    <div style={{ textAlign: 'center', marginTop: 16 }}>
                        <button
                            type="button"
                            onClick={handleSkip}
                            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.84rem', fontWeight: 600, cursor: 'pointer', padding: 0 }}
                        >
                            {t('Skip for now, I’ll do this later', 'تخطي الآن — سأفعل هذا لاحقًا')}
                        </button>
                    </div>
                </div>

                {/* Progress indicator */}
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
                    {t('Step 3 of 3 - Final step', 'الخطوة 3 من 3 — الخطوة الأخيرة')}
                </p>
            </div>

            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&display=swap');
        select option { background: var(--card-bg); color: var(--text-main); }
      `}</style>
        </div>
    );
}
