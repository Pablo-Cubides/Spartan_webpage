# Contracts Template

Use this template for every API endpoint, data schema, and service boundary defined in a spec.
Copy the relevant section(s) into your feature spec or into `docs/specs/api-contracts/`.

---

## REST API Contract

```
Method:   POST | GET | PUT | PATCH | DELETE
Path:     /api/<resource>[/<id>]
Auth:     Bearer <Firebase ID Token> | None | Admin only
Rate:     N req/min per IP | per user
Idempotent: yes | no
```

### Request

Headers:
```
Authorization: Bearer <id_token>   (when auth required)
Content-Type: application/json
```

Body (JSON):
```json
{
  "field": "type — description"
}
```

### Response — Success

```
Status: 200 | 201 | 204
```
```json
{
  "field": "value"
}
```

### Response — Errors

| Status | `error` code | Condition |
|--------|-------------|-----------|
| 400 | `missing_field` | Required field absent |
| 401 | `unauthorized` | Token missing or invalid |
| 403 | `forbidden` | Authenticated but insufficient role |
| 404 | `not_found` | Resource does not exist |
| 409 | `conflict` | Duplicate or state conflict |
| 422 | `validation_error` | Input fails business rules |
| 429 | `rate_limited` | Too many requests |
| 500 | `internal_error` | Unexpected server failure |
| 502 | `upstream_error` | External service failure |

Error body:
```json
{ "error": "<code>", "details": "<optional human message>" }
```

---

## Webhook Contract

```
Direction: <Provider> → POST /api/<resource>/webhook
Auth:      Signature header (provider-specific)
Retry:     Provider retries on 5xx; respond 200 immediately
```

### Headers (inbound)

```
<provider>-signature: <value>
<provider>-request-id: <uuid>
Content-Type: application/json
```

### Payload (example)

```json
{
  "type": "event.name",
  "data": { "id": "string" }
}
```

### Events handled

| Event type | Action |
|------------|--------|
| `event.approved` | Mark resource completed, grant entitlement |
| `event.failed` | Mark resource failed |

### Response

Always `200 { "received": true }` — never expose internal state in webhook responses.

---

## Data Contract (Prisma Schema)

Document the model fields that matter to the spec. Reference the schema file + line.

```
Model:      ModelName  (frontend/prisma/schema.prisma:<line>)
Owned by:   <feature name>
```

| Field | Type | Nullable | Description |
|-------|------|----------|-------------|
| `id` | Int | No | Auto PK |
| `status` | String | No | Enum: pending \| completed \| failed |

### Valid state transitions

```
pending → completed
pending → failed
(completed and failed are terminal)
```

---

## Responsibilities Contract

Who owns what across the boundary.

| Responsibility | Owner |
|---------------|-------|
| Token validation | `middleware.ts` + `firebaseAdmin.ts` |
| Business logic | API route handler |
| Persistence | Prisma via `lib/server/prisma.ts` |
| Email notification | `lib/server/email.ts` |
| Error formatting | `lib/api/error-handler.ts` |
