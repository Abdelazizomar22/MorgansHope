import crypto, { randomUUID } from 'crypto';
import VerificationChallenge from '../../models/VerificationChallenge';
import User from '../../models/User';
import { sendOTPEmail, sendVerificationCodeEmail } from '../../utils/mailer';

type Purpose = 'email_verification' | 'phone_verification';
const CODE_TTL_MS = 10 * 60 * 1000;
const RESEND_COOLDOWN_MS = 60 * 1000;
const hash = (value: string) => crypto.createHash('sha256').update(value).digest('hex');
const generateCode = () => crypto.randomInt(100000, 1000000).toString();

export async function createChallenge(user: User, purpose: Purpose) {
  const destination = purpose === 'email_verification' ? user.email : user.phone;
  if (!destination) throw new Error('Verification destination is missing.');

  const existing = await VerificationChallenge.findOne({
    where: { userId: user.id, purpose, consumedAt: null },
    order: [['createdAt', 'DESC']],
  });
  if (existing && existing.resendAvailableAt.getTime() > Date.now()) {
    const seconds = Math.ceil((existing.resendAvailableAt.getTime() - Date.now()) / 1000);
    throw new Error(`Please wait ${seconds} seconds before requesting another code.`);
  }

  await VerificationChallenge.update(
    { consumedAt: new Date() },
    { where: { userId: user.id, purpose, consumedAt: null } },
  );

  const code = generateCode();
  await VerificationChallenge.create({
    id: randomUUID(),
    userId: user.id,
    purpose,
    destinationHash: hash(destination.toLowerCase()),
    codeHash: hash(code),
    expiresAt: new Date(Date.now() + CODE_TTL_MS),
    resendAvailableAt: new Date(Date.now() + RESEND_COOLDOWN_MS),
  });

  if (purpose === 'email_verification') {
    await sendVerificationCodeEmail(user.email!, code);
  } else {
    if (!user.email) throw new Error('Account email is required to deliver the phone verification code.');
    await sendOTPEmail(user.email, code);
  }
  return code;
}

export async function consumeChallenge(user: User, purpose: Purpose, code: string) {
  const challenge = await VerificationChallenge.findOne({
    where: { userId: user.id, purpose, consumedAt: null },
    order: [['createdAt', 'DESC']],
  });
  if (!challenge) return { success: false as const, error: 'No verification is pending.' };
  if (challenge.lockedUntil && challenge.lockedUntil.getTime() > Date.now()) {
    return { success: false as const, error: 'Too many attempts. Please request a new code later.' };
  }
  if (challenge.expiresAt.getTime() <= Date.now()) {
    return { success: false as const, error: 'Verification code expired.' };
  }
  if (hash(code) !== challenge.codeHash) {
    const attempts = challenge.attempts + 1;
    await challenge.update({
      attempts,
      lockedUntil: attempts >= challenge.maxAttempts ? new Date(Date.now() + 15 * 60 * 1000) : null,
    });
    return { success: false as const, error: 'Invalid verification code.' };
  }
  await challenge.update({ consumedAt: new Date() });
  return { success: true as const };
}
