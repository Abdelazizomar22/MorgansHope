import { useState, useEffect } from 'react';

interface AboutPageProps { lang: 'en' | 'ar'; }

// SVG Icon map for cards
const CARD_ICONS: Record<string, JSX.Element> = {
  target: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></svg>,
  shield: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>,
};

// Bronchial Tree SVG Watermark
const Watermark = () => (
  <svg width="400" height="400" viewBox="0 0 64 64" fill="none" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', opacity: 0.03, pointerEvents: 'none', zIndex: 0 }}>
    <path d="M32 14 C32 14 28 17 26 22 C24 27 24 31 22 35 C20 39 16 41 16 47 C16 53 20 56 25 55 C28 54 30.5 51 32 48" stroke="var(--primary)" strokeWidth="2.2" fill="none" strokeLinecap="round" />
    <path d="M32 14 C32 14 36 17 38 22 C40 27 40 31 42 35 C44 39 48 41 48 47 C48 53 44 56 39 55 C36 54 33.5 51 32 48" stroke="var(--primary)" strokeWidth="2.2" fill="none" strokeLinecap="round" />
    <line x1="32" y1="12" x2="32" y2="48" stroke="var(--primary)" strokeWidth="1.5" strokeDasharray="2,3" />
    <line x1="15" y1="33" x2="49" y2="33" stroke="var(--primary)" strokeWidth="1.5" opacity="0.3" />
    <circle cx="15" cy="33" r="2" fill="var(--primary)" opacity="0.4" />
    <circle cx="49" cy="33" r="2" fill="var(--primary)" opacity="0.4" />
  </svg>
);

import { MotionPageTransition } from '../components/animations/MotionPageTransition';
import { MotionFade } from '../components/animations/MotionFade';
import { MotionHoverScale } from '../components/animations/MotionHoverScale';

export function AboutPage({ lang }: AboutPageProps) {
  const ar = lang === 'ar';
  const t = (en: string, arText: string) => ar ? arText : en;

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <MotionPageTransition>
      <div dir={ar ? 'rtl' : 'ltr'} style={{ minHeight: '100vh', backgroundImage: `url(/images/about/about-full.jpeg)`, backgroundPosition: "center", backgroundSize: "cover", color: 'var(--text-main)', fontFamily: ar ? "'Cairo', sans-serif" : "'Sora', sans-serif", position: 'relative', overflow: 'hidden' }}>

        {/* Watermark Logo */}
        <Watermark />

        {/* Hero */}
        {/*background: 'linear-gradient(160deg, var(--primary-dark) 0%, var(--primary) 60%, var(--primary-light) 100%)'*/}
        <section className='border-b-4 border-(--primary) section-bg-image page-header-padding' style={{ backgroundPosition: 'center', color: 'white', padding: isMobile ? '40px 20px' : '70px 40px', textAlign: 'center', position: 'relative', zIndex: 1, overflow: 'hidden' }}>
          <MotionFade direction="up" delay={0.1}>
            <h1 style={{ fontSize: isMobile ? 32 : 38, fontWeight: 900, margin: '0 0 14px', position: 'relative', zIndex: 2 }}>Morgan's <span style={{ opacity: 0.9 }}>Hope</span></h1>
            <p style={{ fontSize: isMobile ? 15 : 17, fontStyle: 'italic', opacity: 0.95, margin: '0 0 16px', position: 'relative', zIndex: 2 }}>
              {t('"Legacy of Care, Vision of Hope."', '"إرث من الرعاية، ورؤية من الأمل."')}
            </p>
          </MotionFade>
        </section>

        {/* Main Content */}
        <section style={{ padding: isMobile ? '40px 20px' : '70px 40px', maxWidth: 960, margin: '0 auto', position: 'relative', zIndex: 1 }}>

          {/* The Story Behind the Name */}
          <MotionFade direction="up" delay={0.2}>
            <MotionHoverScale scaleAmount={1.02}>
              <div style={{ background: 'var(--card-bg)', borderRadius: 24, padding: isMobile ? '24px' : '40px', marginBottom: 32, border: '1px solid var(--card-border)', boxShadow: '0 4px 20px var(--shadow-main)', textAlign: 'center' }}>
                <div style={{ marginBottom: 16, display: 'inline-flex', padding: 12, background: 'var(--primary)', borderRadius: 14, boxShadow: '0 2px 10px var(--shadow-main)' }}>
                  {CARD_ICONS.shield}
                </div>
                <h2 style={{ fontSize: isMobile ? 24 : 28, fontWeight: 900, color: 'var(--text-main)', marginBottom: 16 }}>
                  {t('The Story Behind "Morgan\'s Hope"', 'القصة وراء "مورجان هوب"')}
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: isMobile ? 14 : 16, lineHeight: 1.78, maxWidth: 740, margin: '0 auto' }}>
                  {t("Morgan's Hope was inspired by Arthur Morgan and his tragic fight with tuberculosis. His story reflects how silent and dangerous lung disease can be. We built this platform on one belief: early detection gives patients a real second chance.", "استلهمنا Morgan's Hope من قصة آرثر مورجان وصراعه المأساوي مع السل. قصته تذكرنا بمدى صمت وخطورة أمراض الرئة. بنينا هذه المنصة على إيمان واحد: الكشف المبكر يمنح المريض فرصة ثانية حقيقية.")}
                </p>
              </div>
            </MotionHoverScale>
          </MotionFade>

          {/* Who we are */}
          <MotionFade direction="up" delay={0.3}>
            <MotionHoverScale scaleAmount={1.02}>
              <div style={{ background: 'var(--card-bg)', borderRadius: 24, padding: isMobile ? '24px' : '40px', marginBottom: 32, border: '1px solid var(--card-border)', boxShadow: '0 4px 20px var(--shadow-main)', textAlign: 'center' }}>
                <div style={{ marginBottom: 16, display: 'inline-flex', padding: 12, background: 'var(--primary)', borderRadius: 14, boxShadow: '0 2px 10px var(--shadow-main)' }}>
                  {CARD_ICONS.target}
                </div>
                <h2 style={{ fontSize: isMobile ? 24 : 28, fontWeight: 900, color: 'var(--text-main)', marginBottom: 16 }}>
                  {t('Who we are?', 'من نحن؟')}
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: isMobile ? 14 : 16, lineHeight: 1.78, maxWidth: 700, margin: '0 auto' }}>
                  {t("Morgan's Hope simplifies the diagnostic journey through AI-powered imaging analysis. It offers faster, clearer early-screening support, with a smart medical chatbot and batch scanning for multiple images at once.", "Morgan's Hope يبسّط رحلة التشخيص عبر تحليل الصور الطبية بالذكاء الاصطناعي. ويوفر دعمًا أسرع وأوضح للكشف المبكر، مع مساعد طبي ذكي ونظام فحص دفعات لمعالجة عدة صور في وقت واحد.")}
                </p>
              </div>
            </MotionHoverScale>
          </MotionFade>

          {/* Our Vision */}
          <MotionFade direction="up" delay={0.4}>
            <MotionHoverScale scaleAmount={1.02}>
              <div style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)', borderRadius: 24, padding: isMobile ? '24px' : '40px', marginBottom: 50, color: 'white', textAlign: 'center', boxShadow: '0 10px 30px var(--shadow-main)' }}>
                <div style={{ marginBottom: 16, display: 'inline-flex', padding: 12, background: 'rgba(255,255,255,0.2)', borderRadius: 14 }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></svg>
                </div>
                <h2 style={{ fontSize: isMobile ? 24 : 28, fontWeight: 900, color: 'white', marginBottom: 16 }}>
                  {t('Our Vision', 'رؤيتنا')}
                </h2>
                <p style={{ fontSize: isMobile ? 16 : 20, fontWeight: 700, margin: 0, letterSpacing: 0.5, textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                  {t('"Making early detection of lung cancer accessible to everyone."', '"جعل التشخيص المبكر لسرطان الرئة متاحاً للجميع."')}
                </p>
              </div>
            </MotionHoverScale>
          </MotionFade>

        </section>

        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=Cairo:wght@400;600;700;800;900&display=swap');
        `}</style>
      </div>
    </MotionPageTransition>
  );
}
