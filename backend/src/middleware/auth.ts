import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { asyncHandler } from '../utils/asyncHandler';
import { env } from '../config/env';
import { isSessionActive } from '../application/auth/sessionService';
import { ACCESS_COOKIE } from '../config/authCookies';

const JWT_SECRET = env.jwtSecret || 'development_only_jwt_secret_minimum_32_chars';

export interface AuthRequest extends Request {
  user?: InstanceType<typeof User>;
  requestId?: string;
}

export const authenticate = asyncHandler(async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  const header = req.headers.authorization;
  const token = header?.startsWith('Bearer ') ? header.slice(7) : req.cookies?.[ACCESS_COOKIE];

  if (!token) {
    res.status(401).json({ success: false, message: 'Authentication required.' });
    return;
  }

  const payload = jwt.verify(token, JWT_SECRET, {
    issuer: 'morgans-hope',
    audience: 'morgans-hope-web',
  }) as unknown as { sub?: number | string; sid?: string; id?: number };

  const userId = Number(payload.sub || payload.id);
  if (!userId || Number.isNaN(userId)) {
    res.status(401).json({ success: false, message: 'Authentication token is invalid.' });
    return;
  }

  if (payload.sid && !(await isSessionActive(payload.sid, userId))) {
    res.status(401).json({ success: false, message: 'Session is no longer active.' });
    return;
  }

  const user = await User.findOne({ where: { id: userId, isActive: true } });
  if (!user) {
    res.status(401).json({ success: false, message: 'User not found or inactive.' });
    return;
  }

  req.user = user;
  next();
}) as unknown as (req: AuthRequest, res: Response, next: NextFunction) => void;

export function requireRole(...roles: Array<'admin' | 'user'>) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated.' });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({ success: false, message: 'Insufficient permissions.' });
      return;
    }

    next();
  };
}

export { JWT_SECRET };
