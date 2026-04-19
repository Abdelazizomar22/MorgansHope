const cleanEnvUrl = (value?: string) =>
  value?.trim().replace(/^['"]|['"]$/g, '').replace(/\/+$/, '') || '';

const isBrowser = typeof window !== 'undefined';
const isLocalHost = isBrowser && /^(localhost|127\.0\.0\.1)$/i.test(window.location.hostname);

export const API_BASE_URL = isLocalHost
  ? (cleanEnvUrl(import.meta.env.VITE_API_URL) || '/api')
  : '/api';

export const GOOGLE_AUTH_URL = isLocalHost
  ? (cleanEnvUrl(import.meta.env.VITE_GOOGLE_AUTH_URL) || `${API_BASE_URL}/auth/google`)
  : '/api/auth/google';
