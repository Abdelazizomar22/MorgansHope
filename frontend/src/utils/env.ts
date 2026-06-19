const cleanEnvUrl = (value?: string) => {
  if (!value) return '';

  let normalized = value.trim();
  if (
    normalized.length >= 2
    && ((normalized.startsWith('"') && normalized.endsWith('"'))
      || (normalized.startsWith("'") && normalized.endsWith("'")))
  ) {
    normalized = normalized.slice(1, -1);
  }

  let end = normalized.length;
  while (end > 0 && normalized.charCodeAt(end - 1) === 47) {
    end -= 1;
  }
  return normalized.slice(0, end);
};

const isBrowser = typeof window !== 'undefined';
const isLocalHost = isBrowser && /^(localhost|127\.0\.0\.1)$/i.test(window.location.hostname);

export const API_BASE_URL = isLocalHost
  ? (cleanEnvUrl(import.meta.env.VITE_API_URL) || '/api')
  : '/api';

export const GOOGLE_AUTH_URL = isLocalHost
  ? (cleanEnvUrl(import.meta.env.VITE_GOOGLE_AUTH_URL) || `${API_BASE_URL}/auth/google`)
  : '/api/auth/google';
