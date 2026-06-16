import { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { AuthRequest } from '../middleware/auth';
import { asyncHandler } from '../utils/asyncHandler';
import crypto from 'crypto';
import { generateOTP, hashOTP, verifyOTP } from '../utils/otp';
import { sendOTPEmail } from '../utils/mailer';
import * as authService from '../services/authService';

const REFRESH_COOKIE = 'medtech_refresh';

const cookieOptions = (maxAgeMs: number) => {
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
const generateVerificationCode = () => {
  const arr = new Uint32Array(1);
  crypto.getRandomValues(arr);
  return (100000 + (arr[0] % 900000)).toString();
};

function queueVerification(user: User, channel: 'email' | 'phone') {
  const code = generateVerificationCode();
  user.verificationCode = code;
  user.verificationChannel = channel;
  user.verificationExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

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

export const updateProfileValidators = [
  body('firstName').optional().trim().notEmpty().withMessage('First name cannot be empty'),
  body('lastName').optional().trim().notEmpty().withMessage('Last name cannot be empty'),
  body('phone').optional().trim(),
  body('age').optional().isInt({ min: 1, max: 150 }).withMessage('Age must be between 1 and 150'),
  body('gender').optional().isIn(['male', 'female', 'other']).withMessage('Gender must be male, female, or other'),
  body('newPassword')
    .optional()
    .isLength({ min: 8 }).withMessage('New password must be at least 8 characters')
    .matches(/[A-Z]/).withMessage('New password must contain at least one uppercase letter')
    .matches(/[a-z]/).withMessage('New password must contain at least one lowercase letter')
    .matches(/[0-9]/).withMessage('New password must contain at least one number'),
  body('currentPassword').if(body('newPassword').exists()).notEmpty().withMessage('Current password is required to set a new password'),
  body('smokingHistory').optional().trim(),
  body('medicalHistory').optional().trim(),
];

export const verifyContactValidators = [
  body('code').notEmpty().withMessage('Verification code is required').isString().trim(),
];

export const verifyPhoneOtpValidators = [
  body('otp').notEmpty().withMessage('OTP is required').isString().trim(),
];

export const resendVerificationValidators = [
  body('channel').optional().isIn(['email', 'phone']).withMessage('Channel must be email or phone'),
];

const devHint =
  process.env.NODE_ENV !== 'production'
    ? ' Open http://localhost:3000/api/auth/dev-setup in browser to create admin (admin@medtech.com / Admin@123456).'
    : '';

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

  const result = await authService.registerUser({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    password: req.body.password,
    age: req.body.age,
    gender: req.body.gender,
    smokingHistory: req.body.smokingHistory,
    role: req.body.role,
    acceptedDisclaimer: req.body.acceptedDisclaimer,
  });

  if (result.success === false) {
    res.status(409).json({ success: false, message: result.error });
    return;
  }

  res.cookie(REFRESH_COOKIE, result.data.refreshToken, cookieOptions(7 * 24 * 60 * 60 * 1000));
  res.status(201).json({
    success: true,
    message: 'Account created successfully',
    data: { user: result.data.user, token: result.data.accessToken },
  });
});

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
  const password = (req.body.password || '').toString().trim();
  const rememberMe = req.body.rememberMe;

  if (process.env.NODE_ENV !== 'production') {
    console.log('[Auth] Login attempt:', identifier);
  }

  let user = isEmail(normalizedEmail)
    ? await User.findOne({ where: { email: normalizedEmail, isActive: true } })
    : null;

  if (!user) {
    await bcrypt.compare(password, '$2b$12$invalidhashplaceholderxxxxxxxxxxxxxxx');
    res.status(401).json({ success: false, message: 'Invalid email or password.' });
    return;
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    res.status(401).json({ success: false, message: 'Invalid email or password.' });
    return;
  }

  res.cookie(REFRESH_COOKIE, result.data.refreshToken, cookieOptions(result.data.cookieMaxMs));

  res.json({
    success: true,
    message: 'Login successful',
    data: { user: result.data.user, token: result.data.accessToken },
  });
});

export const logout = asyncHandler(async (_req: Request, res: Response) => {
  res.clearCookie(REFRESH_COOKIE, { path: '/' });
  res.json({ success: true, message: 'Logged out successfully' });
});

export const refreshToken = asyncHandler(async (req: Request, res: Response) => {
  const token = req.cookies?.[REFRESH_COOKIE];
  if (!token) {
    res.status(401).json({ success: false, message: 'No refresh token' });
    return;
  }

  let payload: { id: number; rememberMe?: boolean };
  try {
    payload = jwt.verify(token, REFRESH_SECRET, { algorithms: ['HS256'] }) as { id: number; rememberMe?: boolean };
  } catch {
    res.clearCookie(REFRESH_COOKIE, { path: '/' });
    res.status(401).json({ success: false, message: 'Invalid or expired refresh token' });
    return;
  }

  if (result.success === false) {
    res.clearCookie(REFRESH_COOKIE, { path: '/' });
    res.status(401).json({ success: false, message: result.error });
    return;
  }

  res.cookie(REFRESH_COOKIE, result.data.refreshToken, cookieOptions(result.data.cookieMaxMs));

  res.json({
    success: true,
    message: 'Token refreshed',
    data: { token: result.data.accessToken, user: result.data.user },
  });
});

export const me = asyncHandler(async (req: AuthRequest, res: Response) => {
  res.json({ success: true, message: 'User retrieved', data: req.user!.toSafeJSON() });
});

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
    if (newPassword.length < 8 || !/[A-Z]/.test(newPassword) || !/[a-z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
      res.status(422).json({ success: false, message: 'New password must be at least 8 characters with uppercase, lowercase, and a number' });
      return;
    }
    user.password = await bcrypt.hash(newPassword, 12);
  }

  const result = await authService.updateUserProfile(req.user!, {
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    phone: req.body.phone,
    currentPassword: req.body.currentPassword,
    newPassword: req.body.newPassword,
    age: req.body.age,
    gender: req.body.gender,
    smokingHistory: req.body.smokingHistory,
    medicalHistory: req.body.medicalHistory,
    onboardingCompleted: req.body.onboardingCompleted,
  });

  if (result.success === false) {
    const status = result.error === 'Current password is incorrect' ? 400 : 422;
    res.status(status).json({ success: false, message: result.error });
    return;
  }

  res.json({ success: true, message: 'Profile updated', data: result.data });
});

export const verifyContact = asyncHandler(async (req: AuthRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(422).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(e => ({ field: (e as any).path, message: e.msg })),
    });
    return;
  }

  const code = (req.body.code || '').toString().trim();
  const result = await authService.verifyUserContact(req.user!, code);

  if (result.success === false) {
    res.status(400).json({ success: false, message: result.error });
    return;
  }

  res.json({ success: true, message: 'Contact verified', data: result.data });
});

export const resendVerification = asyncHandler(async (req: AuthRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(422).json({ success: false, message: 'Validation failed', errors: errors.array() });
    return;
  }

  if (channel === 'phone') {
    if (!user.email || user.email.endsWith(`@${PHONE_EMAIL_DOMAIN}`)) {
      res.status(400).json({ success: false, message: 'No email address is available to deliver the phone verification code.' });
      return;
    }

    const otp = generateOTP();
    user.phoneOtpHash = hashOTP(otp, user.id);
    user.phoneOtpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();
    await sendOTPEmail(user.email, otp);

    res.json({
      success: true,
      message: 'Phone verification code sent to your email.',
      data: {
        channel,
        ...(process.env.NODE_ENV !== 'production' ? { devCode: otp } : {}),
      },
    });
    return;
  }

  res.json({
    success: true,
    message: `Verification code generated for your ${result.data.channel}.`,
    data: result.data,
  });
});

export const sendPhoneOtp = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await authService.sendPhoneOtpToUser(req.user!);

  if (result.success === false) {
    res.status(400).json({ success: false, message: result.error });
    return;
  }

  const otp = generateOTP();
  user.phoneOtpHash = hashOTP(otp, user.id);
  user.phoneOtpExpiry = new Date(Date.now() + 10 * 60 * 1000);
  await user.save();
  await sendOTPEmail(user.email, otp);

  res.json({
    success: true,
    message: 'A phone verification code was sent to your email.',
    data: result.data,
  });
});

export const verifyPhoneOtp = asyncHandler(async (req: AuthRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(422).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(e => ({ field: (e as any).path, message: e.msg })),
    });
    return;
  }
  if (!verifyOTP(otp, user.phoneOtpHash, user.id)) {
    res.status(400).json({ success: false, message: 'Invalid verification code.' });
    return;
  }

  res.json({ success: true, message: 'Phone verified successfully.', data: result.data });
});

export const uploadAvatar = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.file) {
    res.status(400).json({ success: false, message: 'No image file provided' });
    return;
  }

  const result = await authService.uploadUserAvatar(req.user!, req.file);

  if (result.success === false) {
    res.status(413).json({ success: false, message: result.error });
    return;
  }

  res.json({ success: true, message: 'Profile picture updated', data: result.data });
});

