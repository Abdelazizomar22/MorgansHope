import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useState } from 'react';

// SVG Icons
const IconHome = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>;
const IconUpload = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 16 12 12 8 16" /><line x1="12" y1="12" x2="12" y2="21" /><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" /></svg>;
const IconResults = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>;
const IconHospital = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><line x1="9" y1="22" x2="9" y2="12" /><line x1="15" y1="22" x2="15" y2="12" /><line x1="9" y1="12" x2="15" y2="12" /><line x1="12" y1="9" x2="12" y2="15" /></svg>;
const IconAbout = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>;
const IconContact = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>;
const IconLogout = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>;
const IconUser = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>;
const IconSun = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" /></svg>;
const IconMoon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>;
const IconChat = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" /></svg>;

const NAV = [
  { path: '/', en: 'Home', ar: 'الرئيسية', Icon: IconHome },
  { path: '/upload', en: 'Upload & Analyze', ar: 'رفع وتحليل', Icon: IconUpload },
  { path: '/results', en: 'Results', ar: 'النتائج', Icon: IconResults },
  { path: '/chat', en: 'AI Assistant', ar: 'المساعد الذكي', Icon: IconChat },
  { path: '/hospitals', en: 'Hospitals', ar: 'المستشفيات', Icon: IconHospital },
  { path: '/about', en: 'About', ar: 'عن المشروع', Icon: IconAbout },
  { path: '/contact', en: 'Contact', ar: 'تواصل', Icon: IconContact },
];



interface NavbarProps { lang: 'en' | 'ar'; onLangToggle: () => void; }

export default function Navbar({ lang, onLangToggle }: NavbarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const ar = lang === 'ar';
  const t = (en: string, arText: string) => ar ? arText : en;

  const handleLogout = () => { logout(); navigate('/login'); setMenuOpen(false); };

  return (
    <nav dir={ar ? 'rtl' : 'ltr'} style={{
      background: 'var(--card-bg)',
      borderBottom: '1px solid var(--card-border)',
      padding: '0 32px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      height: 60, position: 'sticky', top: 0, zIndex: 200,
      boxShadow: '0 1px 12px var(--shadow-main)',
      fontFamily: ar ? "'Cairo', sans-serif" : "'Sora', sans-serif",
    }}>

      {/* Logo */}
      <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}>
        <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
          <img src="/logo.png" alt="Morgan's Hope Logo" className="theme-logo" style={{ height: 44, width: 44, objectFit: 'contain', mixBlendMode: 'multiply' as const }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ fontSize: 20, fontWeight: 900, color: 'var(--primary)', letterSpacing: -0.6, lineHeight: 1 }}>Morgan's</span>
          <span style={{ fontSize: 18, fontWeight: 400, fontStyle: 'italic', letterSpacing: 0, color: 'var(--primary)', opacity: 0.85, marginLeft: 2, lineHeight: 1 }}>Hope</span>
        </div>
      </Link>

      {/* Nav Links */}
      <div style={{ display: 'flex', gap: 0, alignItems: 'center' }}>
        {NAV.map(({ path, en, ar: arLabel, Icon }) => {
          const active = location.pathname === path;
          return (
            <Link key={path} to={path} style={{
              textDecoration: 'none',
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '0 11px', height: 60,
              fontSize: 13.5, fontWeight: active ? 700 : 500,
              color: active ? 'var(--primary)' : 'var(--text-muted)',
              borderBottom: active ? '2.5px solid var(--primary)' : '2.5px solid transparent',
              transition: 'all 0.15s',
              whiteSpace: 'nowrap',
            }}>
              <span style={{ opacity: active ? 1 : 0.6 }}><Icon /></span>
              {ar ? arLabel : en}
            </Link>
          );
        })}
      </div>

      {/* Right controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {/* Theme Toggle */}
        <button onClick={toggleTheme} style={{
          background: 'var(--primary)', border: '1.5px solid var(--card-border)',
          borderRadius: 8, padding: '7px',
          cursor: 'pointer', color: 'white',
          transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 2px 8px var(--shadow-main)'
        }}>
          {theme === 'light' ? <IconMoon /> : <IconSun />}
        </button>

        {/* AR / EN Toggle - Prominent */}
        <button onClick={onLangToggle} style={{
          background: 'var(--primary)', border: '1.5px solid var(--card-border)',
          borderRadius: 8, padding: '6px 14px',
          cursor: 'pointer', color: 'white', fontWeight: 800, fontSize: 13,
          fontFamily: 'inherit', letterSpacing: 0.5,
          transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 6,
          boxShadow: '0 2px 8px var(--shadow-main)'
        }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--card-border)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'var(--primary-light)'; }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>
          {ar ? 'EN' : 'عربي'}
        </button>

        {user ? (
          <div style={{ position: 'relative' }}>
            <button onClick={() => setMenuOpen(!menuOpen)} style={{
              width: 38, height: 38, borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
              border: '2px solid var(--card-border)', color: 'white',
              fontWeight: 800, fontSize: 14, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'inherit', boxShadow: '0 2px 8px var(--shadow-main)'
            }}>
              {user.firstName?.[0]?.toUpperCase() || 'U'}
            </button>
            {menuOpen && (
              <>
                <div onClick={() => setMenuOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 100 }} />
                <div style={{
                  position: 'absolute', [ar ? 'left' : 'right']: 0, top: 46,
                  background: 'var(--card-bg)', borderRadius: 12, padding: '6px 0',
                  boxShadow: '0 8px 32px var(--shadow-main)',
                  minWidth: 200, zIndex: 201,
                  border: '1px solid var(--card-border)',
                }}>
                  <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--card-border)' }}>
                    <div style={{ fontWeight: 800, color: 'var(--text-main)', fontSize: 13 }}>{user.firstName} {user.lastName}</div>
                    <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 2 }}>{user.email}</div>
                  </div>
                  <Link to="/profile" onClick={() => setMenuOpen(false)} style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '10px 16px', textDecoration: 'none',
                    color: 'var(--text-main)', fontWeight: 600, fontSize: 13,
                    transition: 'background 0.1s',
                  }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--primary-light)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <span style={{ color: 'var(--primary)' }}><IconUser /></span>
                    {t('My Profile', 'ملفي الشخصي')}
                  </Link>
                  <button onClick={handleLogout} style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: 8,
                    padding: '10px 16px', background: 'none', border: 'none',
                    borderTop: '1px solid var(--card-border)',
                    textAlign: ar ? 'right' : 'left', cursor: 'pointer',
                    color: '#ef4444', fontWeight: 600, fontSize: 13,
                    fontFamily: 'inherit', transition: 'background 0.1s',
                  }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--primary-light)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <IconLogout />{t('Sign Out', 'تسجيل الخروج')}
                  </button>
                </div>
              </>
            )}
          </div>
        ) : (
          <Link to="/login" style={{
            padding: '8px 20px', background: 'var(--primary)',
            color: 'white', borderRadius: 8,
            textDecoration: 'none', fontWeight: 700, fontSize: 13.5,
            transition: 'background 0.2s'
          }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--primary-dark)'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--primary)'}
          >
            {t('Login', 'تسجيل الدخول')}
          </Link>
        )}
      </div>

      <style>{`@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=Cairo:wght@400;600;700;800;900&display=swap');`}</style>
    </nav>
  );
}
