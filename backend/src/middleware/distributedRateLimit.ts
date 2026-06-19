import type { NextFunction, Request, Response } from 'express';
import { Ratelimit } from '@upstash/ratelimit';
import { getRedis, isRedisConfigured } from '../infrastructure/cache/redis';
import { env } from '../config/env';
import type { AuthRequest } from './auth';

type LimitName = 'global' | 'login' | 'register' | 'otp' | 'upload' | 'chat' | 'contact';

const settings: Record<LimitName, { requests: number; window: Parameters<typeof Ratelimit.slidingWindow>[1] }> = {
  global: { requests: 200, window: '15 m' },
  login: { requests: 10, window: '15 m' },
  register: { requests: 5, window: '1 h' },
  otp: { requests: 5, window: '15 m' },
  upload: { requests: 20, window: '15 m' },
  chat: { requests: 30, window: '15 m' },
  contact: { requests: 5, window: '1 h' },
};

const limiters = new Map<LimitName, Ratelimit>();

function limiterFor(name: LimitName) {
  let limiter = limiters.get(name);
  if (!limiter) {
    const config = settings[name];
    limiter = new Ratelimit({
      redis: getRedis()!,
      limiter: Ratelimit.slidingWindow(config.requests, config.window),
      prefix: `morgans-hope:ratelimit:${name}`,
      analytics: true,
    });
    limiters.set(name, limiter);
  }
  return limiter;
}

export function distributedRateLimit(name: LimitName) {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!env.enableDistributedRateLimit || !isRedisConfigured()) return next();

    const authRequest = req as AuthRequest;
    const account = String(req.body?.email || req.body?.identifier || '').trim().toLowerCase();
    const identity = authRequest.user?.id
      ? `user:${authRequest.user.id}`
      : account
        ? `account:${account}:ip:${req.ip}`
        : `ip:${req.ip}`;

    const result = await limiterFor(name).limit(identity);
    res.setHeader('RateLimit-Limit', String(result.limit));
    res.setHeader('RateLimit-Remaining', String(result.remaining));
    res.setHeader('RateLimit-Reset', String(result.reset));

    if (!result.success) {
      res.status(429).json({ success: false, message: 'Too many requests. Please try again later.' });
      return;
    }
    next();
  };
}
