import crypto from 'crypto';

export function generateOTP() {
  return crypto.randomInt(100000, 1000000).toString();
}

export function hashOTP(otp: string) {
  return crypto.createHash('sha256').update(otp).digest('hex');
}

export function verifyOTP(otp: string, hash: string) {
  return hashOTP(otp) === hash;
}
