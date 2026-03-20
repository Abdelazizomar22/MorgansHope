import { useState } from 'react';

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

export function AboutPage({ lang }: AboutPageProps) {
  const ar = lang === 'ar';
  const t = (en: string, arText: string) => ar ? arText : en;

  return (
    <div dir={ar ? 'rtl' : 'ltr'} style={{ minHeight: '100vh', background: 'var(--bg-main)', color: 'var(--text-main)', fontFamily: ar ? "'Cairo', sans-serif" : "'Sora', sans-serif", position: 'relative', overflow: 'hidden' }}>

      {/* Watermark Logo */}
      <Watermark />

      {/* Hero */}
      <section style={{ background: 'linear-gradient(160deg, var(--primary-dark) 0%, var(--primary) 60%, var(--primary-light) 100%)', color: 'white', padding: '70px 40px', textAlign: 'center', position: 'relative', zIndex: 1, overflow: 'hidden' }}>
        <h1 style={{ fontSize: 38, fontWeight: 900, margin: '0 0 8px', position: 'relative', zIndex: 2 }}>Morgan's <span style={{ opacity: 0.9 }}>Hope</span></h1>
        <p style={{ fontSize: 17, fontStyle: 'italic', opacity: 0.95, margin: '0 0 16px', position: 'relative', zIndex: 2 }}>
          {t('"Legacy of Care, Vision of Hope."', '"إرث من الرعاية، ورؤية من الأمل."')}
        </p>

      </section>

      {/* Main Content */}
      <section style={{ padding: '70px 40px', maxWidth: 960, margin: '0 auto', position: 'relative', zIndex: 1 }}>

        {/* The Story Behind the Name */}
        <div style={{ background: 'var(--card-bg)', borderRadius: 24, padding: '40px', marginBottom: 32, border: '1px solid var(--card-border)', boxShadow: '0 4px 20px var(--shadow-main)', textAlign: 'center' }}>
          <div style={{ marginBottom: 16, display: 'inline-flex', padding: 12, background: 'var(--primary)', borderRadius: 14, boxShadow: '0 2px 10px var(--shadow-main)' }}>
            {CARD_ICONS.shield}
          </div>
          <h2 style={{ fontSize: 28, fontWeight: 900, color: 'var(--text-main)', marginBottom: 16 }}>
            {t('The Story Behind "Morgan\'s Hope"', 'القصة وراء "مورجان هوب"')}
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 16, lineHeight: 1.8, maxWidth: 740, margin: '0 auto' }}>
            {t("Inspired by the legendary character Arthur Morgan, whose tragic battle with tuberculosis—a severe lung disease—left a lasting impact on millions. His story is a poignant reminder of how silent and devastating respiratory illnesses can be. Morgan's Hope was founded on the belief that early detection is the ultimate weapon against these invisible enemies. We built this AI platform to give patients the 'second chance' that many, like Arthur, never had.", "مستوحى من الشخصية الأسطورية آرثر مورجان، الذي ترك صراعه المأساوي مع مرض السل—وهو مرض رئوي حاد—أثراً لا يُنسى في ملايين الأشخاص. قصته هي تذكير مؤثر بمدى صمت وفتك أمراض الجهاز التنفسي. تأسس 'مورجان هوب' على إيمان بأن الكشف المبكر هو السلاح الأقوى ضد هذه الأعداء الخفية. لقد بنينا منصة الذكاء الاصطناعي هذه لمنح المرضى 'الفرصة الثانية' التي لم يحظَ بها الكثيرون، مثل آرثر.")}
          </p>
        </div>

        {/* Who we are */}
        <div style={{ background: 'var(--card-bg)', borderRadius: 24, padding: '40px', marginBottom: 32, border: '1px solid var(--card-border)', boxShadow: '0 4px 20px var(--shadow-main)', textAlign: 'center' }}>
          <div style={{ marginBottom: 16, display: 'inline-flex', padding: 12, background: 'var(--primary)', borderRadius: 14, boxShadow: '0 2px 10px var(--shadow-main)' }}>
            {CARD_ICONS.target}
          </div>
          <h2 style={{ fontSize: 28, fontWeight: 900, color: 'var(--text-main)', marginBottom: 16 }}>
            {t('Who we are?', 'من نحن؟')}
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 16, lineHeight: 1.8, maxWidth: 700, margin: '0 auto' }}>
            {t("Morgan's Hope aims to ease the patient's diagnostic journey using Artificial Intelligence. We provide a platform that seamlessly connects patients with cutting-edge medical imaging analysis, empowering early and accurate detection.", "مشروع مورجان هوب يستهدف التسهيل للمرضى باستخدام الذكاء الاصطناعي. نحن نقدم منصة تربط بسلاسة بين المرضى وتحليل الصور الطبية المتطور، لتمكين الكشف المبكر والدقيق.")}
            <br /><br />
            {t("Our latest features include a sophisticated AI Medical Chatbot for instant health guidance and a Batch Scanning system that processes multiple images simultaneously, saving valuable time.", "تشمل أحدث ميزاتنا مساعداً طبياً ذكياً للحصول على إرشادات صحية فورية، ونظام فحص للدفعات يعالج صوراً متعددة في نفس الوقت، مما يوفر وقتاً ثميناً.")}
          </p>
        </div>

        {/* Our Vision */}
        <div style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)', borderRadius: 24, padding: '40px', marginBottom: 50, color: 'white', textAlign: 'center', boxShadow: '0 10px 30px var(--shadow-main)' }}>
          <div style={{ marginBottom: 16, display: 'inline-flex', padding: 12, background: 'rgba(255,255,255,0.2)', borderRadius: 14 }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></svg>
          </div>
          <h2 style={{ fontSize: 28, fontWeight: 900, color: 'white', marginBottom: 16 }}>
            {t('Our Vision', 'رؤيتنا')}
          </h2>
          <p style={{ fontSize: 20, fontWeight: 700, margin: 0, letterSpacing: 0.5, textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            {t('"Making early detection of lung cancer accessible to everyone."', '"جعل التشخيص المبكر لسرطان الرئة متاحاً للجميع."')}
          </p>
        </div>

      </section>



      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=Cairo:wght@400;600;700;800;900&display=swap');

      `}</style>
    </div>
  );
}
