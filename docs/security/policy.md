# Security Policy (SSD)

## Audit Policy
- CI enforces dependency audits at severity >= high by default.
- Exceptions must be approved and documented with expiry.

## Secret Handling
- No secrets in source. Use environment variables and secret rotation documented in secret-rotation.md.

## Exception Procedure
- Create a ticket, assign owner, document justification and expiry date.
- Approval recorded in PR description and in security policy exceptions list.
