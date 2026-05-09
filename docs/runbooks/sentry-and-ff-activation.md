---
version: "1.0"
status: active
owner: engineering
last_changed: "2026-05-09"
---

# Runbook: Activate Sentry and Harness Feature Flags

> Configs are scaffolded but the SDKs are NOT installed by default.
> This runbook walks you through activating each integration when ready.

---

## Activate Sentry

### Step 1 — Create Sentry account and project

1. <https://sentry.io/signup/> — choose Free tier
2. Create a project → platform: **Next.js**
3. Copy the DSN from Project Settings → Client Keys (DSN)
4. Generate an Auth Token: <https://sentry.io/settings/account/api/auth-tokens/>
   - Scopes: `project:releases`, `org:read`

### Step 2 — Install the SDK

```bash
cd frontend
npm install @sentry/nextjs
```

### Step 3 — Activate the configs

The configs live as `.example.ts` files (excluded from build). Rename them:

```bash
cd frontend
mv sentry.client.config.example.ts sentry.client.config.ts
mv sentry.server.config.example.ts sentry.server.config.ts
mv sentry.edge.config.example.ts sentry.edge.config.ts
```

Then update `frontend/tsconfig.json` to remove `**/*.example.ts` exclusion if desired (not strictly needed since the renamed files don't match the pattern anymore).

### Step 4 — Add env vars

Add to **all** environments (local `.env.local`, Vercel, Harness Secrets):

```
SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
NEXT_PUBLIC_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
SENTRY_AUTH_TOKEN=sntrys_xxx
```

Document them in `docs/specs/environment-variables.md` (already done).

### Step 5 — Wire sourcemaps upload

Update `frontend/next.config.ts`:

```ts
import { withSentryConfig } from '@sentry/nextjs';

// ... your existing nextConfig ...

export default withSentryConfig(nextConfig, {
  org: 'your-sentry-org',
  project: 'spartan-club',
  silent: !process.env.CI,
  sourcemaps: { disable: false },
}, {
  hideSourceMaps: true,
  disableLogger: true,
});
```

### Step 6 — Verify

```bash
npm run build  # should still pass
npm run dev
# In browser console, force an error:
# throw new Error("Sentry test")
# Check Sentry dashboard → Issues — should appear within 30s
```

---

## Activate Harness Feature Flags

### Step 1 — Create FF environment in Harness UI

1. Harness → Feature Flags module → Environments → **Production**
2. Get the SDK Keys (one server, one client)

### Step 2 — Create the 4 flags

Create these flags with default value `false` (or per `defaults` in `flags.ts`):

| Flag Identifier | Default | Type |
|----------------|---------|------|
| `coach_layer2_enabled` | OFF | Boolean |
| `payment_stripe_enabled` | ON | Boolean |
| `payment_mercadopago_enabled` | ON | Boolean |
| `asesor_new_flow_enabled` | OFF | Boolean |

### Step 3 — Install the SDKs

```bash
cd frontend
npm install @harnessio/ff-nodejs-server-sdk @harnessio/ff-javascript-client-sdk
```

### Step 4 — Add env vars

Add to local `.env.local`, Vercel, and Harness Secrets:

```
HARNESS_FF_SDK_KEY=server_sdk_key_here
NEXT_PUBLIC_HARNESS_FF_SDK_KEY=client_sdk_key_here
```

### Step 5 — Use a flag

Server side:

```ts
import { isFlagEnabled, FLAGS } from '@/lib/feature-flags';

const enabled = await isFlagEnabled(FLAGS.PAYMENT_STRIPE_ENABLED, {
  userId: user.uid,
});

if (!enabled) {
  return NextResponse.json({ error: 'Stripe disabled' }, { status: 503 });
}
```

Client side:

```tsx
'use client';
import { useFeatureFlag, FLAGS } from '@/lib/feature-flags';

function Component() {
  const showLayer2 = useFeatureFlag(FLAGS.COACH_LAYER2_ENABLED);
  return showLayer2 ? <Layer2UI /> : <ClassicUI />;
}
```

### Step 6 — Verify

```bash
# Toggle a flag in Harness UI
# Reload the app — UI should reflect the new state within 60s (SSE)
```

---

## Why are these "off by default"?

The Spartan webpage works without Sentry and without Feature Flags. Adding both as required dependencies would:

1. Force every developer (including local dev with no Harness account) to install ~50MB of packages
2. Block the build when SDKs aren't installed (the original Vercel build error)
3. Couple application logic to vendor SDKs that may change

The current design **fails open**: if the SDKs aren't installed, `isFlagEnabled` returns `defaults[flag]`, and Sentry simply doesn't capture errors. The app keeps working.

---

## Definition of Done (after activating both)

- [ ] Sentry receives at least one test error from production
- [ ] All 4 feature flags created in Harness FF
- [ ] At least one flag wired into a real route (start with `payment_stripe_enabled` as kill switch)
- [ ] `docs/specs/environment-variables.md` lists the new env vars (already done)
- [ ] Verify `npm run build` still passes locally and on Vercel
