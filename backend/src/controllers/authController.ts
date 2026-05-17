import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';
import { body, validationResult } from 'express-validator';
import User from '../models/User';
import { AuthRequest, JWT_SECRET, REFRESH_SECRET } from '../middleware/auth';
import { asyncHandler } from '../utils/asyncHandler';
import { verifyFirebaseIdToken } from '../config/firebaseAdmin';

const ACCESS_TOKEN_TTL = '15m';
const REFRESH_TOKEN_TTL = '7d';
const REFRESH_TOKEN_LONG_TTL = '30d';
const REFRESH_COOKIE = 'medtech_refresh';
const PHONE_EMAIL_DOMAIN = 'phone.morganshope.local';

// â”€â”€ Cookie options â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function cookieOptions(maxAgeMs: number) {
  const isProd = process.env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    sameSite: (isProd ? 'none' : 'strict') as 'none' | 'strict',
    secure: isProd,
    maxAge: maxAgeMs,
    path: '/',
  };
}

function makeAccessToken(id: number, ttl = ACCESS_TOKEN_TTL) {
  return jwt.sign({ id }, JWT_SECRET, { expiresIn: ttl as any });
}

function makeRefreshToken(id: number, rememberMe = false) {
  return jwt.sign(
    { id, rememberMe },
    REFRESH_SECRET,
    { expiresIn: (rememberMe ? REFRESH_TOKEN_LONG_TTL : REFRESH_TOKEN_TTL) as any },
  );
}

const normalizeEmail = (value?: string) => value?.toLowerCase().trim() || '';
const normalizePhone = (value?: string) => value?.replace(/[^\d+]/g, '').trim() || '';
const isEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
const generateVerificationCode = () => Math.floor(100000 + Math.random() * 900000).toString();

function queueVerification(user: User, channel: 'email' | 'phone') {
  const code = generateVerificationCode();
  user.verificationCode = code;
  user.verificationChannel = channel;
  user.verificationExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

  if (process.env.NODE_ENV !== 'production') {
    console.log('[Auth] Verification code for ' + channel + ': ' + code);
  }

  return code;
}

const toE164EgyptPhone = (phone?: string) => {
  const normalized = normalizePhone(phone);
  if (!normalized) return '';
  if (normalized.startsWith('+')) return normalized;
  if (normalized.startsWith('00')) return '+' + normalized.slice(2);
  if (normalized.startsWith('0')) return '+20' + normalized.slice(1);
  return normalized;
};

// â”€â”€ Validators â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
];

export const loginValidators = [
  body('email').optional({ checkFalsy: true }).trim(),
  body('identifier').optional({ checkFalsy: true }).trim(),
  body('password').notEmpty().withMessage('Password is required'),
  body().custom((_value, { req }) => {
    if (!req.body.email && !req.body.identifier) throw new Error('Email is required');
    return true;
  }),
];

// â”€â”€ Register â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

  const email = normalizeEmail(req.body.email);
  const { firstName, lastName, password, age, gender, smokingHistory } = req.body;

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
    age,
    gender,
    smokingHistory,
    role: req.body.role || 'user',
    acceptedDisclaimer: req.body.acceptedDisclaimer === true,
    onboardingCompleted: false,
    authProvider: 'local',
    emailVerified: true,
    phoneVerified: false,
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

// â”€â”€ Login â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

  const identifier = (req.body.identifier || req.body.email || '').toString().trim();
  const normalizedEmail = normalizeEmail(identifier);
    const password = (req.body.password || '').toString().trim();
  const rememberMe = req.body.rememberMe;

  if (process.env.NODE_ENV !== 'production') {
    console.log('[Auth] Login attempt:', identifier);
  }

  let user = isEmail(normalizedEmail)
    ? await User.findOne({ where: { email: normalizedEmail, isActive: true } })
    : null;

  if (!user && process.env.NODE_ENV !== 'production' && normalizedEmail === 'admin@medtech.com' && password === 'Admin@123456') {
    const hashed = await bcrypt.hash(password, 12);
    user = await User.create({
      firstName: 'Admin',
      lastName: 'MedTech',
      email: normalizedEmail,
      password: hashed,
      role: 'admin',
      emailVerified: true,
      acceptedDisclaimer: true,
      onboardingCompleted: true,
    });
  }

  const devHint =
    process.env.NODE_ENV !== 'production'
      ? ' Open http://localhost:3000/api/auth/dev-setup in browser to create admin (admin@medtech.com / Admin@123456).'
      : '';

  if (!user) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[Auth] Login failed: no user with identifier', identifier);
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
      console.warn('[Auth] Login failed: wrong password for', identifier);
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
  const refreshToken = makeRefreshToken(user.id, Boolean(rememberMe));

  res.cookie(REFRESH_COOKIE, refreshToken, cookieOptions(cookieMaxMs));

  res.json({
    success: true,
    message: 'Login successful',
    data: { user: user.toSafeJSON(), token: accessToken },
  });
});

// â”€â”€ Logout â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const logout = asyncHandler(async (_req: Request, res: Response) => {
  res.clearCookie(REFRESH_COOKIE, { path: '/' });
  res.json({ success: true, message: 'Logged out successfully' });
});

// â”€â”€ Refresh Access Token â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const refreshToken = asyncHandler(async (req: Request, res: Response) => {
  const token = req.cookies?.[REFRESH_COOKIE];
  if (!token) {
    res.status(401).json({ success: false, message: 'No refresh token' });
    return;
  }

  let payload: { id: number; rememberMe?: boolean };
  try {
    payload = jwt.verify(token, REFRESH_SECRET) as { id: number; rememberMe?: boolean };
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

  const rememberMe = payload.rememberMe === true;
  const newAccessToken = makeAccessToken(user.id, rememberMe ? '7d' : ACCESS_TOKEN_TTL);
  const newRefreshToken = makeRefreshToken(user.id, rememberMe);
  const cookieMaxMs = rememberMe ? 30 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000;

  res.cookie(REFRESH_COOKIE, newRefreshToken, cookieOptions(cookieMaxMs));

  res.json({
    success: true,
    message: 'Token refreshed',
    data: { token: newAccessToken, user: user.toSafeJSON() },
  });
});

// â”€â”€ /me â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const me = asyncHandler(async (req: AuthRequest, res: Response) => {
  res.json({ success: true, message: 'User retrieved', data: req.user!.toSafeJSON() });
});

// â”€â”€ Update Profile â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
  if (phone !== undefined) {
    const nextPhone = normalizePhone(phone);
    if (nextPhone !== (user.phone || '')) {
      user.phone = nextPhone || undefined;
      user.phoneVerified = false;
    }
  }
  if (age !== undefined) user.age = age;
  if (gender !== undefined) user.gender = gender;
  if (smokingHistory !== undefined) user.smokingHistory = smokingHistory;
  if (medicalHistory !== undefined) user.medicalHistory = medicalHistory;
  if (req.body.onboardingCompleted !== undefined) user.onboardingCompleted = req.body.onboardingCompleted === true;

  await user.save();
  res.json({ success: true, message: 'Profile updated', data: user.toSafeJSON() });
});

export const verifyContact = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = req.user!;
  const code = (req.body.code || '').toString().trim();

  if (!user.verificationCode || !user.verificationChannel || !user.verificationExpiresAt) {
    res.status(400).json({ success: false, message: 'No verification is pending.' });
    return;
  }

  if (user.verificationExpiresAt.getTime() < Date.now()) {
    res.status(400).json({ success: false, message: 'Verification code expired.' });
    return;
  }

  if (code !== user.verificationCode) {
    res.status(400).json({ success: false, message: 'Invalid verification code.' });
    return;
  }

  if (user.verificationChannel === 'email') user.emailVerified = true;
  if (user.verificationChannel === 'phone') user.phoneVerified = true;
  user.verificationCode = null;
  user.verificationChannel = null;
  user.verificationExpiresAt = null;
  await user.save();

  res.json({ success: true, message: 'Contact verified', data: user.toSafeJSON() });
});

export const resendVerification = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = req.user!;
  const channel: 'email' | 'phone' = req.body.channel || (user.email && !user.email.endsWith(`@${PHONE_EMAIL_DOMAIN}`) ? 'email' : 'phone');

  if (channel === 'email' && (!user.email || user.email.endsWith(`@${PHONE_EMAIL_DOMAIN}`))) {
    res.status(400).json({ success: false, message: 'No email address is available for verification.' });
    return;
  }
  if (channel === 'phone' && !user.phone) {
    res.status(400).json({ success: false, message: 'No phone number is available for verification.' });
    return;
  }

  const verificationCode = queueVerification(user, channel);
  await user.save();

  res.json({
    success: true,
    message: channel === 'phone'
      ? 'Use Firebase Phone Auth on the client to send and verify phone OTPs.'
      : `Verification code generated for your ${channel}.`,
    data: {
      channel,
      ...(process.env.NODE_ENV !== 'production' ? { devCode: verificationCode } : {}),
    },
  });
});

export const verifyFirebasePhone = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = req.user!;
  const idToken = (req.body.idToken || '').toString().trim();

  if (!idToken) {
    res.status(400).json({ success: false, message: 'Firebase phone verification token is required.' });
    return;
  }

  const decoded = await verifyFirebaseIdToken(idToken);
  const firebasePhone = typeof decoded.phone_number === 'string' ? decoded.phone_number : '';

  if (!firebasePhone) {
    res.status(400).json({ success: false, message: 'Firebase token does not contain a verified phone number.' });
    return;
  }

  const currentPhone = toE164EgyptPhone(user.phone);
  if (currentPhone && currentPhone !== firebasePhone) {
    res.status(400).json({ success: false, message: 'Verified phone does not match your profile phone number.' });
    return;
  }

  user.phone = firebasePhone;
  user.phoneVerified = true;
  user.verificationCode = null;
  user.verificationChannel = null;
  user.verificationExpiresAt = null;
  await user.save();

  res.json({ success: true, message: 'Phone verified with Firebase', data: user.toSafeJSON() });
});

// â”€â”€ Upload Avatar â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const uploadAvatar = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = req.user!;
  if (!req.file) {
    res.status(400).json({ success: false, message: 'No image file provided' });
    return;
  }

  if (req.file.size > 2 * 1024 * 1024) {
    try {
      fs.unlinkSync(req.file.path);
    } catch { }
    res.status(413).json({ success: false, message: 'Avatar image must be 2MB or smaller' });
    return;
  }

  const imageBuffer = fs.readFileSync(req.file.path);
  const mimeType = req.file.mimetype || 'image/png';
  const dataUri = `data:${mimeType};base64,${imageBuffer.toString('base64')}`;

  if (user.profilePicture && !/^https?:\/\//i.test(user.profilePicture) && !user.profilePicture.startsWith('data:')) {
    try {
      const uploadsRoot = process.env.UPLOAD_DIR || 'uploads';
      const uploadPath = path.isAbsolute(uploadsRoot)
        ? uploadsRoot
        : path.join(process.cwd(), uploadsRoot);
      const oldPath = path.join(uploadPath, user.profilePicture);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    } catch { }
  }

  user.profilePicture = dataUri;
  await user.save();

  try {
    fs.unlinkSync(req.file.path);
  } catch { }

  res.json({ success: true, message: 'Profile picture updated', data: user.toSafeJSON() });
});

