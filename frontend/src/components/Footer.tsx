import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

interface FooterProps {
    lang: 'en' | 'ar';
}

// ── Icons ─────────────────────────────────────────────────────────────────────
const IconFacebook = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg>;
const IconInstagram = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" /></svg>;
const IconLinkedin = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect x="2" y="9" width="4" height="12" /><circle cx="4" cy="4" r="2" /></svg>;
const IconX = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" /></svg>;

const SOCIAL = [
    { Icon: IconFacebook, href: '#', label: 'Facebook' },
    { Icon: IconInstagram, href: '#', label: 'Instagram' },
    { Icon: IconLinkedin, href: '#', label: 'LinkedIn' },
    { Icon: IconX, href: '#', label: 'X (Twitter)' },
];

// ── Pages list ────────────────────────────────────────────────────────────────
const PAGES = (t: (en: string, ar: string) => string) => [
    { name: t('Home', 'الرئيسية'), path: '/' },
    { name: t('About', 'عن المبادرة'), path: '/about' },
    { name: t('Upload Scan', 'رفع الأشعة'), path: '/upload' },
    { name: t('Hospitals', 'المستشفيات'), path: '/hospitals' },
    { name: t('Contact', 'تواصل معنا'), path: '/contact' },
    { name: t('Chatbot', 'المساعد الذكي'), path: '/chat' },
    { name: t('FAQs', 'الأسئلة الشائعة'), path: '/faqs' },
    { name: t('Privacy Policy', 'سياسة الخصوصية'), path: '/privacy' },
];

// ── Component ─────────────────────────────────────────────────────────────────
export default function Footer({ lang }: FooterProps) {
    const ar = lang === 'ar';
    const t = (en: string, arText: string) => ar ? arText : en;

    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <footer dir={ar ? 'rtl' : 'ltr'} style={{
            background: 'var(--primary)',
            padding: isMobile ? '40px 20px 24px' : '60px 40px 50px',
            color: 'white',
            fontFamily: ar ? "'Cairo', sans-serif" : "'Sora', sans-serif",
        }}>
            <div style={{ maxWidth: 1200, margin: '0 auto' }}>

                {/* ── TOP GRID ───────────────────────────────────────────── */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: isMobile ? '1fr' : 'minmax(280px, 1.5fr) 1fr 1fr',
                    gap: isMobile ? 40 : 60,
                    marginBottom: 60,
                    alignItems: 'start',
                }}>

                    {/* LEFT — Brand + Tagline + Social */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

                        {/* Logo + Name — mirrors Navbar exactly */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
                            <img
                                src="/logo.png"
                                alt="Morgan's Hope Logo"
                                className="theme-logo"
                                style={{ height: 60, width: 60, objectFit: 'contain', filter: 'brightness(0) invert(1)', transform: 'scale(1.4) translateY(-4px)', marginRight: -10 }}
                            />
                            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                <span style={{ fontSize: 22, fontWeight: 900, color: 'white', letterSpacing: -0.6, lineHeight: 1 }}>Morgan's</span>
                                <span style={{ fontSize: 20, fontWeight: 400, fontStyle: 'italic', letterSpacing: 0, color: 'white', opacity: 0.85, marginLeft: 2, lineHeight: 1 }}>Hope</span>
                            </div>
                        </div>

                        {/* Tagline aligned to match 'Morgan's Hope' text */}
                        <div>
                            <p style={{
                                fontSize: 16,
                                fontStyle: 'italic',
                                fontWeight: 400,
                                color: 'rgba(255,255,255,0.85)',
                                margin: 0,
                                lineHeight: 1.5,
                                letterSpacing: 0.2,
                            }}>
                                {t(
                                    '"A Second Chance for Every Breath"',
                                    '"فرصة ثانية لكل نَفَس"'
                                )}
                            </p>
                        </div>

                        {/* Social Icons aligned to match 'Morgan's Hope' text */}
                        <div style={{ display: 'flex', gap: 16 }}>
                            {SOCIAL.map(({ Icon, href, label }) => (
                                <a
                                    key={label}
                                    href={href}
                                    aria-label={label}
                                    style={{
                                        color: 'white',
                                        opacity: 0.8,
                                        transition: 'opacity 0.2s, transform 0.2s',
                                        display: 'flex',
                                    }}
                                    onMouseEnter={e => {
                                        e.currentTarget.style.opacity = '1';
                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                    }}
                                    onMouseLeave={e => {
                                        e.currentTarget.style.opacity = '0.8';
                                        e.currentTarget.style.transform = 'translateY(0)';
                                    }}
                                >
                                    <Icon />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* MIDDLE — Pages */}
                    <div>
                        <h4 style={{
                            fontSize: 16, fontWeight: 800, color: 'white',
                            marginBottom: 20,
                            borderBottom: '1px solid rgba(255,255,255,0.15)',
                            paddingBottom: 10,
                        }}>
                            {t('Pages', 'الصفحات')}
                        </h4>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px 24px' }}>
                            {PAGES(t).map((link, i) => (
                                <Link key={i} to={link.path} style={{
                                    textDecoration: 'none',
                                    color: 'white',
                                    fontSize: 13.5,
                                    fontWeight: 500,
                                    opacity: 0.8,
                                    transition: 'opacity 0.15s',
                                }}
                                    onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                                    onMouseLeave={e => e.currentTarget.style.opacity = '0.8'}
                                >
                                    {link.name}
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* RIGHT — Contact */}
                    <div>
                        <h4 style={{
                            fontSize: 16, fontWeight: 800, color: 'white',
                            marginBottom: 20,
                            borderBottom: '1px solid rgba(255,255,255,0.15)',
                            paddingBottom: 10,
                        }}>
                            {t('Contact information', 'معلومات التواصل')}
                        </h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            {[
                                { label: t('Phone', 'الهاتف'), value: '+20 123 456 7890' },
                                { label: t('Email', 'البريد'), value: 'info@morganshope.com' },
                                { label: t('Address', 'العنوان'), value: t('Cairo, Giza, Egypt', 'القاهرة، الجيزة، مصر') },
                            ].map(({ label, value }) => (
                                <div key={label} style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                    <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.55)', letterSpacing: 0.5, textTransform: 'uppercase' as const }}>
                                        {label}
                                    </span>
                                    <span style={{ fontSize: 14, fontWeight: 600, color: 'white' }}>
                                        {value}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ── DIVIDER ────────────────────────────────────────────── */}
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.12)', marginBottom: 24 }} />

                <div className='flex items-center justfiy-between gap-8'>
                    {/* ── DISCLAIMER ─────────────────────────────────────────── */}
                    <p style={{
                        fontSize: 11.5, color: 'rgba(255,255,255,0.7)',
                        lineHeight: 1.7,
                        maxWidth: 880,
                    }}>
                        <strong style={{ fontWeight: 700 }}>
                            {t('Medical Disclaimer: ', 'إخلاء المسؤولية الطبي: ')}
                        </strong>
                        {t(
                            "Morgan's Hope is an experimental AI diagnostic assistance tool. Results are not a final medical diagnosis. The analysis is intended for informational and research purposes only and should NOT be used as a substitute for professional medical advice. Always consult a qualified physician or oncologist.",
                            "مورجان هوب أداة مساعدة تشخيصية تجريبية بالذكاء الاصطناعي. النتائج ليست تشخيصاً طبياً نهائياً. التحليل مخصص للأغراض المعلوماتية والبحثية فقط ولا يجب استخدامه بديلاً عن المشورة الطبية المتخصصة. استشر دائماً طبيباً أو أخصائي أورام."
                        )}
                    </p>

                    {/* ── COPYRIGHT ──────────────────────────────────────────── */}
                    <div>
                        <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', fontWeight: 400 }}>
                            © 2026 Morgan's Hope. {t('All rights reserved.', 'جميع الحقوق محفوظة.')}
                        </span>
                    </div>
                </div>

            </div>
        </footer>
    );
}
