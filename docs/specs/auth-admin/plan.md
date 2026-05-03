# Plan: Auth & Admin

## Technical Approach

- Firebase Auth remains the identity provider; database `User.role` remains the authorization source of truth.
- Middleware protects page-level access for `/admin/**` and `/dashboard/**`.
- Server routes enforce role checks through shared auth helpers before returning admin data or mutating roles.
- Session cookie lifecycle stays in `/api/auth/session`; Firebase-to-DB sync stays in `/api/auth/sync`.

## Verification

- Run `frontend/tests/users/signup-bonus.test.ts`.
- Run `node scripts/qa-spec-completeness.js --strict`.
- Run `node scripts/qa-spec-verifier.js --strict`.

## Rollback

- Revert admin route or middleware changes as one unit.
- If auth secrets rotate, follow `docs/runbooks/auth-admin-runbook.md`.
