# Spartan Club Project Guidelines

## Scope
- This repo is a Next.js frontend with Prisma-backed APIs and a blog/admin flow.
- Use the `qa:*` scripts in the root `package.json` for quality gates.
- Prefer the shared storage helper in `frontend/src/lib/storage.ts` for image uploads.

## Working Rules
- Start every feature from `docs/specs/<feature>/spec.md`.
- If a change touches UI, also update the design docs in `docs/design/`.
- If a change touches blog content, follow the blog skill and content runbook.
- Do not introduce new secrets or hardcode credentials.

## Build and Validation
- Local gate: `npm run qa:prepush`
- Core checks: lint, typecheck, tests, build, Prisma validate
- Security checks: secret scan and dependency audit

## Content and Media
- Blog articles must have valid slug, SEO metadata, category, author, and cover image.
- Use the upload route for new cover images instead of manual file handling.
- Keep image URLs within allowed hosts or local storage.

## Design
- Follow the design tokens and component specs in `docs/design/`.
- Avoid ad hoc colors and spacing in UI code.
- Ensure keyboard access, focus states, and alt text are present.
