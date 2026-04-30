# API Contract — Auth Session

```
Method:     POST
Path:       /api/auth/session
Auth:       Firebase ID Token (body) → sets __session cookie
Idempotent: yes
```

Implementation: `frontend/src/app/api/auth/session/route.ts`

---

## POST — Create session cookie

### Request

```
Content-Type: application/json
```

```json
{ "idToken": "<firebase_id_token>" }
```

### Response — Success

```
Status: 200
Set-Cookie: __session=<id_token>; HttpOnly; Secure; SameSite=Strict; Path=/
```

```json
{ "ok": true }
```

### Response — Errors

| Status | `error` code | Condition |
|--------|-------------|-----------|
| 400 | `missing_token` | `idToken` field absent |
| 401 | `invalid_token` | Firebase token invalid or expired |
| 500 | `internal_error` | Unexpected exception |

---

## DELETE — Clear session cookie

```
Method: DELETE
Path:   /api/auth/session
Auth:   None
```

### Response — Success

```
Status: 200
Set-Cookie: __session=; Max-Age=0; Path=/
```

```json
{ "ok": true }
```

---

## Middleware protection

Routes `/admin/**` and `/dashboard/**` require a valid `__session` cookie.
Verification: `verifyFirebaseIdToken()` in `middleware.ts` (Edge runtime — REST API fallback).
Server routes use `verifyIdToken()` from `lib/server/firebaseAdmin.ts` (Admin SDK preferred).

## Responsibilities

| Responsibility | Owner |
|---|---|
| Token validation (edge) | `middleware.ts` via identitytoolkit REST API |
| Token validation (server) | `lib/server/firebaseAdmin.ts` (Admin SDK + REST fallback) |
| Cookie lifecycle | `api/auth/session/route.ts` |
