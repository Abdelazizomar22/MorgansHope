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
import { Plus, X } from 'lucide-react';

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

    const FAQ_CATEGORIES = [
        {
            category: t('Medical Use', 'الاستخدام الطبي'),
            items: [
                {
                    q: t("Is Morgan's Hope a substitute for a doctor?", "هل Morgan's Hope بديل عن الطبيب؟"),
                    a: t("No. Morgan's Hope provides AI-assisted screening support only. It does not provide a final diagnosis, prescribe treatment, or replace a licensed physician, radiologist, pulmonologist, or oncologist. All results should be reviewed by a qualified medical professional before any clinical decision is made.", "لا. يقدّم Morgan's Hope دعم فحص بمساعدة الذكاء الاصطناعي فقط. لا يقدّم تشخيصاً نهائياً، ولا يصف علاجاً، ولا يحل محل طبيب مرخص أو أخصائي أشعة أو رئة أو أورام. يجب مراجعة جميع النتائج من قبل أخصائي طبي مؤهل قبل اتخاذ أي قرار سريري.")
                },
                {
                    q: t("How should I understand my AI result?", "كيف أفهم نتيجة الذكاء الاصطناعي الخاصة بي؟"),
                    a: t("The result should be understood as a preliminary screening output. It may include a predicted finding, confidence score, urgency level, and suggested next step. These outputs are intended to help users communicate more clearly with a doctor, not to make a medical decision independently.", "يجب فهم النتيجة على أنها مخرجات فحص أولية. قد تتضمن نتيجة متوقعة، ونسبة ثقة، ومستوى خطورة، وخطوة تالية مقترحة. الهدف من هذه المخرجات مساعدتك على التواصل بوضوح أكبر مع الطبيب، وليس اتخاذ قرار طبي بمفردك.")
                },
                {
                    q: t("When should I seek urgent medical care?", "متى يجب أن أطلب رعاية طبية عاجلة؟"),
                    a: t("If you experience severe shortness of breath, chest pain, coughing blood, fainting, confusion, or rapidly worsening symptoms, seek emergency medical care immediately. Do not wait for an AI result or rely on the platform during emergencies.", "إذا شعرت بضيق شديد في التنفس، أو ألم في الصدر، أو سعال مصحوب بدم، أو إغماء، أو ارتباك، أو تدهور سريع في الأعراض، فاطلب رعاية طبية طارئة فوراً. لا تنتظر نتيجة الذكاء الاصطناعي ولا تعتمد على المنصة في حالات الطوارئ.")
                },
            ],
        },
        {
            category: t('Scan Analysis', 'تحليل الأشعة'),
            items: [
                {
                    q: t("What scan types are supported?", "ما أنواع الأشعة المدعومة؟"),
                    a: t("Morgan's Hope currently supports Chest CT and Chest X-Ray images. The CT workflow focuses on lung cancer-related screening and classification. The Chest X-Ray workflow supports clinical-group screening for major respiratory and chest findings.", "يدعم Morgan's Hope حالياً صور الأشعة المقطعية للصدر (CT) والأشعة السينية للصدر (X-Ray). يركّز مسار CT على فحص وتصنيف الحالات المرتبطة بسرطان الرئة. أما مسار الأشعة السينية فيدعم الفحص بمجموعات سريرية لأهم نتائج الجهاز التنفسي والصدر.")
                },
                {
                    q: t("What does the CT analysis include?", "ماذا يشمل تحليل الأشعة المقطعية (CT)؟"),
                    a: t("The CT branch is designed for lung cancer-related screening. It supports CT categories such as Normal, Benign, Malignant General, Adenocarcinoma, Squamous Cell Carcinoma, and Large Cell Carcinoma. When suspicious CT findings are detected, the workflow can also support nodule localization when the detection stage is available.", "صُمم مسار CT لفحص الحالات المرتبطة بسرطان الرئة. ويدعم تصنيفات مثل: طبيعي، حميد، خبيث عام، سرطان غدي، سرطان حرشفي، وسرطان كبير الخلايا. وعند رصد نتائج مشتبه بها في CT، يمكن للمسار أيضاً دعم تحديد موقع العقيدات عند توفر مرحلة الكشف.")
                },
                {
                    q: t("What does the Chest X-Ray analysis include?", "ماذا يشمل تحليل الأشعة السينية للصدر؟"),
                    a: t("The Chest X-Ray branch is designed around broader clinical groups instead of a narrow binary output. These groups include Pulmonary Infection, COPD-related Findings, Fibrotic Lung Disease, Cardiac Conditions, Potential Malignancy Findings, and Pleural Diseases. TB screening may also be used when the dedicated TB signal is available.", "صُمم مسار الأشعة السينية للصدر حول مجموعات سريرية أوسع بدلاً من نتيجة ثنائية محدودة. وتشمل هذه المجموعات: عدوى/التهاب رئوي، ملاحظات مرتبطة بالانسداد الرئوي المزمن، أمراض التليف الرئوي، مؤشرات قلبية، مؤشرات اشتباه أورام، وأمراض الغشاء البلوري. ويمكن أيضاً استخدام فحص السل عند توفر إشارة السل المخصصة.")
                },
                {
                    q: t("How accurate is the AI model?", "ما مدى دقة نموذج الذكاء الاصطناعي؟"),
                    a: t("Model performance is measured during controlled evaluation using prepared medical imaging datasets. Real-world performance may vary depending on scan quality, image format, acquisition conditions, patient differences, and whether the uploaded image matches the supported input type. For this reason, the result should always be treated as screening support and confirmed by a specialist.", "يُقاس أداء النموذج أثناء تقييم مضبوط باستخدام مجموعات بيانات تصوير طبي مُعدّة مسبقاً. وقد يختلف الأداء في الواقع العملي حسب جودة الصورة، وصيغتها، وظروف التقاطها، والفروق بين المرضى، ومدى تطابق الصورة المرفوعة مع نوع الإدخال المدعوم. لذلك يجب التعامل دائماً مع النتيجة المعروضة كدعم للفحص الأولي يحتاج تأكيداً من أخصائي.")
                },
                {
                    q: t("Can I upload multiple scans at once?", "هل يمكنني رفع أكثر من صورة في نفس الوقت؟"),
                    a: t("When multiple uploads are enabled on the upload page, each scan is processed as an individual analysis inside the same session. Results should still be reviewed separately because each image may show a different finding or confidence level.", "عند تفعيل الرفع المتعدد في صفحة الرفع، تتم معالجة كل صورة كتحليل مستقل ضمن نفس الجلسة. ويجب مراجعة كل نتيجة على حدة لأن كل صورة قد تُظهر نتيجة أو نسبة ثقة مختلفة.")
                },
            ],
        },
        {
            category: t('Privacy & Reports', 'الخصوصية والتقارير'),
            items: [
                {
                    q: t("Is my data private and secure?", "هل بياناتي خاصة وآمنة؟"),
                    a: t("Morgan's Hope uses security measures such as HTTPS/TLS transmission, authenticated access, password hashing, and protected session handling. Your scans and personal information are not sold or shared for advertising. Medical data should still be handled carefully, and users should avoid uploading scans that are not needed for analysis.", "يستخدم Morgan's Hope إجراءات أمان مثل نقل البيانات عبر HTTPS/TLS، والوصول المُوثّق، وتشفير كلمات المرور، وإدارة محمية للجلسات. لا تُباع صورك ومعلوماتك الشخصية ولا تُشارك لأغراض إعلانية. ومع ذلك يجب التعامل مع البيانات الطبية بحذر، وتجنّب رفع صور لا حاجة لها في التحليل.")
                },
                {
                    q: t("Can I download my results?", "هل أستطيع تحميل نتائجي؟"),
                    a: t("Yes. After analysis, users can download a structured PDF report that summarizes the uploaded scan, AI-assisted result, confidence information, urgency level, and suggested next step. The report is intended to support follow-up conversations with a qualified medical professional.", "نعم. بعد التحليل يمكن للمستخدم تحميل تقرير PDF منظم يلخّص الصورة المرفوعة، والنتيجة بمساعدة الذكاء الاصطناعي، ومعلومات الثقة، ومستوى الخطورة، والخطوة التالية المقترحة. ويهدف التقرير لدعم المتابعة مع أخصائي طبي مؤهل.")
                },
                {
                    q: t("Is Morgan's Hope free?", "هل Morgan's Hope مجاني؟"),
                    a: t("Morgan's Hope is currently presented as a free Computer Science graduation project developed by Abdelaziz Omar, the website developer. Future deployment, hosting, or service changes may affect availability, but the current academic version is intended for educational and research use.", "يُقدَّم Morgan's Hope حالياً كمشروع تخرج مجاني في علوم الحاسب، طوّره عبدالعزيز عمر، مطوّر الموقع. وقد تؤثر تغييرات النشر أو الاستضافة أو الخدمة مستقبلاً على التوفر، إلا أن النسخة الأكاديمية الحالية مخصصة للاستخدام التعليمي والبحثي.")
                },
            ],
        },
    ];

    return (
        <MotionPageTransition>
            <div
                style={{
                    minHeight: '100vh',
                    background: 'radial-gradient(circle at 12% 18%, rgba(var(--primary-rgb),0.08), transparent 22%), radial-gradient(circle at 88% 14%, rgba(var(--primary-rgb),0.06), transparent 20%), linear-gradient(180deg, color-mix(in srgb, var(--primary) 4%, var(--bg-main)) 0%, var(--bg-main) 100%)',
                    color: 'var(--text-main)',
                    padding: isMobile ? '40px 18px' : '60px 40px',
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
                            <aside style={{ paddingTop: 8, textAlign: 'start' }}>
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
                                    {t('Frequently Asked Questions', 'الأسئلة الشائعة')}
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
                                    {t("Clear answers about Morgan's Hope, supported scans, AI-assisted screening, privacy, reports, and responsible medical use.", "إجابات واضحة حول Morgan's Hope، أنواع الأشعة المدعومة، الفحص بمساعدة الذكاء الاصطناعي، الخصوصية، التقارير، والاستخدام الطبي المسؤول.")}
                                </p>
                                <p
                                    style={{
                                        marginTop: 10,
                                        maxWidth: 480,
                                        fontSize: 13,
                                        lineHeight: 1.6,
                                        color: 'var(--text-muted)',
                                        fontStyle: 'italic',
                                    }}
                                >
                                    {t("Morgan's Hope is designed to support early awareness and follow-up. It does not replace professional medical evaluation.", "صُمم Morgan's Hope لدعم الوعي المبكر والمتابعة. ولا يحل محل التقييم الطبي المتخصص.")}
                                </p>
                            </aside>
                        </MotionFade>

                        <section>
                        {/*
                          <div
                              style={{
                                  height: 1,
                                  width: '100%',
                                  background: 'linear-gradient(to right, color-mix(in srgb, var(--primary) 20%, transparent), color-mix(in srgb, var(--primary) 50%, transparent), color-mix(in srgb, var(--primary) 10%, transparent))',
                              }}
                          />
                        */}
                            <Accordion
                                type="single"
                                collapsible
                                className="w-full"
                                defaultValue={isMobile ? undefined : 'cat-0-item-0'}
                            >
                                {FAQ_CATEGORIES.map((cat, ci) => (
                                    <div key={ci}>
                                        {/*<div
                                            style={{
                                                height: ci > 0 ? 1 : 0,
                                                width: '100%',
                                                marginTop: ci > 0 ? 28 : 0,
                                                background: ci > 0 ? 'linear-gradient(to right, color-mix(in srgb, var(--primary) 20%, transparent), color-mix(in srgb, var(--primary) 50%, transparent), color-mix(in srgb, var(--primary) 10%, transparent))' : undefined,
                                            }}
                                        />*/}
                                        <p
                                            style={{
                                                marginTop: 12,
                                                marginBottom: 8,
                                                paddingTop: ci ? 30 : 0,
                                                fontSize: 18,
                                                fontWeight: 800,
                                                letterSpacing: 1,
                                                textTransform: 'uppercase',
                                                color: 'var(--primary-dark)',
                                            }}
                                        >
                                            {cat.category}
                                        </p>
                                        {cat.items.map((faq, i) => (
                                            <AccordionItem
                                                key={`${ci}-${i}`}
                                                value={`cat-${ci}-item-${i}`}
                                                className="border-b"
                                                style={{ borderColor: 'var(--card-border)' }}
                                            >
                                                <AccordionTrigger
                                                    className="group [&>svg]:hidden"
                                                    style={{
                                                        width: '100%',
                                                        padding: isMobile ? '20px 0' : '24px 0',
                                                        textAlign: 'start',
                                                        color: 'var(--text-main)',
                                                    }}
                                                >
                                                    <span
                                                        style={{
                                                            fontSize: 14,
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
                                                            fontSize: 13,
                                                            lineHeight: 2,
                                                            color: 'var(--text-muted)',
                                                        }}
                                                    >
                                                        {faq.a}
                                                    </div>
                                                </AccordionContent>
                                            </AccordionItem>
                                        ))}
                                    </div>
                                ))}
                            </Accordion>

                            <MotionFade direction="up" delay={0.35}>
                                <div
                                    style={{
                                        marginTop: 40,
                                        display: 'flex',
                                        flexDirection: isMobile ? 'column' : 'row',
                                        gap: 16,
                                        paddingTop: 24,
                                        textAlign: isMobile ? 'center' : 'left',
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
                                            {t("Contact the Morgan's Hope team for support, privacy concerns, or questions about using the platform responsibly.", "تواصل مع فريق Morgan's Hope للدعم، أو الاستفسارات المتعلقة بالخصوصية، أو أي أسئلة حول الاستخدام المسؤول للمنصة.")}
                                        </p>
                                        <a
                                            href="mailto:morganshope40@gmail.com"
                                            style={{
                                                marginTop: 8,
                                                fontSize: 13,
                                                color: 'var(--primary)',
                                                textDecoration: 'underline',
                                                display: 'inline-block',
                                            }}
                                        >
                                            morganshope40@gmail.com
                                        </a>
                                    </div>
                                    <a
                                        href="/contact"
                                        className='auth-primary-button p-4 mx-auto lg:mx-0'
                                        style={{
                                            transition: 'all 0.2s',
                                            width: 'auto',
                                            whiteSpace: 'nowrap',
                                        }}
                                    >
                                        {t('Contact Us', 'تواصل معنا')}
                                    </a>
                                </div>
                            </MotionFade>
                        </section>
                    </div>
                </div>
            </div>
        </MotionPageTransition>
    );
}
