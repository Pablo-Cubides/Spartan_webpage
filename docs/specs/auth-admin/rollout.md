# Rollout: Auth & Admin

## Release

- Deploy only after auth/admin contract checks, tests, typecheck, and build pass.
- Verify Firebase client and admin environment variables exist in the target environment.
- Smoke-test login, logout, `/admin`, and one admin API route after deploy.

## Rollback

- Revert the application release if middleware or server auth blocks valid admins.
- If session cookies fail, disable the affected admin UI route until `/api/auth/session` is restored.
- For secret rotation or Firebase issues, use `docs/runbooks/auth-admin-runbook.md`.
