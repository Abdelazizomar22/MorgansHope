import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import User from '../models/User';
import { AuthRequest, JWT_SECRET, REFRESH_SECRET } from '../middleware/auth';
import { asyncHandler } from '../utils/asyncHandler';

const ACCESS_TOKEN_TTL = '15m';
const REFRESH_TOKEN_TTL = '7d';
const REFRESH_COOKIE = 'medtech_refresh';

// ── Cookie options ────────────────────────────────────────────────────────────
function cookieOptions(maxAgeMs: number) {
  return {
    httpOnly: true,
    sameSite: 'strict' as const,
    secure: process.env.NODE_ENV === 'production',
    maxAge: maxAgeMs,
    path: '/',
  };
}

function makeAccessToken(id: number, ttl = ACCESS_TOKEN_TTL) {
  return jwt.sign({ id }, JWT_SECRET, { expiresIn: ttl as any });
}

function makeRefreshToken(id: number) {
  return jwt.sign({ id }, REFRESH_SECRET, { expiresIn: REFRESH_TOKEN_TTL as any });
}

// ── Validators ────────────────────────────────────────────────────────────────
export const registerValidators = [
  body('firstName').trim().notEmpty().withMessage('First name is required'),
  body('lastName').trim().notEmpty().withMessage('Last name is required'),
  body('email')
    .customSanitizer((v: string) => v?.toLowerCase().trim())
    .isEmail().withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
    .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter')
    .matches(/[0-9]/).withMessage('Password must contain at least one number'),
  body('confirmPassword').custom((val, { req }) => {
    if (val !== req.body.password) throw new Error('Passwords do not match');
    return true;
  }),
  body('acceptedDisclaimer')
    .custom((value) => value === true)
    .withMessage('You must accept the medical disclaimer to continue'),
  body('phone').optional().trim(),
];

export const loginValidators = [
  body('email')
    .customSanitizer((v: string) => v?.toLowerCase().trim())
    .isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

// ── Register ──────────────────────────────────────────────────────────────────
export const register = asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(422).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(e => ({ field: (e as any).path, message: e.msg })),
    });
    return;
  }

  const { firstName, lastName, email, password, phone, age, gender, smokingHistory } = req.body;

  const existing = await User.findOne({ where: { email } });
  if (existing) {
    res.status(409).json({ success: false, message: 'Email already registered' });
    return;
  }

  const hashed = await bcrypt.hash(password, 12);
  const user = await User.create({
    firstName,
    lastName,
    email,
    password: hashed,
    phone,
    age,
    gender,
    smokingHistory,
    role: req.body.role || 'user'
  });

  const accessToken = makeAccessToken(user.id);
  const refreshToken = makeRefreshToken(user.id);

  res.cookie(REFRESH_COOKIE, refreshToken, cookieOptions(7 * 24 * 60 * 60 * 1000));

  res.status(201).json({
    success: true,
    message: 'Account created successfully',
    data: { user: user.toSafeJSON(), token: accessToken },
  });
});

// ── Login ─────────────────────────────────────────────────────────────────────
export const login = asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(422).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(e => ({ field: (e as any).path, message: e.msg })),
    });
    return;
  }

  const email = (req.body.email || '').toLowerCase().trim();
  const password = (req.body.password || '').toString().trim();
  const rememberMe = req.body.rememberMe;

  if (process.env.NODE_ENV !== 'production') {
    console.log('[Auth] Login attempt:', email);
  }

  let user = await User.findOne({ where: { email, isActive: true } });

  if (!user && process.env.NODE_ENV !== 'production' && email === 'admin@medtech.com' && password === 'Admin@123456') {
    const hashed = await bcrypt.hash(password, 12);
    user = await User.create({
      firstName: 'Admin',
      lastName: 'MedTech',
      email,
      password: hashed,
      role: 'admin',
    });
  }

  const devHint =
    process.env.NODE_ENV !== 'production'
      ? ' Open http://localhost:3000/api/auth/dev-setup in browser to create admin (admin@medtech.com / Admin@123456).'
      : '';

  if (!user) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[Auth] Login failed: no user with email', email);
    }
    await bcrypt.compare(password, '$2b$12$invalidhashplaceholderxxxxxxxxxxxxxxx');
    res.status(401).json({
      success: false,
      message: 'Invalid email or password.' + devHint,
    });
    return;
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[Auth] Login failed: wrong password for', email);
    }
    res.status(401).json({
      success: false,
      message: 'Invalid email or password.' + devHint,
    });
    return;
  }

  // rememberMe = 7-day access token, else 15 min
  const accessTTL = rememberMe ? '7d' : ACCESS_TOKEN_TTL;
  const cookieMaxMs = rememberMe ? 30 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000;

  const accessToken = makeAccessToken(user.id, accessTTL);
  const refreshToken = makeRefreshToken(user.id);

  res.cookie(REFRESH_COOKIE, refreshToken, cookieOptions(cookieMaxMs));

  res.json({
    success: true,
    message: 'Login successful',
    data: { user: user.toSafeJSON(), token: accessToken },
  });
});

// ── Logout ────────────────────────────────────────────────────────────────────
export const logout = asyncHandler(async (_req: Request, res: Response) => {
  res.clearCookie(REFRESH_COOKIE, { path: '/' });
  res.json({ success: true, message: 'Logged out successfully' });
});

// ── Refresh Access Token ──────────────────────────────────────────────────────
export const refreshToken = asyncHandler(async (req: Request, res: Response) => {
  const token = req.cookies?.[REFRESH_COOKIE];
  if (!token) {
    res.status(401).json({ success: false, message: 'No refresh token' });
    return;
  }

  let payload: { id: number };
  try {
    payload = jwt.verify(token, REFRESH_SECRET) as { id: number };
  } catch {
    res.clearCookie(REFRESH_COOKIE, { path: '/' });
    res.status(401).json({ success: false, message: 'Invalid or expired refresh token' });
    return;
  }

  const user = await User.findOne({ where: { id: payload.id, isActive: true } });
  if (!user) {
    res.clearCookie(REFRESH_COOKIE, { path: '/' });
    res.status(401).json({ success: false, message: 'User not found' });
    return;
  }

  const newAccessToken = makeAccessToken(user.id);
  const newRefreshToken = makeRefreshToken(user.id);

  res.cookie(REFRESH_COOKIE, newRefreshToken, cookieOptions(7 * 24 * 60 * 60 * 1000));

  res.json({
    success: true,
    message: 'Token refreshed',
    data: { token: newAccessToken, user: user.toSafeJSON() },
  });
});

// ── /me ───────────────────────────────────────────────────────────────────────
export const me = asyncHandler(async (req: AuthRequest, res: Response) => {
  res.json({ success: true, message: 'User retrieved', data: req.user!.toSafeJSON() });
});

// ── Update Profile ────────────────────────────────────────────────────────────
export const updateProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = req.user!;
  const { firstName, lastName, phone, currentPassword, newPassword, age, gender, smokingHistory, medicalHistory } = req.body;

  if (currentPassword || newPassword) {
    if (!currentPassword || !newPassword) {
      res.status(400).json({ success: false, message: 'Both currentPassword and newPassword are required' });
      return;
    }
    const match = await bcrypt.compare(currentPassword, user.password);
    if (!match) {
      res.status(400).json({ success: false, message: 'Current password is incorrect' });
      return;
    }
    if (newPassword.length < 8) {
      res.status(422).json({ success: false, message: 'New password must be at least 8 characters' });
      return;
    }
    user.password = await bcrypt.hash(newPassword, 12);
  }

  if (firstName) user.firstName = firstName.trim();
  if (lastName) user.lastName = lastName.trim();
  if (phone !== undefined) user.phone = phone?.trim() || undefined;
  if (age !== undefined) user.age = age;
  if (gender !== undefined) user.gender = gender;
  if (smokingHistory !== undefined) user.smokingHistory = smokingHistory;
  if (medicalHistory !== undefined) user.medicalHistory = medicalHistory;

  await user.save();
  res.json({ success: true, message: 'Profile updated', data: user.toSafeJSON() });
});

// ── Upload Avatar ────────────────────────────────────────────────────────────
export const uploadAvatar = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = req.user!;
  if (!req.file) {
    res.status(400).json({ success: false, message: 'No image file provided' });
    return;
  }

  if (user.profilePicture) {
    try {
      const fs = await import('fs');
      const path = await import('path');
      const uploadsRoot = process.env.UPLOAD_DIR || 'uploads';
      const uploadPath = path.isAbsolute(uploadsRoot)
        ? uploadsRoot
        : path.join(process.cwd(), uploadsRoot);
      const oldPath = path.join(uploadPath, user.profilePicture);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    } catch { }
  }

  user.profilePicture = req.file.filename;
  await user.save();

  res.json({ success: true, message: 'Profile picture updated', data: user.toSafeJSON() });
});
