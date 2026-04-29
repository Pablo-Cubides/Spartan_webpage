---
description: "Use when editing blog articles, article metadata, slugs, categories, SEO, publishing flow, or blog admin APIs."
applyTo:
  - "frontend/src/app/admin/dashboard/blog/**/*.tsx"
  - "frontend/src/app/api/admin/blog/**/*.ts"
  - "blog-posts/**/*.md"
  - "scripts/**/*blog*"
---

# Blog Content Rules

- Treat the spec as the source of truth before editing any article or blog API.
- Every article needs: title, slug, description/excerpt, category, author, date, and cover image.
- Keep slugs lowercase, URL-safe, and unique.
- Prefer the `create-article` skill for new content or major rewrites.
- Prefer the `validate-blog-content.js` script before publishing or merging content changes.
- Keep SEO metadata concise and human readable.
- If the article references images, ensure the image URL is valid and accessible.
