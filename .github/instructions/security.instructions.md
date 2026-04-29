---
description: "Use when editing auth, webhooks, secrets, environment files, uploads, or anything that could affect security."
applyTo:
  - "frontend/src/app/api/**/*.ts"
  - "frontend/src/lib/**/*.ts"
  - "scripts/**/*.js"
---

# Security Rules

- Never print or hardcode secrets.
- Validate input with schemas before using it.
- Keep auth and admin checks server-side.
- Use the shared error handler for API routes.
- Do not swallow errors with broad fallback logic unless the spec allows it.
- For any security-sensitive change, run the secret scan and dependency audit scripts.
