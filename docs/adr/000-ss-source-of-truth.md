# ADR 000 — Source of Truth for Editorial Content

Status: Accepted

Decision
- Primary source of truth: Markdown files stored in `blog-posts/`.
- Secondary (optional): CMS may be used for previews or editorial drafting but final persisted record must be the markdown file in the repository.

Rationale
- Versioning: markdown in repo is versioned in Git and fits review workflows.
- Traceability: PRs provide audit trail and allow SSD gates to run.
- Simplicity: Developers and CI operate on local files; editors can still use CMS for staging.

Consequences
- Update runbooks and skills to write to markdown or sync CMS -> markdown process.
- Editors must follow sync rules; exceptions documented in runbook.
