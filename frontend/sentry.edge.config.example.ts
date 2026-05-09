/**
 * Sentry Edge runtime configuration (used by middleware.ts and Edge API routes).
 */
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 0,
  environment: process.env.NEXT_PUBLIC_ENV || process.env.NODE_ENV,
  enabled: process.env.NODE_ENV === 'production',
});
