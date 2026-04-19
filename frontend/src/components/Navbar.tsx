import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../utils/env';

const IconHome = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>;
const IconUpload = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 16 12 12 8 16" /><line x1="12" y1="12" x2="12" y2="21" /><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" /></svg>;
const IconResults = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>;
const IconHospital = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><line x1="9" y1="22" x2="9" y2="12" /><line x1="15" y1="22" x2="15" y2="12" /><line x1="9" y1="12" x2="15" y2="12" /><line x1="12" y1="9" x2="12" y2="15" /></svg>;
const IconContact = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>;
const IconLogout = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>;
const IconUser = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>;
const IconChat = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" /></svg>;
const IconMenu = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" /></svg>;
const IconXMenu = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>;
const IconGlobe = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>;

const NAV = [
  { path: '/', en: 'Home', ar: 'الرئيسية', Icon: IconHome },
  { path: '/upload', en: 'Upload & Analyze', ar: 'رفع وتحليل', Icon: IconUpload },
  { path: '/results', en: 'Results', ar: 'النتائج', Icon: IconResults },
  { path: '/chat', en: 'AI Assistant', ar: 'المساعد الذكي', Icon: IconChat },
  { path: '/hospitals', en: 'Hospitals', ar: 'المستشفيات', Icon: IconHospital },
  { path: '/contact', en: 'Contact', ar: 'تواصل', Icon: IconContact },
];

interface NavbarProps { lang: 'en' | 'ar'; onLangToggle: () => void; }

export default function Navbar({ lang, onLangToggle }: NavbarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [navMobileOpen, setNavMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [avatarFailed, setAvatarFailed] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const ar = lang === 'ar';
  const t = (en: string, arText: string) => ar ? arText : en;
  const menuItemHover = 'color-mix(in srgb, var(--primary) 14%, var(--card-bg))';
  const menuItemHoverDanger = 'color-mix(in srgb, #ef4444 10%, var(--card-bg))';
  const apiBase = API_BASE_URL;
  const uploadsBase = apiBase.replace(/\/api\/?$/, '/api/uploads');
  const avatarSrc = user?.profilePicture
    ? (/^https?:\/\//i.test(user.profilePicture) || user.profilePicture.startsWith('data:')
      ? user.profilePicture
      : `${uploadsBase}/${user.profilePicture}`)
    : '';
  const userInitial = user?.firstName?.[0]?.toUpperCase() || user?.lastName?.[0]?.toUpperCase() || 'U';

  const handleLogout = () => {
    logout();
    navigate('/login');
    setMenuOpen(false);
    setLangMenuOpen(false);
    setNavMobileOpen(false);
  };

  const closeMobileNav = () => setNavMobileOpen(false);

  return (
    <nav
      dir={ar ? 'rtl' : 'ltr'}
      style={{
        background: 'var(--card-bg)',
        borderBottom: '1px solid var(--card-border)',
        padding: isMobile ? '0 14px' : '0 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 60,
        position: 'sticky',
        top: 0,
        zIndex: 200,
        boxShadow: '0 1px 12px var(--shadow-main)',
        fontFamily: ar ? "'Cairo', sans-serif" : "'Sora', sans-serif",
      }}
    >
      <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 0, minWidth: 0 }}>
        <img
          src="/logo.png"
          alt="Morgan's Hope Logo"
          className="theme-logo"
          style={{ height: 56, width: 56, objectFit: 'contain', transform: 'scale(1.35) translateY(-2px)', marginRight: -8 }}
        />
        <div className="hidden md:flex items-center gap-1.5">
          <span style={{ fontSize: 20, fontWeight: 900, color: 'var(--primary)', letterSpacing: -0.5, lineHeight: 1 }}>Morgan&apos;s</span>
          <span style={{ fontSize: 18, fontWeight: 400, fontStyle: 'italic', color: 'var(--primary)', opacity: 0.85, lineHeight: 1 }}>Hope</span>
        </div>
      </Link>

      {!isMobile && (
        <div style={{ display: 'flex', gap: 0, alignItems: 'center' }}>
          {NAV.map(({ path, en, ar: arLabel, Icon }) => {
            const active = location.pathname === path;
            return (
              <Link
                key={path}
                to={path}
                style={{
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                  padding: '0 11px',
                  height: 60,
                  fontSize: 13.5,
                  fontWeight: active ? 700 : 500,
                  color: active ? 'var(--primary)' : 'var(--text-muted)',
                  borderBottom: active ? '2.5px solid var(--primary)' : '2.5px solid transparent',
                  transition: 'all 0.15s',
                  whiteSpace: 'nowrap',
                }}
              >
                <span style={{ opacity: active ? 1 : 0.6 }}><Icon /></span>
                {ar ? arLabel : en}
              </Link>
            );
          })}
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 8 : 10 }}>
        {isMobile && (
          <button
            onClick={() => { setNavMobileOpen(!navMobileOpen); setMenuOpen(false); setLangMenuOpen(false); }}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-main)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 4,
            }}
          >
            {navMobileOpen ? <IconXMenu /> : <IconMenu />}
          </button>
        )}

        <div style={{ position: 'relative' }}>
          <button
            type="button"
            onClick={() => { setLangMenuOpen(!langMenuOpen); setMenuOpen(false); }}
            style={{
              height: 34,
              minWidth: 58,
              borderRadius: 10,
              border: '1px solid var(--card-border)',
              background: 'var(--card-bg)',
              color: 'var(--text-main)',
              fontWeight: 700,
              fontSize: 12.5,
              padding: '0 10px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              boxShadow: '0 2px 8px var(--shadow-main)',
            }}
          >
            <IconGlobe />
            <span>{ar ? 'AR' : 'EN'}</span>
          </button>
          {langMenuOpen && (
            <>
              <div onClick={() => setLangMenuOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 100 }} />
              <div
                style={{
                  position: 'absolute',
                  top: 40,
                  [ar ? 'left' : 'right']: 0,
                  minWidth: 120,
                  background: 'var(--card-bg)',
                  border: '1px solid var(--card-border)',
                  borderRadius: 10,
                  boxShadow: '0 8px 24px var(--shadow-main)',
                  zIndex: 202,
                  overflow: 'hidden',
                }}
              >
                <button
                  type="button"
                  onClick={() => { if (ar) onLangToggle(); setLangMenuOpen(false); }}
                  style={{
                    width: '100%',
                    border: 'none',
                    background: 'transparent',
                    color: 'var(--text-main)',
                    fontSize: 13,
                    fontWeight: 700,
                    textAlign: 'left',
                    padding: '10px 12px',
                    cursor: 'pointer',
                  }}
                >
                  English
                </button>
                <button
                  type="button"
                  onClick={() => { if (!ar) onLangToggle(); setLangMenuOpen(false); }}
                  style={{
                    width: '100%',
                    border: 'none',
                    borderTop: '1px solid var(--card-border)',
                    background: 'transparent',
                    color: 'var(--text-main)',
                    fontSize: 13,
                    fontWeight: 700,
                    textAlign: 'left',
                    padding: '10px 12px',
                    cursor: 'pointer',
                  }}
                >
                  العربية
                </button>
              </div>
            </>
          )}
        </div>

        {user ? (
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => { setMenuOpen(!menuOpen); setLangMenuOpen(false); }}
              style={{
                width: 38,
                height: 38,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
                border: '2px solid var(--card-border)',
                color: 'white',
                fontWeight: 800,
                fontSize: 14,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'inherit',
                boxShadow: '0 2px 8px var(--shadow-main)',
                overflow: 'hidden',
                padding: 0,
              }}
            >
              {avatarSrc && !avatarFailed ? (
                <img
                  src={avatarSrc}
                  alt="User avatar"
                  referrerPolicy="no-referrer"
                  onError={() => setAvatarFailed(true)}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                userInitial
              )}
            </button>
            {menuOpen && (
              <>
                <div onClick={() => setMenuOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 100 }} />
                <div
                  style={{
                    position: 'absolute',
                    [ar ? 'left' : 'right']: 0,
                    top: 46,
                    background: 'var(--card-bg)',
                    borderRadius: 12,
                    padding: '6px 0',
                    boxShadow: '0 8px 32px var(--shadow-main)',
                    minWidth: 210,
                    zIndex: 201,
                    border: '1px solid var(--card-border)',
                  }}
                >
                  <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--card-border)' }}>
                    <div style={{ fontWeight: 800, color: 'var(--text-main)', fontSize: 13 }}>{user.firstName} {user.lastName}</div>
                    <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 2 }}>{user.email}</div>
                  </div>

                  <Link
                    to="/profile"
                    onClick={() => setMenuOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '10px 16px',
                      textDecoration: 'none',
                      color: 'var(--text-main)',
                      fontWeight: 600,
                      fontSize: 13,
                      transition: 'background 0.16s ease, color 0.16s ease',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = menuItemHover; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                  >
                    <span style={{ color: 'var(--primary)' }}><IconUser /></span>
                    {t('My Profile', 'ملفي الشخصي')}
                  </Link>

                  <button
                    onClick={handleLogout}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '10px 16px',
                      background: 'none',
                      border: 'none',
                      borderTop: '1px solid var(--card-border)',
                      textAlign: ar ? 'right' : 'left',
                      cursor: 'pointer',
                      color: '#ef4444',
                      fontWeight: 600,
                      fontSize: 13,
                      fontFamily: 'inherit',
                      transition: 'background 0.16s ease, color 0.16s ease',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = menuItemHoverDanger; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                  >
                    <IconLogout />
                    {t('Sign Out', 'تسجيل الخروج')}
                  </button>
                </div>
              </>
            )}
          </div>
        ) : (
          <Link
            to="/login"
            style={{
              padding: '8px 18px',
              background: 'var(--primary)',
              color: 'white',
              borderRadius: 8,
              textDecoration: 'none',
              fontWeight: 700,
              fontSize: 13.5,
              transition: 'background 0.2s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--primary-dark)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--primary)'; }}
          >
            {t('Login', 'تسجيل الدخول')}
          </Link>
        )}
      </div>

      {isMobile && navMobileOpen && (
        <div
          style={{
            position: 'absolute',
            top: 60,
            left: 0,
            right: 0,
            background: 'var(--card-bg)',
            borderBottom: '1px solid var(--card-border)',
            boxShadow: '0 4px 12px var(--shadow-main)',
            padding: '8px 16px',
            display: 'flex',
            flexDirection: 'column',
            maxHeight: 'calc(100vh - 60px)',
            overflowY: 'auto',
            zIndex: 199,
          }}
        >
          {NAV.map(({ path, en, ar: arLabel, Icon }) => {
            const active = location.pathname === path;
            return (
              <Link
                key={path}
                to={path}
                onClick={closeMobileNav}
                style={{
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '14px 12px',
                  fontSize: 15,
                  fontWeight: active ? 700 : 500,
                  color: active ? 'var(--primary)' : 'var(--text-main)',
                  borderBottom: '1px solid var(--card-border)',
                }}
              >
                <span style={{ opacity: active ? 1 : 0.6 }}><Icon /></span>
                {ar ? arLabel : en}
              </Link>
            );
          })}
        </div>
      )}

      <style>{`@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=Cairo:wght@400;600;700;800;900&display=swap');`}</style>
    </nav>
  );
}
