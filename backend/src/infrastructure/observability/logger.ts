import pino from 'pino';

const redactPaths = [
  'req.headers.authorization',
  'req.headers.cookie',
  'password',
  'token',
  'refreshToken',
  'accessToken',
  'verificationCode',
  'otp',
  'medicalHistory',
  'image',
  'file',
];

export const logger = pino({
  level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
  redact: {
    paths: redactPaths,
    censor: '[REDACTED]',
  },
  base: {
    service: 'morgans-hope-backend',
    environment: process.env.NODE_ENV || 'development',
  },
});

export const safeError = (error: unknown) => {
  if (error instanceof Error) {
    return { name: error.name, message: error.message, stack: error.stack };
  }
  return { message: String(error) };
};
