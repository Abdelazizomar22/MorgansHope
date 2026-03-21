import { useState, useEffect } from 'react';
import { MotionFade } from '../components/animations/MotionFade';
import { MotionPageTransition } from '../components/animations/MotionPageTransition';

interface FAQsPageProps { lang: 'en' | 'ar'; }

const ChevronIcon = ({ open }: { open: boolean }) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
        style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.25s' }}>
        <polyline points="6 9 12 15 18 9" />
    </svg>
);

export function FAQsPage({ lang }: FAQsPageProps) {
    const ar = lang === 'ar';
    const t = (en: string, arText: string) => ar ? arText : en;
    const [open, setOpen] = useState<number | null>(0);

    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const FAQS = [
        {
            q: t("Is Morgan's Hope a substitute for a doctor?",
                "هل مورجان هوب بديل عن الطبيب؟"),
            a: t("No. Morgan's Hope is an AI screening tool designed to assist early detection only. All results must be reviewed by a qualified physician before any medical decision is made.",
                "لا. مورجان هوب أداة فحص بالذكاء الاصطناعي للمساعدة في الكشف المبكر فقط. يجب مراجعة جميع النتائج مع طبيب متخصص قبل اتخاذ أي قرار طبي.")
        },
        {
            q: t("What scan types are supported?",
                "ما أنواع الأشعة المدعومة؟"),
            a: t("Currently we support Chest CT Scans (6-class classification: Normal, Benign, Adenocarcinoma, Squamous Cell, Large Cell, Small Cell) and Chest X-Rays (binary: Normal / Nodule-Mass). More scan types are planned for future updates.",
                "ندعم حالياً الأشعة المقطعية للصدر (6 تصنيفات: طبيعي، حميد، غدي، حرشفي، كبير الخلايا، صغير الخلايا) والأشعة السينية للصدر (تصنيف ثنائي). أنواع إضافية مخططة مستقبلاً.")
        },
        {
            q: t("How accurate is the AI model?",
                "ما مدى دقة نموذج الذكاء الاصطناعي؟"),
            a: t("Our CT model achieves 99.86% accuracy on a test dataset of 15,000+ medical images. However, real-world accuracy may vary depending on image quality and scan conditions. Always confirm results with a specialist.",
                "يحقق نموذج CT دقة 99.86% على مجموعة اختبار تضم أكثر من 15,000 صورة طبية. قد تختلف الدقة الفعلية حسب جودة الصورة وظروف الفحص. تأكد دائماً من النتائج مع متخصص.")
        },
        {
            q: t("Is my data private and secure?",
                "هل بياناتي خاصة وآمنة؟"),
            a: t("Yes. Your scans are transmitted over HTTPS with 256-bit SSL encryption and are never shared with third parties. We do not sell or distribute any personal or medical data.",
                "نعم. تُنقل صورك عبر HTTPS مع تشفير SSL بـ 256 بت ولا تُشارك مع أي طرف خارجي. لا نبيع أو نوزع أي بيانات شخصية أو طبية.")
        },
        {
            q: t("Can I download my results?",
                "هل أستطيع تحميل نتائجي؟"),
            a: t("Yes. After analysis you can download a professionally formatted PDF report containing your scan results, patient information, risk distribution, and the recommended clinical pathway.",
                "نعم. بعد التحليل يمكنك تحميل تقرير PDF احترافي يحتوي على النتائج وبيانات المريض وتوزيع المخاطر والمسار السريري الموصى به.")
        },
        {
            q: t("Can I upload multiple scans at once?",
                "هل يمكنني رفع أكثر من صورة في نفس الوقت؟"),
            a: t("Yes. Morgan's Hope supports batch scanning — you can upload multiple CT or X-Ray images at once and receive individual results for each scan in a single session.",
                "نعم. يدعم مورجان هوب الفحص الجماعي — يمكنك رفع صور CT أو أشعة سينية متعددة مرة واحدة وتلقي نتائج فردية لكل صورة في جلسة واحدة.")
        },
        {
            q: t("Is this service free?",
                "هل الخدمة مجانية؟"),
            a: t("Morgan's Hope is currently a free academic project developed as a graduation project at the Higher Institute of Computer Science & Information Systems, 2025/2026.",
                "مورجان هوب حالياً مشروع أكاديمي مجاني تم تطويره كمشروع تخرج في المعهد العالي لعلوم الحاسب ونظم المعلومات، 2025/2026.")
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
                    color: 'white', padding: isMobile ? '40px 20px' : '60px 40px', textAlign: 'center',
                }}>
                    <MotionFade direction="up" delay={0.1}>
                        <div style={{
                            display: 'inline-flex', padding: '10px 12px',
                            background: 'rgba(255,255,255,0.12)', borderRadius: 12, marginBottom: 18,
                        }}>
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                            </svg>
                        </div>
                        <h1 style={{ fontSize: isMobile ? 28 : 36, fontWeight: 900, margin: '0 0 10px', letterSpacing: -0.5 }}>
                            {t('Frequently Asked Questions', 'الأسئلة الشائعة')}
                        </h1>
                        <p style={{ fontSize: 16, opacity: 0.85, margin: 0 }}>
                            {t('Everything you need to know about Morgan\'s Hope', 'كل ما تحتاج معرفته عن مورجان هوب')}
                        </p>
                    </MotionFade>
                </section>

                {/* FAQ List */}
                <section style={{ padding: isMobile ? '40px 20px' : '60px 40px', maxWidth: 760, margin: '0 auto' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {FAQS.map((faq, i) => (
                            <MotionFade key={i} direction="up" delay={i * 0.06}>
                                <div style={{
                                    background: 'var(--card-bg)',
                                    border: `1.5px solid ${open === i ? 'var(--primary)' : 'var(--card-border)'}`,
                                    borderRadius: 14,
                                    overflow: 'hidden',
                                    transition: 'border-color 0.2s',
                                    boxShadow: open === i ? '0 4px 20px var(--shadow-main)' : 'none',
                                }}>
                                    {/* Question */}
                                    <button
                                        onClick={() => setOpen(open === i ? null : i)}
                                        style={{
                                            width: '100%', display: 'flex', alignItems: 'center',
                                            justifyContent: 'space-between', gap: 16,
                                            padding: isMobile ? '16px' : '18px 22px', background: 'none', border: 'none',
                                            cursor: 'pointer', textAlign: ar ? 'right' : 'left',
                                            fontFamily: 'inherit',
                                        }}
                                    >
                                        <span style={{
                                            fontSize: 15, fontWeight: 700,
                                            color: open === i ? 'var(--primary)' : 'var(--text-main)',
                                            transition: 'color 0.2s', flex: 1,
                                        }}>
                                            {faq.q}
                                        </span>
                                        <span style={{ color: 'var(--primary)', flexShrink: 0 }}>
                                            <ChevronIcon open={open === i} />
                                        </span>
                                    </button>

                                    {/* Answer */}
                                    {open === i && (
                                        <div style={{
                                            padding: isMobile ? '0 16px 16px' : '0 22px 20px',
                                            borderTop: '1px solid var(--card-border)',
                                            paddingTop: 16,
                                        }}>
                                            <p style={{
                                                fontSize: 14, color: 'var(--text-muted)',
                                                lineHeight: 1.8, margin: 0,
                                            }}>
                                                {faq.a}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </MotionFade>
                        ))}
                    </div>

                    {/* Still have questions */}
                    <MotionFade direction="up" delay={0.4}>
                        <div style={{
                            marginTop: 48, textAlign: 'center',
                            background: 'var(--card-bg)', borderRadius: 16,
                            padding: '32px', border: '1px solid var(--card-border)',
                        }}>
                            <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-main)', marginBottom: 8 }}>
                                {t("Still have questions?", "لا تزال لديك أسئلة؟")}
                            </p>
                            <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 20 }}>
                                {t("Our team is happy to help.", "فريقنا سعيد بمساعدتك.")}
                            </p>
                            <a href="/contact" style={{
                                display: 'inline-flex', alignItems: 'center', gap: 8,
                                padding: '11px 24px', background: 'var(--primary)',
                                color: 'white', borderRadius: 9, textDecoration: 'none',
                                fontWeight: 700, fontSize: 14,
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
