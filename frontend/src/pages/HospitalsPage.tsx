import { useState, useEffect } from 'react';
import { hospitalsApi } from '../utils/api';
import { REAL_HOSPITALS } from '../data/hospitals';

interface HospitalsPageProps { lang: 'en' | 'ar'; }

// Icons
const IconMapPin = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 4, verticalAlign: 'text-bottom' }}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>;
const IconBuilding = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 4, verticalAlign: 'text-bottom' }}><rect x="4" y="2" width="16" height="20" rx="2" ry="2" /><path d="M9 22v-4h6v4" /><path d="M8 6h.01" /><path d="M16 6h.01" /><path d="M12 6h.01" /><path d="M12 10h.01" /><path d="M12 14h.01" /><path d="M16 10h.01" /><path d="M16 14h.01" /><path d="M8 10h.01" /><path d="M8 14h.01" /></svg>;
const IconBed = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 4, verticalAlign: 'text-bottom' }}><path d="M2 4v16" /><path d="M2 8h18a2 2 0 0 1 2 2v10" /><path d="M2 17h20" /><path d="M6 8v9" /></svg>;
const IconPhone = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 4, verticalAlign: 'text-bottom' }}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>;
const IconGlobe = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 4, verticalAlign: 'text-bottom' }}><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>;
const IconMap = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 4, verticalAlign: 'text-bottom' }}><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" /><line x1="8" y1="2" x2="8" y2="18" /><line x1="16" y1="6" x2="16" y2="22" /></svg>;
const IconAlert = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 6, verticalAlign: 'text-bottom' }}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>;

const ALL_CITIES = ['All', 'Cairo', 'Alexandria', 'Mansoura', 'Assiut'];

export default function HospitalsPage({ lang }: HospitalsPageProps) {
  const ar = lang === 'ar';
  const t = (en: string, arText: string) => ar ? arText : en;

  const [search, setSearch] = useState('');
  const [cityF, setCityF] = useState('All');
  const [typeF, setTypeF] = useState('All');
  const [expanded, setExpanded] = useState<number | null>(null);

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    hospitalsApi.getAll({ limit: 50 }).catch(() => { });
  }, []);

  const filtered = REAL_HOSPITALS.filter(h => {
    const q = search.toLowerCase();
    const name = (ar ? h.hospitalNameAr : h.hospitalName).toLowerCase();
    const spec = (ar ? h.specializationAr : h.specialization).toLowerCase();
    const city = ar ? h.cityAr : h.city;
    return (!q || name.includes(q) || spec.includes(q) || city.toLowerCase().includes(q))
      && (cityF === 'All' || h.city === cityF)
      && (typeF === 'All' || h.type === typeF);
  });

  return (
    <div dir={ar ? 'rtl' : 'ltr'} style={{ minHeight: '100vh', background: 'var(--bg-main)', color: 'var(--text-main)', fontFamily: ar ? "'Cairo',sans-serif" : "'Sora',sans-serif" }}>

      {/* Header */}
      <div className={`section-bg-image page-header-padding ${isMobile ? "min-h-[160px]" : ""}`}>
        <h1 style={{ fontSize: 30, fontWeight: 900, margin: '0 0 6px', color: 'white' }}>
        	{t('Oncology Centers in Egypt', 'مراكز الأورام في مصر')}
        </h1>
        <p className='text-white' style={{ fontSize: 15, opacity: .8, margin: 0 }}>
        	{t('8 real hospitals — verified contact info, websites & booking links', '8 مستشفيات حقيقية — بيانات اتصال موثقة ومواقع وروابط حجز')}
        </p>
      </div>

      <div style={{ maxWidth: 980, margin: '0 auto', padding: isMobile ? '20px' : '28px 40px' }}>

        {/* Filters */}
        <div style={{ background: 'var(--card-bg)', borderRadius: 16, padding: '18px 20px', marginBottom: 24, border: '1px solid var(--card-border)', display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder={t('Search hospital or city...', 'ابحث باسم المستشفى أو المدينة...')}
            style={{ flex: 1, minWidth: 200, padding: '10px 14px', borderRadius: 10, border: '1.5px solid var(--card-border)', background: 'var(--bg-main)', color: 'var(--text-main)', fontSize: 14, fontFamily: 'inherit', outline: 'none' }}
            onFocus={e => e.target.style.borderColor = 'var(--primary)'} onBlur={e => e.target.style.borderColor = 'var(--card-border)'} />
          {ALL_CITIES.map(c => (
            <button key={c} onClick={() => setCityF(c)}
              style={{
                padding: '8px 14px', borderRadius: 99, border: '1px solid var(--card-border)', cursor: 'pointer', fontWeight: 700, fontSize: 13, fontFamily: 'inherit',
                background: cityF === c ? 'var(--primary)' : 'var(--bg-main)', color: cityF === c ? 'white' : 'var(--text-main)'
              }}>
              {c === 'All' ? t('All Cities', 'جميع المدن') : c}
            </button>
          ))}
          {['All', 'Government', 'Private'].map(tp => (
            <button key={tp} onClick={() => setTypeF(tp)}
              style={{
                padding: '8px 14px', borderRadius: 99, border: '1px solid var(--card-border)', cursor: 'pointer', fontWeight: 700, fontSize: 13, fontFamily: 'inherit',
                background: typeF === tp ? 'var(--primary)' : 'var(--bg-main)', color: typeF === tp ? 'white' : 'var(--text-main)'
              }}>
              {tp === 'All' ? t('All Types', 'الكل') : tp === 'Government' ? t('Gov.', 'حكومي') : t('Private', 'خاص')}
            </button>
          ))}
        </div>

        <p style={{ color: 'var(--text-muted)', fontSize: 13, margin: '0 0 18px', fontWeight: 600 }}>
          {filtered.length} {t('hospitals found', 'مستشفى')}
        </p>

        {/* Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {filtered.map(h => {
            const open = expanded === h.id;
            return (
              <div key={h.id} style={{ background: 'var(--card-bg)', borderRadius: 20, border: '1px solid var(--card-border)', boxShadow: '0 2px 12px var(--shadow-main)', overflow: 'hidden', transition: 'box-shadow .2s' }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = '0 6px 28px var(--shadow-hover)'}
                onMouseLeave={e => e.currentTarget.style.boxShadow = '0 2px 12px var(--shadow-main)'}>

                <div style={{ padding: isMobile ? '16px' : '22px 24px', display: 'flex', gap: 18, alignItems: isMobile ? 'center' : 'flex-start', flexDirection: isMobile ? 'column' : 'row' }}>
                  {/* Left icon */}
                  <div style={{ flexShrink: 0, textAlign: 'center' }}>
                    <div style={{ width: 56, height: 56, borderRadius: 14, background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 6, boxShadow: '0 2px 8px var(--shadow-main)' }}><svg width='28' height='28' viewBox='0 0 24 24' fill='none' stroke='white' strokeWidth='1.6' strokeLinecap='round' strokeLinejoin='round'><path d='M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z' /><line x1='9' y1='22' x2='9' y2='12' /><line x1='15' y1='22' x2='15' y2='12' /><line x1='9' y1='12' x2='15' y2='12' /><line x1='12' y1='9' x2='12' y2='15' /></svg></div>
                    <span style={{ display: 'block', fontSize: 10, fontWeight: 800, color: h.type === 'Private' ? '#22c55e' : 'white', background: 'var(--primary)', borderRadius: 99, padding: '2px 8px' }}>
                      {h.type === 'Government' ? t('Gov.', 'حكومي') : t('Private', 'خاص')}
                    </span>
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, width: isMobile ? '100%' : 'auto' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, flexWrap: 'wrap', marginBottom: 5 }}>
                      <h3 style={{ fontWeight: 900, color: 'var(--text-main)', margin: 0, fontSize: 16, lineHeight: 1.3 }}>
                        {ar ? h.hospitalNameAr : h.hospitalName}
                      </h3>
                      <span style={{ fontSize: 11, fontWeight: 800, background: h.badgeColor, color: 'white', opacity: 0.9, borderRadius: 99, padding: '3px 10px', flexShrink: 0 }}>
                        {h.badge}
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 10 }}>
                      <span style={{ background: 'var(--primary)', color: 'white', borderRadius: 20, padding: '3px 12px', fontSize: 12, fontWeight: 700, boxShadow: '0 1px 4px var(--shadow-main)' }}>
                        {ar ? h.specializationAr : h.specialization}
                      </span>
                      <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}><IconMapPin />{ar ? h.cityAr : h.city}</span>
                      <span style={{ fontSize: 13, color: 'var(--text-muted)' }}><IconBuilding />{t('Est.', 'تأسس')} {h.established}</span>
                      <span style={{ fontSize: 13, color: 'var(--text-muted)' }}><IconBed />{h.beds} {t('Beds', 'سرير')}</span>
                    </div>

                    {/* Stars */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                      <div style={{ display: 'flex', gap: 2 }}>
                        {[...Array(5)].map((_, i) => (
                          <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill={i < Math.floor(h.rating) ? "#f59e0b" : "none"} stroke={i < Math.floor(h.rating) ? "#f59e0b" : "#d1d5db"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26"></polygon>
                          </svg>
                        ))}
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-main)' }}>{h.rating}</span>
                      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>({h.totalReviews.toLocaleString()} {t('reviews', 'تقييم')})</span>
                    </div>

                    {/* Service chips */}
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
                      {h.services.map((s, i) => (
                        <span key={i} style={{ fontSize: 11, background: 'var(--bg-main)', border: '1px solid var(--card-border)', color: 'var(--text-muted)', borderRadius: 99, padding: '3px 10px', fontWeight: 600 }}>
                          {s}
                        </span>
                      ))}
                    </div>

                    {/* Expandable about section */}
                    {open && (
                      <div style={{ background: 'var(--bg-main)', borderRadius: 12, padding: '16px', marginBottom: 16, border: '1px solid var(--card-border)' }}>
                        <p style={{ fontSize: 13.5, color: 'var(--text-main)', lineHeight: 1.8, margin: '0 0 10px' }}>
                          {ar ? h.aboutAr : h.about}
                        </p>
                        <p style={{ fontSize: 13, color: 'var(--text-main)', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                          <span style={{ color: 'var(--primary)', display: 'inline-flex', alignItems: 'center' }}><IconPhone /> {h.phone}</span>
                          <span style={{ color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center' }}><IconMapPin /> {ar ? h.addressAr : h.address}</span>
                        </p>
                      </div>
                    )}

                    {/* Action buttons */}
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                      {/* Book — primary CTA */}
                      <a href={h.bookingUrl} target="_blank" rel="noopener noreferrer"
                        style={{ padding: '10px 20px', background: 'linear-gradient(135deg, var(--primary-dark) 0%, var(--primary) 100%)', color: 'white', borderRadius: 10, textDecoration: 'none', fontWeight: 800, fontSize: 13, boxShadow: '0 3px 12px var(--shadow-main)', display: 'inline-flex', alignItems: 'center' }}>
                        {t('Book Appointment', 'حجز موعد')}
                      </a>

                      <a href={h.website} target="_blank" rel="noopener noreferrer"
                        style={{ padding: '10px 15px', background: 'var(--bg-main)', color: 'var(--primary)', borderRadius: 10, textDecoration: 'none', fontWeight: 800, fontSize: 13, border: '1.5px solid var(--primary)', display: 'inline-flex', alignItems: 'center' }}>
                        <IconGlobe /> {t('Website', 'الموقع')}
                      </a>

                      <a href={h.googleMaps} target="_blank" rel="noopener noreferrer"
                        style={{ padding: '10px 15px', background: 'var(--bg-main)', color: 'var(--text-main)', borderRadius: 10, textDecoration: 'none', fontWeight: 700, fontSize: 13, border: '1.5px solid var(--card-border)', display: 'inline-flex', alignItems: 'center' }}>
                        <IconMap /> {t('Directions', 'الاتجاهات')}
                      </a>

                      <a href={`tel:${h.phone}`}
                        style={{ padding: '10px 15px', background: 'var(--bg-main)', color: 'var(--primary)', borderRadius: 10, textDecoration: 'none', fontWeight: 800, fontSize: 13, border: '1.5px solid var(--primary)', display: 'inline-flex', alignItems: 'center' }}>
                        <IconPhone /> {t('Call', 'اتصال')}
                      </a>

                      <button onClick={() => setExpanded(open ? null : h.id)}
                        style={{ padding: '10px 14px', background: 'none', border: '1.5px solid var(--card-border)', borderRadius: 10, color: 'var(--text-muted)', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>
                        {open ? `▲ ${t('Less', 'أقل')}` : `▼ ${t('About', 'عن المستشفى')}`}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Disclaimer */}
        <div style={{ marginTop: 32, background: 'rgba(245, 158, 11, 0.1)', borderRadius: 14, padding: '14px 18px', border: '1px solid #f59e0b', display: 'flex', alignItems: 'flex-start', gap: 8 }}>
          <span style={{ color: '#d97706', marginTop: 2 }}><IconAlert /></span>
          <p style={{ fontSize: 13, color: '#b45309', margin: 0, lineHeight: 1.7 }}>
            <strong>{t('Note:', 'ملاحظة:')}</strong>{' '}
            {t('Hospital information is for guidance only. Contact details and booking links may change — always verify directly with the hospital before visiting.', 'معلومات المستشفيات للإرشاد فقط. قد تتغير بيانات الاتصال وروابط الحجز — تحقق دائماً مع المستشفى مباشرةً قبل الزيارة.')}
          </p>
        </div>
      </div>

      <style>{`@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=Cairo:wght@400;600;700;800;900&display=swap');`}</style>
    </div>
  );
}
