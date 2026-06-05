import { useState, useEffect } from 'react';

interface AboutPageProps { lang: 'en' | 'ar'; }

import { MotionPageTransition } from '../components/animations/MotionPageTransition';
import { MotionFade } from '../components/animations/MotionFade';

const mintBg = 'color-mix(in srgb, var(--primary) 12%, var(--bg-main))';

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
      <div dir={ar ? 'rtl' : 'ltr'} style={{ minHeight: '100vh', background: 'var(--bg-main)', color: 'var(--text-main)', fontFamily: ar ? "'Cairo', sans-serif" : "'Sora', sans-serif", position: 'relative', overflow: 'hidden' }}>

        {/* Hero */}
        <section className='section-bg-image page-header-padding'
					style={{ backgroundPosition: 'center', color: 'white', padding: isMobile ? '40px 20px' : '70px 40px', textAlign: 'center', position: 'relative', zIndex: 1, overflow: 'hidden', boxShadow: 'inset 0 -6px 0 var(--primary), inset 0 -7px 0 rgba(255,255,255,0.15)' }}>
          <MotionFade direction="up" delay={0.1}>
            <h1 style={{ fontSize: isMobile ? 32 : 38, fontWeight: 900, margin: '0 0 14px', position: 'relative', zIndex: 2 }}>Morgan's <span style={{ opacity: 0.9 }}>Hope</span></h1>
            <p style={{ fontSize: isMobile ? 15 : 17, fontStyle: 'italic', opacity: 0.95, margin: '0 0 16px', position: 'relative', zIndex: 2 }}>
              {t('"Legacy of Care, Vision of Hope."', '"إرث من الرعاية، ورؤية من الأمل."')}
            </p>
          </MotionFade>
        </section>

        {/* Section 1 — Who We Are */}
        <div style={{ background: `url(/images/about/About-us.jpeg) center/cover no-repeat`, width: '100%', position: 'relative' }}>
          <div style={{ background: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)', width: '100%', height: '100%', padding: isMobile ? '60px 24px' : '90px 20px' }}>
            <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
              <MotionFade direction="up" delay={0.3}>
                <h2 style={{ fontSize: isMobile ? 26 : 32, fontWeight: 900, color: 'var(--primary-dark)', margin: '0 0 20px' }}>
                  {t('Who we are?', 'من نحن؟')}
                </h2>
                <p style={{ color: 'var(--text-main)', fontSize: isMobile ? 15 : 16, lineHeight: 1.8, margin: 0 }}>
                  {t("Morgan's Hope simplifies the diagnostic journey through AI-powered imaging analysis. It offers faster, clearer early-screening support, with a smart medical chatbot and batch scanning for multiple images at once.", "Morgan's Hope يبسّط رحلة التشخيص عبر تحليل الصور الطبية بالذكاء الاصطناعي. ويوفر دعمًا أسرع وأوضح للكشف المبكر، مع مساعد طبي ذكي ونظام فحص دفعات لمعالجة عدة صور في وقت واحد.")}
                </p>
              </MotionFade>
            </div>
          </div>
        </div>
        
        {/* Section 2 — The Story Behind "Morgan's Hope" */}
				<div style={{ background: mintBg, position: 'relative', overflow: 'hidden' }}>
					<div style={{ position: 'absolute', top: 0, left: '10%', right: '10%', height: 1, background: 'linear-gradient(to right, transparent, rgba(var(--primary-rgb), 0.15), transparent)' }} />
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', maxWidth: 1200, margin: '0 auto', alignItems: 'center' }}>

            {/* Arthur Morgan illustration — bleeds right (comes first on mobile) */}
            {isMobile && (
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', paddingTop: 32 }}>
                <img
                  src="/images/about/about-us-1.png"
                  alt=""
                  style={{ width: '100%', height: 'auto', display: 'block' }}
                />
              </div>
            )}

            {/* Arthur Morgan illustration — desktop: bleeds right */}
            {!isMobile && (
              <div style={{ position: 'relative', height: '100%', minHeight: 500, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img
                  src="/images/about/about-us-1.png"
                  alt=""
                  style={{
                    width: 'auto',
                    height: '110%',
                    maxWidth: 'none',
                    objectFit: 'cover',
                    objectPosition: ar ? 'right center' : 'left center',
                    display: 'block',
                  }}
                />
              </div>
						)}
            
            {/* Text block */}
            <MotionFade direction="up" delay={0.2}>
              <div style={{ padding: isMobile ? '32px 24px 48px' : '80px 60px', textAlign: isMobile ? 'center' : ar ? 'right' : 'left' }}>
                <h2 style={{ fontSize: isMobile ? 26 : 32, fontWeight: 900, color: 'var(--primary-dark)', margin: '0 0 20px', lineHeight: 1.2 }}>
                  {t('The Story Behind "Morgan\'s Hope"', 'القصة وراء "مورجان هوب"')}
                </h2>
                <p style={{ color: 'var(--hero-text-2)', fontSize: isMobile ? 15 : 16, lineHeight: 1.8, maxWidth: 520, margin: isMobile ? '0 auto' : 0 }}>
                  {t("Morgan's Hope was inspired by Arthur Morgan and his tragic fight with tuberculosis. His story reflects how silent and dangerous lung disease can be. We built this platform on one belief: early detection gives patients a real second chance.", "استلهمنا Morgan's Hope من قصة آرثر مورجان وصراعه المأساوي مع السل. قصته تذكرنا بمدى صمت وخطورة أمراض الرئة. بنينا هذه المنصة على إيمان واحد: الكشف المبكر يمنح المريض فرصة ثانية حقيقية.")}
                </p>
              </div>
            </MotionFade>
          </div>
        </div>

        {/* Section 3 — Our Vision */}
				<div style={{ background: mintBg, position: 'relative', overflow: 'hidden' }}>
					<div style={{ position: 'absolute', top: 0, left: '10%', right: '10%', height: 1, background: 'linear-gradient(to right, transparent, rgba(var(--primary-rgb), 0.15), transparent)' }} />
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', maxWidth: 1200, margin: '0 auto', alignItems: 'center' }}>

            {/* Deer illustration — bleeds left */}
            {isMobile && (
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', paddingTop: 32 }}>
                <img
                  src="/images/about/about-us-2.png"
                  alt=""
                  style={{ width: '100%', height: 'auto', display: 'block' }}
                />
              </div>
            )}

            {/* Text block */}
            <MotionFade direction="up" delay={0.4}>
              <div style={{ padding: isMobile ? '32px 24px 48px' : '80px 60px', textAlign: isMobile ? 'center' : ar ? 'left' : 'right' }}>
                <h2 style={{ fontSize: isMobile ? 26 : 32, fontWeight: 900, color: 'var(--primary-dark)', margin: '0 0 20px' }}>
                  {t('Our Vision', 'رؤيتنا')}
                </h2>
                <blockquote style={{ fontSize: isMobile ? 18 : 22, fontStyle: 'italic', fontWeight: 600, color: 'var(--primary)', lineHeight: 1.5, margin: '0 0 16px', border: 'none', padding: 0, background: 'none' }}>
                  {t('"Making early detection of lung cancer accessible to everyone."', '"جعل التشخيص المبكر لسرطان الرئة متاحاً للجميع."')}
                </blockquote>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>
                  {t("The deer represents Arthur Morgan — the character whose silent strength and resilience inspired the identity of Morgan's Hope.", "يمثل الغزال آرثر مورجان — الشخصية التي ألهمت قوتها الصامتة وصمودها هوية Morgan's Hope.")}
                </p>
              </div>
            </MotionFade>

            {/* Deer illustration — desktop: bleeds left */}
            {!isMobile && (
              <div style={{ position: 'relative', height: '100%', minHeight: 500, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img
                  src="/images/about/about-us-2.png"
                  alt=""
                  style={{
                    width: 'auto',
                    height: '110%',
                    maxWidth: 'none',
                    objectFit: 'cover',
                    objectPosition: ar ? 'left center' : 'right center',
                    display: 'block',
                  }}
                />
              </div>
            )}
          </div>
        </div>

        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=Cairo:wght@400;600;700;800;900&display=swap');
        `}</style>
      </div>
    </MotionPageTransition>
  );
}
