import crypto, { randomUUID } from 'crypto';
import VerificationChallenge from '../../models/VerificationChallenge';
import User from '../../models/User';
import { sendOTPEmail, sendVerificationCodeEmail } from '../../utils/mailer';
import { env } from '../../config/env';

type Purpose = 'email_verification' | 'phone_verification';
const CODE_TTL_MS = 5 * 60 * 1000;
const RESEND_COOLDOWN_MS = 60 * 1000;
const LOCKOUT_MS = 15 * 60 * 1000;
const hashDestination = (value: string) => crypto.createHash('sha256').update(value).digest('hex');
const hashCode = (value: string) => crypto
  .createHmac('sha256', env.otpPepper || env.refreshSecret)
  .update(value)
  .digest('hex');
const generateCode = () => crypto.randomInt(100000, 1000000).toString();

export async function createChallenge(user: User, purpose: Purpose) {
  const destination = purpose === 'email_verification' ? user.email : user.phone;
  if (!destination) throw new Error('Verification destination is missing.');

  const existing = await VerificationChallenge.findOne({
    where: { userId: user.id, purpose, consumedAt: null },
    order: [['createdAt', 'DESC']],
  });
  if (existing?.lockedUntil && existing.lockedUntil.getTime() > Date.now()) {
    const minutes = Math.ceil((existing.lockedUntil.getTime() - Date.now()) / 60_000);
    throw new Error(`Too many attempts. Please try again in ${minutes} minutes.`);
  }
  if (existing && existing.resendAvailableAt.getTime() > Date.now()) {
    const seconds = Math.ceil((existing.resendAvailableAt.getTime() - Date.now()) / 1000);
    throw new Error(`Please wait ${seconds} seconds before requesting another code.`);
  }

  await VerificationChallenge.update(
    { consumedAt: new Date() },
    { where: { userId: user.id, purpose, consumedAt: null } },
  );

  const code = generateCode();
  const challenge = await VerificationChallenge.create({
    id: randomUUID(),
    userId: user.id,
    purpose,
    destinationHash: hashDestination(destination.toLowerCase()),
    codeHash: hashCode(code),
    expiresAt: new Date(Date.now() + CODE_TTL_MS),
    resendAvailableAt: new Date(Date.now() + RESEND_COOLDOWN_MS),
  });

  try {
    if (purpose === 'email_verification') {
      await sendVerificationCodeEmail(user.email!, code);
    } else {
      if (!user.email) throw new Error('Account email is required to deliver the phone verification code.');
      await sendOTPEmail(user.email, code);
    }
  } catch (error) {
    await challenge.update({ consumedAt: new Date() });
    throw error;
  }
  return code;
}

export async function consumeChallenge(user: User, purpose: Purpose, code: string) {
  if (!/^\d{6}$/.test(code)) {
    return { success: false as const, error: 'Enter the 6-digit verification code.' };
  }

  const challenge = await VerificationChallenge.findOne({
    where: { userId: user.id, purpose, consumedAt: null },
    order: [['createdAt', 'DESC']],
  });
  if (!challenge) return { success: false as const, error: 'No verification is pending.' };
  if (challenge.lockedUntil && challenge.lockedUntil.getTime() > Date.now()) {
    return { success: false as const, error: 'Too many attempts. Please request a new code later.' };
  }
  if (challenge.expiresAt.getTime() <= Date.now()) {
    await challenge.update({ consumedAt: new Date() });
    return { success: false as const, error: 'Verification code expired.' };
  }
  const suppliedBuffer = Buffer.from(hashCode(code), 'hex');
  const storedBuffer = Buffer.from(challenge.codeHash, 'hex');
  if (
    suppliedBuffer.length !== storedBuffer.length
    || !crypto.timingSafeEqual(suppliedBuffer, storedBuffer)
  ) {
    const attempts = challenge.attempts + 1;
    await challenge.update({
      attempts,
      lockedUntil: attempts >= challenge.maxAttempts ? new Date(Date.now() + LOCKOUT_MS) : null,
    });
    return {
      success: false as const,
      error: attempts >= challenge.maxAttempts
        ? 'Too many attempts. Please try again in 15 minutes.'
        : 'Invalid verification code.',
    };
  }
  await challenge.update({ consumedAt: new Date() });
  return { success: true as const };
}
