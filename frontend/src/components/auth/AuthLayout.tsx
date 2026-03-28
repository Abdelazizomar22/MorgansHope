import type { CSSProperties, ReactNode } from 'react';

interface FeatureItem {
  icon: ReactNode;
  title: string;
  desc: string;
}

interface AuthLayoutProps {
  dir: 'ltr' | 'rtl';
  fontFamily: string;
  langToggleLabel: string;
  onToggleLang: () => void;
  onToggleTheme: () => void;
  themeToggleIcon: ReactNode;
  brandSlogan: string;
  formBadge: string;
  hideFormBadge?: boolean;
  formTitle: string;
  formDescription: string;
  children: ReactNode;
  formMaxWidth?: number;
  leftPanelMode?: 'brand' | 'features';
  featureItems?: FeatureItem[];
}

export function AuthLayout({
  dir,
  fontFamily,
  langToggleLabel,
  onToggleLang,
  onToggleTheme,
  themeToggleIcon,
  brandSlogan,
  formBadge,
  hideFormBadge = false,
  formTitle,
  formDescription,
  children,
  formMaxWidth = 520,
  leftPanelMode = 'brand',
  featureItems = [],
}: AuthLayoutProps) {
  const isRtl = dir === 'rtl';
  const textAlign = isRtl ? 'right' : 'left';
  const isDesktop = typeof window !== 'undefined' && window.matchMedia('(min-width: 1101px)').matches;

  return (
    <div dir={dir} className="auth-shell" style={{ fontFamily }}>
      {/* ── Left Panel ── */}
      <section
        className="auth-brand-panel"
        style={isDesktop ? { position: 'sticky', top: 0, height: '100vh', minHeight: '100vh' } : undefined}
      >
        <div className="auth-grid-overlay" />

        {leftPanelMode === 'brand' ? (
          // ── Brand mode (default — logo + orbits) ──
          <>
            <div className="auth-brand-orbit auth-brand-orbit-large" style={{ top: '50%', width: 520, height: 520 }} />
            <div className="auth-brand-orbit auth-brand-orbit-medium" style={{ top: '50%', width: 372, height: 372 }} />
            <div className="auth-brand-orbit auth-brand-orbit-small" style={{ top: '50%', width: 220, height: 220 }} />

            <div className="auth-brand-inner" style={{ width: 'min(100%, 660px)', minHeight: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', transform: 'translateY(-68px)' }}>
              <div className="auth-brand-lockup" style={{ margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <div className="auth-brand-logo-shell" style={{ width: 'min(420px, 82vw)', height: 'min(420px, 82vw)', margin: '0 auto 8px', display: 'grid', placeItems: 'center', transform: 'translateY(-8px)' }}>
                  <img src="/logo.png" alt="Morgan's Hope Logo" className="theme-logo" style={{ width: 'min(396px, 76vw)', height: 'min(396px, 76vw)', objectFit: 'contain' }} />
                </div>
                <div className="auth-brand-copy" style={{ maxWidth: 660, margin: '0 auto' }}>
                  <h1 className="auth-brand-title" style={{ fontSize: 'clamp(3.4rem, 6.6vw, 5.2rem)', letterSpacing: '-0.065em', lineHeight: 0.92, transform: 'translateY(-104px)' }}>
                    <span>Morgan&apos;s</span>
                    <span style={{ color: 'rgba(255, 255, 255, 0.82)', fontStyle: 'italic', fontWeight: 500 }}>Hope</span>
                  </h1>
                  <p className="auth-brand-slogan" style={{ marginTop: -26, fontSize: 'clamp(0.98rem, 1.45vw, 1.1rem)', transform: 'translateY(-66px)' }}>{brandSlogan}</p>
                </div>
              </div>
              <div className="auth-brand-trust-pill" style={{ marginTop: 8, transform: 'translateY(-20px)' }}>
                <span className="auth-brand-trust-dot" />
                <span>256-BIT SSL ENCRYPTED</span>
              </div>
            </div>
          </>
        ) : (
          // ── Features mode (Cohere-style) ──
          <div className="auth-features-inner">
            <div className="auth-features-logo-row">
              <img src="/logo.png" alt="Morgan's Hope" style={{ width: 52, height: 52, objectFit: 'contain', borderRadius: 14, background: 'rgba(255,255,255,0.1)', padding: 6 }} />
              <div>
                <div style={{ fontWeight: 900, fontSize: '1.15rem', letterSpacing: '-0.03em' }}>Morgan&apos;s Hope</div>
                <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.7)', marginTop: 2 }}>{brandSlogan}</div>
              </div>
            </div>

            <div className="auth-features-headline">
              <h2>
                {isRtl
                  ? 'ابدأ رحلتك نحو صحة أفضل'
                  : 'Your Health Journey Starts Here'}
              </h2>
              <p>
                {isRtl
                  ? 'منصة بحثية متكاملة لدعم الكشف المبكر عن سرطان الرئة'
                  : 'A comprehensive research platform for early lung cancer detection & support'}
              </p>
            </div>

            <div className="auth-features-list">
              {featureItems.map((item, i) => (
                <div key={i} className="auth-feature-card">
                  <div className="auth-feature-card-icon">{item.icon}</div>
                  <div>
                    <div className="auth-feature-card-title">{item.title}</div>
                    <div className="auth-feature-card-desc">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="auth-brand-trust-pill" style={{ marginTop: 'auto' }}>
              <span className="auth-brand-trust-dot" />
              <span>256-BIT SSL ENCRYPTED</span>
            </div>
          </div>
        )}
      </section>

      {/* ── Right Panel (Form) ── */}
      <section className="auth-form-panel">
        <div className="auth-toolbar" style={{ [isRtl ? 'left' : 'right']: '24px' } as CSSProperties}>
          <button
            type="button"
            onClick={onToggleTheme}
            className="auth-toolbar-button auth-toolbar-icon"
            aria-label="Toggle theme"
          >
            {themeToggleIcon}
          </button>
          <button type="button" onClick={onToggleLang} className="auth-toolbar-button auth-toolbar-lang">
            {langToggleLabel}
          </button>
        </div>

        <div className="auth-form-card" style={{ maxWidth: formMaxWidth, textAlign }}>
          <header className="auth-form-header">
            {!hideFormBadge && formBadge && (
              <div className="auth-form-badge">{formBadge}</div>
            )}
            <h2 className="auth-form-title" style={{ marginTop: hideFormBadge ? 0 : 14 }}>{formTitle}</h2>
            <p className="auth-form-description">{formDescription}</p>
          </header>

          {children}
        </div>
      </section>
    </div>
  );
}
