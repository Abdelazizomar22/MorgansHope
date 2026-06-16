import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';
import User from '../models/User';
import { JWT_SECRET, REFRESH_SECRET } from '../middleware/auth';
import { generateOTP, hashOTP, verifyOTP } from '../utils/otp';
import { sendOTPEmail } from '../utils/mailer';
import type { Result } from '../types/result';
import { Ok, Err } from '../types/result';

const ACCESS_TOKEN_TTL = '15m';
const REFRESH_TOKEN_TTL = '7d';
const REFRESH_TOKEN_LONG_TTL = '30d';
const PHONE_EMAIL_DOMAIN = 'phone.morganshope.local';

const normalizeEmail = (value?: string) => value?.toLowerCase().trim() || '';
const normalizePhone = (value?: string) => value?.replace(/[^\d+]/g, '').trim() || '';
const isEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
const generateVerificationCode = () => Math.floor(100000 + Math.random() * 900000).toString();

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

export interface RegisterInput {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  age?: number;
  gender?: string;
  smokingHistory?: string;
  role?: string;
  acceptedDisclaimer?: boolean;
}

export interface LoginResult {
  user: Record<string, unknown>;
  accessToken: string;
  refreshToken: string;
  rememberMe: boolean;
  cookieMaxMs: number;
}

export async function registerUser(data: RegisterInput): Promise<Result<LoginResult>> {
  const email = normalizeEmail(data.email);

  const existing = await User.findOne({ where: { email } });
  if (existing) {
    return Err('Email already registered');
  }

  const hashed = await bcrypt.hash(data.password, 12);
  const user = await User.create({
    firstName: data.firstName,
    lastName: data.lastName,
    email,
    password: hashed,
    age: data.age,
    gender: data.gender as any,
    smokingHistory: data.smokingHistory as any,
    role: (data.role || 'user') as 'user' | 'admin',
    acceptedDisclaimer: data.acceptedDisclaimer === true,
    onboardingCompleted: false,
    authProvider: 'local',
    emailVerified: true,
    phoneVerified: false,
  });

  const accessToken = makeAccessToken(user.id);
  const refreshToken = makeRefreshToken(user.id);

  return Ok({ user: user.toSafeJSON(), accessToken, refreshToken, rememberMe: false, cookieMaxMs: 7 * 24 * 60 * 60 * 1000 });
}

export async function loginUser(
  identifier: string,
  password: string,
  rememberMe?: boolean,
): Promise<Result<LoginResult>> {
  const normalizedEmail = normalizeEmail(identifier);
  const trimmedPassword = password.toString().trim();

  let user = isEmail(normalizedEmail)
    ? await User.findOne({ where: { email: normalizedEmail, isActive: true } })
    : null;

  if (!user && process.env.NODE_ENV !== 'production' && normalizedEmail === 'admin@medtech.com' && trimmedPassword === 'Admin@123456') {
    const hashed = await bcrypt.hash(trimmedPassword, 12);
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

  if (!user) {
    await bcrypt.compare(trimmedPassword, '$2b$12$invalidhashplaceholderxxxxxxxxxxxxxxx');
    return Err('Invalid email or password.');
  }

  const match = await bcrypt.compare(trimmedPassword, user.password);
  if (!match) {
    return Err('Invalid email or password.');
  }

  const isRemember = Boolean(rememberMe);
  const accessTTL = isRemember ? '7d' : ACCESS_TOKEN_TTL;
  const accessToken = makeAccessToken(user.id, accessTTL);
  const refreshToken = makeRefreshToken(user.id, isRemember);
  const cookieMaxMs = isRemember ? 30 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000;

  return Ok({ user: user.toSafeJSON(), accessToken, refreshToken, rememberMe: isRemember, cookieMaxMs });
}

export async function refreshUserToken(token: string): Promise<Result<LoginResult>> {
  let payload: { id: number; rememberMe?: boolean };
  try {
    payload = jwt.verify(token, REFRESH_SECRET) as { id: number; rememberMe?: boolean };
  } catch {
    return Err('Invalid or expired refresh token');
  }

  const user = await User.findOne({ where: { id: payload.id, isActive: true } });
  if (!user) {
    return Err('User not found');
  }

  const isRemember = payload.rememberMe === true;
  const newAccessToken = makeAccessToken(user.id, isRemember ? '7d' : ACCESS_TOKEN_TTL);
  const newRefreshToken = makeRefreshToken(user.id, isRemember);
  const cookieMaxMs = isRemember ? 30 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000;

  return Ok({ user: user.toSafeJSON(), accessToken: newAccessToken, refreshToken: newRefreshToken, rememberMe: isRemember, cookieMaxMs });
}

export interface UpdateProfileInput {
  firstName?: string;
  lastName?: string;
  phone?: string;
  currentPassword?: string;
  newPassword?: string;
  age?: number;
  gender?: string;
  smokingHistory?: string;
  medicalHistory?: string;
  onboardingCompleted?: boolean;
}

export async function updateUserProfile(
  user: User,
  data: UpdateProfileInput,
): Promise<Result<Record<string, unknown>>> {
  if (data.currentPassword || data.newPassword) {
    if (!data.currentPassword || !data.newPassword) {
      return Err('Both currentPassword and newPassword are required');
    }
    const match = await bcrypt.compare(data.currentPassword, user.password);
    if (!match) {
      return Err('Current password is incorrect');
    }
    if (data.newPassword.length < 8) {
      return Err('New password must be at least 8 characters');
    }
    user.password = await bcrypt.hash(data.newPassword, 12);
  }

  if (data.firstName) user.firstName = data.firstName.trim();
  if (data.lastName) user.lastName = data.lastName.trim();
  if (data.phone !== undefined) {
    const nextPhone = normalizePhone(data.phone);
    if (nextPhone !== (user.phone || '')) {
      user.phone = nextPhone || undefined;
      user.phoneVerified = false;
      user.phoneOtpHash = null;
      user.phoneOtpExpiry = null;
    }
  }
  if (data.age !== undefined) user.age = data.age;
  if (data.gender !== undefined) user.gender = data.gender as any;
  if (data.smokingHistory !== undefined) user.smokingHistory = data.smokingHistory as any;
  if (data.medicalHistory !== undefined) user.medicalHistory = data.medicalHistory;
  if (data.onboardingCompleted !== undefined) user.onboardingCompleted = data.onboardingCompleted === true;

  await user.save();
  return Ok(user.toSafeJSON());
}

export async function verifyUserContact(user: User, code: string): Promise<Result<Record<string, unknown>>> {
  if (!user.verificationCode || !user.verificationChannel || !user.verificationExpiresAt) {
    return Err('No verification is pending.');
  }

  if (user.verificationExpiresAt.getTime() < Date.now()) {
    return Err('Verification code expired.');
  }

  if (code !== user.verificationCode) {
    return Err('Invalid verification code.');
  }

  if (user.verificationChannel === 'email') user.emailVerified = true;
  if (user.verificationChannel === 'phone') user.phoneVerified = true;
  user.verificationCode = null;
  user.verificationChannel = null;
  user.verificationExpiresAt = null;
  await user.save();

  return Ok(user.toSafeJSON());
}

export interface ResendResult {
  channel: string;
  devCode?: string;
}

export async function resendUserVerification(
  user: User,
  channel?: string,
): Promise<Result<ResendResult>> {
  const ch = (channel || (user.email && !user.email.endsWith(`@${PHONE_EMAIL_DOMAIN}`) ? 'email' : 'phone')) as 'email' | 'phone';

  if (ch === 'email' && (!user.email || user.email.endsWith(`@${PHONE_EMAIL_DOMAIN}`))) {
    return Err('No email address is available for verification.');
  }
  if (ch === 'phone' && !user.phone) {
    return Err('No phone number is available for verification.');
  }

  if (ch === 'phone') {
    if (!user.email || user.email.endsWith(`@${PHONE_EMAIL_DOMAIN}`)) {
      return Err('No email address is available to deliver the phone verification code.');
    }

    const otp = generateOTP();
    user.phoneOtpHash = hashOTP(otp);
    user.phoneOtpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();
    await sendOTPEmail(user.email, otp);

    return Ok({
      channel: ch,
      ...(process.env.NODE_ENV !== 'production' ? { devCode: otp } : {}),
    });
  }

  const verificationCode = queueVerification(user, ch);
  await user.save();

  return Ok({
    channel: ch,
    ...(process.env.NODE_ENV !== 'production' ? { devCode: verificationCode } : {}),
  });
}

export async function sendPhoneOtpToUser(user: User): Promise<Result<{ devCode?: string }>> {
  if (!user.phone) {
    return Err('Please add your phone number before requesting a verification code.');
  }
  if (!user.email || user.email.endsWith(`@${PHONE_EMAIL_DOMAIN}`)) {
    return Err('A valid account email is required to deliver the phone verification code.');
  }

  const otp = generateOTP();
  user.phoneOtpHash = hashOTP(otp);
  user.phoneOtpExpiry = new Date(Date.now() + 10 * 60 * 1000);
  await user.save();
  await sendOTPEmail(user.email, otp);

  return Ok({
    ...(process.env.NODE_ENV !== 'production' ? { devCode: otp } : {}),
  });
}

export async function verifyPhoneOtpForUser(user: User, otp: string): Promise<Result<Record<string, unknown>>> {
  if (!otp) {
    return Err('Verification code is required.');
  }
  if (!user.phoneOtpHash || !user.phoneOtpExpiry) {
    return Err('No phone verification code is pending.');
  }
  if (user.phoneOtpExpiry.getTime() < Date.now()) {
    return Err('Verification code expired.');
  }
  if (!verifyOTP(otp, user.phoneOtpHash)) {
    return Err('Invalid verification code.');
  }

  user.phoneVerified = true;
  user.phoneOtpHash = null;
  user.phoneOtpExpiry = null;
  await user.save();

  return Ok(user.toSafeJSON());
}

export async function uploadUserAvatar(
  user: User,
  file: { path: string; mimetype: string; size: number },
): Promise<Result<Record<string, unknown>>> {
  if (file.size > 2 * 1024 * 1024) {
    try { fs.unlinkSync(file.path); } catch { }
    return Err('Avatar image must be 2MB or smaller');
  }

  const imageBuffer = fs.readFileSync(file.path);
  const mimeType = file.mimetype || 'image/png';
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

  try { fs.unlinkSync(file.path); } catch { }

  return Ok(user.toSafeJSON());
}

export { makeAccessToken, makeRefreshToken };
