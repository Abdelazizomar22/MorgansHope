import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../utils/env';
import {
  HiHome,
  HiCloudArrowUp,
  HiDocumentText,
  HiBuildingOffice,
  HiEnvelope,
  HiArrowRightOnRectangle,
  HiUser,
  HiChatBubbleLeftRight,
  HiBars3,
  HiXMark,
  HiGlobeAlt,
} from 'react-icons/hi2';
import { IconType } from 'react-icons';

const NAV = [
  { path: '/', en: 'Home', ar: 'الرئيسية', Icon: HiHome },
  { path: '/upload', en: 'Upload & Analyze', ar: 'رفع وتحليل', Icon: HiCloudArrowUp },
  { path: '/results', en: 'Results', ar: 'النتائج', Icon: HiDocumentText },
  { path: '/chat', en: 'AI Assistant', ar: 'المساعد الذكي', Icon: HiChatBubbleLeftRight },
  { path: '/hospitals', en: 'Hospitals', ar: 'المستشفيات', Icon: HiBuildingOffice },
  { path: '/contact', en: 'Contact', ar: 'تواصل', Icon: HiEnvelope },
];

const Icon = ({ 
  icon: IconComponent, 
  className, 
  ...props 
}: {
  icon: IconType;
  className?: string;
} & React.SVGProps<SVGSVGElement>) => (
  <IconComponent className={className} {...props} />
);

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
      <Link to="/" className='flex items-center gap-5' style={{ textDecoration: 'none', minWidth: 0 }}>
	      <img
	        src="/logo-v2.png"
	        alt="Morgan's Hope Logo"
	        className="theme-logo"
	        style={{ height: 30, width: 30, objectFit: 'contain', transform: 'scale(1.35) translateY(-2px)', marginRight: -8 }}
	      />
        <div dir="ltr" className="hidden md:flex items-center gap-1.5" style={{ textShadow: '0 2px 12px rgba(0,0,0,0.35)' }}>
          <span style={{ fontSize: 20, fontWeight: 900, color: 'var(--primary)', letterSpacing: -0.5, lineHeight: 1 }}>Morgan&apos;s</span>
          <span style={{ fontSize: 18, fontWeight: 400, fontStyle: 'italic', color: 'var(--primary)', opacity: 0.85, lineHeight: 1 }}>Hope</span>
        </div>
      </Link>

      {!isMobile && (
        <div style={{ display: 'flex', gap: 0, alignItems: 'center' }}>
          {NAV.map(({ path, en, ar: arLabel, Icon: NavIcon }) => {
            const active = location.pathname === path;
            return (
              <Link
                key={path}
                to={path}
                style={{
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
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
								<Icon style={{ opacity: active ? 1 : 0.7 }} icon={NavIcon} className='w-4 h-4' />
                <p className='translate-y-0.5'>{ar ? arLabel : en}</p>
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
						{
							navMobileOpen ?
							<HiXMark style={{ width: 22, height: 22 }} /> :
							<HiBars3 style={{ width: 22, height: 22 }} />
						}
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
          	<HiGlobeAlt className="h-3.5 w-3.5" />
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
                    textAlign: ar ? 'right' : 'left',
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
                    textAlign: ar ? 'right' : 'left',
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
										<span style={{ color: 'var(--primary)' }}>
											<HiUser className="h-3.5 w-3.5" />
                    </span>
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
                  	<HiArrowRightOnRectangle className="h-3.5 w-3.5" />
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
          {NAV.map(({ path, en, ar: arLabel, Icon: NavIcon }) => {
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
								<span style={{ opacity: active ? 1 : 0.6 }}>
									<Icon icon={NavIcon} className='w-5 h-5' />
                </span>
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
