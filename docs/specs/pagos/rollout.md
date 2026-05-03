# Rollout: Pagos

## Release

- Deploy only after payment tests, spec gates, Prisma validation, typecheck, and build pass.
- Confirm `MERCADOPAGO_*`, `STRIPE_*`, database, and email secrets exist in the target environment.
- Smoke-test package listing and sandbox checkout/webhook flows.

## Rollback

- Stop new purchases by disabling checkout buttons if webhooks regress.
- Keep webhooks available during rollback so provider retries can reconcile pending purchases.
- Use `docs/runbooks/pagos-runbook.md` for reconciliation and secret rotation.
