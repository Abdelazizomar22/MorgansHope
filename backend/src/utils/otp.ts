import crypto from 'crypto';

export function generateOTP() {
  return crypto.randomInt(100000, 1000000).toString();
}

export function hashOTP(otp: string, salt?: number | string) {
  const hmac = crypto.createHmac('sha256', salt?.toString() || '');
  hmac.update(otp);
  return hmac.digest('hex');
}

export function verifyOTP(otp: string, hash: string, salt?: number | string) {
  return hashOTP(otp, salt) === hash;
}
