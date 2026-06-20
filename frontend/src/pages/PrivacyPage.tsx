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
                "We collect only the information needed to provide the Morgan's Hope service. This may include basic account details such as name, email address, optional phone number, authentication information, uploaded chest scan images, analysis history, generated reports, and messages submitted to the AI assistant. We do not intentionally collect unnecessary personal data.",
                "نجمع فقط المعلومات اللازمة لتقديم خدمة Morgan's Hope. وقد تشمل هذه المعلومات بيانات الحساب الأساسية مثل الاسم والبريد الإلكتروني ورقم الهاتف (اختياري)، ومعلومات المصادقة، وصور أشعة الصدر المرفوعة، وسجل التحليلات، والتقارير المُنشأة، والرسائل المُرسلة إلى المساعد الذكي. لا نقوم بجمع بيانات شخصية غير ضرورية عن قصد."
            ),
        },
        {
            title: t('How We Use Your Data', 'كيف نستخدم بياناتك'),
            content: t(
                "Uploaded scans are used to perform AI-assisted screening, generate analysis results, create downloadable reports, maintain user history, and support follow-up guidance inside the platform. Account information is used for authentication, profile management, and secure access to previous results. We do not use uploaded medical scans to train or improve models without explicit consent.",
                "تُستخدم الصور المرفوعة لإجراء الفحص بمساعدة الذكاء الاصطناعي، وإنشاء نتائج التحليل، وإصدار تقارير قابلة للتحميل، والحفاظ على سجل المستخدم، ودعم إرشادات المتابعة داخل المنصة. تُستخدم معلومات الحساب للمصادقة وإدارة الملف الشخصي والوصول الآمن إلى النتائج السابقة. لا نستخدم الصور الطبية المرفوعة لتدريب أو تحسين النماذج دون موافقة صريحة."
            ),
        },
        {
            title: t('Data Sharing', 'مشاركة البيانات'),
            content: t(
                "Morgan's Hope does not sell, rent, or distribute personal or medical data for advertising or commercial marketing. Data may be processed only as required to operate the platform, provide AI analysis, maintain security, or respond to user support requests. If external service providers are used, they should only process data for the purpose of delivering the requested platform functionality.",
                "لا يقوم Morgan's Hope ببيع أو تأجير أو توزيع البيانات الشخصية أو الطبية لأغراض إعلانية أو تسويقية. تتم معالجة البيانات فقط في الحدود اللازمة لتشغيل المنصة، أو تقديم التحليل بالذكاء الاصطناعي، أو الحفاظ على الأمان، أو الرد على طلبات الدعم. وفي حال استخدام مزودي خدمات خارجيين، يجب أن تقتصر معالجتهم للبيانات على تقديم وظيفة المنصة المطلوبة فقط."
            ),
        },
        {
            title: t('Data Security', 'أمان البيانات'),
            content: t(
                "We apply reasonable technical and organizational safeguards to protect user data. These include HTTPS/TLS transmission, authenticated access, short-lived access tokens, protected refresh cookies, password hashing, and access control practices. No online system can be guaranteed to be completely secure, but Morgan's Hope is designed to reduce unnecessary exposure of sensitive data.",
                "نطبّق إجراءات حماية تقنية وتنظيمية معقولة لحماية بيانات المستخدمين. وتشمل هذه الإجراءات نقل البيانات عبر HTTPS/TLS، والوصول المُوثّق، ورموز وصول قصيرة العمر، وملفات تعريف ارتباط محمية للتجديد، وتشفير كلمات المرور، وممارسات للتحكم في الوصول. لا يمكن ضمان الأمان الكامل لأي نظام إلكتروني، لكن Morgan's Hope مصمم لتقليل التعرض غير الضروري للبيانات الحساسة."
            ),
        },
        {
            title: t('Data Retention', 'الاحتفاظ بالبيانات'),
            content: t(
                "Analysis results and uploaded scan records may remain available in the user account history until the user deletes them or requests account removal. Some technical logs may be retained for security, debugging, and service reliability purposes where necessary.",
                "قد تبقى نتائج التحليل وسجلات الصور المرفوعة متاحة في سجل حساب المستخدم إلى أن يقوم المستخدم بحذفها أو طلب إزالة الحساب. وقد يتم الاحتفاظ ببعض السجلات التقنية لأغراض الأمان، واستكشاف الأخطاء، وضمان موثوقية الخدمة عند الحاجة."
            ),
        },
        {
            title: t('Your Rights', 'حقوقك'),
            content: t(
                "Users can review their analysis history, delete previous analysis records where the feature is available, update profile information, or request account deletion by contacting us at morganshope40@gmail.com. We aim to process account and data requests within 7 business days whenever technically possible.",
                "يمكن للمستخدمين مراجعة سجل تحليلاتهم، وحذف سجلات التحليل السابقة عند توفر هذه الميزة، وتحديث معلومات الملف الشخصي، أو طلب حذف الحساب عبر التواصل معنا على morganshope40@gmail.com. نسعى لمعالجة طلبات الحساب والبيانات خلال 7 أيام عمل كلما كان ذلك ممكناً تقنياً."
            ),
        },
        {
            title: t('Medical Data Disclaimer', 'إخلاء المسؤولية عن البيانات الطبية'),
            content: t(
                "Morgan's Hope is an experimental AI screening assistance platform developed for educational and research purposes. Results are not a final medical diagnosis and should not be used as a substitute for consultation with a qualified physician, radiologist, pulmonologist, or oncologist. Users remain responsible for seeking professional medical advice before making clinical decisions.",
                "Morgan's Hope منصة تجريبية للمساعدة في الفحص بالذكاء الاصطناعي، طُوِّرت لأغراض تعليمية وبحثية. النتائج ليست تشخيصاً طبياً نهائياً ولا يجب استخدامها كبديل عن استشارة طبيب مرخص أو أخصائي أشعة أو رئة أو أورام. يبقى المستخدم مسؤولاً عن طلب الاستشارة الطبية المتخصصة قبل اتخاذ أي قرار سريري."
            ),
        },
        {
            title: t('Contact Us', 'تواصل معنا'),
            content: t(
                "For privacy questions, data requests, or concerns about how your information is handled, contact us at morganshope40@gmail.com.",
                "للاستفسارات المتعلقة بالخصوصية، أو طلبات البيانات، أو أي مخاوف بشأن كيفية التعامل مع معلوماتك، تواصل معنا على morganshope40@gmail.com."
            ),
        },
    ];

    return (
        <MotionPageTransition>
            <div
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
                        {/* Left — Table of Contents Sidebar (Desktop) */}
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
                                                    borderInlineStart: isActive ? `3px solid var(--primary)` : '3px solid transparent',
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

                        {/* Mobile — Table of Contents Chips */}
                        {isMobile && (
                            <div
                                className="mobile-toc-row"
                                style={{
                                    overflowX: 'auto',
                                    display: 'flex',
                                    gap: 8,
                                    paddingBottom: 8,
                                    marginBottom: 20,
                                    WebkitOverflowScrolling: 'touch',
                                    scrollbarWidth: 'none',
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
                                                padding: '7px 14px',
                                                borderRadius: 999,
                                                fontSize: 12.5,
                                                fontWeight: isActive ? 700 : 500,
                                                whiteSpace: 'nowrap',
                                                border: `1px solid ${isActive ? 'var(--primary)' : 'var(--text-muted)'}`,
                                                background: isActive ? 'var(--primary)' : 'transparent',
                                                color: isActive ? 'white' : 'var(--text-muted)',
                                                textDecoration: 'none',
                                                flexShrink: 0,
                                            }}
                                        >
                                            {sec.title}
                                        </a>
                                    );
                                })}
                            </div>
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
                                {t("Your privacy is fundamental to how Morgan's Hope is designed, developed, and used.", "خصوصيتك أساسية في كيفية تصميم Morgan's Hope وتطويره واستخدامه.")}
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

                            {SECTIONS.map((sec, i) => {
                                const isLast = i === SECTIONS.length - 1;
                                return (
                                    <section
                                        key={i}
                                        id={`section-${i}`}
                                        data-section-index={i}
                                        style={{
                                            marginBottom: 32,
                                            scrollMarginTop: 100,
                                        }}
                                    >
                                        {isLast ? (
                                            <MotionFade direction="up" delay={0.45}>
                                                <div
                                                    style={{
                                                        padding: '22px 28px',
                                                        background: 'var(--card-bg)',
                                                        borderRadius: 14,
                                                        border: '1px solid var(--card-border)',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: isMobile ? "center" : 'space-between',
                                                        flexWrap: 'wrap',
                                                        gap: 16,
                                                        boxShadow: '0 2px 12px var(--shadow-main)',
                                                    }}
                                                >
                                                    <div className='text-center lg:text-left'>
                                                        <p style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-main)', margin: '0 0 4px' }}>
                                                            {t('Privacy concerns?', 'لديك استفسار عن الخصوصية؟')}
                                                        </p>
                                                        <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '0 0 4px' }}>
                                                            {sec.content}
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
                                        ) : (
                                            <>
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
                                            </>
                                        )}
                                    </section>
                                );
                            })}
                        </main>
                    </div>
                </div>
            </div>

            <style>{`
                html { scroll-behavior: smooth; }
                .mobile-toc-row::-webkit-scrollbar { display: none; }
                blockquote {
                    margin: 16px 0;
                    padding: 8px 16px;
                    border-inline-start: 4px solid var(--primary);
                    font-style: italic;
                    color: var(--text-muted);
                    background: color-mix(in srgb, var(--primary) 4%, var(--bg-main));
                    border-start-start-radius: 0;
                    border-start-end-radius: 8px;
                    border-end-end-radius: 8px;
                    border-end-start-radius: 0;
                }
            `}</style>
        </MotionPageTransition>
    );
}
