// ─────────────────────────────────────────────────────────────
//  Morgan's Hope — Auth Context  (Professional Edition)
// ─────────────────────────────────────────────────────────────
import {
  createContext, useContext, useState, useEffect, useCallback,
  type ReactNode,
} from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authApi } from '../utils/api';
import { TokenService } from '../services/tokenService';
import type { SafeUser } from '../types';

interface AuthContextType {
  user: SafeUser | null;
  token: string | null;
  loading: boolean;
  isAdmin: boolean;
  login: (identifier: string, password: string, rememberMe?: boolean) => Promise<void>;
  completeSocialLogin: (token: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: SafeUser) => void;
  refreshUser: () => Promise<void>;
}

interface RegisterData {
  firstName: string; lastName: string; email: string;
  password: string; confirmPassword: string;
  acceptedDisclaimer: boolean;
  age?: number;
  gender?: 'male' | 'female' | 'other';
  smokingHistory?: 'never' | 'former' | 'current';
  medicalHistory?: string;
  role?: 'user' | 'admin';
}

const AuthContext = createContext<AuthContextType | null>(null);

// Key used to remember where the user was trying to go before being redirected to login
export const REDIRECT_KEY = 'medtech_redirect_after_login';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SafeUser | null>(null);
  const [token, setToken] = useState<string | null>(TokenService.getToken() || null);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const location = useLocation();

  // Derived
  const isAdmin = user?.role === 'admin';

  // ── Bootstrap: validate stored token on mount ─────────────────────────────
  useEffect(() => {
    const stored = TokenService.getToken();
    if (stored) {
      authApi.me()
        .then((res) => setUser(res.data.data ?? null))
        .catch(() => {
          // Token invalid — clear and let silent refresh interceptor handle 401
          TokenService.removeToken();
          setToken(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  // ── Listen for forced logout from the Axios interceptor ───────────────────
  useEffect(() => {
    const handleForcedLogout = () => {
      setUser(null);
      setToken(null);
      TokenService.removeToken();
      navigate('/login', { replace: true });
    };
    window.addEventListener('auth:logout', handleForcedLogout);
    return () => window.removeEventListener('auth:logout', handleForcedLogout);
  }, [navigate]);

  // ── Login ─────────────────────────────────────────────────────────────────
  const resolvePostLoginPath = (currentUser: SafeUser | null) => {
    if (currentUser && !currentUser.onboardingCompleted) return '/onboarding';
    return sessionStorage.getItem(REDIRECT_KEY) || '/';
  };

  const login = async (identifier: string, password: string, rememberMe = false) => {
    const res = await authApi.login({ identifier, password, rememberMe });
    const { user: u, token: t } = res.data.data!;
    TokenService.setToken(t);
    setToken(t);
    setUser(u);

    // Go to where the user originally wanted to go
    const redirectTo = resolvePostLoginPath(u);
    sessionStorage.removeItem(REDIRECT_KEY);
    navigate(redirectTo, { replace: true });
  };

  const completeSocialLogin = async (incomingToken: string) => {
    TokenService.setToken(incomingToken);
    setToken(incomingToken);
    const res = await authApi.me();
    const currentUser = res.data.data ?? null;
    setUser(currentUser);

    const redirectTo = resolvePostLoginPath(currentUser);
    sessionStorage.removeItem(REDIRECT_KEY);
    navigate(redirectTo, { replace: true });
  };

  // ── Register ──────────────────────────────────────────────────────────────
  const register = async (data: RegisterData) => {
    const res = await authApi.register(data);
    const { user: u, token: t } = res.data.data!;
    TokenService.setToken(t);
    setToken(t);
    setUser(u);
    navigate('/onboarding', { replace: true });
  };

  // ── Logout ────────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    try { await authApi.logout(); } catch { /* ignore */ }
    TokenService.removeToken();
    setToken(null);
    setUser(null);
    navigate('/login', { replace: true });
  }, [navigate]);

  // ── Refresh user data ─────────────────────────────────────────────────────
  const refreshUser = useCallback(async () => {
    const res = await authApi.me();
    setUser(res.data.data ?? null);
  }, []);

  const updateUser = (u: SafeUser) => setUser(u);

  // Save current path for after-login redirect (except /login and /register)
  useEffect(() => {
    const pub = ['/login', '/register'];
    if (!pub.includes(location.pathname) && !user && !loading) {
      sessionStorage.setItem(REDIRECT_KEY, location.pathname + location.search);
    }
  }, [location, user, loading]);

  return (
    <AuthContext.Provider value={{ user, token, loading, isAdmin, login, completeSocialLogin, register, logout, updateUser, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
