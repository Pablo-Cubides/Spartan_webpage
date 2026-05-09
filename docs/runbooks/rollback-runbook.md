---
version: "1.0"
status: active
owner: engineering
last_changed: "2026-05-08"
---

# Runbook: Production Rollback

> **Audience:** Anyone responding to a production incident.
> **Goal:** Restore service to the last-known-good state in under 5 minutes.

---

## When to roll back

| Scenario | Decision |
|----------|----------|
| Smoke tests fail post-deploy | **Auto-rollback** triggers via Harness `spartan-prod-deploy` failureStrategy. No manual action needed. |
| Error rate spikes (Sentry alert: >10% errors) | **Manual rollback** — follow Path A below |
| Specific feature breaks (single endpoint) | **Feature flag kill switch** — Path B (preferred over full rollback) |
| Database migration corrupted data | **Stop-the-world** — Path C (involves DB ops) |

---

## Path A — Manual Rollback (most common)

**Target time: 3 minutes.**

### Option 1 — via Harness UI (recommended)

1. Go to Harness → Pipelines → `spartan-prod-deploy` → recent runs
2. Find the **last successful** production deploy (green checkmark)
3. Click **Re-run** → ensure target environment is `production`
4. Approve when the Approval Stage prompts

### Option 2 — via Vercel CLI (faster, when Harness is down)

```bash
# Requires VERCEL_TOKEN env var
npm i -g vercel@latest
vercel ls --token=$VERCEL_TOKEN --limit=5
# Identify the previous deployment URL (e.g. spartan-abc123.vercel.app)
vercel promote https://spartan-abc123.vercel.app --token=$VERCEL_TOKEN --yes
```

### Verification

After rollback:

```bash
BASE_URL=https://spartan-club.vercel.app node scripts/smoke-tests.js
```

All 4 smoke tests must pass. If any fail, escalate immediately.

### Post-rollback

1. Notify Slack: `#spartan-deploys` with `:rotating_light: Production rolled back. Investigating root cause.`
2. Open a GitHub issue with label `incident`
3. Within 24h: write a postmortem in `docs/postmortems/YYYY-MM-DD-<short-name>.md`

---

## Path B — Feature Flag Kill Switch

When the bad change is gated by a feature flag (preferred way to ship risky changes):

1. Harness UI → Feature Flags → Project: Spartan
2. Find the flag (e.g. `coach_layer2_enabled`)
3. Toggle off → Save
4. Effect propagates within 60 seconds via SSE; clients refresh on next eval

No deploy or rollback needed. **Always prefer this path** when the risky change is flagged.

Flags currently available: see `frontend/src/lib/feature-flags/flags.ts`.

---

## Path C — Database Stop-the-World

> Use only if a Prisma migration corrupted production data.
> **You will likely need outside help — call before acting.**

1. Put the app in maintenance mode (Vercel: deploy a static maintenance page)
2. Open Supabase / Neon dashboard → take an immediate snapshot
3. If recent: restore the snapshot
4. If older: write a corrective migration in `frontend/prisma/migrations/<timestamp>_<fix>/`
5. Apply with `npx prisma migrate deploy`
6. Verify with smoke tests
7. Lift maintenance mode

See `docs/specs/database-migrations.md` for migration safety guidelines.

---

## Monthly Rollback Drill

Run `spartan-rollback-drill` pipeline monthly (1st Monday) to validate this runbook.

**Drill steps:**
1. Capture current production deploy URL
2. Promote N-1 → production
3. Verify smoke tests pass
4. Promote original back → production
5. Verify smoke tests pass
6. Slack reports total elapsed time

**Pass criteria:** total elapsed time < 5 minutes (300s).

If the drill fails or exceeds 5 minutes, the team has a P1 issue to fix before
the next real incident.

---

## Definition of Done (after any rollback)

- [ ] Production is healthy (smoke tests pass)
- [ ] Slack notified
- [ ] GitHub issue opened
- [ ] Postmortem within 24h
- [ ] Action items added to backlog
