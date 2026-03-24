import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import passport from 'passport';
import { Strategy as GoogleStrategy, Profile } from 'passport-google-oauth20';
import User from '../models/User';
import { JWT_SECRET, REFRESH_SECRET } from '../middleware/auth';

const ACCESS_TOKEN_TTL = '7d';
const REFRESH_TOKEN_TTL = '7d';

export function makeGoogleAccessToken(id: number) {
  return jwt.sign({ id }, JWT_SECRET, { expiresIn: ACCESS_TOKEN_TTL as any });
}

export function makeGoogleRefreshToken(id: number) {
  return jwt.sign({ id }, REFRESH_SECRET, { expiresIn: REFRESH_TOKEN_TTL as any });
}

export function authCookieOptions(maxAgeMs: number) {
  return {
    httpOnly: true,
    sameSite: 'strict' as const,
    secure: process.env.NODE_ENV === 'production',
    maxAge: maxAgeMs,
    path: '/',
  };
}

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';
const GOOGLE_CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL || '';

if (GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET && GOOGLE_CALLBACK_URL) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL: GOOGLE_CALLBACK_URL,
        scope: ['profile', 'email'],
      },
      async (_accessToken: string, _refreshToken: string, profile: Profile, done) => {
        try {
          const email = profile.emails?.[0]?.value?.toLowerCase().trim();
          if (!email) {
            return done(new Error('Google account did not return an email address.'));
          }

          let user = await User.findOne({ where: { email } });
          if (!user) {
            const firstName = profile.name?.givenName?.trim() || profile.displayName?.split(' ')[0] || 'Google';
            const lastName = profile.name?.familyName?.trim() || profile.displayName?.split(' ').slice(1).join(' ') || 'User';
            const randomPassword = crypto.randomBytes(24).toString('hex');
            const hashedPassword = await bcrypt.hash(randomPassword, 12);

            user = await User.create({
              firstName,
              lastName: lastName || 'User',
              email,
              password: hashedPassword,
              profilePicture: profile.photos?.[0]?.value || undefined,
              role: 'user',
              isActive: true,
            });
          } else if (!user.profilePicture && profile.photos?.[0]?.value) {
            user.profilePicture = profile.photos[0].value;
            await user.save();
          }

          return done(null, user);
        } catch (error) {
          return done(error as Error);
        }
      },
    ),
  );
}

export default passport;
