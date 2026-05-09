/**
 * Sentry browser SDK configuration.
 *
 * Loaded by Next.js via the @sentry/nextjs plugin (see next.config.ts).
 * DSN comes from NEXT_PUBLIC_SENTRY_DSN to keep the client init non-secret.
 */
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  // Adjust sample rates per environment.
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 0,
  replaysOnErrorSampleRate: 1.0,
  replaysSessionSampleRate: 0,
  environment: process.env.NEXT_PUBLIC_ENV || process.env.NODE_ENV,
  // Avoid sending events from local dev unless explicitly enabled.
  enabled: process.env.NODE_ENV !== 'development' || process.env.NEXT_PUBLIC_SENTRY_ENABLE_DEV === '1',
  ignoreErrors: [
    // Browser noise — third-party extensions / network blips
    'Non-Error promise rejection captured',
    'ResizeObserver loop limit exceeded',
    'ResizeObserver loop completed with undelivered notifications.',
  ],
});
