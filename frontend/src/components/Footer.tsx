import { Link } from 'react-router-dom';

interface FooterProps {
    lang: 'en' | 'ar';
}

const IconFacebook = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg>;
const IconInstagram = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" /></svg>;
const IconLinkedin = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect x="2" y="9" width="4" height="12" /><circle cx="4" cy="4" r="2" /></svg>;
const IconX = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" /></svg>;
const IconMedicalHeart = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></svg>;

export default function Footer({ lang }: FooterProps) {
    const ar = lang === 'ar';
    const t = (en: string, arText: string) => (ar ? arText : en);

    return (
        <footer dir={ar ? 'rtl' : 'ltr'} style={{
            background: 'var(--primary)',
            padding: '60px 40px 40px',
            color: 'white',
            fontFamily: ar ? "'Cairo', sans-serif" : "'Sora', sans-serif"
        }}>
            <div style={{ maxWidth: 1200, margin: '0 auto' }}>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'minmax(300px, 1fr) 2fr',
                    gap: 60,
                    marginBottom: 60,
                    alignItems: 'start'
                }}>
                    {/* Newsletter & Brand Column */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 30 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <img src="/logo.png" alt="Logo" style={{ height: 45, width: 'auto', filter: 'brightness(0) invert(1)' }} />
                            <span style={{ fontSize: 24, fontWeight: 900, color: 'white' }}>
                                {t("Morgan's Hope", "مورجان هوب")}
                            </span>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
                            <h3 style={{ fontSize: 18, fontWeight: 700, color: 'white', opacity: 0.95 }}>
                                {t("Stay updated with our newsletter", "ابق على اطلاع بنشرتنا الإخبارية")}
                            </h3>

                            <div style={{
                                display: 'flex',
                                background: 'rgba(255, 255, 255, 0.1)',
                                borderRadius: 30,
                                padding: '6px',
                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                backdropFilter: 'blur(10px)'
                            }}>
                                <input
                                    type="email"
                                    placeholder={t("Enter your email address", "أدخل بريدك الإلكتروني")}
                                    style={{
                                        flex: 1,
                                        border: 'none',
                                        padding: '0 20px',
                                        outline: 'none',
                                        fontSize: 14,
                                        borderRadius: 30,
                                        background: 'transparent',
                                        color: 'white',
                                        fontFamily: 'inherit'
                                    }}
                                />
                                <button style={{
                                    background: 'white',
                                    color: 'var(--primary-dark)',
                                    border: 'none',
                                    padding: '12px 24px',
                                    borderRadius: 24,
                                    fontWeight: 800,
                                    fontSize: 14,
                                    cursor: 'pointer',
                                    transition: 'transform 0.2s'
                                }} onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'} onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
                                    {t("Subscribe", "اشترك")}
                                </button>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: 20 }}>
                            {[IconFacebook, IconInstagram, IconLinkedin, IconX].map((Icon, i) => (
                                <a key={i} href="#" style={{ color: 'white', opacity: 0.8, transition: 'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.opacity = '1'} onMouseLeave={e => e.currentTarget.style.opacity = '0.8'}>
                                    <Icon />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Links & Info Columns */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1.2fr 1fr',
                        gap: 40
                    }}>
                        <div>
                            <h4 style={{ fontSize: 18, fontWeight: 800, color: 'white', marginBottom: 24, borderBottom: '2px solid rgba(255,255,255,0.1)', paddingBottom: 10 }}>
                                {t("Pages", "الصفحات")}
                            </h4>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 24px' }}>
                                {[
                                    { name: t("Home", "الرئيسية"), path: "/" },
                                    { name: t("About", "عن المبادرة"), path: "/about" },
                                    { name: t("Upload Scan", "رفع الأشعة"), path: "/upload" },
                                    { name: t("Hospitals", "المستشفيات"), path: "/hospitals" },
                                    { name: t("Contact", "تواصل معنا"), path: "/contact" },
                                    { name: t("FAQs", "الأسئلة الشائعة"), path: "#" },
                                    { name: t("Chatbot", "المساعد الذكي"), path: "/chat" },
                                    { name: t("Privacy Policy", "سياسة الخصوصية"), path: "#" },
                                ].map((link, i) => (
                                    <Link key={i} to={link.path} style={{
                                        textDecoration: 'none',
                                        color: 'white',
                                        fontSize: 14,
                                        fontWeight: 600,
                                        opacity: 0.85,
                                        transition: 'opacity 0.2s'
                                    }} onMouseEnter={e => e.currentTarget.style.opacity = '1'} onMouseLeave={e => e.currentTarget.style.opacity = '0.85'}>
                                        {link.name}
                                    </Link>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h4 style={{ fontSize: 18, fontWeight: 800, color: 'white', marginBottom: 24, borderBottom: '2px solid rgba(255,255,255,0.1)', paddingBottom: 10 }}>
                                {t("Contact information", "معلومات التواصل")}
                            </h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                                    <div style={{ fontSize: 12, fontWeight: 800, color: 'white', opacity: 0.7 }}>
                                        {t("Address", "العنوان")}
                                    </div>
                                    <div style={{ fontSize: 14, fontWeight: 600, color: 'white' }}>
                                        {t("Cairo, Giza, Egypt", "القاهرة، الجيزة، مصر")}
                                    </div>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                                    <div style={{ fontSize: 12, fontWeight: 800, color: 'white', opacity: 0.7 }}>
                                        {t("Phone", "الهاتف")}
                                    </div>
                                    <div style={{ fontSize: 14, fontWeight: 600, color: 'white' }}>
                                        +20 123 456 7890
                                    </div>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                                    <div style={{ fontSize: 12, fontWeight: 800, color: 'white', opacity: 0.7 }}>
                                        {t("Email", "البريد الإلكتروني")}
                                    </div>
                                    <div style={{ fontSize: 14, fontWeight: 600, color: 'white' }}>
                                        info@morganshope.com
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar / Disclaimer */}
                <div style={{
                    paddingTop: 40,
                    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 25
                }}>
                    <div style={{ textAlign: 'center' }}>
                        <p style={{
                            fontSize: 11,
                            color: 'white',
                            opacity: 0.8,
                            margin: 0,
                            lineHeight: 1.8,
                            maxWidth: 1000,
                        }}>
                            <strong style={{ opacity: 1 }}>{t('Medical Disclaimer:', 'إخلاء المسؤولية الطبي:')}</strong>{' '}
                            {t("Morgan's Hope is an experimental AI diagnostic assistance tool. Results are not a final medical diagnosis. The analysis provided by this platform is intended for informational and research purposes only and should NOT be used as a substitute for professional medical advice, diagnosis, or treatment. Always consult with a qualified physician or oncologist regarding any medical condition or treatment. Never disregard professional medical advice or delay seeking it because of something you have read or seen on this website.", 'مورجان هوب أداة مساعدة تشخيصية تجريبية للذكاء الاصطناعي. النتائج ليست تشخيصًا طبيًا نهائيًا. التحليل المقدم من هذه المنصة مخصص لأغراض المعلومات والبحث فقط ولا ينبغي استخدامه كبديل للاستشارة الطبية المهنية أو التشخيص أو العلاج. استشر دائمًا طبيبًا مؤهلاً أو أخصائي أورام فيما يتعلق بأي حالة طبية أو علاج. لا تتجاهل أبدًا النصيحة الطبية المهنية أو تطلبها بسبب شيء قرأته أو رأيته على هذا الموقع.')}
                        </p>
                    </div>

                    <div style={{
                        width: '100%',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: 12,
                        color: 'white',
                        opacity: 0.7,
                        fontWeight: 600
                    }}>
                        <div>© {new Date().getFullYear()} Morgan's Hope. {t("All rights reserved.", "جميع الحقوق محفوظة.")}</div>
                        <div style={{ fontStyle: 'italic' }}>{t("Designed with care for every breath", "صُمم بعناية من أجل كل نَفَس")}</div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
