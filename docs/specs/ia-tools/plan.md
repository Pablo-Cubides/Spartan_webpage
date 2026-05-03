# Plan: IA Tools

## Technical Approach

- Coach Espartano uses profile onboarding, per-coach conversations, safety checks, credit gates, encrypted message storage, and Gemini responses.
- Asesor de Estilo validates image uploads, stores images through Cloudinary/local fallback, and runs visual analysis through the existing IA integration.
- Credit consumption remains the shared cost-control boundary across chat and image analysis.
- Operational concerns stay in `docs/runbooks/ia-tools-runbook.md`.

## Verification

- Run `frontend/tests/asesor-estilo/config.test.ts`.
- Run `node scripts/qa-spec-completeness.js --strict`.
- Run `node scripts/qa-spec-verifier.js --strict`.

## Rollback

- Disable affected IA UI entry points if model calls or credit gates fail.
- Restore previous secrets or model settings through the IA runbook.
