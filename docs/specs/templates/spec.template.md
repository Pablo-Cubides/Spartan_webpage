---
version: "1.1"
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

<!-- 
AI-READABILITY HINT: Define clear boundaries. 
Use 'In Scope' for what MUST be built and 'Out of Scope' for what MUST NOT be built.
-->

### In
- Feature A
- Feature B

### Out
- Out-of-scope item

## Constraints

<!-- 
AI-READABILITY HINT: Non-negotiable technical or business rules.
Examples: 
- Must use existing Prisma schema
- No external APIs allowed
- Response time must be < 200ms
-->

- Constraint 1
- Constraint 2

## Acceptance Criteria

<!-- 
AI-READABILITY HINT: Used for automated verification.
Format: Given [context], when [action], then [result].
-->

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
