# Harness Engineering for Spartan

This directory holds the Harness-first delivery governance for Spartan Club.

> **Setup walkthrough:** see [`docs/runbooks/harness-setup.md`](../docs/runbooks/harness-setup.md) for the complete account/connector/secret setup.

## Layout

| Path | Purpose |
|------|---------|
| `pipelines/spartan-pr-quality-gate.yaml` | Runs on every PR. SDD gates + lint/typecheck/test + security scans + build. **Authoritative quality gate.** |
| `pipelines/spartan-main-integration.yaml` | Runs on push to `main`. Repeats the gate + adds Production Approval stage + Slack notification. |
| `templates/sdd-quality-stage.yaml` | Reusable stage template (used by future deploy pipelines) |
| `policies/sdd-governance.rego` | OPA policy: prod requires SDD ≥ 85% + scan + manual approval |
| `scorecards/spartan-sdd-maturity.yaml` | IDP scorecard (8 weighted checks, threshold 85) |
| `notifications/slack-channel.yaml` | Reference for `#spartan-deploys` Slack integration |
| `sto/dependency-scan.yaml` | Reference for the Security Test Orchestration scanners |
| `pipelines/spartan-prod-deploy.yaml` | CD pipeline: pre-deploy → staging → approval → prod → smoke + rollback |
| `pipelines/spartan-staging-deploy.yaml` | Lightweight staging-only deploy pipeline |
| `pipelines/spartan-rollback-drill.yaml` | Monthly drill: rollback to N-1, verify, restore |
| `triggers/hourly-health-check.yaml` | Cron trigger for production smoke tests |
| `srm/spartan-slos.yaml` | SLO + monitored service definitions (Availability, Latency, Error Rate) |

## Adoption Status

| Phase | State | What it covers |
|-------|-------|----------------|
| **0 — Account setup** | manual, see runbook | Connectors, secrets, environments, monitored services |
| **1 — Quality gates** | ✅ implemented | PR gate, main gate, Approval stage, Slack/email, gitleaks + OWASP DC |
| **2 — CD with verification** | ✅ implemented | Vercel deploy pipelines, smoke tests, migration safety, auto-rollback, hourly health check |
| **3 — Observability + SLOs** | ✅ implemented (configs ready, requires Sentry account + Harness SRM setup) | Sentry configs (client/server/edge), SLO definitions, Lighthouse CI |
| **4 — Feature flags + drills** | ✅ implemented (lib + drill pipeline + husky) | Feature flag lib, monthly rollback drill, husky pre-commit/pre-push |

The PR pipeline runs in parallel with the lightweight `.github/workflows/ci-cd.yml`. GitHub Actions is the **fast-feedback** path for forks and external contributors; Harness is the **authoritative** gate.

## Run the same gate locally

```bash
# SDD-only (fast)
node scripts/qa-spec-structure.js --strict
node scripts/qa-spec-artifacts.js --strict
node scripts/qa-spec-completeness.js --strict
node scripts/qa-spec-traceability.js --strict
node scripts/qa-spec-verifier.js --strict

# Full pre-push
node scripts/validate-push.js
```

## Pipeline Variables

The pipelines use **Pipeline Variables** instead of `<+input>` placeholders. Defaults:

| Variable | Default |
|----------|---------|
| `org` | `default` |
| `project` | `Spartan` |
| `git_connector` | `github_spartan` |
| `repo` | `Pablo-Cubides/Spartan_webpage` |
| `api_url` | `https://spartan-club.vercel.app` |

These are overridable per-execution if needed (e.g. `api_url` becomes the staging URL when running against staging environment).

## Rollback

- **If Harness fails but the lightweight GH Actions is green:** keep merging via GH Actions; fix Harness in a follow-up PR.
- **If Harness becomes the required check and blocks incorrectly:** remove the branch protection requirement for `Spartan SDD Quality Gate`, then revert the Harness config PR.
- **Vercel deploys** still happen via Vercel's GitHub integration. Harness adds the **approval gate** before allowing the merge that triggers Vercel; the deploy itself is automatic once main is updated.

## Secrets

All secrets are stored in Harness Secret Manager. See `docs/runbooks/harness-setup.md` Step 4 for the full list. Cross-referenced in `docs/specs/environment-variables.md`.

**No secret values appear in this repo.** If `node scripts/scan-secrets.js` ever flags a YAML file in `.harness/`, that's a bug to fix immediately.
