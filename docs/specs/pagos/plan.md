# Plan: Pagos

## Technical Approach

- Checkout endpoints create pending `Purchase` records before sending users to MercadoPago or Stripe.
- Webhooks verify provider signatures before reading payloads or granting credits.
- Credit granting is idempotent by checking terminal purchase state before mutation.
- Email confirmation failures are logged but do not fail successful payment webhooks.

## Verification

- Run `frontend/tests/payments/flow.test.ts`.
- Run `node scripts/qa-spec-completeness.js --strict`.
- Run `node scripts/qa-spec-verifier.js --strict`.

## Rollback

- Do not drop purchase data during rollback.
- Disable the affected provider checkout if webhook verification or credit granting regresses.
