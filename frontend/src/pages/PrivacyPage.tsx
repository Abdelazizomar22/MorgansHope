import { MotionFade } from '../components/animations/MotionFade';
import { MotionHoverScale } from '../components/animations/MotionHoverScale';
import { MotionPageTransition } from '../components/animations/MotionPageTransition';
import { useState, useEffect, useRef } from 'react';

interface PrivacyPageProps { lang: 'en' | 'ar'; }

export function PrivacyPage({ lang }: PrivacyPageProps) {
    const ar = lang === 'ar';
    const t = (en: string, arText: string) => ar ? arText : en;

    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [activeSection, setActiveSection] = useState(0);
    const contentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const container = contentRef.current;
        if (!container) return;

        const sectionEls = container.querySelectorAll<HTMLElement>('[data-section-index]');
        if (!sectionEls.length) return;

        const updateActiveSection = () => {
            let current = 0;
            sectionEls.forEach((el, i) => {
                const rect = el.getBoundingClientRect();
                if (rect.top <= 150) {
                    current = i;
                }
            });
            setActiveSection(current);
        };

        window.addEventListener('scroll', updateActiveSection, { passive: true });
        updateActiveSection();
        return () => window.removeEventListener('scroll', updateActiveSection);
    }, []);

    const SECTIONS = [
        {
            title: t('Data We Collect', 'البيانات التي نجمعها'),
            content: t(
                'We collect basic account information (name, email, optional phone) and medical scan images you choose to upload for analysis. We do not collect unnecessary personal data or track your behavior beyond what is needed to provide the service.',
                'نجمع معلومات الحساب الأساسية (الاسم، البريد الإلكتروني، الهاتف اختياري) وصور الأشعة الطبية التي تختار رفعها للتحليل. لا نجمع بيانات شخصية غير ضرورية ولا نتتبع سلوكك خارج نطاق تقديم الخدمة.'
            ),
        },
        {
            title: t('How We Use Your Data', 'كيف نستخدم بياناتك'),
            content: t(
                'Uploaded scans are used solely for AI analysis and generating your diagnostic report. We do not use your medical data for training our models without explicit consent. Your data is never sold, shared, or distributed to any third party.',
                'تُستخدم الصور المرفوعة فقط للتحليل بالذكاء الاصطناعي وإنشاء تقريرك التشخيصي. لا نستخدم بياناتك الطبية لتدريب نماذجنا دون موافقة صريحة. لا تُباع بياناتك أو تُشارك أو تُوزَّع على أي طرف خارجي.'
            ),
        },
        {
            title: t('Data Security', 'أمان البيانات'),
            content: t(
                'All data is transmitted over HTTPS with 256-bit SSL encryption. Authentication uses short-lived JWT access tokens (15 minutes) combined with HttpOnly, SameSite=Strict refresh cookies to prevent XSS and CSRF attacks. Passwords are hashed using bcrypt with 12 rounds.',
                'تُنقل جميع البيانات عبر HTTPS مع تشفير SSL بـ 256 بت. تستخدم المصادقة رموز وصول JWT قصيرة العمر (15 دقيقة) مع ملفات تعريف الارتباط HttpOnly وSameSite=Strict للحماية من هجمات XSS وCSRF. تُشفَّر كلمات المرور باستخدام bcrypt بـ 12 جولة.'
            ),
        },
        {
            title: t('Your Rights', 'حقوقك'),
            content: t(
                'You can delete your analysis history at any time from your profile page. You can update your personal information or request complete account deletion by contacting us at morganshope40@gmail.com. We will process your request within 7 business days.',
                'يمكنك حذف سجل تحليلاتك في أي وقت من صفحة ملفك الشخصي. يمكنك تحديث معلوماتك الشخصية أو طلب حذف حسابك كاملاً بالتواصل معنا على morganshope40@gmail.com. سنعالج طلبك خلال 7 أيام عمل.'
            ),
        },
        {
            title: t('Medical Data Disclaimer', 'إخلاء المسؤولية عن البيانات الطبية'),
            content: t(
                "Morgan's Hope is an experimental AI diagnostic assistance tool developed for educational and research purposes. Results are not a final medical diagnosis and should never replace consultation with a qualified physician. We are not liable for any medical decisions made based solely on our AI output.",
                "مورجان هوب أداة مساعدة تشخيصية تجريبية بالذكاء الاصطناعي طُوِّرت للأغراض التعليمية والبحثية. النتائج ليست تشخيصاً طبياً نهائياً ولا يجب أن تحل محل استشارة طبيب متخصص. نحن غير مسؤولين عن أي قرارات طبية تُتخذ بناءً على مخرجات الذكاء الاصطناعي وحده."
            ),
        },
    ];

    return (
        <MotionPageTransition>
            <div
                dir={ar ? 'rtl' : 'ltr'}
                style={{
                    minHeight: '100vh',
                    background: 'radial-gradient(circle at 12% 18%, rgba(var(--primary-rgb),0.08), transparent 22%), radial-gradient(circle at 88% 14%, rgba(var(--primary-rgb),0.06), transparent 20%), linear-gradient(180deg, color-mix(in srgb, var(--primary) 4%, var(--bg-main)) 0%, var(--bg-main) 100%)',
                    color: 'var(--text-main)',
                    padding: isMobile ? '52px 18px' : '90px 40px',
                    fontFamily: ar ? "'Cairo', sans-serif" : "'Sora', sans-serif",
                }}
            >
                <div style={{ maxWidth: 1200, margin: '0 auto' }}>
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: isMobile ? '1fr' : '220px 1fr',
                            gap: isMobile ? 32 : 48,
                            alignItems: 'start',
                        }}
                    >
                        {/* Left — Table of Contents Sidebar */}
                        {!isMobile && (
                            <aside
                                style={{
                                    position: 'sticky',
                                    top: 100,
                                    paddingTop: 12,
                                }}
                            >
                                <div
                                    style={{
                                        fontSize: 11,
                                        fontWeight: 800,
                                        letterSpacing: 1.2,
                                        textTransform: 'uppercase',
                                        color: 'var(--text-muted)',
                                        marginBottom: 16,
                                    }}
                                >
                                    {t('Table of contents', 'محتويات')}
                                </div>
                                <nav
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: 4,
                                    }}
                                >
                                    {SECTIONS.map((sec, i) => {
                                        const isActive = i === activeSection;
                                        return (
                                            <a
                                                key={i}
                                                href={`#section-${i}`}
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    setActiveSection(i);
                                                    document.getElementById(`section-${i}`)?.scrollIntoView({ behavior: 'smooth' });
                                                }}
                                                style={{
                                                    textDecoration: 'none',
                                                    fontSize: 13,
                                                    fontWeight: isActive ? 700 : 500,
                                                    color: isActive ? 'var(--primary)' : 'var(--text-muted)',
                                                    padding: '6px 0 6px 12px',
                                                    borderLeft: isActive ? `3px solid var(--primary)` : '3px solid transparent',
                                                    transition: 'color 0.2s, border-color 0.2s, font-weight 0.2s',
                                                    lineHeight: 1.4,
                                                }}
                                            >
                                                {sec.title}
                                            </a>
                                        );
                                    })}
                                </nav>
                            </aside>
                        )}

                        {/* Right — Main Content */}
                        <main ref={contentRef}>
                            <h1
                                style={{
                                    fontSize: isMobile ? 32 : 44,
                                    fontWeight: 800,
                                    lineHeight: 1.1,
                                    letterSpacing: '-0.03em',
                                    color: 'var(--primary-dark)',
                                    margin: '0 0 8px',
                                }}
                            >
                                {t('Privacy Policy', 'سياسة الخصوصية')}
                            </h1>
                            <p
                                style={{
                                    fontSize: 16,
                                    lineHeight: 1.7,
                                    color: 'var(--text-muted)',
                                    margin: '0 0 4px',
                                    maxWidth: 600,
                                }}
                            >
                                {t("Your privacy is fundamental to everything we build.", "خصوصيتك أساس كل ما نبنيه.")}
                            </p>
                            <span
                                style={{
                                    display: 'inline-block',
                                    fontSize: 13,
                                    color: 'var(--text-muted-alt)',
                                    fontWeight: 600,
                                    marginBottom: 28,
                                }}
                            >
                                {t('Last updated: March 2026', 'آخر تحديث: مارس 2026')}
                            </span>

                            <div
                                style={{
                                    height: 1,
                                    width: '100%',
                                    background: 'linear-gradient(to right, color-mix(in srgb, var(--primary) 20%, transparent), color-mix(in srgb, var(--primary) 50%, transparent), color-mix(in srgb, var(--primary) 10%, transparent))',
                                    marginBottom: 32,
                                }}
                            />

                            {SECTIONS.map((sec, i) => (
                                <section
                                    key={i}
                                    id={`section-${i}`}
                                    data-section-index={i}
                                    style={{
                                        marginBottom: 32,
                                        scrollMarginTop: 100,
                                    }}
                                >
                                    <h2
                                        style={{
                                            fontSize: 20,
                                            fontWeight: 700,
                                            color: 'var(--text-main)',
                                            margin: '0 0 12px',
                                        }}
                                    >
                                        {sec.title}
                                    </h2>
                                    <p
                                        style={{
                                            fontSize: 16,
                                            lineHeight: 1.7,
                                            color: 'var(--text-muted)',
                                            margin: 0,
                                        }}
                                    >
                                        {sec.content}
                                    </p>
                                </section>
                            ))}

                            <MotionFade direction="up" delay={0.45}>
                                <div
                                    style={{
                                        marginTop: 48,
                                        padding: '22px 28px',
                                        background: 'var(--card-bg)',
                                        borderRadius: 14,
                                        border: '1px solid var(--card-border)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        flexWrap: 'wrap',
                                        gap: 16,
                                        boxShadow: '0 2px 12px var(--shadow-main)',
                                    }}
                                >
                                    <div>
                                        <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-main)', margin: '0 0 4px' }}>
                                            {t('Privacy concerns?', 'لديك استفسار عن الخصوصية؟')}
                                        </p>
                                        <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>
                                        	morganshope40@gmail.com
                                        </p>
                                    </div>
                                    <MotionHoverScale>
                                        <a
                                            href="/contact"
                                            style={{
                                                padding: '10px 22px',
                                                background: 'linear-gradient(135deg, var(--primary-dark), var(--primary))',
                                                color: 'white',
                                                borderRadius: 9,
                                                textDecoration: 'none',
                                                fontWeight: 700,
                                                fontSize: 13,
                                                flexShrink: 0,
                                                boxShadow: '0 8px 20px rgba(var(--primary-rgb), 0.2)',
                                            }}
                                        >
                                            {t('Contact Us', 'تواصل معنا')}
                                        </a>
                                    </MotionHoverScale>
                                </div>
                            </MotionFade>
                        </main>
                    </div>
                </div>
            </div>

            <style>{`
                html { scroll-behavior: smooth; }
                blockquote {
                    margin: 16px 0;
                    padding: 8px 16px;
                    border-left: 4px solid var(--primary);
                    font-style: italic;
                    color: var(--text-muted);
                    background: color-mix(in srgb, var(--primary) 4%, var(--bg-main));
                    border-radius: 0 8px 8px 0;
                }
            `}</style>
        </MotionPageTransition>
    );
}
