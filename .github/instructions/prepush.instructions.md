---
description: "Use when preparing a push, release, or merge. Covers the required validation order and blocked states."
---

# Pre-push Rules

- Run the root gate: `npm run qa:prepush`
- Do not push if lint, typecheck, tests, build, Prisma validation, or security checks fail.
- If content or image validation reports issues, fix or document them before merging.
- If a script is in strict mode, treat warnings as failures.
- Keep the push scope tied to one spec whenever possible.
