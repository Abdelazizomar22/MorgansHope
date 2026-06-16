import rateLimit from 'express-rate-limit';
import type { AuthRequest } from './auth';

interface RateLimiterConfig {
  windowMs?: number;
  max: number;
  message?: string;
}

export function userRateLimiter(config: RateLimiterConfig) {
  return rateLimit({
    windowMs: config.windowMs || 15 * 60 * 1000,
    max: config.max,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
      const authReq = req as AuthRequest;
      if (authReq.user?.id) return `user:${authReq.user.id}`;
      return `ip:${req.ip || req.socket.remoteAddress || 'unknown'}`;
    },
    message: {
      success: false,
      message: config.message || 'Too many requests, please try again later.',
    },
  });
}
