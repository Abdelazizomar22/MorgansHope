import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MotionFade } from '../components/animations/MotionFade';
import { MotionStaggerList } from '../components/animations/MotionStaggerList';
import { MotionHoverScale } from '../components/animations/MotionHoverScale';
import { MotionPageTransition } from '../components/animations/MotionPageTransition';

interface HomePageProps { lang: 'en' | 'ar'; }

// ── SVG Icon Components ───────────────────────────────────────────────────────
const IconCloudUpload = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 16 12 12 8 16" /><line x1="12" y1="12" x2="12" y2="21" />
    <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
  </svg>
);
const IconBrainCircuit = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="5" r="1.5" /><circle cx="5" cy="12" r="1.5" /><circle cx="19" cy="12" r="1.5" /><circle cx="12" cy="19" r="1.5" /><circle cx="12" cy="12" r="2.5" />
    <line x1="12" y1="6.5" x2="12" y2="9.5" /><line x1="6.5" y1="12" x2="9.5" y2="12" /><line x1="14.5" y1="12" x2="17.5" y2="12" /><line x1="12" y1="14.5" x2="12" y2="17.5" />
    <line x1="14" y1="10" x2="17.5" y2="13.5" /><line x1="6.5" y1="13.5" x2="10" y2="10" />
  </svg>
);
const IconFileText = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" />
  </svg>
);
const IconCpu = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="4" width="16" height="16" rx="2" /><rect x="9" y="9" width="6" height="6" />
    <line x1="9" y1="1" x2="9" y2="4" /><line x1="15" y1="1" x2="15" y2="4" />
    <line x1="9" y1="20" x2="9" y2="23" /><line x1="15" y1="20" x2="15" y2="23" />
    <line x1="20" y1="9" x2="23" y2="9" /><line x1="20" y1="14" x2="23" y2="14" />
    <line x1="1" y1="9" x2="4" y2="9" /><line x1="1" y1="14" x2="4" y2="14" />
  </svg>
);
const IconZap = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);
const IconFileReport = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
    <line x1="10" y1="9" x2="8" y2="9" />
  </svg>
);
const IconHospitalPin = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <line x1="9" y1="22" x2="9" y2="12" /><line x1="15" y1="22" x2="15" y2="12" />
    <line x1="9" y1="12" x2="15" y2="12" /><line x1="12" y1="9" x2="12" y2="15" />
  </svg>
);
const IconShield = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);
const IconGlobe = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);
const IconTarget = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#e67e22" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" />
  </svg>
);

function useCounter(target: number, duration = 1800, trigger: boolean) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!trigger) return;
    let start: number | null = null;
    const step = (ts: number) => {
      if (!start) start = ts;
      const prog = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - prog, 3);
      setVal(Math.round(eased * target));
      if (prog < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [trigger]);
  return val;
}

function SurvivalBar({ label, pct, color, delay = 0, trigger }: { label: string; pct: number; color: string; delay?: number; trigger: boolean }) {
  const [w, setW] = useState(0);
  useEffect(() => {
    if (!trigger) return;
    const tm = setTimeout(() => setW(pct), delay);
    return () => clearTimeout(tm);
  }, [trigger, pct, delay]);
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
        <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-main)' }}>{label}</span>
        <span style={{ fontSize: 13, fontWeight: 800, color }}>{pct}%</span>
      </div>
      <div style={{ height: 10, background: 'var(--card-border)', borderRadius: 99, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${w}%`, background: color, borderRadius: 99, transition: `width 1.3s cubic-bezier(.4,0,.2,1) ${delay}ms` }} />
      </div>
    </div>
  );
}

export default function HomePage({ lang }: HomePageProps) {
  const { user } = useAuth();
  const ar = lang === 'ar';
  const t = (en: string, arText: string) => ar ? arText : en;

  const statsRef = useRef<HTMLDivElement>(null);
  const survivalRef = useRef<HTMLDivElement>(null);
  const [sTrig, setSTrig] = useState(false);
  const [vTrig, setVTrig] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.target === statsRef.current && e.isIntersecting) setSTrig(true);
        if (e.target === survivalRef.current && e.isIntersecting) setVTrig(true);
      });
    }, { threshold: 0.25 });
    if (statsRef.current) obs.observe(statsRef.current);
    if (survivalRef.current) obs.observe(survivalRef.current);
    return () => obs.disconnect();
  }, []);

  const c1 = useCounter(9986, 1600, sTrig);
  const c2 = useCounter(6, 1000, sTrig);
  const c3 = useCounter(99, 1400, sTrig);
  const c4 = useCounter(50000, 1800, sTrig);

  const SURVIVAL = [
    { label: t('Stage I  — 5-year survival', 'المرحلة الأولى — بقاء 5 سنوات'), pct: 68, color: '#22c55e', delay: 0 },
    { label: t('Stage II — 5-year survival', 'المرحلة الثانية — بقاء 5 سنوات'), pct: 35, color: '#e67e22', delay: 180 },
    { label: t('Stage III— 5-year survival', 'المرحلة الثالثة — بقاء 5 سنوات'), pct: 16, color: '#ef4444', delay: 360 },
    { label: t('Stage IV — 5-year survival', 'المرحلة الرابعة — بقاء 5 سنوات'), pct: 5, color: '#7f1d1d', delay: 540 },
  ];

  const DONUT_DATA = [
    { label: t('Adenocarcinoma', 'أدينوكارسينوما'), pct: 35, color: '#e67e22' },
    { label: t('Squamous Cell', 'خلايا حرشفية'), pct: 30, color: '#ef4444' },
    { label: t('Small Cell', 'خلايا صغيرة'), pct: 15, color: '#6366f1' },
    { label: t('Large Cell', 'خلايا كبيرة'), pct: 10, color: '#3b82f6' },
    { label: t('Other', 'أخرى'), pct: 10, color: '#94a3b8' },
  ];
  const circ = 2 * Math.PI * 40;
  let acc = 0;
  const slices = DONUT_DATA.map(d => {
    const off = acc;
    const dash = (d.pct / 100) * circ;
    acc += dash;
    return { ...d, off, dash };
  });

  const EGYPT_CARDS = [
    { val: '~7,600', label: t('New cases/year in Egypt (GLOBOCAN)', 'حالة جديدة سنوياً في مصر (GLOBOCAN)'), color: '#ef4444', bg: '#fff1f2', flag: 'EG' },
    { val: '#1', label: t('Global cause of cancer death in men', 'السبب العالمي لوفيات السرطان عند الرجال'), color: '#e67e22', bg: '#fff8f1', flag: '1st' },
    { val: '80%', label: t('Cases linked to smoking', 'الحالات مرتبطة بالتدخين'), color: '#7c3aed', bg: '#f5f3ff', flag: '~' },
    { val: '70-75%', label: t('Diagnosed at late stage (NCI Egypt)', 'تُشخَّص في مراحل متأخرة (NCI Egypt)'), color: '#3b82f6', bg: '#eff6ff', flag: '!' },
  ];

  const FEATURES = [
    { Icon: IconCpu, title: t('Dual AI Models', 'نموذجان AI'), desc: t('Specialized algorithms for CT and X-Ray scans', 'خوارزميات مخصصة لصور CT والأشعة السينية') },
    { Icon: IconZap, title: t('Batch Scanning', 'رفع متعدد'), desc: t('Fast deep learning inference on multiple scans at once', 'تحليل سريع لأكثر من صورة في نفس الوقت') },
    { Icon: IconFileReport, title: t('PDF Reports', 'تقارير PDF'), desc: t('Detailed printable medical report', 'تقرير طبي مفصّل قابل للطباعة') },
    { Icon: IconHospitalPin, title: t('Hospital Finder', 'مُوجِّه المستشفيات'), desc: t('Nearest oncology centers in Egypt', 'أقرب مراكز الأورام في مصر') },
    { Icon: IconGlobe, title: t('AI Medical Chatbot', 'مساعد طبي ذكي'), desc: t('Instant answers to your medical queries', 'إجابات فورية لاستفساراتك الطبية') },
    { Icon: IconShield, title: t('Privacy First', 'خصوصيتك أولاً'), desc: t('Your scans are encrypted and never shared with third parties', 'صورك مشفّرة ولا تُشارك مع أي طرف خارجي') },
  ];

  // Shared section heading style
  const SectionHeading = ({ en, ar: arText, sub, enSub, arSub }: { en: string; ar: string; sub?: boolean; enSub?: string; arSub?: string }) => (
    <div style={{ textAlign: 'center', marginBottom: sub ? 44 : 40 }}>
      <h2 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-main)', margin: '0 0 8px', letterSpacing: -0.4 }}>{t(en, arText)}</h2>
      {enSub && <p style={{ color: 'var(--text-muted)', fontSize: 14.5, margin: 0 }}>{t(enSub, arSub || '')}</p>}
    </div>
  );

  return (
    <MotionPageTransition>
      <div dir={ar ? 'rtl' : 'ltr'} style={{ fontFamily: ar ? "'Cairo', sans-serif" : "'Sora', sans-serif", background: 'var(--bg-main)', minHeight: '100vh', color: 'var(--text-main)' }}>

        {/* ══ HERO ══════════════════════════════════════════════════════════ */}
        <section style={{ background: 'var(--bg-main)', color: 'var(--text-main)', padding: '90px 40px 110px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          {/* Grid */}
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(var(--card-border) 1px, transparent 1px), linear-gradient(90deg, var(--card-border) 1px, transparent 1px)', backgroundSize: '44px 44px', opacity: 0.5 }} />
          {/* Glow */}
          <div style={{ position: 'absolute', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, var(--shadow-main) 0%, transparent 70%)', top: '-10%', left: '30%', pointerEvents: 'none' }} />
          {[300, 480, 660].map((s, i) => (
            <div key={i} style={{ position: 'absolute', top: '50%', left: '50%', width: s, height: s, borderRadius: '50%', border: '1px solid var(--card-border)', transform: 'translate(-50%,-50%)', pointerEvents: 'none' }} />
          ))}

          <div style={{ position: 'relative', maxWidth: 700, margin: '0 auto' }}>
            <MotionFade direction="up" delay={0.1}>
              <h1 style={{ fontSize: 48, fontWeight: 900, margin: '0 0 12px', lineHeight: 1.15, letterSpacing: -1.5 }}>
                <span style={{ color: 'var(--hero-text-1)' }}>{t('Early Detection', 'الكشف المبكر')}</span>{' '}
                <span style={{ color: 'var(--hero-text-2)' }}>{t('Saves Lives', 'ينقذ الأرواح')}</span>
              </h1>
              <div style={{ marginBottom: 40 }}>
                <p style={{ fontSize: 14.5, color: 'var(--text-muted)', fontStyle: 'italic', margin: '0 0 28px', letterSpacing: 0.3 }}>
                  {t('"Morgan’s Hope: A Second Chance for Every Breath." — Inspired by a legend, built for reality.', '"مورجان هوب: فرصة ثانية لكل نَفَس." — مستوحى من أسطورة، ومبني للواقع.')}
                </p>
                <p style={{ fontSize: 16, color: 'var(--text-main)', margin: '0 0 0', lineHeight: 1.85, maxWidth: 600, marginLeft: 'auto', marginRight: 'auto' }}>
                  {t('Like Arthur Morgan facing an invisible enemy, lung disease is a quiet battle. Our mission is to tip the scales in your favor. Upload your CT scan or X-Ray and get an AI-powered lung cancer analysis in a very short time.', 'مثلما واجه آرثر مورجان عدواً خفياً، فإن مرض الرئة هو معركة صامتة. مهمتنا هي ترجيح الكفة لصالحك. ارفع صورتك لتحليل سرطان الرئة بالذكاء الاصطناعي في وقت قصير جداً.')}
                </p>
              </div>
            </MotionFade>
            <MotionFade direction="up" delay={0.2}>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginTop: 12 }}>
                <MotionHoverScale style={{ display: 'inline-flex' }}>
                  <Link to={user ? '/upload' : '/register'} style={{ padding: '14px 34px', background: 'var(--primary)', color: 'white', borderRadius: 10, textDecoration: 'none', fontWeight: 700, fontSize: 15.5, boxShadow: '0 4px 20px var(--shadow-main)', letterSpacing: 0.2, display: 'inline-flex', alignItems: 'center', gap: 8, transition: 'transform 0.2s, background 0.2s' }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.background = 'var(--primary-dark)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.background = 'var(--primary)'; }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 16 12 12 8 16" /><line x1="12" y1="12" x2="12" y2="21" /><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" /></svg>
                    {t('Start Free Analysis', 'ابدأ التحليل مجاناً')}
                  </Link>
                </MotionHoverScale>
                <MotionHoverScale style={{ display: 'inline-flex' }}>
                  <Link to="/about" style={{ padding: '14px 26px', background: 'var(--card-bg)', color: 'var(--text-main)', borderRadius: 10, textDecoration: 'none', fontWeight: 700, fontSize: 14.5, border: '1.5px solid var(--card-border)', transition: 'background 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--primary-light)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'var(--card-bg)'}
                  >
                    {t('About Us', 'من نحن')}
                  </Link>
                </MotionHoverScale>
              </div>
            </MotionFade>
          </div>
        </section>

        {/* ══ STATS BAR ═════════════════════════════════════════════════════ */}
        <section ref={statsRef} style={{ background: 'var(--card-bg)', boxShadow: '0 2px 12px var(--shadow-main)', padding: '28px 40px', borderBottom: '1px solid var(--card-border)' }}>
          <div style={{ maxWidth: 1040, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(5,1fr)' }}>
            {[
              { val: '99.86%', label: t('CT Scan Accuracy', 'دقة CT Scan') },
              { val: '6', label: t('Cancer Types', 'أنواع السرطان') },
              { val: '15K+', label: t('Training Images', 'صورة تدريب') },
              { val: '1,200+', label: t('Scans Analyzed', 'فحص تم تحليله') },
              { val: '<4s', label: t('Avg Analysis Time', 'متوسط وقت التحليل') },
            ].map((s, i) => (
              <div key={i} style={{ textAlign: 'center', padding: '0 16px', borderRight: i < 4 ? '1px solid var(--card-border)' : 'none' }}>
                <div style={{ fontSize: 28, fontWeight: 900, color: 'var(--primary)', lineHeight: 1.1, letterSpacing: -0.5 }}>{s.val}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 5, fontWeight: 700 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ══ EGYPT STATS ═══════════════════════════════════════════════════ */}
        <section style={{ padding: '72px 40px 0', maxWidth: 1060, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--card-bg)', border: '1px solid var(--card-border)', color: 'var(--text-main)', borderRadius: 99, padding: '5px 16px', fontSize: 11.5, fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase' as const, marginBottom: 14 }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><circle cx="12" cy="16" r=".5" fill="currentColor" /></svg>
              {t('Egypt — Real Statistics', 'مصر — إحصائيات حقيقية')}
            </div>
            <h2 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-main)', margin: '0 0 8px', letterSpacing: -0.4 }}>{t('Lung Cancer in Egypt', 'سرطان الرئة في مصر')}</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 14.5, maxWidth: 480, margin: '0 auto' }}>{t('Real data — why AI-powered early screening is critical.', 'بيانات حقيقية — لماذا الفحص المبكر بالذكاء الاصطناعي بالغ الأهمية.')}</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 18, marginBottom: 48 }}>
            {EGYPT_CARDS.map((c, i) => (
              <div key={i} style={{ background: 'var(--card-bg)', borderRadius: 16, padding: '24px 18px', textAlign: 'center', border: '1px solid var(--card-border)', boxShadow: '0 2px 10px var(--shadow-main)' }}>
                <div style={{ fontSize: 28, fontWeight: 800, color: c.color, lineHeight: 1, marginBottom: 8 }}>{c.val}</div>
                <div style={{ fontSize: 12.5, color: 'var(--text-muted)', lineHeight: 1.55, fontWeight: 500 }}>{c.label}</div>
              </div>
            ))}
          </div>

          {/* Survival + Donut */}
          <div ref={survivalRef} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 32 }}>
            <div style={{ background: 'var(--card-bg)', borderRadius: 16, padding: '28px 28px', border: '1px solid var(--card-border)', boxShadow: '0 2px 10px var(--shadow-main)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>
                <h3 style={{ fontWeight: 800, color: 'var(--text-main)', fontSize: 16, margin: 0 }}>{t('5-Year Survival Rate by Stage', 'معدل البقاء 5 سنوات حسب المرحلة')}</h3>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: 12, margin: '0 0 20px' }}>{t('Source: US SEER Data / IARC Global Statistics', 'المصدر: بيانات US SEER / إحصائيات IARC العالمية')}</p>
              {SURVIVAL.map((s, i) => <SurvivalBar key={i} {...s} trigger={vTrig} />)}
              <div style={{ marginTop: 16, background: 'var(--primary)', borderRadius: 10, padding: '12px 14px', border: '1px solid var(--card-border)', boxShadow: 'inset 0 1px 4px rgba(0,0,0,0.1)' }}>
                <p style={{ fontSize: 12.5, color: '#ffffff', margin: 0, fontWeight: 600, lineHeight: 1.6 }}>
                  {t('Stage I detection = 13× higher survival than Stage IV. Every scan matters.', 'اكتشاف المرحلة الأولى = فرصة بقاء أعلى 13 مرة من المرحلة الرابعة. كل صورة مهمة.')}
                </p>
              </div>
            </div>

            <div style={{ background: 'var(--card-bg)', borderRadius: 16, padding: '28px 28px', border: '1px solid var(--card-border)', boxShadow: '0 2px 10px var(--shadow-main)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                <h3 style={{ fontWeight: 800, color: 'var(--text-main)', fontSize: 16, margin: 0 }}>{t('Global Cancer Type Distribution', 'توزيع أنواع السرطان عالمياً')}</h3>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: 12, margin: '0 0 20px' }}>{t('Global lung cancer histology', 'تشريح سرطان الرئة عالمياً')}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                <svg viewBox="0 0 100 100" width={136} height={136} style={{ flexShrink: 0 }}>
                  {slices.map((s, i) => (
                    <circle key={i} cx="50" cy="50" r={40} fill="none" stroke={s.color} strokeWidth={18}
                      strokeDasharray={`${s.dash} ${circ - s.dash}`} strokeDashoffset={-s.off}
                      style={{ transform: 'rotate(-90deg)', transformOrigin: '50px 50px' }} />
                  ))}
                  <text x="50" y="47" textAnchor="middle" style={{ fontSize: 7.5, fontWeight: 'bold', fill: 'var(--text-main)' }}>{t('Lung', 'رئة')}</text>
                  <text x="50" y="57" textAnchor="middle" style={{ fontSize: 7.5, fontWeight: 'bold', fill: 'var(--primary)' }}>{t('Cancer', 'سرطان')}</text>
                </svg>
                <div style={{ flex: 1 }}>
                  {DONUT_DATA.map((d, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 9 }}>
                      <div style={{ width: 10, height: 10, borderRadius: 2, background: d.color, flexShrink: 0 }} />
                      <span style={{ fontSize: 12.5, color: 'var(--text-main)', flex: 1 }}>{d.label}</span>
                      <span style={{ fontSize: 12.5, fontWeight: 800, color: d.color }}>{d.pct}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Impact banner */}
          <div style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)', borderRadius: 18, padding: '28px 36px', color: 'white', display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap', marginBottom: 80, border: '1px solid var(--card-border)' }}>
            <div style={{ flexShrink: 0 }}><IconTarget /></div>
            <div style={{ flex: 1, minWidth: 260 }}>
              <h3 style={{ fontSize: 19, fontWeight: 800, margin: '0 0 10px', letterSpacing: -0.3 }}>{t('Why Early Detection Matters', 'لماذا الكشف المبكر مهم؟')}</h3>
              <p style={{ fontSize: 14, opacity: 0.85, lineHeight: 1.8, margin: 0 }}>
                {t("In Egypt, ~70-75% of lung cancer cases are diagnosed at Stage III or IV. AI-powered early screening can catch abnormalities before symptoms appear, shifting the diagnosis to Stage I where 68% of patients survive 5+ years (US SEER data).", 'في مصر، ~70-75% من حالات سرطان الرئة تُكتشف في المرحلة الثالثة أو الرابعة. الفحص بالذكاء الاصطناعي يكتشف الشذوذات قبل الأعراض ويحوّل التشخيص للمرحلة الأولى حيث 68% من المرضى يبقون 5 سنوات أو أكثر (بيانات US SEER).')}
              </p>
            </div>
            <Link to={user ? '/upload' : '/register'} style={{ padding: '13px 26px', background: '#F8FAFC', color: 'var(--primary-dark)', borderRadius: 10, textDecoration: 'none', fontWeight: 800, fontSize: 14.5, whiteSpace: 'nowrap', boxShadow: '0 4px 16px var(--shadow-main)', transition: 'all 0.2s', border: '1px solid #e2e8f0' }}
              onMouseEnter={e => { e.currentTarget.style.background = '#ffffff'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#F8FAFC'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              {t('Get Screened Now', 'احصل على فحصك الآن')}
            </Link>
          </div>
        </section >

        {/* ══ HOW IT WORKS ══════════════════════════════════════════════════ */}
        < section style={{ padding: '0 40px 80px', background: 'var(--bg-main)' }
        }>
          <div style={{ maxWidth: 920, margin: '0 auto' }}>
            <div style={{ paddingTop: 64, textAlign: 'center', marginBottom: 48 }}>
              <h2 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-main)', margin: '0 0 8px', letterSpacing: -0.4 }}>{t('How It Works', 'كيف يعمل النظام')}</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: 14.5, margin: 0 }}>{t('3 steps to your AI lung report', '3 خطوات للحصول على تقريرك الطبي')}</p>
            </div>
            <MotionStaggerList staggerDelay={0.15} style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 22 }}>
              {[
                { n: 1, Icon: IconCloudUpload, title: t('Upload Scan', 'رفع الصورة'), desc: t('CT or X-Ray image (JPG/PNG/WebP, max 10MB)', 'صورة CT أو أشعة سينية (JPG/PNG/WebP، حتى 10MB)') },
                { n: 2, Icon: IconBrainCircuit, title: t('AI Analysis', 'التحليل بالذكاء الاصطناعي'), desc: t('Advanced deep learning model analyzes your scans quickly', 'نموذج ذكاء اصطناعي متقدم يحلل الصور بسرعة') },
                { n: 3, Icon: IconFileText, title: t('Get Report', 'استلام التقرير'), desc: t('PDF report with urgency level & hospital guidance', 'تقرير PDF مع مستوى الخطورة وإرشادات المستشفيات') },
              ].map(s => (
                <div key={s.n} style={{ height: '100%', textAlign: 'center', background: 'var(--card-bg)', borderRadius: 16, padding: '36px 24px', border: '1px solid var(--card-border)', boxShadow: '0 2px 8px var(--shadow-main)' }}>
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16, padding: '14px', background: 'var(--bg-main)', color: 'var(--primary-dark)', borderRadius: '50%', width: 64, margin: '0 auto 16px' }}><s.Icon /></div>
                  <h3 style={{ fontWeight: 800, color: 'var(--text-main)', margin: '0 0 10px', fontSize: 16 }}>{s.title}</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: 13, lineHeight: 1.7, margin: 0 }}>{s.desc}</p>
                </div>
              ))}
            </MotionStaggerList>
          </div>
        </section >

        {/* ══ FEATURES ══════════════════════════════════════════════════════ */}
        < section style={{ padding: '60px 40px 80px' }}>
          <div style={{ maxWidth: 1040, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 44 }}>
              <h2 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-main)', margin: '0 0 8px', letterSpacing: -0.4 }}>{t("Why Morgan's Hope?", 'لماذا مورجان هوب؟')}</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: 14.5, margin: 0 }}>{t('Cutting-edge AI meets compassionate medical guidance', 'ذكاء اصطناعي متطور مع إرشادات طبية رحيمة')}</p>
            </div>
            <MotionStaggerList staggerDelay={0.1} style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 18 }}>
              {FEATURES.map(({ Icon, title, desc }, i) => (
                <div key={i} style={{ height: '100%', background: 'var(--card-bg)', borderRadius: 14, padding: '24px 20px', border: '1px solid var(--card-border)', boxShadow: '0 2px 8px var(--shadow-main)', transition: 'box-shadow 0.2s, transform 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 6px 22px var(--shadow-hover)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 2px 8px var(--shadow-main)'; e.currentTarget.style.transform = 'none'; }}
                >
                  <div style={{ marginBottom: 16, padding: 12, background: 'var(--bg-main)', color: 'var(--primary-dark)', borderRadius: '50%', display: 'inline-flex' }}><Icon /></div>
                  <h4 style={{ fontWeight: 800, color: 'var(--text-main)', margin: '0 0 7px', fontSize: 14.5 }}>{title}</h4>
                  <p style={{ color: 'var(--text-muted)', fontSize: 13, lineHeight: 1.65, margin: 0 }}>{desc}</p>
                </div>
              ))}
            </MotionStaggerList>
          </div>
        </section >

        {/* ══ FUTURE VISION ════════════════════════════════════════════════ */}
        < section style={{ padding: '0 40px 80px' }}>
          <div style={{ maxWidth: 920, margin: '0 auto', background: 'var(--card-bg)', borderRadius: 20, padding: '44px', border: '1.5px dashed var(--primary-dark)', position: 'relative', overflow: 'hidden', boxShadow: '0 2px 10px var(--shadow-main)' }}>
            <div style={{ position: 'absolute', top: -20, right: -20, width: 120, height: 120, borderRadius: '50%', background: 'radial-gradient(circle, var(--shadow-main) 0%, transparent 70%)', pointerEvents: 'none' }} />
            <div style={{ position: 'relative' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--card-bg)', border: '1px solid var(--card-border)', color: 'var(--text-main)', borderRadius: 99, padding: '5px 14px', fontSize: 11, fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase' as const, marginBottom: 16 }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                {t('Future Vision', 'الرؤية المستقبلية')}
              </div>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-main)', margin: '0 0 12px', letterSpacing: -0.3 }}>
                {t('Beyond Lung Cancer — A Complete Chest Diagnostic Platform', 'ما وراء سرطان الرئة — منصة تشخيص صدر متكاملة')}
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: 14, lineHeight: 1.8, margin: '0 0 26px', maxWidth: 640 }}>
                {t("Morgan's Hope currently focuses on lung cancer, but our vision is much bigger. Future versions will expand to cover all major chest and respiratory conditions.", "مورجان هوب تركز حالياً على سرطان الرئة، لكن رؤيتنا أكبر. ستتوسع الإصدارات القادمة لتغطي جميع أمراض الصدر والجهاز التنفسي الرئيسية.")}
              </p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {[
                  { en: 'Lung Cancer (Current)', ar: 'سرطان الرئة (الحالي)', current: true },
                  { en: 'Pneumonia Detection', ar: 'كشف الالتهاب الرئوي', current: false },
                  { en: 'Tuberculosis', ar: 'مرض السل', current: false },
                  { en: 'COPD Analysis', ar: 'الانسداد الرئوي', current: false },
                  { en: 'Pulmonary Fibrosis', ar: 'التليف الرئوي', current: false },
                  { en: 'Cardiac Conditions', ar: 'أمراض القلب', current: false },
                ].map((c, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, background: c.current ? 'var(--card-bg)' : 'transparent', borderRadius: 99, padding: '7px 14px', border: `1.5px solid ${c.current ? 'var(--primary)' : 'var(--card-border)'}`, fontSize: 12.5, fontWeight: c.current ? 800 : 500, color: c.current ? 'var(--text-main)' : '#8A8F8D', boxShadow: c.current ? '0 2px 8px var(--shadow-main)' : 'none' }}>
                    {ar ? c.ar : c.en}
                    {c.current
                      ? <span style={{ fontSize: 10.5, background: 'var(--primary)', color: 'white', borderRadius: 99, padding: '2px 9px', fontWeight: 800 }}>Live</span>
                      : <span style={{ fontSize: 10, background: 'transparent', color: '#8A8F8D', borderRadius: 99, padding: '2px 9px', fontWeight: 600, border: '1px solid #e2e8f0' }}>{t('Soon', 'قريباً')}</span>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section >

        {/* ══ CTA ════════════════════════════════════════════════════════════ */}
        < section style={{ padding: '80px 40px', background: 'var(--bg-main)', textAlign: 'center', color: 'var(--text-main)', borderTop: '1px solid var(--card-border)' }}>
          <h2 style={{ fontSize: 34, fontWeight: 900, margin: '0 0 14px', letterSpacing: -0.5 }}>{t('Start Your Free Analysis Today', 'ابدأ تحليلك المجاني اليوم')}</h2>
          <p style={{ fontSize: 15.5, color: 'var(--text-muted)', margin: '0 0 38px', maxWidth: 480, marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.8 }}>
            {t("Don't wait for symptoms. Early detection dramatically improves survival rates.", 'لا تنتظر الأعراض. الكشف المبكر يحسن فرص البقاء بشكل كبير.')}
          </p>
          <MotionHoverScale style={{ display: 'inline-block' }}>
            <Link to={user ? '/upload' : '/register'} style={{ padding: '15px 40px', background: 'var(--primary)', color: 'white', borderRadius: 10, textDecoration: 'none', fontWeight: 700, fontSize: 16, boxShadow: '0 4px 22px var(--shadow-main)', display: 'inline-block', letterSpacing: 0.2, transition: 'background 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--primary-dark)'}
              onMouseLeave={e => e.currentTarget.style.background = 'var(--primary)'}
            >
              {user ? t('Upload a Scan', 'رفع صورة الآن') : t('Get Started Free', 'ابدأ مجاناً')}
            </Link>
          </MotionHoverScale>
        </section >

        <style>{`@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=Cairo:wght@400;600;700;800;900&display=swap');`}</style>
      </div>
    </MotionPageTransition>
  );
}
