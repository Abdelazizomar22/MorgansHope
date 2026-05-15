import { useState } from 'react';
import { MotionFade } from '../components/animations/MotionFade';
import { MotionPageTransition } from '../components/animations/MotionPageTransition';

interface FAQsPageProps { lang: 'en' | 'ar'; }

const ArrowIcon = ({ open }: { open: boolean }) => (
    <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{
            transition: 'transform 0.25s',
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)'
        }}
    >
        <path d="m6 9 6 6 6-6" />
    </svg>
);

export function FAQsPage({ lang }: FAQsPageProps) {
    const ar = lang === 'ar';
    const t = (en: string, arText: string) => ar ? arText : en;
    const [open, setOpen] = useState<number | null>(0);

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
                className={`bg-[#efefef] text-slate-950 ${ar ? "font-['Cairo',sans-serif]" : "font-['Sora',sans-serif]"}`}
            >
                <main className="mx-auto max-w-[1280px] px-5 py-14 sm:px-8 lg:py-20">
                    <div className="grid gap-12 lg:grid-cols-[0.85fr_1.35fr] lg:gap-24">
                        <MotionFade direction="up" delay={0.05}>
                            <aside className={`pt-2 ${ar ? 'lg:text-right' : 'lg:text-left'}`}>
                                <p className="mb-5 inline-flex rounded-full border border-[#1B4D3E]/20 bg-white/90 px-3 py-1 text-xs font-bold uppercase tracking-[0.22em] text-[#1B4D3E]">
                                    Morgan's Hope
                                </p>
                                <h1 className="max-w-[520px] text-4xl font-semibold leading-[1.05] tracking-[-0.04em] text-slate-950 sm:text-5xl lg:text-[56px]">
                                    {t('Frequently asked questions', 'الأسئلة الشائعة')}
                                </h1>
                                <p className="mt-6 max-w-[450px] text-base leading-8 text-slate-600">
                                    {t("Everything you need to know about Morgan's Hope, AI scan analysis, privacy, accuracy, and reports.", 'كل ما تحتاج معرفته عن مورجان هوب، تحليل الأشعة بالذكاء الاصطناعي، الخصوصية، الدقة، والتقارير.')}
                                </p>
                            </aside>
                        </MotionFade>

                        <section>
                            <div className="h-px w-full bg-gradient-to-r from-[#c3c9c6] via-[#1B4D3E]/65 to-[#1B4D3E]/10" />
                            <div className="border-b border-slate-900/35 bg-white/25">
                                {FAQS.map((faq, i) => {
                                    const isOpen = open === i;

                                    return (
                                        <MotionFade key={i} direction="up" delay={i * 0.04}>
                                            <article className="border-t border-slate-900/35">
                                                <button
                                                    type="button"
                                                    onClick={() => setOpen(isOpen ? null : i)}
                                                    className="flex w-full items-start justify-between gap-6 py-5 text-left md:py-6"
                                                    style={{ textAlign: ar ? 'right' : 'left' }}
                                                >
                                                    <span className="text-[1.02rem] font-medium leading-7 tracking-[-0.01em] text-slate-950 sm:text-[1.06rem]">
                                                        {faq.q}
                                                    </span>
                                                    <span className={`mt-1 shrink-0 text-slate-950 transition-colors ${isOpen ? 'text-[#1B4D3E]' : ''}`}>
                                                        <ArrowIcon open={isOpen} />
                                                    </span>
                                                </button>

                                                {isOpen && (
                                                    <div className="pb-8 pt-1 md:pb-9">
                                                        <p className="max-w-[760px] text-[0.95rem] leading-8 text-slate-700">
                                                            {faq.a}
                                                        </p>
                                                    </div>
                                                )}
                                            </article>
                                        </MotionFade>
                                    );
                                })}
                            </div>

                            <MotionFade direction="up" delay={0.35}>
                                <div className="mt-10 flex flex-col gap-4 border-t border-[#1B4D3E]/25 pt-6 sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                        <p className="text-lg font-semibold text-slate-950">
                                            {t("Still have questions?", "لا تزال لديك أسئلة؟")}
                                        </p>
                                        <p className="mt-1 text-sm leading-6 text-slate-600">
                                            {t("Our team is happy to help.", "فريقنا سعيد بمساعدتك.")}
                                        </p>
                                    </div>
                                    <a
                                        href="/contact"
                                        className="inline-flex w-fit items-center justify-center rounded-full bg-[#1B4D3E] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#12372d]"
                                    >
                                        {t('Contact Us', 'تواصل معنا')}
                                    </a>
                                </div>
                            </MotionFade>
                        </section>
                    </div>
                </main>
            </div>
        </MotionPageTransition>
    );
}
