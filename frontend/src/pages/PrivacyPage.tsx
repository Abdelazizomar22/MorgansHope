import { MotionFade } from '../components/animations/MotionFade';
import { MotionPageTransition } from '../components/animations/MotionPageTransition';

interface PrivacyPageProps { lang: 'en' | 'ar'; }

export function PrivacyPage({ lang }: PrivacyPageProps) {
    const ar = lang === 'ar';
    const t = (en: string, arText: string) => ar ? arText : en;

    const SECTIONS = [
        {
            icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>,
            title: t('Data We Collect', 'البيانات التي نجمعها'),
            content: t(
                'We collect basic account information (name, email, optional phone) and medical scan images you choose to upload for analysis. We do not collect unnecessary personal data or track your behavior beyond what is needed to provide the service.',
                'نجمع معلومات الحساب الأساسية (الاسم، البريد الإلكتروني، الهاتف اختياري) وصور الأشعة الطبية التي تختار رفعها للتحليل. لا نجمع بيانات شخصية غير ضرورية ولا نتتبع سلوكك خارج نطاق تقديم الخدمة.'
            ),
        },
        {
            icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>,
            title: t('How We Use Your Data', 'كيف نستخدم بياناتك'),
            content: t(
                'Uploaded scans are used solely for AI analysis and generating your diagnostic report. We do not use your medical data for training our models without explicit consent. Your data is never sold, shared, or distributed to any third party.',
                'تُستخدم الصور المرفوعة فقط للتحليل بالذكاء الاصطناعي وإنشاء تقريرك التشخيصي. لا نستخدم بياناتك الطبية لتدريب نماذجنا دون موافقة صريحة. لا تُباع بياناتك أو تُشارك أو تُوزَّع على أي طرف خارجي.'
            ),
        },
        {
            icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>,
            title: t('Data Security', 'أمان البيانات'),
            content: t(
                'All data is transmitted over HTTPS with 256-bit SSL encryption. Authentication uses short-lived JWT access tokens (15 minutes) combined with HttpOnly, SameSite=Strict refresh cookies to prevent XSS and CSRF attacks. Passwords are hashed using bcrypt with 12 rounds.',
                'تُنقل جميع البيانات عبر HTTPS مع تشفير SSL بـ 256 بت. تستخدم المصادقة رموز وصول JWT قصيرة العمر (15 دقيقة) مع ملفات تعريف الارتباط HttpOnly وSameSite=Strict للحماية من هجمات XSS وCSRF. تُشفَّر كلمات المرور باستخدام bcrypt بـ 12 جولة.'
            ),
        },
        {
            icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>,
            title: t('Your Rights', 'حقوقك'),
            content: t(
                'You can delete your analysis history at any time from your profile page. You can update your personal information or request complete account deletion by contacting us at info@morganshope.com. We will process your request within 7 business days.',
                'يمكنك حذف سجل تحليلاتك في أي وقت من صفحة ملفك الشخصي. يمكنك تحديث معلوماتك الشخصية أو طلب حذف حسابك كاملاً بالتواصل معنا على info@morganshope.com. سنعالج طلبك خلال 7 أيام عمل.'
            ),
        },
        {
            icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>,
            title: t('Medical Data Disclaimer', 'إخلاء المسؤولية عن البيانات الطبية'),
            content: t(
                "Morgan's Hope is an experimental AI diagnostic assistance tool developed for educational and research purposes. Results are not a final medical diagnosis and should never replace consultation with a qualified physician. We are not liable for any medical decisions made based solely on our AI output.",
                "مورجان هوب أداة مساعدة تشخيصية تجريبية بالذكاء الاصطناعي طُوِّرت للأغراض التعليمية والبحثية. النتائج ليست تشخيصاً طبياً نهائياً ولا يجب أن تحل محل استشارة طبيب متخصص. نحن غير مسؤولين عن أي قرارات طبية تُتخذ بناءً على مخرجات الذكاء الاصطناعي وحده."
            ),
        },
    ];

    return (
        <MotionPageTransition>
            <div dir={ar ? 'rtl' : 'ltr'} style={{
                minHeight: '100vh',
                background: 'var(--bg-main)',
                color: 'var(--text-main)',
                fontFamily: ar ? "'Cairo', sans-serif" : "'Sora', sans-serif",
            }}>

                {/* Hero */}
                <section style={{
                    background: 'linear-gradient(160deg, var(--primary-dark) 0%, var(--primary) 60%, var(--primary-light) 100%)',
                    color: 'white', padding: '60px 40px', textAlign: 'center',
                }}>
                    <MotionFade direction="up" delay={0.1}>
                        <div style={{
                            display: 'inline-flex', padding: '10px 12px',
                            background: 'rgba(255,255,255,0.12)', borderRadius: 12, marginBottom: 18,
                        }}>
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                            </svg>
                        </div>
                        <h1 style={{ fontSize: 36, fontWeight: 900, margin: '0 0 10px', letterSpacing: -0.5 }}>
                            {t('Privacy Policy', 'سياسة الخصوصية')}
                        </h1>
                        <p style={{ fontSize: 16, opacity: 0.85, margin: '0 0 12px' }}>
                            {t("Your privacy is fundamental to everything we build.", "خصوصيتك أساس كل ما نبنيه.")}
                        </p>
                        <span style={{
                            fontSize: 12, opacity: 0.65,
                            background: 'rgba(255,255,255,0.1)',
                            padding: '4px 12px', borderRadius: 99,
                        }}>
                            {t('Last updated: March 2026', 'آخر تحديث: مارس 2026')}
                        </span>
                    </MotionFade>
                </section>

                {/* Sections */}
                <section style={{ padding: '60px 40px', maxWidth: 800, margin: '0 auto' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                        {SECTIONS.map((sec, i) => (
                            <MotionFade key={i} direction="up" delay={i * 0.08}>
                                <div style={{
                                    background: 'var(--card-bg)',
                                    border: '1px solid var(--card-border)',
                                    borderRadius: 16, padding: '28px 32px',
                                    boxShadow: '0 2px 12px var(--shadow-main)',
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                                        <div style={{
                                            padding: 10, background: 'rgba(var(--primary-rgb), 0.08)',
                                            borderRadius: 10, color: 'var(--primary)', flexShrink: 0,
                                        }}>
                                            {sec.icon}
                                        </div>
                                        <h2 style={{ fontSize: 17, fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                                            {sec.title}
                                        </h2>
                                    </div>
                                    <p style={{
                                        fontSize: 14, color: 'var(--text-muted)',
                                        lineHeight: 1.85, margin: 0,
                                    }}>
                                        {sec.content}
                                    </p>
                                </div>
                            </MotionFade>
                        ))}
                    </div>

                    {/* Contact for privacy */}
                    <MotionFade direction="up" delay={0.5}>
                        <div style={{
                            marginTop: 40, padding: '24px 32px',
                            background: 'var(--card-bg)', borderRadius: 14,
                            border: '1px solid var(--card-border)',
                            display: 'flex', alignItems: 'center',
                            justifyContent: 'space-between', flexWrap: 'wrap', gap: 16,
                        }}>
                            <div>
                                <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-main)', margin: '0 0 4px' }}>
                                    {t('Privacy concerns?', 'لديك استفسار عن الخصوصية؟')}
                                </p>
                                <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>
                                    info@morganshope.com
                                </p>
                            </div>
                            <a href="/contact" style={{
                                padding: '10px 22px', background: 'var(--primary)',
                                color: 'white', borderRadius: 9, textDecoration: 'none',
                                fontWeight: 700, fontSize: 13, flexShrink: 0,
                            }}>
                                {t('Contact Us', 'تواصل معنا')}
                            </a>
                        </div>
                    </MotionFade>
                </section>
            </div>
        </MotionPageTransition>
    );
}
