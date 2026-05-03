# Plan: Blog Publish

## Technical Approach

- Markdown files in `blog-posts/` remain the editorial source of truth.
- CI validates required frontmatter, slug format, duplicate slugs, and image URLs.
- Build-time blog data is regenerated from markdown and exposed through public blog routes and sitemap.
- Admin publishing updates runtime visibility without replacing markdown as the reviewed source.

## Verification

- Run `node scripts/validate-blog-content.js`.
- Run `node scripts/validate-image-urls.js`.
- Run `frontend/tests/production-checklist.ts`.

## Rollback

- Revert the content commit for bad markdown.
- Re-run the build after restoring valid markdown and image URLs.
