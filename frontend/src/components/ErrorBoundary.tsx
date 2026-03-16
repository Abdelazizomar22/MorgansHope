import { Component, type ReactNode, type ErrorInfo } from 'react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

/**
 * Top-level React error boundary.
 * Catches unhandled render/lifecycle errors and shows a user-friendly
 * screen instead of a blank white page.
 */
export default class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, info: ErrorInfo) {
        // In production you'd send this to a logging service (Sentry, DataDog, etc.)
        console.error('[ErrorBoundary]', error, info.componentStack);
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null });
        window.location.href = '/';
    };

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) return this.props.fallback;

            return (
                <div style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                    justifyContent: 'center', minHeight: '100vh',
                    background: '#f8f9fa', fontFamily: 'Sora, sans-serif', padding: '40px',
                }}>
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none"
                        stroke="#b91c1c" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                        style={{ marginBottom: 24 }}>
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    <h1 style={{ fontSize: 28, fontWeight: 900, color: '#1f2937', marginBottom: 8 }}>
                        Something went wrong
                    </h1>
                    <p style={{ color: '#6b7280', marginBottom: 8, maxWidth: 420, textAlign: 'center' }}>
                        An unexpected error occurred. Our team has been notified.
                    </p>
                    {import.meta.env.DEV && this.state.error && (
                        <pre style={{
                            background: '#1e293b', color: '#f87171', padding: '16px 20px',
                            borderRadius: 8, fontSize: 12, maxWidth: 600, overflowX: 'auto',
                            marginBottom: 24, width: '100%',
                        }}>
                            {this.state.error.message}
                        </pre>
                    )}
                    <button
                        onClick={this.handleReset}
                        style={{
                            background: '#0d9488', color: '#fff', border: 'none',
                            borderRadius: 8, padding: '12px 28px', fontSize: 15,
                            fontWeight: 700, cursor: 'pointer',
                        }}
                    >
                        ← Back to Home
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}
