# Rollout: Blog Publish

## Release

- Merge only after content, image, spec, typecheck, tests, and build gates pass.
- Confirm the built sitemap includes expected published posts.
- Confirm no draft-only content appears in public routes.

## Rollback

- Revert the content or admin publish change.
- Redeploy the previous known-good build if public SEO metadata is incorrect.
- Use `docs/runbooks/blog-publish-runbook.md` for production triage.
