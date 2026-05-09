/**
 * Server-side feature flag evaluation.
 *
 * Uses Harness Feature Flags JS SDK in node mode. If the SDK key is not set
 * (e.g. local dev), falls back to defaults defined in flags.ts.
 *
 * Usage:
 *   import { isFlagEnabled } from '@/lib/feature-flags/server';
 *   const enabled = await isFlagEnabled(FLAGS.PAYMENT_STRIPE_ENABLED, { userId: '42' });
 */

import { defaults, FLAGS, type FlagKey } from './flags';

type Target = {
  /** Stable user identifier (e.g. Firebase UID, anon session id). */
  userId?: string;
  /** Email for percentage rollout targeting. */
  email?: string;
  /** Custom attributes (e.g. role, country). */
  attributes?: Record<string, string | number | boolean>;
};

interface FFClient {
  waitForInitialization(): Promise<void>;
  boolVariation(key: string, target: unknown, fallback: boolean): Promise<boolean>;
}

interface FFModule {
  Client: new (key: string, opts: { enableStream?: boolean }) => FFClient;
}

const SDK_KEY = process.env.HARNESS_FF_SDK_KEY;

let clientPromise: Promise<FFClient | null> | null = null;

async function getClient(): Promise<FFClient | null> {
  if (!SDK_KEY) return null;
  if (clientPromise) return clientPromise;

  clientPromise = (async () => {
    try {
      // Dynamic import via variable so TypeScript doesn't try to resolve
      // the package at compile time when it's not installed.
      const pkg = '@harnessio/ff-nodejs-server-sdk';
      const dynImport = new Function('p', 'return import(p)') as (p: string) => Promise<FFModule>;
      const mod = await dynImport(pkg).catch(() => null);
      if (!mod) {
        console.warn('[feature-flags] @harnessio/ff-nodejs-server-sdk not installed');
        return null;
      }
      const client = new mod.Client(SDK_KEY, { enableStream: true });
      await client.waitForInitialization();
      return client;
    } catch (err) {
      console.error('[feature-flags] init failed', err);
      return null;
    }
  })();

  return clientPromise;
}

export async function isFlagEnabled(flag: FlagKey, target: Target = {}): Promise<boolean> {
  const fallback = defaults[flag];
  const client = await getClient();
  if (!client) return fallback;
  try {
    const t = {
      identifier: target.userId || 'anonymous',
      name: target.userId || 'anonymous',
      attributes: { email: target.email || '', ...target.attributes },
    };
    return await client.boolVariation(flag, t, fallback);
  } catch (err) {
    console.error('[feature-flags] evaluation failed for', flag, err);
    return fallback;
  }
}

/** Convenience helper to evaluate multiple flags in one call. */
export async function getFlags(target: Target = {}): Promise<Record<FlagKey, boolean>> {
  const keys = Object.values(FLAGS) as FlagKey[];
  const results = await Promise.all(keys.map(k => isFlagEnabled(k, target)));
  return Object.fromEntries(keys.map((k, i) => [k, results[i]])) as Record<FlagKey, boolean>;
}
