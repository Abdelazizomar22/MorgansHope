import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { asyncHandler } from '../utils/asyncHandler';

const JWT_SECRET = process.env.JWT_SECRET || 'changeme_min32chars_xxxxxxxxxxxxxxxxxx';
const REFRESH_SECRET = process.env.REFRESH_SECRET || `${JWT_SECRET}_refresh`;

export interface AuthRequest extends Request {
  user?: InstanceType<typeof User>;
  requestId?: string;
}

// ── Authenticate (Bearer access token) ───────────────────────────────────────
export const authenticate = asyncHandler(async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ success: false, message: 'No token provided' });
    return;
  }

  const token = header.slice(7);
  const payload = jwt.verify(token, JWT_SECRET) as { id: number };

  const user = await User.findOne({ where: { id: payload.id, isActive: true } });
  if (!user) {
    res.status(401).json({ success: false, message: 'User not found or inactive' });
    return;
  }

  req.user = user;
  next();
}) as unknown as (req: AuthRequest, res: Response, next: NextFunction) => void;

// ── Require Role ──────────────────────────────────────────────────────────────
export function requireRole(...roles: Array<'admin' | 'user'>) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated' });
      return;
    }
    if (!roles.includes(req.user.role)) {
      res.status(403).json({ success: false, message: 'Insufficient permissions' });
      return;
    }
    next();
  };
}

// ── Verify Refresh Token (from HttpOnly cookie) ───────────────────────────────
export async function verifyRefreshToken(token: string): Promise<{ id: number } | null> {
  try {
    return jwt.verify(token, REFRESH_SECRET) as { id: number };
  } catch {
    return null;
  }
}

export { JWT_SECRET, REFRESH_SECRET };
