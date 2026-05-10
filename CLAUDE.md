# Instructions for Claude Code (and other AI agents)

This file is read automatically by Claude Code when working in this repo.

## ⚠️ MANDATORY before every commit that touches application code

Run the full pre-push gate locally **before pushing**:

```bash
npm run qa:prepush
```

This runs the same 14-step gate that husky's pre-push hook enforces:
- SDD validation (5 gates)
- Content/image validation
- Secret scan + dependency audit
- Lint + TypeScript typecheck
- Tests + Prisma validate
- **`npm run build`** ← catches Vercel build failures locally

**Do NOT commit code that touches `.ts`/`.tsx`/`next.config.ts`/`package.json` without running this first.**

If you only changed docs (`.md`) or `.harness/*.yaml` configs, the SDD-only gates suffice:

```bash
node scripts/qa-spec-structure.js --strict
node scripts/qa-spec-traceability.js --strict
node scripts/qa-spec-completeness.js --strict
node scripts/scan-secrets.js
```

## Why this rule exists

On 2026-05-09 a commit landed on `main` that broke Vercel deploy because `sentry.*.config.ts` files imported a package (`@sentry/nextjs`) that wasn't installed. The error would have been caught by `npm run build` locally — but I (Claude) only ran the SDD/security gates and pushed.

Five layers of defense were designed; only the slowest (post-push GitHub Actions) actually fired. Vercel detected it at the same time.

**Lesson:** trust no single gate. Run the full local gate. See [`docs/runbooks/local-dev-setup.md`](docs/runbooks/local-dev-setup.md) for the dev workflow.

## Repo layout quick reference

| Path | Purpose |
|------|---------|
| `frontend/` | Next.js 15 app (App Router, Prisma, Firebase auth) |
| `frontend/src/app/api/` | API routes — every `route.ts` MUST have a contract in `docs/specs/api-contracts/MANIFEST.json` |
| `docs/specs/` | Specs (SDD source of truth). Each spec has YAML frontmatter |
| `docs/specs/api-contracts/` | API contract docs referenced by `MANIFEST.json` |
| `docs/runbooks/` | Operational playbooks (rollback, incidents, Harness setup) |
| `docs/adr/` | Architecture Decision Records |
| `.harness/` | Harness pipelines (PR gate, main, prod deploy, rollback drill) |
| `.github/workflows/ci-cd.yml` | Lightweight fast-feedback CI (lint/typecheck/test) |
| `scripts/qa-*.js` | SDD gate scripts (run by both local and CI) |
| `scripts/smoke-tests.js` | Post-deploy verification |
| `scripts/validate-push.js` | The full pre-push gate |

## Conventions

- **Specs first.** New endpoint? Add to `MANIFEST.json` + create the contract MD before merging.
- **Frontmatter required** on every `spec.md` (`version`, `status`, `owner`, `last_changed`).
- **No secrets in YAML or code.** `scripts/scan-secrets.js` enforces this.
- **Env vars** must appear in `docs/specs/environment-variables.md` with criticality.
- **Migrations** must have an entry in `docs/specs/database-migrations.md`.

## When the user says "deploy" / "push"

1. Run `npm run qa:prepush` first
2. If it fails, fix and re-run
3. Only then `git commit` + `git push`
4. After push, monitor `gh run list --limit 1` to confirm GH Actions passes
