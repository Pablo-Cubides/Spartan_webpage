---
description: "Use when working on image uploads, cover images, Cloudinary, storage helpers, media validation, or image URLs."
applyTo:
  - "frontend/src/lib/storage.ts"
  - "frontend/src/app/api/admin/blog/media/**/*.ts"
  - "frontend/src/app/api/avatar/**/*.ts"
  - "frontend/src/app/admin/dashboard/blog/**/*.tsx"
---

# Image and Media Rules

- Prefer the shared upload flow over hand-coded file writes.
- Keep image formats to JPEG, PNG, or WEBP unless the spec says otherwise.
- Keep uploads under 10 MB unless a feature spec explicitly changes the limit.
- Always provide alt text and a preview when the UI renders an image.
- Use canonical URLs from the storage helper, not temporary upload URLs.
- When adding new hosts, update `next.config.ts` and the image validation script.
