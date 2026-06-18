import * as Sentry from '@sentry/node';
import { env } from '../../config/env';

let initialized = false;

export function initializeSentry() {
  if (initialized || !env.sentryDsn || !env.enableSentry) return;
  Sentry.init({
    dsn: env.sentryDsn,
    environment: env.nodeEnv,
    tracesSampleRate: env.nodeEnv === 'production' ? 0.1 : 1,
    sendDefaultPii: false,
    beforeSend(event) {
      if (event.request) {
        delete event.request.cookies;
        delete event.request.data;
        if (event.request.headers) {
          delete event.request.headers.authorization;
          delete event.request.headers.cookie;
        }
      }
      if (event.user) {
        delete event.user.email;
        delete event.user.ip_address;
      }
      return event;
    },
  });
  initialized = true;
}

export const captureException = (error: unknown, context?: Record<string, unknown>) => {
  if (!initialized) return;
  Sentry.withScope((scope) => {
    if (context) scope.setContext('request', context);
    Sentry.captureException(error);
  });
};
