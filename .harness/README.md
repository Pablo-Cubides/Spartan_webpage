# Harness Engineering for Spartan SDD

This folder stores the Harness-first delivery governance layer for Spartan Club.
The initial adoption mode is parallel-first: GitHub Actions remains the merge
gate while Harness mirrors the SDD quality gate.

## Files

- `pipelines/spartan-pr-quality-gate.yaml`: PR validation pipeline.
- `pipelines/spartan-main-integration.yaml`: push-to-main validation pipeline, with deployment disabled in phase 1.
- `templates/sdd-quality-stage.yaml`: reusable SDD gate stage.
- `policies/sdd-governance.rego`: OPA policy set for production pipeline governance.
- `scorecards/spartan-sdd-maturity.yaml`: IDP scorecard definition for SDD maturity.

## Harness Setup

1. Create a GitHub connector with API access.
2. Create the pipelines as Remote resources using Harness Git Experience.
3. Configure PR triggers for `main` and `develop` on `spartan-pr-quality-gate`.
4. Configure push trigger for `main` on `spartan-main-integration`.
5. Add secrets matching the existing GitHub Actions/Vercel public build env names.
6. Run Harness in parallel for 2-3 green PRs before making `Spartan SDD Quality Gate` required.

## Local Parity

Run the same SDD gate locally:

```bash
node scripts/qa-spec-structure.js --strict
node scripts/qa-spec-artifacts.js --strict
node scripts/qa-spec-completeness.js --strict
node scripts/qa-spec-traceability.js --strict
node scripts/qa-spec-verifier.js --strict
```

Full local gate:

```bash
node scripts/validate-push.js
```

## Rollback

- If Harness fails but GitHub Actions is green during phase 1, keep GitHub Actions as the source of truth and fix Harness config.
- If Harness becomes a required check and blocks incorrectly, remove the branch protection requirement for `Spartan SDD Quality Gate`, then revert the Harness config PR.
- Deployment remains with Vercel/GitHub until the quality gate is stable.
