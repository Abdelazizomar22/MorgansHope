import { useState, useEffect } from 'react';

interface AboutPageProps { lang: 'en' | 'ar'; }

import { MotionPageTransition } from '../components/animations/MotionPageTransition';
import { MotionFade } from '../components/animations/MotionFade';
import { HiRectangleStack, HiClipboardDocumentList, HiUserGroup } from 'react-icons/hi2';

export function AboutPage({ lang }: AboutPageProps) {
  const ar = lang === 'ar';
  const t = (en: string, arText: string) => ar ? arText : en;

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const accentDash = <div style={{ width: 40, height: 3, background: 'var(--primary)', marginBottom: 12, marginRight: ar ? 0 : 'auto', marginLeft: ar ? 'auto' : 0 }} />;

  return (
    <MotionPageTransition>
      <div style={{ minHeight: '100vh', background: 'var(--bg-main)', color: 'var(--text-main)', fontFamily: ar ? "'Cairo', sans-serif" : "'Sora', sans-serif", position: 'relative', overflow: 'hidden' }}>

				{/* Section 1 — Hero */}
        <div dir='ltr' style={{ background: 'var(--primary-dark)', backgroundImage: isMobile ? "url('/images/about/header-mobile-background.png')" : "url('/images/about/header-web-background.png')", backgroundSize: 'cover', padding: isMobile ? '60px 24px 50px' : '90px 60px', color: 'white' }}>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 40, alignItems: 'center', maxWidth: 1200, margin: '0 auto' }}>
            <MotionFade direction="up" delay={0.1}>
              <div style={{ textAlign: ar ? 'right' : 'left' }}>
                {accentDash}
                <h1 style={{ fontSize: isMobile ? 36 : 48, fontWeight: 900, color: 'white', margin: '0 0 16px' }}>
                  {t('About Morgan\'s Hope', 'Morgan\'s Hope عن')}
                </h1>
                <p style={{ fontSize: isMobile ? 15 : 17, color: 'var(--primary-light)', fontWeight: 600, margin: '0 0 20px' }}>
                  {t('A graduation project turning AI-powered chest imaging into a clearer, more human-centered screening experience.', 'مشروع تخرج يحوّل تحليل صور الصدر بالذكاء الاصطناعي إلى تجربة فحص أوضح وأكثر إنسانية.')}
                </p>
                <div style={{ width: 60, height: 3, background: 'var(--primary)', marginBottom: 20, marginRight: ar ? 0 : 'auto', marginLeft: ar ? 'auto' : 0 }} />
                <p style={{ fontSize: isMobile ? 14 : 15, color: 'rgba(255, 255, 255, 0.85)', lineHeight: 1.8, margin: 0 }}>
                  {t("Morgan's Hope was created to make chest image screening clearer, faster, and more accessible. The project combines artificial intelligence, medical imaging, and thoughtful interface design to support earlier awareness without replacing professional medical judgment.", 'صُمِّم Morgan\'s Hope ليجعل فحص صور الصدر أوضح وأسرع وأكثر إتاحةً. يجمع المشروع بين الذكاء الاصطناعي والتصوير الطبي وتصميم واجهات مدروسة لدعم الوعي المبكر دون الإحلال محل الحكم الطبي المتخصص.')}
                </p>
              </div>
            </MotionFade>
          </div>
        </div>

        {/* Section 2 — Who We Are */}
        <div style={{ background: 'var(--bg-main)', padding: isMobile ? '60px 24px' : '80px 60px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 40, alignItems: 'center', maxWidth: 1200, margin: '0 auto' }}>
            <MotionFade direction="up" delay={0.2}>
              <div style={{ textAlign: ar ? 'right' : 'left' }}>
                {accentDash}
                <h2 style={{ fontSize: isMobile ? 26 : 32, fontWeight: 900, color: 'var(--primary-dark)', margin: '0 0 20px' }}>
                  {t('Who We Are', 'من نحن')}
                </h2>
                <p style={{ fontSize: isMobile ? 14 : 15, lineHeight: 1.8, color: 'var(--text-main)', margin: 0 }}>
                  {t("Morgan's Hope is a graduation project focused on AI-powered chest imaging analysis for lung cancer and broader chest findings. We aim to make screening easier to understand, improve communication, and help users feel more informed and supported throughout their health journey.", 'Morgan\'s Hope مشروع تخرج يركز على تحليل صور الصدر بالذكاء الاصطناعي لسرطان الرئة وملاحظات الصدر الأوسع. نسعى إلى تبسيط الفهم وتحسين التواصل ومساعدة المستخدمين ليشعروا بمزيد من المعلومات والدعم طوال رحلتهم الصحية.')}
                </p>
              </div>
            </MotionFade>
            <div style={{ borderRadius: 16, overflow: 'hidden', maxHeight: 280 }}>
              <img src="/images/about/scanner.png" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            </div>
          </div>
        </div>

        {/* Section 3 — Morgan */}
        <div style={{ background: 'var(--card-bg)', padding: isMobile ? '60px 24px' : '80px 60px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '400px 1fr', gap: 40, alignItems: 'center', maxWidth: 1200, margin: '0 auto' }}>
            <div style={{ overflow: 'hidden' }}>
              <img src="/images/about/morgan.png" alt={'Arthur morgan portrait'} style={{ width: 'auto', height: isMobile? 300 : 400, objectFit: 'cover', display: 'block' }} />
            </div>
            <MotionFade direction="up" delay={0.3}>
              <div style={{ textAlign: ar ? 'right' : 'left' }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--primary)', letterSpacing: 1.5, textTransform: 'uppercase', display: 'block', marginBottom: 10 }}>
                  {t('Origin', 'المنشأ')}
                </span>
                <h2 style={{ fontSize: isMobile ? 26 : 34, fontWeight: 900, color: 'var(--primary-dark)', margin: '0 0 16px' }}>
                  {t("The Story Behind 'Morgan\'s Hope'", 'القصة وراء "مورجان هوب"')}
                </h2>
                <p style={{ fontSize: isMobile ? 14 : 15, lineHeight: 1.8, color: 'var(--hero-text-2)', margin: '0 0 20px' }}>
									{t("Morgan's Hope was inspired by Arthur Morgan and his tragic fight with tuberculosis. His story reflects how silent and dangerous lung disease can be. We built this platform on one belief: early detection gives patients a real second chance.",
										'استلهمنا Morgan\'s Hope من قصة آرثر مورجان وصراعه المأساوي مع السل. قصته تذكرنا بمدى صمت وخطورة أمراض الرئة. بنينا هذه المنصة على إيمان واحد: الكشف المبكر يمنح المريض فرصة ثانية حقيقية.')}
                </p>
                <div style={{ borderLeft: ar ? undefined : '3px solid var(--primary)', borderRight: ar ? '3px solid var(--primary)' : undefined, paddingLeft: ar ? undefined : 16, paddingRight: ar ? 16 : undefined, marginTop: 16 }}>
                  <q className='font-bold' style={{ color: 'var(--primary)', fontSize: 28, marginBottom: 4, lineHeight: 1 }}></q>
                  <p style={{ fontSize: isMobile ? 15 : 16, fontStyle: 'italic', fontWeight: 600, color: 'var(--primary)', margin: 0 }}>
                    {t('"I don\'t have a plan. I just got a… a sickness. And it\'s given me sort of a… a different perspective on things."', '«ليس لدي خطة. فقط أصابني… مرض. وقد منحني… منظوراً مختلفاً للأشياء.»')}
                  </p>
                </div>
              </div>
            </MotionFade>
          </div>
        </div>

        {/* Section 4 — Why "Morgan's Hope"? */}
        <div style={{ background: 'var(--bg-main)', padding: isMobile ? '60px 24px' : '80px 60px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 40, alignItems: 'center', maxWidth: 1200, margin: '0 auto' }}>
            <MotionFade direction="up" delay={0.4}>
              <div style={{ textAlign: ar ? 'right' : 'left' }}>
                {accentDash}
                <h2 style={{ fontSize: isMobile ? 26 : 32, fontWeight: 900, color: 'var(--primary-dark)', margin: '0 0 20px' }}>
                  {t('Why \'Morgan\'s Hope\'?', 'لماذا Morgan\'s Hope؟')}
                </h2>
                <p style={{ fontSize: isMobile ? 14 : 15, lineHeight: 1.8, color: 'var(--text-main)', maxWidth: 600, margin: 0 }}>
                  {t("The name Morgan's Hope is inspired by Arthur Morgan, a character whose story reflects strength, struggle, and the quiet weight of illness. This inspiration gives the project its emotional identity: behind every medical image, there is a person who may need time, guidance, and a second chance. The project uses this story as a symbol of early awareness. Lung diseases can develop silently, and earlier screening can help people move from uncertainty toward action.", 'استُوحي اسم Morgan\'s Hope من آرثر مورجان، شخصية تعكس قصتها القوة والكفاح والعبء الصامت للمرض. يمنح هذا الإلهام المشروعَ هويته العاطفية: وراء كل صورة طبية شخص قد يحتاج وقتاً وتوجيهاً وفرصةً ثانية. يستخدم المشروع هذه القصة رمزاً للتوعية المبكرة؛ فأمراض الرئة قد تتطور بصمت، والفحص المبكر يساعد الناس على الانتقال من الحيرة إلى الفعل.')}
                </p>
              </div>
						</MotionFade>
            
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img src="/images/about/dear.png" alt="Dear Picture" style={{ width: '100%', height: 'auto', display: 'block' }} />
            </div>
          </div>
        </div>

        {/* Section 5 — Our Vision */}
        <div style={{ background: 'var(--bg-main)', padding: isMobile ? '60px 24px' : '80px 60px' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <MotionFade direction="up" delay={0.15}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ width: 40, height: 3, background: 'var(--primary)', margin: '0 auto 12px' }} />
                <h2 style={{ fontSize: isMobile ? 26 : 32, fontWeight: 900, color: 'var(--primary-dark)', margin: '0 0 20px' }}>
                  {t('Our Vision', 'رؤيتنا')}
                </h2>
                <p style={{ fontSize: isMobile ? 14 : 15, lineHeight: 1.8, color: 'var(--text-muted)', maxWidth: 700, margin: '0 auto 40px' }}>
                  {t("Morgan's Hope is intended as a starting point, not a final destination. The long-term vision is to expand from focused lung cancer screening toward broader chest disease support, more imaging pathways, richer explainability, and stronger follow-up tools.", 'Morgan\'s Hope نقطة بداية لا نهاية مقصد. الرؤية طويلة الأمد هي التوسع من فحص سرطان الرئة المحدد نحو دعم أمراض الصدر الأشمل ومسارات التصوير الإضافية وقدرات التفسير الأعمق وأدوات المتابعة الأقوى.')}
                </p>
              </div>
            </MotionFade>
            <MotionFade direction="up" delay={0.25}>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: 20 }}>
                {[
                  {
                    icon: HiRectangleStack,
                    title: t('More Imaging Pathways', 'مسارات تصوير أكثر'),
                    body: t('Toward broader modality support over time.', 'نحو دعم أوسع لأنواع التصوير بمرور الوقت.'),
                  },
                  {
                    icon: HiClipboardDocumentList,
                    title: t('More Chest Conditions', 'حالات صدرية أكثر'),
                    body: t('From focused detection to wider thoracic screening.', 'من الكشف المحدد إلى الفحص الصدري الأشمل.'),
                  },
                  {
                    icon: HiUserGroup,
                    title: t('More Practical Impact', 'تأثير عملي أكبر'),
                    body: t('Designed to deliver clarity, guidance, and earlier action.', 'مصمَّم لتقديم الوضوح والتوجيه والتحرك المبكر.'),
                  },
                ].map((item) => (
                  <div key={item.title} style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: 18, padding: 22, boxShadow: '0 10px 28px var(--shadow-main)', textAlign: ar ? 'right' : 'left' }}>
                    <div style={{ background: 'rgba(var(--primary-rgb), 0.1)', borderRadius: '50%', width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                      <item.icon style={{ fontSize: 22, color: 'var(--primary)' }} />
                    </div>
                    <h3 style={{ fontSize: 16, fontWeight: 900, color: 'var(--primary-dark)', margin: '0 0 8px' }}>{item.title}</h3>
                    <p style={{ fontSize: 13, color: 'var(--hero-text-2)', lineHeight: 1.7, margin: 0 }}>{item.body}</p>
                  </div>
                ))}
              </div>
            </MotionFade>
          </div>
        </div>

        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=Cairo:wght@400;600;700;800;900&display=swap');
        `}</style>
      </div>
    </MotionPageTransition>
  );
}
