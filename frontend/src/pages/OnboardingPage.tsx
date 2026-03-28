import { useState, type ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const IconUser = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
    </svg>
);

const IconAlert = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
);

export default function OnboardingPage() {
    const navigate = useNavigate();
    const { updateUser, refreshUser } = useAuth();
    const [lang] = useState<'en' | 'ar'>('en');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [skipped, setSkipped] = useState(false);
    const [form, setForm] = useState({
        age: '',
        gender: '',
        smokingHistory: '',
    });

    const ar = lang === 'ar';
    const t = (en: string, arText: string) => ar ? arText : en;

    const bind = (key: string) => ({
        value: (form as Record<string, string>)[key],
        onChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm({ ...form, [key]: e.target.value }),
    });

    const handleSubmit = async () => {
        setLoading(true);
        setError('');
        try {
            // Refresh user to ensure we have latest data
            await refreshUser();
            navigate('/', { replace: true });
        } catch {
            setError(t('Something went wrong. You can update your profile later.', 'حدث خطأ ما. يمكنك تحديث ملفك لاحقًا.'));
        } finally {
            setLoading(false);
        }
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
                    <div style={{
                        width: 72, height: 72, borderRadius: 20,
                        background: 'linear-gradient(135deg, var(--primary-dark), var(--primary))',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 20px',
                        boxShadow: '0 16px 40px rgba(var(--primary-rgb),0.3)',
                    }}>
                        <IconUser />
                    </div>
                    <h1 style={{ margin: '0 0 10px', color: 'var(--text-main)', fontSize: 'clamp(1.7rem, 4vw, 2.1rem)', fontWeight: 900, letterSpacing: '-0.04em' }}>
                        {t('Complete your profile', 'أكمل ملفك الشخصي')}
                    </h1>
                    <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.97rem', lineHeight: 1.7, maxWidth: 380, marginLeft: 'auto', marginRight: 'auto' }}>
                        {t(
                            'Help us personalize your experience with a few quick details. You can always update these later.',
                            'ساعدنا في تخصيص تجربتك ببيانات سريعة. يمكنك تحديثها لاحقًا.'
                        )}
                    </p>
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
                            onClick={() => navigate('/', { replace: true })}
                            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.84rem', fontWeight: 600, cursor: 'pointer', padding: 0 }}
                        >
                            {t('Skip for now — I\u2019ll do this later', 'تخطي الآن — سأفعل هذا لاحقًا')}
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
                    {t('Step 3 of 3 — Final step', 'الخطوة 3 من 3 — الخطوة الأخيرة')}
                </p>
            </div>

            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&display=swap');
        select option { background: var(--card-bg); color: var(--text-main); }
      `}</style>
        </div>
    );
}
