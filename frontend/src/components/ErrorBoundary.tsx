import { Component, type ReactNode, type ErrorInfo } from 'react';
import { SOCIAL } from '../data/social';

function NotFoundFooter() {
    return (
        <footer style={{
            background: 'var(--primary)',
            padding: '24px 40px',
            color: 'white',
            fontFamily: "'Sora', sans-serif",
        }}>
            <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
                {/* Brand + Tagline */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
                        <img
                            src="/logo-v1.png"
                            alt="Morgan's Hope Logo"
                            className="theme-logo"
                            style={{ height: 40, width: 40, objectFit: 'contain', filter: 'brightness(0) invert(1)', transform: 'scale(1.4) translateY(-4px)', marginRight: -8 }}
                        />
                        <div dir="ltr" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <span style={{ fontSize: 18, fontWeight: 900, color: 'white', letterSpacing: -0.6, lineHeight: 1 }}>Morgan's</span>
                            <span style={{ fontSize: 16, fontWeight: 400, fontStyle: 'italic', color: 'white', opacity: 0.85, lineHeight: 1 }}>Hope</span>
                        </div>
                    </div>
                    <p style={{ fontSize: 12, fontStyle: 'italic', color: 'rgba(255,255,255,0.85)', margin: 0, lineHeight: 1.4, paddingLeft: 6 }}>
                        &ldquo;A Second Chance for Every Breath&rdquo;
                    </p>
                </div>

                {/* Social */}
                <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                    {SOCIAL.map(({ Icon, href, label }) => (
                        <a key={label} href={href} aria-label={label} target="_blank" rel="noopener noreferrer"
                            style={{ color: 'white', opacity: 0.8, transition: 'opacity 0.2s, transform 0.2s', display: 'flex' }}
                            onMouseEnter={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                            onMouseLeave={e => { e.currentTarget.style.opacity = '0.8'; e.currentTarget.style.transform = 'translateY(0)'; }}
                        >
                            <Icon size={29} />
                        </a>
                    ))}
                </div>

                {/* Copyright */}
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.75)' }}>
                    &copy; 2026 Morgan&apos;s Hope. All rights reserved.
                </span>
            </div>
        </footer>
    );
}

export function NotFoundPage({ error }: { error?: Error | null }) {
    return (
        <div style={{
            display: 'flex', flexDirection: 'column', minHeight: '100vh',
            background: '#f8f9fa', fontFamily: 'Sora, sans-serif',
        }}>
            <div style={{
                flex: 1, display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', padding: '40px',
            }}>
                <h1 style={{ fontSize: 120, fontWeight: 900, color: '#1f2937', margin: 0, lineHeight: 1 }}>
                    404
                </h1>
                <h2 style={{ fontSize: 32, fontWeight: 900, color: '#374151', margin: '8px 0 16px' }}>
                    Page not found
                </h2>
                <p style={{ color: '#6b7280', fontSize: 15, maxWidth: 480, textAlign: 'center', lineHeight: 1.7, margin: '0 0 32px' }}>
                    This page may have been moved or deleted. Please check the URL is correct in the address bar, and get in touch with us if you continue to have issues.
                </p>
                {import.meta.env.DEV && error && (
                    <pre style={{
                        background: '#1e293b', color: '#f87171', padding: '16px 20px',
                        borderRadius: 8, fontSize: 12, maxWidth: 600, overflowX: 'auto',
                        marginBottom: 24, width: '100%',
                    }}>
                        {error.message}
                    </pre>
                )}
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
                    <a
                        href="/"
                        style={{
                            background: 'var(--primary)', color: '#fff', border: 'none',
                            borderRadius: 8, padding: '12px 28px', fontSize: 15,
                            fontWeight: 700, cursor: 'pointer', textDecoration: 'none',
                        }}
                    >
                        ← Back to Home
                    </a>
                    <a
                        href="/contact"
                        style={{
                            background: 'transparent', color: '#374151', border: '2px solid #d1d5db',
                            borderRadius: 8, padding: '12px 28px', fontSize: 15,
                            fontWeight: 700, cursor: 'pointer', textDecoration: 'none',
                        }}
                    >
                        Contact Us →
                    </a>
                </div>
            </div>
            <NotFoundFooter />
        </div>
    );
}

/**
 * Top-level React error boundary.
 * Catches unhandled render/lifecycle errors and shows a user-friendly
 * screen instead of a blank white page.
 */

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, info: ErrorInfo) {
        console.error('[ErrorBoundary]', error, info.componentStack);
    }

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) return this.props.fallback;
            return <NotFoundPage error={this.state.error} />;
        }

        return this.props.children;
    }
}
