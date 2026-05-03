# Test Scenarios: Auth & Admin

| ID | Scenario | Expected |
|----|----------|----------|
| AUTH-1 | Unauthenticated user opens `/admin` | Redirect to `/?auth=required` |
| AUTH-2 | User role calls admin route | `403 forbidden` |
| AUTH-3 | Admin lists users | `200` with paginated users |
| AUTH-4 | Admin changes user role | Role is updated immediately |
| AUTH-5 | New Firebase user syncs | DB user is created with default role |
| AUTH-6 | User logs out | `__session` cookie is cleared |

Automated coverage: `frontend/tests/users/signup-bonus.test.ts`.
