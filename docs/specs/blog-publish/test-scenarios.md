# Test Scenarios: Blog Publish

| ID | Scenario | Expected |
|----|----------|----------|
| BLOG-1 | Missing required frontmatter | Content validation exits non-zero |
| BLOG-2 | Duplicate slug | Content validation exits non-zero |
| BLOG-3 | Broken cover image | Image validation exits non-zero |
| BLOG-4 | Published post is listed | `GET /api/blog` includes post |
| BLOG-5 | Build runs | Static blog data and sitemap are generated |

Automated coverage: `frontend/tests/production-checklist.ts`.
