import { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { AuthRequest } from '../middleware/auth';
import { asyncHandler } from '../utils/asyncHandler';
import * as authService from '../services/authService';
import { clearAuthCookies, REFRESH_COOKIE, setAuthCookies } from '../config/authCookies';
import { revokeSession } from '../application/auth/sessionService';
import { issueCsrfToken } from '../middleware/csrf';

const sessionMetadataFrom = (req: Request) => ({
  userAgent: req.headers['user-agent'],
  ip: req.ip,
});

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
  body('acceptedDisclaimer').optional().isBoolean().withMessage('acceptedDisclaimer must be a boolean'),
];

export const verifyContactValidators = [
  body('code')
    .isString()
    .trim()
    .matches(/^\d{6}$/)
    .withMessage('Enter the 6-digit verification code'),
];

export const verifyPhoneOtpValidators = [
  body('otp').notEmpty().withMessage('OTP is required').isString().trim(),
];

export const resendVerificationValidators = [
  body('channel').optional().isIn(['email', 'phone']).withMessage('Channel must be email or phone'),
];

export const csrf = issueCsrfToken;

export const register = asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(422).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map((e) => ({ field: (e as any).path, message: e.msg })),
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
    acceptedDisclaimer: false,
  }, sessionMetadataFrom(req));

  if (result.success === false) {
    const status = result.error === 'Email already registered' ? 409 : 503;
    res.status(status).json({ success: false, message: result.error });
    return;
  }

  setAuthCookies(res, result.data.session, result.data.rememberMe);
  res.status(201).json({
    success: true,
    message: 'Account created successfully. Please verify your email to unlock protected services.',
    data: {
      user: result.data.user,
      verification: result.data.verification,
    },
  });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(422).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map((e) => ({ field: (e as any).path, message: e.msg })),
    });
    return;
  }

  const identifier = (req.body.identifier || req.body.email || '').toString().trim();
  const password = (req.body.password || '').toString().trim();
  const rememberMe = req.body.rememberMe === true;

  const result = await authService.loginUser(identifier, password, rememberMe, sessionMetadataFrom(req));

  if (result.success === false) {
    res.status(401).json({ success: false, message: result.error });
    return;
  }

  setAuthCookies(res, result.data.session, result.data.rememberMe);

  res.json({
    success: true,
    message: 'Login successful',
    data: { user: result.data.user },
  });
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  const token = req.cookies?.[REFRESH_COOKIE];
  await revokeSession(token);
  clearAuthCookies(res);
  res.json({ success: true, message: 'Logged out successfully' });
});

export const refreshToken = asyncHandler(async (req: Request, res: Response) => {
  const token = req.cookies?.[REFRESH_COOKIE];
  if (!token) {
    clearAuthCookies(res);
    res.status(401).json({ success: false, message: 'No refresh session.' });
    return;
  }

  const result = await authService.refreshUserSession(token, sessionMetadataFrom(req));

  if (result.success === false) {
    clearAuthCookies(res);
    res.status(401).json({ success: false, message: result.error });
    return;
  }

  setAuthCookies(res, result.data.session, result.data.rememberMe);

  res.json({
    success: true,
    message: 'Session refreshed',
    data: { user: result.data.user },
  });
});

export const bootstrapSession = asyncHandler(async (req: Request, res: Response) => {
  const token = req.cookies?.[REFRESH_COOKIE];
  if (!token) {
    res.json({ success: true, message: 'No active session', data: null });
    return;
  }

  const result = await authService.refreshUserSession(token, sessionMetadataFrom(req));
  if (result.success === false) {
    clearAuthCookies(res);
    res.json({ success: true, message: 'No active session', data: null });
    return;
  }

  setAuthCookies(res, result.data.session, result.data.rememberMe);
  res.json({ success: true, message: 'Session restored', data: result.data.user });
});

export const me = asyncHandler(async (req: AuthRequest, res: Response) => {
  res.json({ success: true, message: 'User retrieved', data: req.user!.toSafeJSON() });
});

export const updateProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(422).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map((e) => ({ field: (e as any).path, message: e.msg })),
    });
    return;
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
    acceptedDisclaimer: req.body.acceptedDisclaimer,
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
      errors: errors.array().map((e) => ({ field: (e as any).path, message: e.msg })),
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

  const result = await authService.resendUserVerification(req.user!, req.body.channel);

  if (result.success === false) {
    res.status(400).json({ success: false, message: result.error });
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
      errors: errors.array().map((e) => ({ field: (e as any).path, message: e.msg })),
    });
    return;
  }

  const otp = (req.body.otp || '').toString().trim();
  const result = await authService.verifyPhoneOtpForUser(req.user!, otp);

  if (result.success === false) {
    res.status(400).json({ success: false, message: result.error });
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
