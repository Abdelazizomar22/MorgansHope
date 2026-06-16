import { useState, useEffect } from 'react';
import { MotionFade } from '../components/animations/MotionFade';
import { MotionHoverScale } from '../components/animations/MotionHoverScale';
import { MotionPageTransition } from '../components/animations/MotionPageTransition';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import { Plus, X } from '@aliimam/icons';

interface FAQsPageProps { lang: 'en' | 'ar'; }

export function FAQsPage({ lang }: FAQsPageProps) {
    const ar = lang === 'ar';
    const t = (en: string, arText: string) => ar ? arText : en;
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const FAQS = [
        {
            q: t("Is Morgan's Hope a substitute for a doctor?", "هل مورجان هوب بديل عن الطبيب؟"),
            a: t("No. Morgan's Hope is an AI screening tool designed to assist early detection only. All results must be reviewed by a qualified physician before any medical decision is made.", "لا. مورجان هوب أداة فحص بالذكاء الاصطناعي للمساعدة في الكشف المبكر فقط. يجب مراجعة جميع النتائج مع طبيب متخصص قبل اتخاذ أي قرار طبي.")
        },
        {
            q: t("What scan types are supported?", "ما أنواع الأشعة المدعومة؟"),
            a: t("Currently we support Chest CT Scans (6-class classification: Normal, Benign, Adenocarcinoma, Squamous Cell, Large Cell, Small Cell) and Chest X-Rays (binary: Normal / Nodule-Mass). More scan types are planned for future updates.", "ندعم حالياً الأشعة المقطعية للصدر (6 تصنيفات: طبيعي، حميد، غدي، حرشفي، كبير الخلايا، صغير الخلايا) والأشعة السينية للصدر (تصنيف ثنائي). أنواع إضافية مخططة مستقبلاً.")
        },
        {
            q: t("How accurate is the AI model?", "ما مدى دقة نموذج الذكاء الاصطناعي؟"),
            a: t("Our CT model achieves 99.86% accuracy on a test dataset of 15,000+ medical images. However, real-world accuracy may vary depending on image quality and scan conditions. Always confirm results with a specialist.", "يحقق نموذج CT دقة 99.86% على مجموعة اختبار تضم أكثر من 15,000 صورة طبية. قد تختلف الدقة الفعلية حسب جودة الصورة وظروف الفحص. تأكد دائماً من النتائج مع متخصص.")
        },
        {
            q: t("Is my data private and secure?", "هل بياناتي خاصة وآمنة؟"),
            a: t("Yes. Your scans are transmitted over HTTPS with 256-bit SSL encryption and are never shared with third parties. We do not sell or distribute any personal or medical data.", "نعم. تُنقل صورك عبر HTTPS مع تشفير SSL بـ 256 بت ولا تُشارك مع أي طرف خارجي. لا نبيع أو نوزع أي بيانات شخصية أو طبية.")
        },
        {
            q: t("Can I download my results?", "هل أستطيع تحميل نتائجي؟"),
            a: t("Yes. After analysis you can download a professionally formatted PDF report containing your scan results, patient information, risk distribution, and the recommended clinical pathway.", "نعم. بعد التحليل يمكنك تحميل تقرير PDF احترافي يحتوي على النتائج وبيانات المريض وتوزيع المخاطر والمسار السريري الموصى به.")
        },
        {
            q: t("Can I upload multiple scans at once?", "هل يمكنني رفع أكثر من صورة في نفس الوقت؟"),
            a: t("Yes. Morgan's Hope supports batch scanning — you can upload multiple CT or X-Ray images at once and receive individual results for each scan in a single session.", "نعم. يدعم مورجان هوب الفحص الجماعي — يمكنك رفع صور CT أو أشعة سينية متعددة مرة واحدة وتلقي نتائج فردية لكل صورة في جلسة واحدة.")
        },
        {
            q: t("Is this service free?", "هل الخدمة مجانية؟"),
            a: t("Morgan's Hope is currently a free academic project developed as a graduation project at the Higher Institute of Computer Science & Information Systems, 2025/2026.", "مورجان هوب حالياً مشروع أكاديمي مجاني تم تطويره كمشروع تخرج في المعهد العالي لعلوم الحاسب ونظم المعلومات، 2025/2026.")
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
                            gridTemplateColumns: isMobile ? '1fr' : '0.85fr 1.35fr',
                            gap: isMobile ? 32 : 48,
                            alignItems: 'start',
                        }}
                    >
                        <MotionFade direction="up" delay={0.05}>
                            <aside style={{ paddingTop: 8, textAlign: ar ? 'right' : 'left' }}>
                                <div
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: 8,
                                        padding: '8px 14px',
                                        borderRadius: 999,
                                        background: 'color-mix(in srgb, var(--primary) 10%, var(--card-bg))',
                                        color: 'var(--primary-dark)',
                                        fontSize: 12,
                                        fontWeight: 800,
                                        letterSpacing: 0.5,
                                        textTransform: 'uppercase',
                                        marginBottom: 16,
                                    }}
                                >
                                    Morgan's Hope
                                </div>
                                <h1
                                    style={{
                                        maxWidth: 520,
                                        fontSize: isMobile ? 32 : 48,
                                        fontWeight: 800,
                                        lineHeight: 1.05,
                                        letterSpacing: '-0.04em',
                                        color: 'var(--primary-dark)',
                                        margin: 0,
                                    }}
                                >
                                    {t('Frequently asked questions', 'الأسئلة الشائعة')}
                                </h1>
                                <p
                                    style={{
                                        marginTop: 16,
                                        maxWidth: 450,
                                        fontSize: 16,
                                        lineHeight: 1.85,
                                        color: 'var(--text-muted)',
                                    }}
                                >
                                    {t("Everything you need to know about Morgan's Hope, AI scan analysis, privacy, accuracy, and reports.", 'كل ما تحتاج معرفته عن مورجان هوب، تحليل الأشعة بالذكاء الاصطناعي، الخصوصية، الدقة، والتقارير.')}
                                </p>
                            </aside>
                        </MotionFade>

                        <section>
                            <div
                                style={{
                                    height: 1,
                                    width: '100%',
                                    background: 'linear-gradient(to right, color-mix(in srgb, var(--primary) 20%, transparent), color-mix(in srgb, var(--primary) 50%, transparent), color-mix(in srgb, var(--primary) 10%, transparent))',
                                }}
                            />

                            <Accordion type="single" collapsible className="w-full">
                                {FAQS.map((faq, i) => (
                                    <AccordionItem
                                        key={i}
                                        value={`item-${i}`}
                                        className="border-b"
                                        style={{ borderColor: 'var(--card-border)' }}
                                    >
                                        <AccordionTrigger
                                            className="group [&>svg]:hidden"
                                            style={{
                                                width: '100%',
                                                padding: isMobile ? '20px 0' : '24px 0',
                                                textAlign: ar ? 'right' : 'left',
                                                color: 'var(--text-main)',
                                            }}
                                        >
                                            <span
                                                style={{
                                                    fontSize: '1.02rem',
                                                    fontWeight: 500,
                                                    lineHeight: 1.75,
                                                    letterSpacing: '-0.01em',
                                                }}
                                            >
                                                {faq.q}
                                            </span>
                                            <div className="relative shrink-0 mt-1" style={{ marginInlineStart: 24 }}>
                                                <Plus
                                                    strokeWidth={2}
                                                    className="h-5 w-5 transition-all duration-500 group-data-[state=open]:opacity-0 group-data-[state=open]:rotate-180"
                                                    style={{ color: 'var(--primary)' }}
                                                />
                                                <X
                                                    strokeWidth={2}
                                                    className="absolute inset-0 h-5 w-5 transition-all duration-500 opacity-0 group-data-[state=open]:opacity-100 group-data-[state=open]:rotate-180"
                                                    style={{ color: 'var(--primary)' }}
                                                />
                                            </div>
                                        </AccordionTrigger>
                                        <AccordionContent>
                                            <div
                                                style={{
                                                    paddingBottom: 24,
                                                    maxWidth: 760,
                                                    fontSize: '0.95rem',
                                                    lineHeight: 2,
                                                    color: 'var(--text-muted)',
                                                }}
                                            >
                                                {faq.a}
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>

                            <MotionFade direction="up" delay={0.35}>
                                <div
                                    style={{
                                        marginTop: 40,
                                        display: 'flex',
                                        flexDirection: isMobile ? 'column' : 'row',
                                        gap: 16,
                                        // borderTop: '1px solid color-mix(in srgb, var(--primary) 25%, transparent)',
                                        paddingTop: 24,
                                        alignItems: isMobile ? 'flex-start' : 'center',
                                        justifyContent: 'space-between',
                                    }}
                                >
                                    <div>
                                        <p
                                            style={{
                                                fontSize: 18,
                                                fontWeight: 600,
                                                color: 'var(--primary-dark)',
                                                margin: 0,
                                            }}
                                        >
                                            {t("Still have questions?", "لا تزال لديك أسئلة؟")}
                                        </p>
                                        <p
                                            style={{
                                                marginTop: 4,
                                                fontSize: 14,
                                                lineHeight: 1.5,
                                                color: 'var(--text-muted)',
                                            }}
                                        >
                                            {t("Our team is happy to help.", "فريقنا سعيد بمساعدتك.")}
                                        </p>
                                    </div>
                                    <MotionHoverScale>
                                        <a
                                            href="/contact"
                                            style={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                borderRadius: 999,
                                                background: 'linear-gradient(135deg, var(--primary-dark), var(--primary))',
                                                padding: isMobile ? '12px 24px' : '14px 32px',
                                                fontSize: 14,
                                                fontWeight: 700,
                                                color: 'white',
                                                textDecoration: 'none',
                                                transition: 'all 0.2s',
                                                boxShadow: '0 10px 24px rgba(var(--primary-rgb), 0.22)',
                                            }}
                                        >
                                            {t('Contact Us', 'تواصل معنا')}
                                        </a>
                                    </MotionHoverScale>
                                </div>
                            </MotionFade>
                        </section>
                    </div>
                </div>
            </div>
        </MotionPageTransition>
    );
}
