/**
 * Client-side feature flag hook.
 *
 * In a Next.js app, prefer evaluating flags on the server (server.ts) and
 * passing values to the client component as props. This module is only used
 * for purely-client interactions (e.g. UI toggles that depend on flags).
 *
 * For SSR pages, use the server SDK and pass props down.
 */

'use client';

import { useEffect, useState } from 'react';
import { defaults, type FlagKey } from './flags';

const SDK_KEY = process.env.NEXT_PUBLIC_HARNESS_FF_SDK_KEY;

interface FFClient {
  variation: (flag: string, fallback: boolean) => boolean;
  on: (event: string, cb: () => void) => void;
}

interface FFModule {
  initialize: (key: string, target: { identifier: string }, opts: { baseUrl?: string }) => FFClient;
  Event: { READY: string };
}

let clientInitPromise: Promise<FFClient | null> | null = null;

async function ensureClient(): Promise<FFClient | null> {
  if (typeof window === 'undefined') return null;
  if (!SDK_KEY) return null;
  if (clientInitPromise) return clientInitPromise;

  clientInitPromise = (async () => {
    try {
      const pkg = '@harnessio/ff-javascript-client-sdk';
      const dynImport = new Function('p', 'return import(p)') as (p: string) => Promise<FFModule>;
      const mod = await dynImport(pkg).catch(() => null);
      if (!mod) {
        console.warn('[feature-flags] @harnessio/ff-javascript-client-sdk not installed');
        return null;
      }
      const cf = mod.initialize(SDK_KEY, { identifier: 'anonymous' }, { baseUrl: undefined });
      await new Promise<void>(resolve => {
        cf.on(mod.Event.READY, () => resolve());
      });
      return cf;
    } catch (err) {
      console.error('[feature-flags] client init failed', err);
      return null;
    }
  })();

  return clientInitPromise;
}

export function useFeatureFlag(flag: FlagKey): boolean {
  const [enabled, setEnabled] = useState<boolean>(defaults[flag]);

  useEffect(() => {
    let cancelled = false;
    ensureClient().then(client => {
      if (!client || cancelled) return;
      try {
        const value = client.variation(flag, defaults[flag]);
        setEnabled(Boolean(value));
      } catch (err) {
        console.error('[feature-flags] client evaluation failed', err);
      }
    });
    return () => { cancelled = true; };
  }, [flag]);

  return enabled;
}
