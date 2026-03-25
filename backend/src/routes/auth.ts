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
  updateProfile,
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
  process.env.GOOGLE_CLIENT_SECRET &&
  process.env.GOOGLE_CALLBACK_URL,
);

const googleRedirect = (status: 'success' | 'error', params: Record<string, string>) => {
  const search = new URLSearchParams({ googleAuth: status, ...params });
  return `${FRONTEND_URL}/login?${search.toString()}`;
};

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

router.get('/google', (req, res, next) => {
  if (!GOOGLE_CONFIGURED) {
    return res.redirect(googleRedirect('error', { message: 'Google sign-in is not configured yet.' }));
  }

  return passport.authenticate('google', {
    session: false,
    scope: ['profile', 'email'],
    prompt: 'select_account',
  })(req, res, next);
});

router.get('/google/callback', (req, res, next) => {
  if (!GOOGLE_CONFIGURED) {
    return res.redirect(googleRedirect('error', { message: 'Google sign-in is not configured yet.' }));
  }

  return passport.authenticate('google', { session: false }, async (error: unknown, user?: InstanceType<typeof User>) => {
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

router.post('/register', registerValidators, register);
router.post('/login', loginValidators, login);
router.post('/logout', logout);
router.post('/refresh', refreshToken);
router.get('/me', authenticate, me);
router.put('/profile', authenticate, updateProfile);
router.post('/avatar', authenticate, upload.single('avatar'), uploadAvatar);

export default router;
