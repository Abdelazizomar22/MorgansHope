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
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  acceptedDisclaimer: boolean;
  age?: number;
  gender?: 'male' | 'female' | 'other';
  smokingHistory?: 'never' | 'former' | 'current';
  medicalHistory?: string;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const REDIRECT_KEY = 'morgans_hope_redirect_after_login';
export const VERIFICATION_NOTICE_KEY = 'morgans_hope_verification_notice';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SafeUser | null>(null);
  const [token, setToken] = useState<string | null>(TokenService.getToken() || null);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const location = useLocation();

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    let active = true;

    const bootstrapAuth = async () => {
      const stored = TokenService.getToken();

      if (stored) {
        setToken(stored);
      }

      try {
        if (stored) {
          const res = await authApi.me();
          if (!active) return;
          setUser(res.data.data ?? null);
          return;
        }

        const res = await authApi.refresh();
        const restoredToken = res.data.data?.token ?? null;
        const restoredUser = res.data.data?.user ?? null;

        if (!active) return;

        if (restoredToken) {
          TokenService.setToken(restoredToken, TokenService.isPersistent());
          setToken(restoredToken);
        }

        setUser(restoredUser);
      } catch {
        TokenService.removeToken();
        if (!active) return;
        setToken(null);
        setUser(null);
      } finally {
        if (active) setLoading(false);
      }
    };

    bootstrapAuth();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const handleForcedLogout = () => {
      setUser(null);
      setToken(null);
      TokenService.removeToken();
      sessionStorage.removeItem(REDIRECT_KEY);
      navigate('/', { replace: true });
    };

    window.addEventListener('auth:logout', handleForcedLogout);
    return () => window.removeEventListener('auth:logout', handleForcedLogout);
  }, [navigate]);

  const resolvePostLoginPath = (currentUser: SafeUser | null) => {
    if (currentUser && !currentUser.onboardingCompleted) return '/onboarding';
    return sessionStorage.getItem(REDIRECT_KEY) || '/';
  };

  const login = async (identifier: string, password: string, rememberMe = false) => {
    const res = await authApi.login({ identifier, password, rememberMe });
    const { user: nextUser, token: nextToken } = res.data.data!;

    TokenService.setToken(nextToken, rememberMe);
    setToken(nextToken);
    setUser(nextUser);

    const redirectTo = resolvePostLoginPath(nextUser);
    sessionStorage.removeItem(REDIRECT_KEY);
    navigate(redirectTo, { replace: true });
  };

  const completeSocialLogin = async (incomingToken: string) => {
    TokenService.setToken(incomingToken, true);
    setToken(incomingToken);

    const res = await authApi.me();
    const currentUser = res.data.data ?? null;
    setUser(currentUser);

    const redirectTo = resolvePostLoginPath(currentUser);
    sessionStorage.removeItem(REDIRECT_KEY);
    navigate(redirectTo, { replace: true });
  };

  const register = async (data: RegisterData) => {
    const res = await authApi.register(data);
    const { user: nextUser, token: nextToken, verification } = res.data.data!;

    TokenService.setToken(nextToken, false);
    setToken(nextToken);
    setUser(nextUser);

    if (verification?.required) {
      const notice = verification.devCode
        ? `We've emailed your verification code. Dev code: ${verification.devCode}`
        : "We've emailed your verification code. Enter it to activate your account.";
      sessionStorage.setItem(VERIFICATION_NOTICE_KEY, notice);
    }

    navigate('/onboarding', { replace: true });
  };

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // Ignore logout transport errors and clear local auth state anyway.
    }

    TokenService.removeToken();
    setToken(null);
    setUser(null);
    sessionStorage.removeItem(REDIRECT_KEY);
    navigate('/', { replace: true });
  }, [navigate]);

  const refreshUser = useCallback(async () => {
    const res = await authApi.me();
    setUser(res.data.data ?? null);
  }, []);

  const updateUser = (nextUser: SafeUser) => setUser(nextUser);

  useEffect(() => {
    const protectedPrefixes = ['/results', '/profile', '/onboarding'];
    const shouldRemember = protectedPrefixes.some((prefix) => location.pathname.startsWith(prefix));

    if (shouldRemember && !user && !loading) {
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
