# API Contract — Contact & Newsletter

---

## POST /api/contact — Send contact message

```
Method:     POST
Path:       /api/contact
Auth:       None (public)
Rate:       5 req/hour per IP (via Upstash rate limit)
Idempotent: no
```

Implementation: `frontend/src/app/api/contact/route.ts`

### Request

```json
{
  "name": "string",
  "email": "valid email",
  "message": "string (max 2000 chars)"
}
```

### Response — Success

```
Status: 200
```
```json
{ "ok": true }
```

### Response — Errors

| Status | `error` code | Condition |
|--------|-------------|-----------|
| 400 | `missing_fields` | `name`, `email`, or `message` absent |
| 400 | `invalid_email` | Email format invalid |
| 429 | `rate_limited` | Too many requests from this IP |
| 500 | `email_error` | Brevo send failure |
| 500 | `internal_error` | Unexpected failure |

---

## POST /api/newsletter — Subscribe to newsletter

```
Method:     POST
Path:       /api/newsletter
Auth:       None (public)
Idempotent: yes — duplicate emails are handled gracefully
```

Implementation: `frontend/src/app/api/newsletter/route.ts`

### Request

```json
{ "email": "valid email" }
```

### Response — Success

```
Status: 200
```
```json
{ "ok": true, "alreadySubscribed": false }
```

### Response — Errors

| Status | `error` code | Condition |
|--------|-------------|-----------|
| 400 | `invalid_email` | Email format invalid |
| 500 | `brevo_error` | Brevo API failure |
| 500 | `internal_error` | Unexpected failure |

---

## GET /api/home-content — Home page dynamic content

```
Method: GET
Path:   /api/home-content
Auth:   None (public)
Cache:  public, s-maxage=300
```

Implementation: `frontend/src/app/api/home-content/route.ts`

### Response — Success

```json
{
  "heroStats": { "members": 1200, "countries": 5 },
  "featuredPosts": [ /* latest 3 blog posts */ ]
}
```

---

## GET /api/health — Health check

```
Method: GET
Path:   /api/health
Auth:   None
```

Implementation: `frontend/src/app/api/health/route.ts`

### Response — Success

```
Status: 200
```
```json
{ "status": "ok", "timestamp": "ISO8601" }
```
