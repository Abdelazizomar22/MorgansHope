import type { NextFunction, Request, Response } from 'express';

const blockedCookieNames = new Set(['__proto__', 'constructor', 'prototype']);

function decodeCookieValue(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export function parseCookies(req: Request, _res: Response, next: NextFunction) {
  const cookies: Record<string, string> = Object.create(null);
  const header = req.headers.cookie;

  if (header) {
    for (const item of header.split(';')) {
      const separator = item.indexOf('=');
      if (separator <= 0) continue;

      const name = item.slice(0, separator).trim();
      if (
        !name
        || blockedCookieNames.has(name)
        || Object.prototype.hasOwnProperty.call(cookies, name)
      ) continue;

      cookies[name] = decodeCookieValue(item.slice(separator + 1).trim());
    }
  }

  req.cookies = cookies;
  next();
}
