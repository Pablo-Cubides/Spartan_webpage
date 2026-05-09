/**
 * Sentry Node.js (server) SDK configuration.
 *
 * Used by API routes and server components. SENTRY_DSN is server-only.
 */
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 0,
  environment: process.env.NEXT_PUBLIC_ENV || process.env.NODE_ENV,
  enabled: process.env.NODE_ENV === 'production' || process.env.SENTRY_ENABLE_DEV === '1',
  // Strip PII before send (defensive — Sentry SDK already redacts most things)
  beforeSend(event) {
    if (event.request?.cookies) {
      event.request.cookies = '[redacted]';
    }
    if (event.request?.headers) {
      const h = event.request.headers as Record<string, string>;
      if (h.authorization) h.authorization = '[redacted]';
      if (h.cookie) h.cookie = '[redacted]';
    }
    return event;
  },
});
