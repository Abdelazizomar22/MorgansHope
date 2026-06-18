import type { Response } from 'express';
import { env, isProduction } from './env';

export const ACCESS_COOKIE = 'morgans_hope_access';
export const REFRESH_COOKIE = 'morgans_hope_refresh';

const baseCookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: 'lax' as const,
  path: '/',
  domain: env.cookieDomain,
};

export function getAccessCookieOptions(maxAgeMs = 15 * 60 * 1000) {
  return { ...baseCookieOptions, maxAge: maxAgeMs };
}

export function getRefreshCookieOptions(rememberMe: boolean, maxAgeMs?: number) {
  if (rememberMe && maxAgeMs) {
    return { ...baseCookieOptions, maxAge: maxAgeMs };
  }
  return { ...baseCookieOptions };
}

export function setAuthCookies(
  res: Response,
  session: {
    accessToken: string;
    refreshToken: string;
    accessMaxAgeMs: number;
    refreshMaxAgeMs?: number;
  },
  rememberMe: boolean,
) {
  res.cookie(ACCESS_COOKIE, session.accessToken, getAccessCookieOptions(session.accessMaxAgeMs));
  res.cookie(REFRESH_COOKIE, session.refreshToken, getRefreshCookieOptions(rememberMe, session.refreshMaxAgeMs));
}

export function clearAuthCookies(res: Response) {
  const options = {
    path: '/',
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: isProduction,
    domain: env.cookieDomain,
  };

  res.clearCookie(ACCESS_COOKIE, options);
  res.clearCookie(REFRESH_COOKIE, options);
}
