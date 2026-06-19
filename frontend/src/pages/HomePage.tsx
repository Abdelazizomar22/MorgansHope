import { Link } from 'react-router-dom';
// Hooks
import { useCounter } from '../hooks/useCounter';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
// UI Components
import { MotionFade } from '../components/animations/MotionFade';
import { MotionStaggerList } from '../components/animations/MotionStaggerList';
import { MotionHoverScale } from '../components/animations/MotionHoverScale';
import { MotionPageTransition } from '../components/animations/MotionPageTransition';
import SurvivalBar from '../components/SurvivalBar';
// Data
import { SURVIVAL } from '../data/survival';
import { EGYPT_CARDS } from '../data/eg-cards';
import { DONUT_DATA } from '../data/donut';
// Icons
import { HiExclamationTriangle, HiDocumentText, HiCloudArrowUp, HiArrowRight, HiCpuChip, HiInformationCircle, HiChartBarSquare, HiClock, HiShieldCheck, HiHeart, HiCog6Tooth, HiCheckCircle, HiPhoto } from 'react-icons/hi2';

// Interface for language
interface HomePageProps { lang: 'en' | 'ar'; }

export default function HomePage({ lang }: HomePageProps) {
  const { user } = useAuth();
  const ar = lang === 'ar';
  const t = (en: string, arText: string) => ar ? arText : en;

  const survivalRef = useRef<HTMLDivElement>(null);
  const [vTrig, setVTrig] = useState(false);

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isTablet, setIsTablet] = useState(window.innerWidth < 1024);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      setIsTablet(window.innerWidth < 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.target === survivalRef.current && e.isIntersecting) setVTrig(true);
      });
    }, { threshold: 0.25 });
    if (survivalRef.current) obs.observe(survivalRef.current);
    return () => obs.disconnect();
  }, []);

  const circ = 2 * Math.PI * 40;
  let acc = 0;
  const slices = DONUT_DATA.map(d => {
    const off = acc;
    const value = vTrig ? d.pct : 0;
    const dash = (value / 100) * circ;
    acc += (d.pct / 100) * circ;
    return { ...d, off, dash };
  });

  const CARDS_IMAGES = [
    "/images/home/card-bg-1.jpeg",
    "/images/home/card-bg-2.jpeg",
    "/images/home/card-bg-3.jpeg",
  ];

  const PROVIDES_ITEMS = [
    { Icon: <HiCpuChip size={26} />, en: 'CT and X-Ray Support', ar: 'دعم CT و X-Ray', desc_en: 'The platform currently supports the two main imaging inputs used in this project: Chest CT and Chest X-Ray.', desc_ar: 'تدعم المنصة حالياً نوعي التصوير الرئيسيين في المشروع: الأشعة المقطعية للصدر (CT) والأشعة السينية للصدر (X-Ray).' },
    { Icon: <HiShieldCheck size={26} />, en: 'Image Validation Gate', ar: 'بوابة التحقق من الصورة', desc_en: 'Every uploaded image passes through a pre-classification step to confirm whether it is a supported chest scan before disease analysis.', desc_ar: 'تمر كل صورة مرفوعة بخطوة تصنيف أولي للتأكد من أنها صورة صدر مدعومة قبل بدء تحليل الأمراض.' },
    { Icon: <HiDocumentText size={26} />, en: 'CT Cancer Analysis', ar: 'تحليل سرطان عبر CT', desc_en: 'The CT branch focuses on lung cancer screening and classifies CT images into clinically relevant cancer-related categories.', desc_ar: 'يركّز مسار CT على فحص سرطان الرئة ويصنّف صور CT إلى فئات سريرية مرتبطة بالسرطان.' },
    { Icon: <HiPhoto size={26} />, en: 'X-Ray Clinical Screening', ar: 'فحص سريري عبر X-Ray', desc_en: 'The X-Ray branch supports broader chest screening through clinical groups such as infection, pleural disease, and potential malignancy findings.', desc_ar: 'يدعم مسار X-Ray فحصاً أوسع للصدر عبر مجموعات سريرية مثل العدوى وأمراض الغشاء البلوري ومؤشرات الأورام المحتملة.' },
    { Icon: <HiInformationCircle size={26} />, en: 'Report and Urgency Level', ar: 'التقرير ومستوى الخطورة', desc_en: 'The result page presents the prediction, confidence, urgency level, suggested next step, and a downloadable PDF report.', desc_ar: 'تعرض صفحة النتيجة التوقع ونسبة الثقة ومستوى الخطورة والخطوة التالية المقترحة، مع تقرير PDF قابل للتحميل.' },
    { Icon: <HiHeart size={26} />, en: 'Guided Medical Follow-up', ar: 'متابعة طبية موجهة', desc_en: 'When concerning findings appear, the platform helps users move toward proper consultation through hospital guidance and safe assistant support.', desc_ar: 'عند ظهور نتائج مقلقة، تساعد المنصة المستخدم على التوجه لاستشارة مناسبة عبر إرشادات المستشفيات ودعم مساعد آمن.' },
  ];

  const gridCols = isMobile ? 2 : isTablet ? 3 : 6;

  const COVERAGE_ITEMS = [
    { en: 'Lung Cancer Detection', ar: 'اكتشاف سرطان الرئة', desc_en: 'AI-assisted CT screening for lung cancer-related findings, nodule presence, and malignant-suspicious patterns.', desc_ar: 'فحص CT بمساعدة الذكاء الاصطناعي لنتائج سرطان الرئة ووجود العقيدات والأنماط المشبوهة بالخبث.', tag: 'CT', status: 'available' },
    { en: 'Tuberculosis Screening', ar: 'فحص السل', desc_en: 'AI-assisted Chest X-Ray screening support for TB-related lung patterns.', desc_ar: 'دعم فحص الأشعة السينية للصدر بمساعدة الذكاء الاصطناعي لأنماط الرئة المرتبطة بالسل.', tag: 'X-Ray', status: 'available' },
    { en: 'Pulmonary Infection', ar: 'عدوى رئوية', desc_en: 'Screens for infection-related Chest X-Ray patterns such as pneumonia, consolidation, and infiltration.', desc_ar: 'يفحص أنماط الأشعة السينية للصدر المرتبطة بالعدوى مثل الالتهاب الرئوي والتماسك والتسلل.', tag: 'X-Ray', status: 'available' },
    { en: 'Pleural Diseases', ar: 'أمراض الغشاء البلوري', desc_en: 'Screens for pleural abnormalities such as effusion, pneumothorax, and pleural thickening.', desc_ar: 'يفحص تشوهات الغشاء البلوري مثل الانصباب واسترواح الصدر وسماكة الغشاء البلوري.', tag: 'X-Ray', status: 'available' },
    { en: 'COPD-related Findings', ar: 'نتائج مرتبطة بالانسداد الرئوي المزمن', desc_en: 'Emphysema, hyperinflation, and airway changes.', desc_ar: 'النُفاخ الرئوي وفرط الانتفاخ وتغيرات المجاري الهوائية.', tag: 'CT / X-Ray', status: 'soon' },
    { en: 'Fibrotic Lung Disease', ar: 'مرض التليف الرئوي', desc_en: 'ILD patterns and pulmonary fibrosis.', desc_ar: 'أنماط أمراض الرئة الخلالية والتليف الرئوي.', tag: 'CT / X-Ray', status: 'soon' },
    { en: 'Cardiac Conditions', ar: 'حالات قلبية', desc_en: 'Cardiomegaly and related cardiac findings.', desc_ar: 'تضخم القلب والنتائج القلبية ذات الصلة.', tag: 'X-Ray', status: 'soon' },
    { en: 'Others', ar: 'أخرى', desc_en: 'More diseases and imaging types on the way.', desc_ar: 'المزيد من الأمراض وأنواع التصوير في الطريق.', tag: 'CT / X-Ray', status: 'soon' },
  ];

  return (
    <MotionPageTransition>
      <div style={{ fontFamily: ar ? "'Cairo', sans-serif" : "'Sora', sans-serif", background: 'var(--bg-main)', minHeight: '100vh', color: 'var(--text-main)' }}>

        {/* ══ HERO ══════════════════════════════════════════════════════════ */}
        <div id='hero' className='flex flex-col justify-between'>
          <section style={{ backgroundImage: `url('images/home/hero-background.png')`, backgroundPosition: "center", backgroundSize: "cover", color: 'var(--text-main)', padding: isMobile ? '60px 16px' : '60px 40px', position: 'relative', overflow: 'hidden'}}>

            <div style={{ position: 'relative', maxWidth: 400, zIndex: 10, marginRight: 'auto' }}>
              <MotionFade direction="up" delay={0.1}>
                <div style={{ transform: isMobile ? 'translateY(4px)' : 'translateY(12px)' }}>
                <h1 style={{ color: 'var(--primary)', fontSize: 'clamp(2.15rem, 7vw, 3rem)', fontWeight: 700, margin: '0 0 12px', lineHeight: 1.12, letterSpacing: -1 }}>
                  <span>{t('Early Detection', 'الكشف المبكر')}</span>{' '}
                  <span>{t('Saves Lives', 'ينقذ الأرواح')}</span>
                </h1>
                <p style={{ fontSize: isMobile ? 13 : 14, fontStyle: 'italic', margin: '4px 0 14px', letterSpacing: 0.1 }}>
                  {t('"Morgan\'s Hope: A Second Chance for Every Breath." Inspired by a legend, built for reality.', '"مورجان هوب: فرصة ثانية لكل نَفَس." — مستوحى من أسطورة، ومبني للواقع.')}
                </p>
                <div style={{ marginTop: isMobile ? 22 : 28, marginBottom: isMobile ? 16 : 24 }}>
                  <p style={{ fontSize: isMobile ? 15 : 16, lineHeight: 1.84, maxWidth: 620, transform: 'translateY(0px)' }}>
                    {t('Like Arthur Morgan facing an invisible enemy, lung disease can be a quiet battle. Morgan\'s Hope shifts the odds through earlier detection. Upload your CT scan or X-Ray and get an AI-powered analysis in minutes.', 'مثلما واجه آرثر مورجان عدوًا خفيًا، قد يكون مرض الرئة معركة صامتة. Morgan\'s Hope يرجّح الكفة عبر الكشف المبكر. ارفع صورة CT أو X-Ray واحصل على تحليل مدعوم بالذكاء الاصطناعي خلال دقائق.')}
                  </p>
                </div>
                </div>
              </MotionFade>
              <MotionFade direction="up" delay={0.2}>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: isMobile ? 30 : 44 }}>
                  <MotionHoverScale style={{ display: 'inline-flex' }}>
                    <Link to={user ? '/upload' : '/register'} style={{ padding: '14px 34px', background: 'var(--primary)', color: 'white', borderRadius: 10, textDecoration: 'none', fontWeight: 700, fontSize: 15.5, boxShadow: '0 4px 20px var(--shadow-main)', letterSpacing: 0.2, display: 'inline-flex', alignItems: 'center', gap: 8, transition: 'transform 0.2s, background 0.2s' }}
                      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.background = 'var(--primary-dark)'; }}
                      onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.background = 'var(--primary)'; }}
                    >
                      <HiCloudArrowUp size={16} />
                      {t('Start Free Analysis', 'ابدأ التحليل مجاناً')}
                    </Link>
                  </MotionHoverScale>
                  <MotionHoverScale style={{ display: 'inline-flex' }}>
                    <Link
											to="/about"
											className='group'
                      style={{
                        padding: '14px 26px',
                        borderRadius: 10,
                        textDecoration: 'none',
                        fontWeight: 700,
                        fontSize: 14.5,
                        border: '1.5px solid var(--primary)',
                        position: 'relative',
                        overflow: 'hidden',
                        transition: 'color 0.3s',
                        display: 'inline-flex',
                        alignItems: 'center',
											}}
                      onMouseEnter={e => {
                        (e.currentTarget.querySelector('.fill') as HTMLElement).style.transform = 'translateX(0)';
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget.querySelector('.fill') as HTMLElement).style.transform = ar ? 'translateX(100%)' : 'translateX(-100%)';
                      }}
                    >
                      <span className="fill" style={{ position: 'absolute', inset: 0,  background: 'var(--primary)', transform: ar ? 'translateX(100%)' : 'translateX(-100%)', transition: 'transform 0.3s ease', borderRadius: 10 }} />
                      <span className='text-(--primary-dark) transition-colors duration-300 group-hover:text-white' style={{ position: 'relative', zIndex: 1 }}>{t('About Us', 'من نحن')}</span>
                    </Link>
                  </MotionHoverScale>
                </div>
              </MotionFade>
            </div>
          </section>

          {/* ══ WHAT MORGAN'S HOPE PROVIDES ══════════════════════════════════ */}
          <section style={{ background: 'var(--card-bg)', borderBottom: '1px solid var(--card-border)', padding: isMobile ? '32px 16px' : '40px 40px' }}>
            <div style={{ margin: '0 auto' }}>
              <MotionStaggerList staggerDelay={0.08} style={{ display: 'grid', gridTemplateColumns: `repeat(${gridCols},1fr)` }}>
                {PROVIDES_ITEMS.map((item, i) => (
                  <div key={i} style={{ textAlign: 'center', padding: isMobile ? '16px 10px' : '0px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', borderInlineEnd: (i + 1) % gridCols === 0 ? 'none' : '1px solid var(--card-border)' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 48, height: 48, borderRadius: 14, background: 'var(--bg-main)', color: 'var(--primary)', marginBottom: 12, flexShrink: 0 }}>
                      {item.Icon}
                    </div>
                    <h3 style={{ fontWeight: 800, fontSize: 15, color: 'var(--primary-dark)', margin: '0 0 6px', minHeight: 42, display: 'flex', alignItems: 'center' }}>{ar ? item.ar : item.en}</h3>
                    <p style={{ fontSize: 12.5, color: 'var(--text-muted)', lineHeight: 1.7, margin: '0 auto', maxWidth: 260 }}>{ar ? item.desc_ar : item.desc_en}</p>
                  </div>
                ))}
              </MotionStaggerList>
            </div>
          </section>
        </div>

        {/* ══ EGYPT STATS & INSIGHTS ══════════════════════════════════════════ */}
        <section style={{
          position: 'relative', overflow: 'hidden', marginTop: "30px" }}>
          <img src="images/home/stats-1.png" className='hidden md:block' style={{ position: 'absolute', left: -30, top: 130, width: '40%', height: '40%', objectFit: 'cover', zIndex: 0 }} />
          <img src="images/home/stats-2.png" className='hidden md:block' style={{ position: 'absolute', right: 0, top: 150, width: '40%', height: '40%', objectFit: 'cover', zIndex: 0 }} />
          <div style={{ position: 'absolute', inset: 0, zIndex: 1, background: 'rgba(255,255,255,0.4)' }} />
          <div style={{position: 'relative', padding: isMobile ? '40px 20px 10px' : '80px 40px 10px', zIndex: 10, maxWidth: 1100, margin: '0 auto'}}>

            <div style={{ textAlign: 'center', marginBottom: 50 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'var(--card-bg)', border: '1px solid var(--card-border)', color: 'var(--primary)', borderRadius: 99, padding: '6px 18px', fontSize: 11, fontWeight: 800, letterSpacing: 1.2, textTransform: 'uppercase' as const, marginBottom: 16, boxShadow: '0 2px 8px var(--shadow-main)' }}>
                <HiInformationCircle size={12} />
                {t('Local Context — Real Statistics', 'الواقع المحلي — إحصائيات حقيقية')}
              </div>
              <h2 style={{ fontSize: 32, fontWeight: 900, color: 'var(--text-main)', margin: '0 0 10px', letterSpacing: -0.6 }}>{t('Lung Cancer in Egypt', 'سرطان الرئة في مصر')}</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: 15, maxWidth: 520, margin: '0 auto', lineHeight: 1.6 }}>{t('The burden is significant. AI-powered early screening is the most effective tool to change these outcomes.', 'العبء كبير. الفحص المبكر بالذكاء الاصطناعي هو الأداة الأكثر فعالية لتغيير هذه النتائج.')}</p>
            </div>

            {/* Unified High-Level Stats Panel - Refined Presentation */}
            <div style={{ background: 'var(--card-bg)', borderRadius: 28, border: '1px solid var(--card-border)', overflow: 'hidden', marginBottom: 48, boxShadow: '0 12px 48px var(--shadow-main)', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : isTablet ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', position: 'relative' }}>
              <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(var(--card-border) 1.5px, transparent 1.5px)', backgroundSize: '20px 20px', opacity: 0.2, pointerEvents: 'none' }} />

              {EGYPT_CARDS.map((c, i) => {
                const animatedVal = useCounter(c.val, 1600, vTrig);
                const displayVal = vTrig ? animatedVal : c.val;
                const formattedVal = c.format ? displayVal.toLocaleString() : displayVal;

                return (
                  <div key={i} className='animate-card group group-hover:*:text-white' style={{ padding: '40px 24px', textAlign: 'center', borderInlineEnd: (isMobile || isTablet) ? 'none' : (i < 3 ? '1px solid var(--card-border)' : 'none'), borderBottom: isMobile || (isTablet && i < 2) ? '1px solid var(--card-border)' : 'none', position: 'relative' }}
                  >
                    <div style={{ fontSize: 36, fontWeight: 900, color: 'var(--primary)', lineHeight: 1, marginBottom: 10, letterSpacing: -1.2 }}>
                      {c.prefix}{formattedVal}{c.suffix}
                    </div>
                    <div style={{ fontSize: 13.5, color: 'var(--text-main)', lineHeight: 1.4, fontWeight: 700, margin: '0 auto 12px', maxWidth: 180 }}>
                      {ar ? c.ar : c.en}
                    </div>
                    <div style={{ display: 'inline-block', fontSize: 10, color: 'var(--text-muted)', background: 'var(--bg-main)', padding: '4px 10px', borderRadius: 99, border: '1px solid var(--card-border)', textTransform: 'uppercase', fontWeight: 800, letterSpacing: 0.5 }}>
                      {ar ? c.subAr : c.subEn}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Combined Insights: Survival + Distro */}
            <div ref={survivalRef} style={{ display: 'grid', gridTemplateColumns: isTablet ? '1fr' : '1.2fr 1fr', gap: 24, marginBottom: 32 }}>
              {/* Survival Column */}
              <div style={{ background: 'var(--card-bg)', borderRadius: 24, padding: '34px', border: '1px solid var(--card-border)', boxShadow: '0 4px 20px var(--shadow-main)', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                    <div style={{ padding: 10, background: 'var(--bg-main)', borderRadius: 12, color: 'var(--primary)' }}>
                      <HiChartBarSquare size={20} />
                    </div>
                    <div>
                      <h3 style={{ fontWeight: 800, color: 'var(--text-main)', fontSize: 17, margin: 0 }}>{t('Survival Rate by Stage', 'معدل البقاء حسب المرحلة')}</h3>
                      <div style={{ color: 'var(--text-muted)', fontSize: 11.5, marginTop: 2, fontWeight: 500 }}>{t('Source: Global IARC / SEER Database', 'المصدر: قاعدة بيانات IARC / SEER العالمية')}</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {SURVIVAL.map((s, i) => (
                      <SurvivalBar key={i} {...s} label={ar ? s.ar : s.en} trigger={vTrig} />
                    ))}
                  </div>

                  <div className='bg-[var(--primar-light)]/60 border border-[var(--primary)] border-dashed text-[var(--text-main)] flex items-center gap-4' style={{ marginTop: 24, borderRadius: 14, padding: '16px 20px', position: 'relative', overflow: 'hidden' }}>
                    <HiExclamationTriangle color={'var(--primary)'} size={30} />
                    <p style={{ fontSize: 11, margin: 0, fontWeight: 600, lineHeight: 1.6, position: 'relative', zIndex: 1 }}>
                      {t('Stage I detection yields a 13× higher survival rate than Stage IV. Every scan is a chance for life.', 'اكتشاف المرحلة الأولى يحقق معدل بقاء أعلى بـ 13 مرة من الرابعة. كل فحص هو فرصة للحياة.')}
                    </p>
                    <div style={{ position: 'absolute', top: '-50%', right: '-10%', width: 100, height: 100, background: 'rgba(255,255,255,0.05)', borderRadius: '50%' }} />
                  </div>
                </div>
              </div>

              {/* Distribution Column */}
              <div style={{ background: 'var(--card-bg)', borderRadius: 24, padding: '34px', border: '1px solid var(--card-border)', boxShadow: '0 4px 20px var(--shadow-main)', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                    <div style={{ padding: 10, background: 'var(--bg-main)', borderRadius: 12, color: 'var(--primary)' }}>
                      <HiClock size={20} />
                    </div>
                    <div>
                      <h3 style={{ fontWeight: 800, color: 'var(--text-main)', fontSize: 17, margin: 0 }}>{t('Global Histology', 'التوزيع النسيجي العالمي')}</h3>
                      <div style={{ color: 'var(--text-muted)', fontSize: 11.5, marginTop: 2, fontWeight: 500 }}>{t('Breakdown by lung cancer type', 'تقسيم حسب نوع سرطان الرئة')}</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 16 : 32, marginTop: 10, flexDirection: isMobile ? 'column' : 'row' }}>
                    <div style={{ position: 'relative', width: 140, height: 140, flexShrink: 0 }}>
                      <svg viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)', width: '100%', height: '100%' }}>
                        {slices.map((s, i) => (
                          <circle key={i} cx="50" cy="50" r={40} fill="none" stroke={s.color} strokeWidth={14}
                            strokeDasharray={`${s.dash} ${circ - s.dash}`} strokeDashoffset={-s.off}
                            style={{ transition: 'stroke-dasharray 2s cubic-bezier(0.4, 0, 0.2, 1)' }} />
                        ))}
                      </svg>
                      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                        <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>{t('Histology', 'الأنسجة')}</div>
                        <div style={{ fontSize: 16, fontWeight: 900, color: 'var(--main-text)', marginTop: -2 }}>100%</div>
                      </div>
                    </div>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {DONUT_DATA.map((d, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ width: 8, height: 8, borderRadius: 2, background: d.color }} />
                            <span style={{ fontSize: 13, color: 'var(--text-main)', fontWeight: 600 }}>{ar ? d.labelAr : d.labelEn}</span>
                          </div>
                          <span style={{ fontSize: 13, fontWeight: 900, color: 'var(--text-main)' }}>{d.pct}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Optimized Call-to-Action Banner */}
            <div style={{ backgroundImage: "url('/images/home/early-detection-section.png')", backgroundSize: 'cover', backgroundPosition: 'right', borderRadius: 24, padding: isMobile ? '30px 20px' : '40px 50px', color: 'white', display: 'flex', alignItems: 'center', gap: isMobile ? 24 : 40, flexWrap: 'wrap', marginBottom: 100, border: '1px solid var(--primary)', position: 'relative', overflow: 'hidden', flexDirection: isMobile ? 'column' : 'row', textAlign: isMobile ? 'center' : 'start' as const }}>
              <div style={{ flexShrink: 0, position: 'relative', margin: isMobile ? '0 auto' : '0' }}>
                <div style={{ width: 64, height: 64, background: 'rgba(255,255,255,0.1)', borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></svg>
                </div>
              </div>

              <div style={{ flex: 1, minWidth: isMobile ? 'auto' : 300, position: 'relative' }}>
                <h3 style={{ fontSize: 22, fontWeight: 900, margin: '0 0 12px', letterSpacing: -0.4 }}>{t('Why Early Detection Matters', 'لماذا الكشف المبكر مهم؟')}</h3>
                <p style={{ fontSize: 14.5, opacity: 0.85, lineHeight: 1.8, margin: 0, fontWeight: 500 }}>
                  {t("75% of cases in Egypt are late-stage. AI screening identifies abnormalities before symptoms appear, shifting survival rates from 5% (Stage IV) to over 68% (Stage I). Time is the most valuable variable.", '75% من الحالات في مصر تُكتشف متأخراً. الفحص بالذكاء الاصطناعي يكتشف الشذوذات قبل الأعراض، ويحول معدلات البقاء من 5% (المرحلة 4) إلى أكثر من 68% (المرحلة 1). الوقت هو المتغير الأغلى.')}
                </p>
              </div>

              <Link to={user ? '/upload' : '/register'} style={{ padding: '16px 36px', background: '#FFFFFF', color: 'var(--primary-dark)', borderRadius: 12, textDecoration: 'none', fontWeight: 800, fontSize: 15, whiteSpace: 'nowrap', boxShadow: '0 10px 30px rgba(0,0,0,0.2)', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', border: 'none', position: 'relative', width: isMobile ? '100%' : 'auto', textAlign: 'center' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 15px 40px rgba(0,0,0,0.3)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.2)'; }}
              >
                {t('Get Screened Now', 'افحص الآن')}
              </Link>
            </div>
          </div>
        </section>

        {/* ══ HOW IT WORKS ══════════════════════════════════════════════════ */}
        <div style={{
          backgroundImage: "url('images/common/flowers-1.jpeg')",
          backgroundSize: 'contain',
        }}>
          <section style={{
            padding: isMobile ? '0 20px 40px' : '0 40px 80px',
          }}>
            <div style={{ maxWidth: 1040, margin: '0 auto' }}>
              <div style={{ paddingTop: 64, textAlign: 'center', marginBottom: 48 }}>
                <h2 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-main)', margin: '0 0 8px', letterSpacing: -0.4 }}>{t('How It Works', 'كيف يعمل النظام')}</h2>
              </div>

              <MotionStaggerList staggerDelay={0.15} style={{ display: 'grid', gridTemplateColumns: isTablet ? '1fr' : 'repeat(3,1fr)', gap: 22 }}>
                {[
                  { Icon: <HiCloudArrowUp size={30} />, title: t('Upload Scan', 'رفع الصورة'), desc: t('CT or X-Ray image (JPG/PNG/WebP, max 10MB)', 'صورة CT أو أشعة سينية (JPG/PNG/WebP، حتى 10MB)') },
                  { Icon: <HiCpuChip size={30} />, title: t('AI Analysis', 'التحليل بالذكاء الاصطناعي'), desc: t('Advanced deep learning model analyzes your scans quickly', 'نموذج ذكاء اصطناعي متقدم يحلل الصور بسرعة') },
                  { Icon: <HiDocumentText size={30} />, title: t('Get Report', 'استلام التقرير'), desc: t('PDF report with urgency level & hospital guidance', 'تقرير PDF مع مستوى الخطورة وإرشادات المستشفيات') },
                ].map((s, index) => {
                  const CURRENT_IMAGE = CARDS_IMAGES[index];

                  return <div className='group-hover:scale-104 animate-card group *:transition-all *:duration-300'
                    key={index}
                    style={{ height: '100%', textAlign: 'center', background: 'var(--card-bg)', borderRadius: 16, padding: '20px 15px', border: '1px solid var(--primary-light)', boxShadow: '0 2px 8px var(--shadow-main)' }}>
                    <div className='text-primary flex items-center justify-center group-hover:-translate-y-[3px] group-hover:text-[var(--primary-dark)]'
                      style={{ backgroundImage: `url(${CURRENT_IMAGE})`, backgroundSize: 'cover', backgroundPosition: 'center', borderRadius: 10, height: 130, marginBottom: 16, }}>
                      <div style={{padding: 12}} className='bg-(--bg-main) rounded-full w-fit mx-auto'>
                        {s.Icon}
                      </div>
                    </div>
                    <h3 className='group-hover:text-[var(--primary)] group-hover:-translate-y-[3px]' style={{ fontWeight: 800, margin: '0 0 10px', fontSize: 16 }}>{s.title}</h3>
                    <p className='text-[var(--text-muted)] group-hover:text-[var(--text-main)] group-hover:-translate-y-[3px]' style={{ fontSize: 13, lineHeight: 1.7, margin: 0 }}>{s.desc}</p>
                  </div>
                })}
              </MotionStaggerList>
            </div>
          </section>
        </div>

        {/* ══ WHAT WE OFFER TODAY / OUR VISION ══════════════════════════════ */}
        <section style={{ padding: isMobile ? '40px 20px' : '60px 40px' }}>
          <MotionFade direction="up" delay={0.1}>
            <div style={{ maxWidth: 1040, margin: '0 auto', background: 'var(--card-bg)', borderRadius: 20, border: '1px solid var(--card-border)', padding: isMobile ? '28px 20px' : '36px 40px', boxShadow: '0 4px 20px var(--shadow-main)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? 28 : 40, position: 'relative' }}>
                {!isMobile && <div style={{ position: 'absolute', left: '50%', top: '5%', bottom: '5%', width: 1, background: 'var(--card-border)' }} />}

                {/* Left Column — What We Offer Today */}
                <div>
                  <h3 style={{ fontWeight: 800, fontSize: isMobile ? 16 : 18, color: 'var(--text-main)', margin: '0 0 4px' }}>{t('What We Offer Today', 'ما نقدمه اليوم')}</h3>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '0 0 16px' }}>{t("Currently available in Morgan's Hope", `متاح حالياً في Morgan's Hope`)}</p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div style={{ background: 'var(--bg-main)', borderRadius: 12, padding: 14, border: '1px solid var(--card-border)' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, borderRadius: 10, background: 'var(--card-bg)', color: 'var(--primary)', marginBottom: 10 }}>
                        <HiCpuChip size={18} />
                      </div>
                      <h4 style={{ fontWeight: 800, fontSize: 14, color: 'var(--text-main)', margin: '0 0 4px' }}>{t('Chest CT', 'CT للصدر')}</h4>
                      <p style={{ fontSize: 11.5, color: 'var(--text-muted)', lineHeight: 1.6, margin: '0 0 10px' }}>{t('AI analysis for lung nodules, masses, and lung cancer classification.', 'تحليل بالذكاء الاصطناعي للعقيدات والكتل الرئوية وتصنيف سرطان الرئة.')}</p>
                      <span style={{ display: 'inline-block', fontSize: 10, fontWeight: 800, background: 'var(--primary-dark)', color: 'white', padding: '3px 10px', borderRadius: 99, letterSpacing: 0.3 }}>{t('Available Now', 'متاح الآن')}</span>
                    </div>
                    <div style={{ background: 'var(--bg-main)', borderRadius: 12, padding: 14, border: '1px solid var(--card-border)' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, borderRadius: 10, background: 'var(--card-bg)', color: 'var(--primary)', marginBottom: 10 }}>
                        <HiPhoto size={18} />
                      </div>
                      <h4 style={{ fontWeight: 800, fontSize: 14, color: 'var(--text-main)', margin: '0 0 4px' }}>{t('Chest X-Ray', 'X-Ray للصدر')}</h4>
                      <p style={{ fontSize: 11.5, color: 'var(--text-muted)', lineHeight: 1.6, margin: '0 0 10px' }}>{t('AI screening for major respiratory and chest conditions.', 'فحص بالذكاء الاصطناعي لأهم حالات الجهاز التنفسي والصدر.')}</p>
                      <span style={{ display: 'inline-block', fontSize: 10, fontWeight: 800, background: 'var(--primary-dark)', color: 'white', padding: '3px 10px', borderRadius: 99, letterSpacing: 0.3 }}>{t('Available Now', 'متاح الآن')}</span>
                    </div>
                  </div>
                </div>

                {/* Right Column — Our Vision */}
                <div>
                  <h3 style={{ fontWeight: 800, fontSize: isMobile ? 16 : 18, color: 'var(--text-main)', margin: '0 0 4px' }}>{t('Our Vision', 'رؤيتنا')}</h3>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '0 0 16px' }}>{t('Expanding the future of AI-powered imaging', 'توسيع مستقبل التصوير المعتمد على الذكاء الاصطناعي')}</p>
                  <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2,1fr)' : isTablet ? 'repeat(3,1fr)' : 'repeat(5,1fr)', gap: 10 }}>
                    {[
                      { Icon: <HiPhoto size={18} />, en: 'More Imaging Types', arS: 'أنواع تصوير أكثر', desc_en: 'HRCT, Low-dose CT, PET-CT, and more.', desc_ar: 'HRCT، CT منخفض الجرعة، PET-CT، والمزيد.' },
                      { Icon: <HiDocumentText size={18} />, en: 'More Diseases', arS: 'أمراض أكثر', desc_en: 'Broader coverage of respiratory, pleural, cardiac, and more.', desc_ar: 'تغطية أوسع لأمراض الجهاز التنفسي والغشاء البلوري والقلب والمزيد.' },
                      { Icon: <HiCpuChip size={18} />, en: 'Smarter AI', arS: 'ذكاء اصطناعي أذكى', desc_en: 'More accurate, explainable, and continuously improving models.', desc_ar: 'نماذج أكثر دقة وقابلية للتفسير ومستمرة في التحسن.' },
                      { Icon: <HiCog6Tooth size={18} />, en: 'Clinical Integration', arS: 'تكامل سريري', desc_en: 'Appointment booking, telemedicine, and hospital follow-up support.', desc_ar: 'حجز المواعيد والطب عن بُعد ودعم المتابعة مع المستشفيات.' },
                      { Icon: <HiHeart size={18} />, en: 'Better Impact', arS: 'تأثير أفضل', desc_en: 'Earlier detection, better outcomes, healthier lives.', desc_ar: 'كشف أبكر ونتائج أفضل وحياة أكثر صحة.' },
                    ].map((item, i) => (
                      <div key={i} style={{ textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 40, height: 40, borderRadius: '50%', background: 'var(--bg-main)', color: 'var(--primary)', marginBottom: 8 }}>
                          {item.Icon}
                        </div>
                        <h4 style={{ fontWeight: 800, fontSize: 13, color: 'var(--text-main)', margin: '0 0 2px' }}>{ar ? item.arS : item.en}</h4>
                        <p style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>{ar ? item.desc_ar : item.desc_en}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </MotionFade>
        </section>

        {/* Section 6 — Current AI Coverage */}
        <div style={{ background: 'var(--bg-main)', padding: isMobile ? '60px 24px' : '80px 60px' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <MotionFade direction="up" delay={0.15}>
              <div style={{ textAlign: 'center', marginBottom: 40 }}>
                <h2 style={{ fontSize: isMobile ? 26 : 32, fontWeight: 900, color: 'var(--primary-dark)', margin: '0 0 12px' }}>
                  {t('Current AI Coverage', 'التغطية الحالية للذكاء الاصطناعي')}
                </h2>
                <p style={{ fontSize: 14, color: 'var(--text-muted)', maxWidth: 550, margin: '0 auto' }}>
                  {t("Expanding from today's availability toward comprehensive chest imaging.", 'التوسع من التغطية الحالية نحو تصوير صدر شامل.')}
                </p>
              </div>
            </MotionFade>
            <MotionFade direction="up" delay={0.25}>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 32, position: 'relative' }}>
                {!isMobile && <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: 1, background: 'var(--card-border)', transform: 'translateX(-50%)' }} />}
                <div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--primary-dark)', color: 'white', fontSize: 12, fontWeight: 800, padding: '6px 20px', borderRadius: 99, letterSpacing: 0.5, marginBottom: 20 }}>
                    <HiCheckCircle size={14} />
                    {t('Available Now', 'متاح الآن')}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {COVERAGE_ITEMS.filter(i => i.status === 'available').map(item => (
                      <div key={item.en} style={{ background: 'var(--card-bg)', borderRadius: 14, padding: 16, border: '1px solid var(--card-border)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <HiCheckCircle size={18} color="var(--primary)" style={{ flexShrink: 0 }} />
                          <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-main)' }}>{t(item.en, item.ar)}</span>
                          <span style={{ fontSize: 10, fontWeight: 700, background: 'var(--bg-main)', color: 'var(--text-muted)', padding: '2px 8px', borderRadius: 99, marginInlineStart: 'auto', whiteSpace: 'nowrap' }}>{item.tag}</span>
                        </div>
                        <p style={{ fontSize: 12.5, color: 'var(--text-muted)', lineHeight: 1.6, margin: '6px 0 0', paddingInlineStart: 28 }}>{t(item.desc_en, item.desc_ar)}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#fef3c7', color: '#92400e', fontSize: 12, fontWeight: 800, padding: '6px 20px', borderRadius: 99, letterSpacing: 0.5, marginBottom: 20 }}>
                    <HiClock size={14} />
                    {t('Coming Soon', 'قريباً')}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {COVERAGE_ITEMS.filter(i => i.status === 'soon').map(item => (
                      <div key={item.en} style={{ background: 'var(--card-bg)', borderRadius: 14, padding: 16, border: '1px solid var(--card-border)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <HiClock size={18} color="#d97706" style={{ flexShrink: 0 }} />
                          <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-main)' }}>{t(item.en, item.ar)}</span>
                          <span style={{ fontSize: 10, fontWeight: 700, background: 'var(--bg-main)', color: 'var(--text-muted)', padding: '2px 8px', borderRadius: 99, marginInlineStart: 'auto', whiteSpace: 'nowrap' }}>{item.tag}</span>
                        </div>
                        <p style={{ fontSize: 12.5, color: 'var(--text-muted)', lineHeight: 1.6, margin: '6px 0 0', paddingInlineStart: 28 }}>{t(item.desc_en, item.desc_ar)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </MotionFade>
          </div>
        </div>

				{/* Section 7 — Trusted by Innovators */}
        <div style={{ backgroundImage: "url('/images/common/flowers-2.jpeg')", backgroundSize: 'contain', padding: isMobile ? '40px 24px' : '80px 60px' }}>
          <div className='border border-primary rounded-2xl p-6 bg-card' style={{ margin: '0 auto', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '350px 1fr', gap: isMobile ? 32 : 60, alignItems: 'center' }}>
            <MotionFade direction="up" delay={0.15}>
              <div style={{ textAlign: ar ? 'right' : 'left' }}>
                <h2 style={{ fontSize: isMobile ? 26 : 30, fontWeight: 700, color: 'var(--primary)', margin: '0 0 12px' }}>
                  {t('Trusted by Innovators', 'موثوق من المبتكرين')}
                </h2>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.7 }}>
                  {t('Building the future of AI-powered healthcare together.', 'نبني مستقبل الرعاية الصحية بالذكاء الاصطناعي معاً.')}
                </p>
              </div>
            </MotionFade>
            <MotionFade direction="up" delay={0.25}>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: 20 }}>
                {[
                  { number: '100+', label: t('Hospitals & Partners', 'مستشفى وشريك') },
                  { number: '4,500+', label: t('Scans Analyzed', 'فحص تم تحليله') },
                  { number: '150+', label: t('Researchers & Doctors', 'باحث وطبيب') },
                ].map((item, index) => {
                  const CURRENT_IMAGE = CARDS_IMAGES[index];
                  return (
                    <div key={item.label} style={{ backgroundImage: `url(${CURRENT_IMAGE})`, backgroundSize: 'cover', backgroundPosition: 'center', borderRadius: 18, padding: '24px', textAlign: 'center', boxShadow: '0 4px 16px var(--shadow-main)', position: 'relative', overflow: 'hidden' }}>
                      <div className='flex flex-col gap-4' style={{ position: 'relative', zIndex: 1 }}>
                        <div style={{ fontSize: 30, fontWeight: 900, color: 'white', lineHeight: 1 }}>{item.number}</div>
                        <div style={{ fontSize: 11, color: '#ddd', fontWeight: 600 }}>{item.label}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </MotionFade>
          </div>
        </div>

        {/* Section 8 — Take the First Step */}
				<div style={{padding: isMobile ? '40px 24px' : '80px 60px'}}>
		     <div className="rounded-2xl mx-auto" style={{ backgroundImage: "url('/images/home/early-detection-section.png')", maxWidth: 1040, padding: isMobile ? '60px 24px' : '80px 60px', backgroundSize: 'cover', position: 'relative', overflow: 'hidden' }}>
		          <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 40, flexDirection: isMobile ? 'column' : 'row', textAlign: isMobile ? 'center' : ar ? 'right' : 'left' }}>
		            <div style={{ flex: 1 }}>
		              <h2 style={{ fontSize: isMobile ? 30 : 38, fontWeight: 900, color: 'white', margin: '0 0 12px' }}>
		                {t('Take the First Step', 'اتخذ الخطوة الأولى')}
		              </h2>
		              <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.8)', margin: '0 0 28px', maxWidth: 480 }}>
		                {t('Early detection can change everything.', 'الكشف المبكر يمكن أن يغير كل شيء.')}
		              </p>
		              <Link className='text-primary bg-white' to="/upload" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, borderRadius: 12, padding: '16px 34px', fontWeight: 800, fontSize: 15, textDecoration: 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.2)', transition: 'all 0.3s' }}
		                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.3)'; }}
		                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.2)'; }}
		              >
		                {t('Start Free Analysis', 'ابدأ التحليل مجاناً')}
		                <HiArrowRight size={18} style={{ transform: ar ? 'scaleX(-1)' : 'none' }} />
		              </Link>
		            </div>
		            {!isMobile && (
		              <div style={{ flexShrink: 0, width: 200, height: 200, position: 'relative' }}>
		                <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%' }}>
		                  <circle cx="50" cy="50" r="3" fill="rgba(255,255,255,0.3)" />
		                  <circle cx="30" cy="30" r="2" fill="rgba(255,255,255,0.2)" />
		                  <circle cx="70" cy="30" r="2" fill="rgba(255,255,255,0.2)" />
		                  <circle cx="30" cy="70" r="2" fill="rgba(255,255,255,0.2)" />
		                  <circle cx="70" cy="70" r="2" fill="rgba(255,255,255,0.2)" />
		                  <line x1="50" y1="50" x2="30" y2="30" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />
		                  <line x1="50" y1="50" x2="70" y2="30" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />
		                  <line x1="50" y1="50" x2="30" y2="70" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />
		                  <line x1="50" y1="50" x2="70" y2="70" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />
		                  <line x1="30" y1="30" x2="70" y2="30" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" />
		                  <line x1="30" y1="70" x2="70" y2="70" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" />
		                  <circle cx="50" cy="50" r="15" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
		                  <circle cx="50" cy="50" r="25" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />
		                </svg>
		              </div>
		            )}
		          </div>
		        </div>
        </div>

        <style>{`@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=Cairo:wght@400;600;700;800;900&display=swap');`}</style>
      </div>
    </MotionPageTransition>
  );
}
