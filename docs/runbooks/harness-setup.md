---
version: "1.0"
status: active
owner: engineering
last_changed: "2026-05-08"
---

# Runbook: Harness Account Setup

> **Audience:** Project owner setting up Harness for the first time.
> **Goal:** Connect the Harness pipelines in `.harness/` to a real Harness account with all secrets, environments, and integrations configured.
> **Estimated time:** 2–4 hours (mostly waiting for tokens to propagate).

---

## Prerequisites

- Admin access to the GitHub repository `Pablo-Cubides/Spartan_webpage`
- Admin access to the Vercel project hosting `spartan-club.vercel.app`
- Slack workspace where notifications should land (admin to install incoming webhook)
- A working email for notifications (the project owner's email)

---

## Step 1 — Create Harness Account

1. Go to <https://app.harness.io/auth/#/signup>
2. Use the project owner's primary email
3. Choose **Free** tier (sufficient for 1 developer + small repo)
4. Verify the email link

**What you get on Free tier:**
- CI: 25,000 build credits/month
- CD: 100 monthly active services
- STO: 1 scanner integration
- Feature Flags: 25 MAUs
- SRM: 5 monitored services + 1 SLO

---

## Step 2 — Create Project

1. In the Harness UI, click **Project Picker → New Project**
2. Project Name: `Spartan`
3. Project Identifier (auto-generated): `Spartan`
4. Org: leave as `default`
5. Modules to enable: **CI**, **CD**, **STO**, **FF**, **SRM** (toggle all on)

> Take note of the Org and Project identifiers — these replace the `<+input>` placeholders in `.harness/pipelines/*.yaml`.

---

## Step 3 — Create Connectors

Navigate to **Project Settings → Connectors → New Connector**.

### 3.1. GitHub Connector

| Field | Value |
|-------|-------|
| Type | GitHub (Repository) |
| Name | `github_spartan` |
| URL Type | Repository |
| Repository URL | `https://github.com/Pablo-Cubides/Spartan_webpage` |
| Authentication | HTTP, Personal Access Token |
| PAT scopes | `repo`, `admin:repo_hook`, `workflow` |
| Test Connection | Must succeed |

**Generate PAT:** GitHub → Settings → Developer settings → Personal access tokens (classic) → Generate new token. Save in a password manager AND in Harness Secrets (next step).

### 3.2. Docker Registry Connector

We use GitHub Container Registry (ghcr.io) for caching builds.

| Field | Value |
|-------|-------|
| Type | Docker Registry |
| Name | `ghcr_spartan` |
| Provider | Other |
| Registry URL | `https://ghcr.io` |
| Username | Your GitHub username |
| Password | The same PAT (with `read:packages`, `write:packages`) |

### 3.3. Vercel Connector (Custom)

Vercel does not have a native Harness connector. We use a Custom Secret + shell steps.

1. Go to <https://vercel.com/account/tokens> and create a token named `harness-deploy`. Scope: full account.
2. **Do NOT create a Harness Connector for it** — instead store it as a Secret (Step 4) and use it via `vercel CLI` in shell steps.

### 3.4. Slack Connector

1. In Slack: Apps → search "Incoming Webhooks" → Add to a channel called `#spartan-deploys` (create the channel if needed)
2. Copy the webhook URL (starts with `https://hooks.slack.com/services/...`)
3. In Harness: New Connector → **Slack** → paste the webhook URL → Name: `slack_deploys`

---

## Step 4 — Create Secrets

Navigate to **Project Settings → Secrets → New Secret → Text**.

Create the following secrets. **All values must be from your real environment.** Get them from `frontend/.env.local` and from the corresponding provider dashboards.

### 4.1. Authentication / Database
| Secret Identifier | Source |
|-------------------|--------|
| `database_url` | Supabase / Neon connection pooler URL |
| `direct_url` | Supabase / Neon direct connection URL |
| `firebase_admin_private_key` | Firebase Console → Service Accounts → Generate Private Key |
| `firebase_client_email` | from the same JSON above |
| `firebase_project_id` | Firebase Console → Project Settings |

### 4.2. Public Firebase (build-time)
| Secret Identifier | Source |
|-------------------|--------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase Console → Project Settings → Web app |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | same |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | same |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | same |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | same |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | same |

### 4.3. Payments
| Secret Identifier | Source |
|-------------------|--------|
| `mercadopago_access_token` | MercadoPago Developer Dashboard |
| `mercadopago_webhook_secret` | MercadoPago → Webhooks → Signing secret |
| `NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY` | same dashboard |
| `stripe_secret_key` | Stripe Dashboard → Developers → API keys |
| `stripe_webhook_secret` | Stripe Dashboard → Webhooks → Signing secret |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | same |

### 4.4. AI / Storage / Email
| Secret Identifier | Source |
|-------------------|--------|
| `gemini_api_key_face` | Google AI Studio |
| `gemini_api_key_clothing` | Google AI Studio |
| `gemini_api_key_coach` | Google AI Studio |
| `gemini_api_key` | Google AI Studio (fallback) |
| `cloudinary_api_secret` | Cloudinary Console |
| `cloudinary_api_key` | same |
| `cloudinary_cloud_name` | same |
| `brevo_api_key` | Brevo Dashboard → SMTP & API |

### 4.5. Deploy / Observability (added during later phases)
| Secret Identifier | Source |
|-------------------|--------|
| `vercel_token` | Vercel → Account → Tokens (created in Step 3.3) |
| `sentry_dsn` | (Phase 3) Sentry → Project → Client Keys |
| `sentry_auth_token` | (Phase 3) Sentry → Account → Auth Tokens |

> **Cross-reference:** All these secrets must also appear in `docs/specs/environment-variables.md` with their criticality.

---

## Step 5 — Create Environments

Navigate to **Project Settings → Environments → New Environment**.

### 5.1. `staging`
| Field | Value |
|-------|-------|
| Name | `staging` |
| Type | PreProduction |
| Variables | `api_url=https://spartan-club-staging.vercel.app` |

### 5.2. `production`
| Field | Value |
|-------|-------|
| Name | `production` |
| Type | Production |
| Variables | `api_url=https://spartan-club.vercel.app` |

> The `<+env.variables.api_url>` reference in pipelines (Phase 1) reads from these.

---

## Step 6 — Import Pipelines from Git

The pipelines live in this repo at `.harness/pipelines/*.yaml`. Use Git Experience to keep them in sync.

1. **Project Settings → Default Settings → Git Experience** → Enable
2. **Pipelines → New Pipeline → Import from Git**
3. Select connector `github_spartan`, branch `main`, file path `.harness/pipelines/spartan-pr-quality-gate.yaml`
4. Repeat for `spartan-main-integration.yaml`
5. Once imported, Harness will track future commits to those files.

When prompted for `<+input>` values:
- `orgIdentifier`: `default`
- `projectIdentifier`: `Spartan`
- `connectorRef`: `github_spartan`
- `repoName`: `Pablo-Cubides/Spartan_webpage`
- `build`: branch reference (use `<+trigger.targetBranch>` for PR triggers, `main` for main pipeline)
- For Kubernetes infrastructure: see Step 7

---

## Step 7 — Build Infrastructure (Hosted Builds Recommended)

> **Recommended path:** use Harness Cloud Hosted Builds — no Kubernetes cluster required.

For each pipeline stage that currently has `infrastructure.type: KubernetesDirect`, change to:

```yaml
infrastructure:
  type: HostedVm
  spec:
    type: harness
    poolName: linux-amd64
    os: Linux
```

This is automatic on Free tier. You don't need a K8s cluster for this project.

---

## Step 8 — Pipeline Variables (instead of `<+input>` placeholders)

Once pipelines are imported, edit them in the Harness UI → **Variables tab** and add these pipeline-level variables, then update the YAML to reference them:

| Variable | Value |
|----------|-------|
| `org` | `default` |
| `project` | `Spartan` |
| `git_connector` | `github_spartan` |
| `repo` | `Pablo-Cubides/Spartan_webpage` |

This eliminates the runtime `<+input>` prompts.

---

## Step 9 — Triggers

Navigate to each imported pipeline → **Triggers tab → New Trigger**.

### 9.1. PR Quality Gate
- Trigger Name: `pr-quality-gate`
- Source: GitHub Webhook
- Event: Pull Request
- Actions: Open, Reopened, Synchronize
- Target Branch Pattern: `main`, `develop`

### 9.2. Main Integration
- Trigger Name: `main-integration`
- Source: GitHub Webhook
- Event: Push
- Branch: `main`

---

## Step 10 — Branch Protection (GitHub side)

Once pipelines run successfully on a test PR, set them as required checks:

1. GitHub → repo Settings → Branches → Branch protection rules → `main`
2. Require status checks to pass before merging:
   - `Spartan SDD Quality Gate` (the name from `advanced.sendGitStatus.name`)
3. Require conversation resolution
4. Require a pull request before merging

---

## Step 11 — Verification Checklist

Run this checklist before considering Harness "live":

- [ ] All 4 connectors show **Connected** status
- [ ] All ~20 secrets appear in Project Settings → Secrets
- [ ] Both pipelines imported from Git and visible in the Pipelines list
- [ ] Test PR shows the `Spartan SDD Quality Gate` check appearing
- [ ] Slack channel `#spartan-deploys` receives a test notification (run the pipeline once with a known-failing change)
- [ ] Branch protection requires the Harness check
- [ ] `docs/specs/environment-variables.md` lists all secrets with the same names as in Harness

---

## Troubleshooting

### "Pipeline can't find connector"
- Check that the connector Name matches the YAML reference exactly (case-sensitive)
- Test the connector from the UI (Connectors list → click → Test Connection)

### "Pipeline run failed: insufficient credits"
- Free tier: 25k credits/month. Each minute of build = 1 credit. If exhausted, upgrade or wait for monthly reset.

### "GitHub status check not appearing on PR"
- Verify `advanced.sendGitStatus.enabled: true` in pipeline YAML
- The pipeline must complete at least one full run for the check name to register
- Connector must have `repo:status` write scope

### "Vercel deploy step fails: token invalid"
- Tokens expire if unused for 90 days. Regenerate at <https://vercel.com/account/tokens>.

---

## Definition of Done

- [ ] All 11 setup steps completed
- [ ] Verification checklist (Step 11) all checked
- [ ] Test PR successfully runs `spartan-pr-quality-gate` end-to-end
- [ ] This runbook updated with any deviations encountered
