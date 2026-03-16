import { Navigate, useLocation } from 'react-router-dom';
import { useAuth, REDIRECT_KEY } from '../context/AuthContext';
import type { ReactNode } from 'react';

/**
 * Protects routes that require authentication.
 * Saves the attempted path in sessionStorage so the user is
 * redirected back to it after a successful login.
 */
export default function AuthGuard({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: 'var(--bg, #f0f7f4)' }}>
        <div style={{ textAlign: 'center', fontFamily: 'Sora, sans-serif' }}>
          <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'center' }}>
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#004080" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <p style={{ color: '#004080', fontWeight: 700, fontSize: 16 }}>Loading Morgan's Hope...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    // Save where the user was trying to go
    sessionStorage.setItem(REDIRECT_KEY, location.pathname + location.search);
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
