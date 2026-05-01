---
version: "1.0"
status: draft
owner: engineering
last_changed: "YYYY-MM-DD"
---

# Spec: <Feature Name>

## Problem

<!-- What user problem or business need does this solve? -->

## Goal

<!-- Concrete outcome this spec delivers. -->

## Scope

### In
- Feature A
- Feature B

### Out
- Out-of-scope item

## Acceptance Criteria

- Given X, when Y, then Z.
- User can do A.
- System rejects B with error C.

## API Contracts

See [docs/specs/api-contracts/<feature>.md](../api-contracts/<feature>.md) (if applicable).

## Implementation

| Endpoint / Component | File | Notes |
|---------------------|------|-------|
| `POST /api/...` | `frontend/src/app/api/.../route.ts` | |

## Test Scenarios

| ID | Scenario | Expected |
|----|---------|----------|
| T1 | Happy path | 200 OK |
| T2 | Invalid input | 400 error |

## Non-Functional Requirements

- Performance: response < Xms at P95
- Security: no secrets in logs
- Availability: graceful degradation if external API fails

## Definition of Done

- [ ] All acceptance criteria met
- [ ] API contract doc created/updated
- [ ] Tests added for happy path and error cases
- [ ] QA script gates passing (`qa-spec-completeness`, `qa-spec-traceability`, `qa-spec-structure`)
- [ ] Docs updated (this spec + `environment-variables.md` if new vars added)
