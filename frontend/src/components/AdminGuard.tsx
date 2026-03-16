import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { ReactNode } from 'react';

/**
 * Role-based route guard. Renders children only if the
 * logged-in user has one of the required roles.
 * Falls back to 403 page or redirects to home.
 */
interface AdminGuardProps {
    children: ReactNode;
    roles?: Array<'admin' | 'user'>;
    fallback?: ReactNode;
}

export default function AdminGuard({
    children,
    roles = ['admin'],
    fallback,
}: AdminGuardProps) {
    const { user, loading } = useAuth();

    if (loading) return null;

    if (!user) return <Navigate to="/login" replace />;

    if (!roles.includes(user.role)) {
        if (fallback) return <>{fallback}</>;
        return (
            <div style={{ textAlign: 'center', padding: '80px 40px', fontFamily: 'Sora, sans-serif' }}>
                <h1 style={{ fontSize: 32, fontWeight: 900, color: '#b91c1c', marginBottom: 12 }}>
                    403 — Access Denied
                </h1>
                <p style={{ color: '#6b7280', marginBottom: 24 }}>
                    You don't have permission to view this page.
                </p>
                <a href="/" style={{ color: '#0d9488', fontWeight: 700 }}>← Back to Home</a>
            </div>
        );
    }

    return <>{children}</>;
}
