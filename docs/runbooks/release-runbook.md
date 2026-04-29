# Release Runbook

## Before Merge
- Run `npm run qa:prepush`
- Confirm spec and docs are updated
- Confirm design changes have matching tokens/specs

## After Merge
- Review CI summary
- Confirm rollout path
- Watch for regressions in content and media flows

## Rollback
- Revert the feature commit
- Revert the spec if the product decision changed
