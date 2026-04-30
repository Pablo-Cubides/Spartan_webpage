# API Contract — Auth Sync

```
Method:     POST
Path:       /api/auth/sync
Auth:       Bearer <Firebase ID Token>
Idempotent: yes — upsert is safe to call multiple times
```

Implementation: `frontend/src/app/api/auth/sync/route.ts`

---

## Purpose

Syncs the Firebase authenticated user into the Prisma database.
Called on first login and on subsequent logins to ensure DB record is up-to-date.

- If the user doesn't exist in DB → creates a new `User` record.
- If the user exists → updates `email` only (name and avatar are NOT overwritten — the user may have customized them).

---

## Request

```
Authorization: Bearer <id_token>
Content-Type: application/json
```

Body: empty (user data comes from the decoded token).

---

## Response — Success

```
Status: 200
```
```json
{
  "id": 7,
  "uid": "firebase_uid",
  "email": "user@example.com",
  "name": "string",
  "role": "user",
  "credits": 0,
  "isNew": true
}
```

`isNew: true` when the DB record was just created (first login).

---

## Response — Errors

| Status | `error` code | Condition |
|--------|-------------|-----------|
| 401 | `unauthorized` | Token missing, invalid, or expired |
| 401 | `invalid_token` | Token lacks `uid` or `email` claim |
| 500 | `internal_error` | DB upsert failure |

---

## Data Contract

```
Model: User  (frontend/prisma/schema.prisma)
```

Fields set on CREATE:
- `uid` — from Firebase token
- `email` — from Firebase token
- `name` — from token `name` claim, fallback: email prefix
- `avatar_id` — from token `picture` claim, fallback: `/icono spartan club - sin fondo.png`
- `role` — `user` (default)
- `credits` — `0`
- `is_active` — `true`

Fields updated on subsequent calls:
- `email` — only field updated (respects user-customized name/avatar)
- `updated_at`

## Responsibilities

| Responsibility | Owner |
|---|---|
| Token decode | `lib/server/firebaseAdmin.ts:verifyIdToken()` |
| DB upsert | `prisma.user.upsert()` in route handler |
| Error formatting | `lib/api/error-handler.ts:withErrorHandler()` |
