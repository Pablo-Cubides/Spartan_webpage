# Rollout: IA Tools

## Release

- Deploy only after IA config tests, spec gates, typecheck, and build pass.
- Confirm required model, storage, credit, and encryption environment variables are present.
- Smoke-test onboarding, one coach message, one image upload, and one image analysis.

## Rollback

- Disable the affected tool route from navigation if cost, moderation, or model failures appear.
- Rotate or restore `COACH_ENCRYPTION_KEY` only through the documented runbook.
- Use `docs/runbooks/ia-tools-runbook.md` for incident steps.
