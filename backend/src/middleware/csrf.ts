import { Request, Response, NextFunction } from 'express';

const normalizeOrigin = (origin: string) => origin.trim().replace(/^['"]|['"]$/g, '').replace(/\/+$/, '');

const isDev = process.env.NODE_ENV !== 'production';

const envOrigins = [
  process.env.FRONTEND_URLS || '',
  process.env.FRONTEND_URL || '',
]
  .flatMap((value) => value.split(','))
  .map((origin) => normalizeOrigin(origin))
  .filter(Boolean);

const configuredOrigins = Array.from(
  new Set([
    'https://morgans-hope.vercel.app',
    'http://localhost:3001',
    ...envOrigins,
  ]),
);

const vercelPreviewPattern = /^https:\/\/[a-z0-9-]+\.vercel\.app$/i;

function isAllowedOrigin(origin?: string): boolean {
  if (!origin || isDev) return true;
  const normalized = normalizeOrigin(origin);
  return configuredOrigins.includes(normalized) || vercelPreviewPattern.test(normalized);
}

export function sameOrigin(req: Request, res: Response, next: NextFunction) {
  if (isDev) return next();

  const origin = req.headers.origin as string | undefined;
  const referer = req.headers.referer as string | undefined;

  const source = origin || (referer ? new URL(referer).origin : null);

  if (!source) {
    res.status(403).json({ success: false, message: 'CSRF check failed: no origin or referer header' });
    return;
  }

  if (!isAllowedOrigin(source)) {
    res.status(403).json({ success: false, message: `CSRF check failed: blocked origin ${source}` });
    return;
  }

  next();
}

