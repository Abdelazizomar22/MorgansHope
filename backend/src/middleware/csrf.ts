import crypto from 'crypto';
import type { NextFunction, Request, Response } from 'express';
import { env, isProduction } from '../config/env';

export const CSRF_COOKIE = 'morgans_hope_csrf';

const allowedOrigins = new Set([
  env.frontendUrl,
  ...env.frontendUrls,
  ...(isProduction ? [] : ['http://localhost:3001']),
].filter(Boolean));

function normalizeOrigin(origin: string) {
  let end = origin.length;
  while (end > 0 && origin.charCodeAt(end - 1) === 47) {
    end -= 1;
  }
  return origin.slice(0, end);
}

export function issueCsrfToken(_req: Request, res: Response) {
  const token = crypto.randomBytes(32).toString('base64url');
  res.cookie(CSRF_COOKIE, token, {
    httpOnly: false,
    secure: isProduction,
    sameSite: 'lax',
    path: '/',
    domain: env.cookieDomain,
  });
  res.json({ success: true, data: { csrfToken: token } });
}

export function csrfProtection(req: Request, res: Response, next: NextFunction) {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();
  // QStash requests are authenticated with a signed body in the internal controller.
  if (req.path === '/api/internal/jobs/analysis') return next();

  const origin = req.headers.origin;
  if (origin && !allowedOrigins.has(normalizeOrigin(origin))) {
    res.status(403).json({ success: false, message: 'Request origin is not allowed.' });
    return;
  }

  const cookieToken = req.cookies?.[CSRF_COOKIE];
  const headerToken = req.headers['x-csrf-token'];
  if (!cookieToken || typeof headerToken !== 'string') {
    res.status(403).json({ success: false, message: 'CSRF token is missing.' });
    return;
  }

  const cookieBuffer = Buffer.from(cookieToken);
  const headerBuffer = Buffer.from(headerToken);
  if (cookieBuffer.length !== headerBuffer.length || !crypto.timingSafeEqual(cookieBuffer, headerBuffer)) {
    res.status(403).json({ success: false, message: 'CSRF token is invalid.' });
    return;
  }
  next();
}
