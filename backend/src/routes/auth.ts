import { Router, Request } from 'express';
import User from '../models/User';
import passport from '../config/passport';
import {
  register, registerValidators,
  login, loginValidators,
  logout,
  refreshToken,
  bootstrapSession,
  me,
  updateProfile, updateProfileValidators,
  verifyContact, verifyContactValidators,
  sendPhoneOtp,
  verifyPhoneOtp, verifyPhoneOtpValidators,
  resendVerification, resendVerificationValidators,
  uploadAvatar,
  csrf,
} from '../controllers/authController';
import { authenticate } from '../middleware/auth';
import upload from '../middleware/upload';
import { distributedRateLimit } from '../middleware/distributedRateLimit';
import { createSession } from '../application/auth/sessionService';
import { setAuthCookies } from '../config/authCookies';

const router = Router();

const FRONTEND_URL = (
  process.env.FRONTEND_URL ||
  process.env.FRONTEND_URLS?.split(',')[0] ||
  'http://localhost:3001'
).trim().replace(/^['"]|['"]$/g, '').replace(/\/+$/, '');

const GOOGLE_CONFIGURED = Boolean(
  process.env.GOOGLE_CLIENT_ID &&
  process.env.GOOGLE_CLIENT_SECRET,
);

const googleRedirect = (status: 'success' | 'error', params: Record<string, string>) => {
  const search = new URLSearchParams({ googleAuth: status, ...params });
  return `${FRONTEND_URL}/login?${search.toString()}`;
};

const getGoogleCallbackUrl = (req: Request) => {
  if (process.env.NODE_ENV === 'production' && FRONTEND_URL.startsWith('https://')) {
    return `${FRONTEND_URL}/api/auth/google/callback`;
  }

  const configured = (process.env.GOOGLE_CALLBACK_URL || '').trim().replace(/^['"]|['"]$/g, '');
  if (configured) return configured;

  const forwardedProto = (req.headers['x-forwarded-proto'] as string | undefined)?.split(',')[0]?.trim();
  const proto = forwardedProto || req.protocol;
  const host = req.get('host');
  return `${proto}://${host}/api/auth/google/callback`;
};

router.get('/csrf', csrf);

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

router.get('/google/callback', (req, res, next) => {
  if (!GOOGLE_CONFIGURED) {
    return res.redirect(googleRedirect('error', { message: 'Google sign-in is not configured yet.' }));
  }

  return passport.authenticate(
    'google',
    { session: false, callbackURL: getGoogleCallbackUrl(req) } as any,
    async (error: unknown, user?: InstanceType<typeof User>) => {
      if (error || !user) {
        const message = error instanceof Error ? error.message : 'Google sign-in failed.';
        return res.redirect(googleRedirect('error', { message }));
      }

      const session = await createSession(user.id, true, {
        userAgent: req.headers['user-agent'],
        ip: req.ip,
      });

      setAuthCookies(res, session, true);
      return res.redirect(googleRedirect('success', {}));
    },
  )(req, res, next);
});

router.post('/register', distributedRateLimit('register'), registerValidators, register);
router.post('/login', distributedRateLimit('login'), loginValidators, login);
router.post('/logout', logout);
router.post('/refresh', refreshToken);
router.get('/bootstrap', bootstrapSession);
router.get('/me', authenticate, me);
router.put('/profile', authenticate, updateProfileValidators, updateProfile);
router.post('/verify-contact', authenticate, distributedRateLimit('otp'), verifyContactValidators, verifyContact);
router.post('/send-phone-otp', authenticate, distributedRateLimit('otp'), sendPhoneOtp);
router.post('/verify-phone-otp', authenticate, distributedRateLimit('otp'), verifyPhoneOtpValidators, verifyPhoneOtp);
router.post('/resend-verification', authenticate, distributedRateLimit('otp'), resendVerificationValidators, resendVerification);
router.post('/avatar', authenticate, upload.single('avatar'), uploadAvatar);

export default router;
