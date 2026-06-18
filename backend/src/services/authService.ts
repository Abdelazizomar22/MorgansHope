import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import User from '../models/User';
import type { Result } from '../types/result';
import { Ok, Err } from '../types/result';
import {
  createChallenge,
  consumeChallenge,
} from '../application/auth/verificationService';
import {
  createSession,
  rotateSession,
  type SessionMetadata,
} from '../application/auth/sessionService';

const PHONE_EMAIL_DOMAIN = 'phone.morganshope.local';

const normalizeEmail = (value?: string) => value?.toLowerCase().trim() || '';
const normalizePhone = (value?: string) => value?.replace(/[^\d+]/g, '').trim() || '';
const isEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

export interface RegisterInput {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  age?: number;
  gender?: string;
  smokingHistory?: string;
  acceptedDisclaimer?: boolean;
}

export interface LoginResult {
  user: Record<string, unknown>;
  rememberMe: boolean;
  verification?: {
    required: boolean;
    channel: 'email';
    devCode?: string;
  };
  session: {
    accessToken: string;
    refreshToken: string;
    accessMaxAgeMs: number;
    refreshMaxAgeMs?: number;
  };
}

export async function registerUser(data: RegisterInput, metadata: SessionMetadata): Promise<Result<LoginResult>> {
  const email = normalizeEmail(data.email);
  const existing = await User.findOne({ where: { email } });
  if (existing) {
    return Err('Email already registered');
  }

  const hashed = await bcrypt.hash(data.password, 12);
  let user: User;

  try {
    user = await User.create({
      firstName: data.firstName,
      lastName: data.lastName,
      email,
      password: hashed,
      age: data.age,
      gender: data.gender as any,
      smokingHistory: data.smokingHistory as any,
      role: 'user',
      acceptedDisclaimer: data.acceptedDisclaimer === true,
      onboardingCompleted: false,
      authProvider: 'local',
      emailVerified: false,
      phoneVerified: false,
    });
  } catch (error) {
    if ((error as { name?: string }).name === 'SequelizeUniqueConstraintError') {
      return Err('Email already registered');
    }
    throw error;
  }

  let verificationCode: string;
  try {
    verificationCode = await createChallenge(user, 'email_verification');
  } catch (error) {
    try {
      await user.destroy();
    } catch {
      // Ignore cleanup errors if the email pipeline already failed.
    }
    return Err(error instanceof Error ? error.message : 'We could not send the verification email.');
  }

  const session = await createSession(user.id, false, metadata);

  return Ok({
    user: user.toSafeJSON(),
    rememberMe: false,
    session,
    verification: {
      required: true,
      channel: 'email',
      ...(process.env.NODE_ENV !== 'production' ? { devCode: verificationCode } : {}),
    },
  });
}

export async function loginUser(
  identifier: string,
  password: string,
  rememberMe: boolean,
  metadata: SessionMetadata,
): Promise<Result<LoginResult>> {
  const normalizedIdentifier = normalizeEmail(identifier);
  const trimmedPassword = password.toString().trim();

  const user = isEmail(normalizedIdentifier)
    ? await User.findOne({ where: { email: normalizedIdentifier, isActive: true } })
    : null;

  if (!user) {
    await bcrypt.compare(trimmedPassword, '$2b$12$invalidhashplaceholderxxxxxxxxxxxxxxx');
    return Err('Invalid email or password.');
  }

  const match = await bcrypt.compare(trimmedPassword, user.password);
  if (!match) {
    return Err('Invalid email or password.');
  }

  const session = await createSession(user.id, Boolean(rememberMe), metadata);

  return Ok({
    user: user.toSafeJSON(),
    rememberMe: Boolean(rememberMe),
    session,
  });
}

export async function refreshUserSession(refreshToken: string, metadata: SessionMetadata): Promise<Result<LoginResult>> {
  const rotated = await rotateSession(refreshToken, metadata);
  if (!rotated) {
    return Err('Invalid or expired refresh session.');
  }

  return Ok({
    user: rotated.user.toSafeJSON(),
    rememberMe: rotated.refreshMaxAgeMs !== undefined,
    session: {
      accessToken: rotated.accessToken,
      refreshToken: rotated.refreshToken,
      accessMaxAgeMs: rotated.accessMaxAgeMs,
      refreshMaxAgeMs: rotated.refreshMaxAgeMs,
    },
  });
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
  const result = await consumeChallenge(user, 'email_verification', code);
  if (!result.success) {
    return Err(result.error);
  }

  user.emailVerified = true;
  await user.save();
  return Ok(user.toSafeJSON());
}

export interface ResendResult {
  channel: 'email' | 'phone';
  devCode?: string;
}

export async function resendUserVerification(
  user: User,
  channel?: string,
): Promise<Result<ResendResult>> {
  const normalizedChannel = (channel || 'email') as 'email' | 'phone';

  if (normalizedChannel === 'email') {
    if (!user.email || user.email.endsWith(`@${PHONE_EMAIL_DOMAIN}`)) {
      return Err('No email address is available for verification.');
    }

    const code = await createChallenge(user, 'email_verification');
    return Ok({
      channel: 'email',
      ...(process.env.NODE_ENV !== 'production' ? { devCode: code } : {}),
    });
  }

  if (!user.phone) {
    return Err('No phone number is available for verification.');
  }

  const code = await createChallenge(user, 'phone_verification');
  return Ok({
    channel: 'phone',
    ...(process.env.NODE_ENV !== 'production' ? { devCode: code } : {}),
  });
}

export async function sendPhoneOtpToUser(user: User): Promise<Result<{ devCode?: string }>> {
  if (!user.phone) {
    return Err('Please add your phone number before requesting a verification code.');
  }

  const code = await createChallenge(user, 'phone_verification');
  return Ok({
    ...(process.env.NODE_ENV !== 'production' ? { devCode: code } : {}),
  });
}

export async function verifyPhoneOtpForUser(user: User, otp: string): Promise<Result<Record<string, unknown>>> {
  if (!otp) {
    return Err('Verification code is required.');
  }

  const result = await consumeChallenge(user, 'phone_verification', otp);
  if (!result.success) {
    return Err(result.error);
  }

  user.phoneVerified = true;
  await user.save();
  return Ok(user.toSafeJSON());
}

export async function uploadUserAvatar(
  user: User,
  file: { path: string; mimetype: string; size: number },
): Promise<Result<Record<string, unknown>>> {
  if (file.size > 2 * 1024 * 1024) {
    try { fs.unlinkSync(file.path); } catch {}
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
    } catch {
      // Ignore avatar cleanup errors.
    }
  }

  user.profilePicture = dataUri;
  await user.save();

  try { fs.unlinkSync(file.path); } catch {}

  return Ok(user.toSafeJSON());
}
