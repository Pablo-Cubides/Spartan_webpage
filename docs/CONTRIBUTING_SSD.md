# Contributing with SSD

## Required Flow
1. Create or update the feature spec.
2. Add or update the design section if UI changes.
3. Write the technical plan and tasks.
4. Implement the change.
5. Run the SSD gate.
6. Update docs and runbooks.

## Commands
- `npm run qa:content:validate`
- `npm run qa:images:validate`
- `npm run qa:security:secrets`
- `npm run qa:security:deps`
- `npm run qa:lint`
- `npm run qa:typecheck`
- `npm run qa:test`
- `npm run qa:prisma:validate`
- `npm run qa:build`
- `npm run qa:prepush`

## Rules
- One feature, one spec folder
- No undocumented behavior changes
- No secret leakage
- No merging with broken checks
