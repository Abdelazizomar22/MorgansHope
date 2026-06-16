import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User';
import passport from '../config/passport';
import { authCookieOptions, makeGoogleAccessToken, makeGoogleRefreshToken } from '../config/passport';
import {
  register, registerValidators,
  login, loginValidators,
  logout,
  refreshToken,
  me,
  updateProfile, updateProfileValidators,
  verifyContact, verifyContactValidators,
  sendPhoneOtp,
  verifyPhoneOtp, verifyPhoneOtpValidators,
  resendVerification, resendVerificationValidators,
  uploadAvatar,
} from '../controllers/authController';
import { authenticate } from '../middleware/auth';
import upload from '../middleware/upload';

const router = Router();

const FRONTEND_URL = (
  process.env.FRONTEND_URL ||
  process.env.FRONTEND_URLS?.split(',')[0] ||
  'http://localhost:3001'
).trim().replace(/^['"]|['"]$/g, '');
const GOOGLE_CONFIGURED = Boolean(
  process.env.GOOGLE_CLIENT_ID &&
  process.env.GOOGLE_CLIENT_SECRET,
);

const googleRedirect = (status: 'success' | 'error', params: Record<string, string>) => {
  const search = new URLSearchParams({ googleAuth: status, ...params });
  return `${FRONTEND_URL}/login?${search.toString()}`;
};

const getGoogleCallbackUrl = (req: Request) => {
  const configured = (process.env.GOOGLE_CALLBACK_URL || '').trim().replace(/^['"]|['"]$/g, '');
  if (configured) return configured;

  const forwardedProto = (req.headers['x-forwarded-proto'] as string | undefined)?.split(',')[0]?.trim();
  const proto = forwardedProto || req.protocol;
  const host = req.get('host');
  return `${proto}://${host}/api/auth/google/callback`;
};

/**
 * @openapi
 * /api/auth/debug:
 *   get:
 *     tags: [Auth]
 *     summary: Debug database connection and admin user (dev only)
 *     security: []
 *     responses:
 *       200:
 *         description: Debug info
 *       404:
 *         description: Not found in production
 */
router.get('/debug', async (req: Request, res: Response) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(404).json({ success: false, message: 'Not found' });
  }
  try {
    const count = await User.count();
    const admin = await User.findOne({ where: { email: 'admin@medtech.com' } });
    const bcrypt = await import('bcryptjs');
    const testMatch = admin ? await bcrypt.compare('Admin@123456', admin.password) : null;
    return res.json({
      success: true,
      db: 'ok',
      userCount: count,
      adminExists: !!admin,
      adminEmailInDb: admin?.email ?? null,
      testPasswordMatch: testMatch,
    });
  } catch (e: any) {
    return res.status(500).json({ success: false, dbError: e?.message });
  }
});

/**
 * @openapi
 * /api/auth/dev-setup:
 *   get:
 *     tags: [Auth]
 *     summary: Create or reset admin user (dev only)
 *     security: []
 *     responses:
 *       200:
 *         description: Admin user credentials
 *       404:
 *         description: Not found in production
 */
router.get('/dev-setup', async (req: Request, res: Response) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(404).json({ success: false, message: 'Not found' });
  }
  const email = 'admin@medtech.com';
  const password = 'Admin@123456';
  const hashed = await bcrypt.hash(password, 12);
  let user = await User.findOne({ where: { email } });
  if (!user) {
    user = await User.create({
      firstName: 'Admin',
      lastName: 'MedTech',
      email,
      password: hashed,
      role: 'admin',
    });
    return res.json({
      success: true,
      message: 'Admin user created. Use these credentials to log in.',
      email,
      password,
    });
  }
  user.password = hashed;
  await user.save();
  return res.json({
    success: true,
    message: 'Admin password reset. Use these credentials to log in.',
    email,
    password,
  });
});

/**
 * @openapi
 * /api/auth/google:
 *   get:
 *     tags: [Auth]
 *     summary: Initiate Google OAuth sign-in
 *     description: Redirects the user to Google's OAuth consent screen. After successful authentication, the callback redirects back to the frontend with a token.
 *     security: []
 *     responses:
 *       302:
 *         description: Redirect to Google OAuth consent screen
 */
router.get('/google', (req, res, next) => {
  if (!GOOGLE_CONFIGURED) {
    return res.redirect(googleRedirect('error', { message: 'Google sign-in is not configured yet.' }));
  }

  return passport.authenticate('google', {
    session: false,
    scope: ['profile', 'email'],
    prompt: 'select_account',
    callbackURL: getGoogleCallbackUrl(req),
  } as any)(req, res, next);
});

/**
 * @openapi
 * /api/auth/google/callback:
 *   get:
 *     tags: [Auth]
 *     summary: Google OAuth callback
 *     description: Handles the OAuth callback from Google. On success, sets a refresh cookie and redirects to the frontend with an access token.
 *     security: []
 *     parameters:
 *       - in: query
 *         name: code
 *         schema: { type: string }
 *         description: Authorization code from Google
 *       - in: query
 *         name: state
 *         schema: { type: string }
 *         description: State parameter for CSRF protection
 *     responses:
 *       302:
 *         description: Redirect to frontend with token or error
 */
router.get('/google/callback', (req, res, next) => {
  if (!GOOGLE_CONFIGURED) {
    return res.redirect(googleRedirect('error', { message: 'Google sign-in is not configured yet.' }));
  }

  return passport.authenticate('google', { session: false, callbackURL: getGoogleCallbackUrl(req) } as any, async (error: unknown, user?: InstanceType<typeof User>) => {
    if (error || !user) {
      const message = error instanceof Error ? error.message : 'Google sign-in failed.';
      return res.redirect(googleRedirect('error', { message }));
    }

    const accessToken = makeGoogleAccessToken(user.id);
    const refreshToken = makeGoogleRefreshToken(user.id);

    res.cookie('medtech_refresh', refreshToken, authCookieOptions(30 * 24 * 60 * 60 * 1000));
    return res.redirect(googleRedirect('success', { token: accessToken }));
  })(req, res, next);
});

/**
 * @openapi
 * /api/auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Register a new user account
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterInput'
 *     responses:
 *       201:
 *         description: Account created successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         user: { $ref: '#/components/schemas/SafeUser' }
 *                         token: { type: string }
 *       409:
 *         description: Email already registered
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       422:
 *         description: Validation failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/register', registerValidators, register);

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Log in with email and password
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginInput'
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         user: { $ref: '#/components/schemas/SafeUser' }
 *                         token: { type: string }
 *       401:
 *         description: Invalid email or password
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/login', loginValidators, login);

/**
 * @openapi
 * /api/auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: Log out and clear refresh cookie
 *     security: []
 *     responses:
 *       200:
 *         description: Logged out successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
router.post('/logout', logout);

/**
 * @openapi
 * /api/auth/refresh:
 *   post:
 *     tags: [Auth]
 *     summary: Refresh access token using HttpOnly cookie
 *     description: The refresh token is read from the medtech_refresh HttpOnly cookie automatically.
 *     security: []
 *     responses:
 *       200:
 *         description: Token refreshed
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         user: { $ref: '#/components/schemas/SafeUser' }
 *                         token: { type: string }
 *       401:
 *         description: Invalid or expired refresh token
 */
router.post('/refresh', refreshToken);

/**
 * @openapi
 * /api/auth/me:
 *   get:
 *     tags: [Auth]
 *     summary: Get current authenticated user
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Current user profile
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data: { $ref: '#/components/schemas/SafeUser' }
 *       401:
 *         description: Not authenticated
 */
router.get('/me', authenticate, me);

/**
 * @openapi
 * /api/auth/profile:
 *   put:
 *     tags: [Auth]
 *     summary: Update user profile
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateProfileInput'
 *     responses:
 *       200:
 *         description: Profile updated
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data: { $ref: '#/components/schemas/SafeUser' }
 *       400:
 *         description: Current password is incorrect
 */
router.put('/profile', authenticate, updateProfileValidators, updateProfile);

/**
 * @openapi
 * /api/auth/verify-contact:
 *   post:
 *     tags: [Auth]
 *     summary: Verify email or phone with a code
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [code]
 *             properties:
 *               code: { type: string, description: 'Verification code sent via email' }
 *     responses:
 *       200:
 *         description: Contact verified
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data: { $ref: '#/components/schemas/SafeUser' }
 *       400:
 *         description: Invalid or expired code
 */
router.post('/verify-contact', authenticate, verifyContactValidators, verifyContact);

/**
 * @openapi
 * /api/auth/send-phone-otp:
 *   post:
 *     tags: [Auth]
 *     summary: Send OTP to email for phone verification
 *     description: Sends a one-time password to the user's email to verify their phone number.
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: OTP sent to email
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         devCode: { type: string, description: 'OTP code shown only in development' }
 *       400:
 *         description: No phone or email on account
 */
router.post('/send-phone-otp', authenticate, sendPhoneOtp);

/**
 * @openapi
 * /api/auth/verify-phone-otp:
 *   post:
 *     tags: [Auth]
 *     summary: Verify phone number with OTP
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [otp]
 *             properties:
 *               otp: { type: string, description: 'One-time password sent to your email' }
 *     responses:
 *       200:
 *         description: Phone verified
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data: { $ref: '#/components/schemas/SafeUser' }
 *       400:
 *         description: Invalid or expired OTP
 */
router.post('/verify-phone-otp', authenticate, verifyPhoneOtpValidators, verifyPhoneOtp);

/**
 * @openapi
 * /api/auth/resend-verification:
 *   post:
 *     tags: [Auth]
 *     summary: Resend verification code
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               channel:
 *                 type: string
 *                 enum: [email, phone]
 *                 description: 'Channel to resend verification for'
 *     responses:
 *       200:
 *         description: Verification code resent
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         channel: { type: string }
 *                         smsSent: { type: boolean }
 *                         to: { type: string }
 *                         devCode: { type: string }
 *       400:
 *         description: No contact available for verification
 */
router.post('/resend-verification', authenticate, resendVerificationValidators, resendVerification);

/**
 * @openapi
 * /api/auth/avatar:
 *   post:
 *     tags: [Auth]
 *     summary: Upload profile avatar
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [avatar]
 *             properties:
 *               avatar:
 *                 type: string
 *                 format: binary
 *                 description: 'Image file (JPG, PNG, WebP). Max 2MB.'
 *     responses:
 *       200:
 *         description: Profile picture updated
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data: { $ref: '#/components/schemas/SafeUser' }
 *       400:
 *         description: No image file provided
 *       413:
 *         description: File too large (max 2MB)
 */
router.post('/avatar', authenticate, upload.single('avatar'), uploadAvatar);

export default router;
