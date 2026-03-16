import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { ReactNode } from 'react';

/**
 * Prevents authenticated users from reaching guest-only pages
 * (e.g. /login, /register). Redirects them to the home page.
 */
export default function GuestGuard({ children }: { children: ReactNode }) {
    const { user, loading } = useAuth();

    if (loading) return null; // avoid flash

    return user ? <Navigate to="/" replace /> : <>{children}</>;
}
