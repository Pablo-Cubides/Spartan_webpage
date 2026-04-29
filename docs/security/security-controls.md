# Security Controls

- Server-side auth for admin routes
- Schema validation for all inputs
- Secret scan before push
- Dependency audit before merge
- No hardcoded credentials
- No broad error suppression in security-sensitive code

## Sensitive Areas
- Auth
- Webhooks
- Uploads
- Environment variables
- Storage helpers
