const cleanEnvUrl = (value?: string) =>
  value?.trim().replace(/^['"]|['"]$/g, '').replace(/\/+$/, '') || '';

export const API_BASE_URL = cleanEnvUrl(import.meta.env.VITE_API_URL) || '/api';

export const GOOGLE_AUTH_URL = cleanEnvUrl(import.meta.env.VITE_GOOGLE_AUTH_URL)
  || `${API_BASE_URL}/auth/google`;
