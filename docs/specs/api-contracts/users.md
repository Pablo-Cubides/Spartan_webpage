# API Contract — Users Profile & Avatar

Implementation: `frontend/src/app/api/users/profile/route.ts`, `frontend/src/app/api/users/avatar/confirm/route.ts`, `frontend/src/app/api/avatar/`

---

## GET /api/users/profile — Get own profile

```
Method: GET
Path:   /api/users/profile
Auth:   Bearer <Firebase ID Token>
```

### Response — Success

```
Status: 200
```
```json
{
  "id": 7,
  "uid": "firebase_uid",
  "name": "string",
  "email": "string",
  "avatar_id": "https://... | /path",
  "role": "user | editor | admin",
  "credits": 50,
  "is_active": true,
  "created_at": "ISO8601"
}
```

---

## PATCH /api/users/profile — Update own profile

```
Method: PATCH
Path:   /api/users/profile
Auth:   Bearer <Firebase ID Token>
```

### Request

```json
{
  "name": "string (optional)",
  "avatar_id": "string URL (optional)"
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
| 400 | `missing_fields` | No updatable field provided |
| 401 | `unauthorized` | Token missing or invalid |
| 500 | `internal_error` | DB failure |

---

## POST /api/avatar/presign — Get presigned upload URL

```
Method: POST
Path:   /api/avatar/presign
Auth:   Bearer <Firebase ID Token>
```

### Request

```json
{ "contentType": "image/jpeg | image/png | image/webp" }
```

### Response — Success

```
Status: 200
```
```json
{
  "uploadUrl": "https://...s3.amazonaws.com/... (presigned PUT URL)",
  "publicUrl": "https://... (final CDN URL after upload)",
  "key": "avatars/user_7_abc123.jpg"
}
```

---

## POST /api/avatar/upload — Direct upload (fallback)

```
Method:      POST
Path:        /api/avatar/upload
Auth:        Bearer <Firebase ID Token>
Body:        multipart/form-data, field: file
Max size:    5 MB
```

### Response — Success

```json
{ "url": "https://..." }
```

---

## POST /api/users/avatar/confirm — Confirm avatar after S3 upload

```
Method: POST
Path:   /api/users/avatar/confirm
Auth:   Bearer <Firebase ID Token>
```

### Request

```json
{ "key": "avatars/user_7_abc123.jpg", "publicUrl": "https://..." }
```

### Response — Success

```json
{ "ok": true, "avatar_id": "https://..." }
```

Updates `User.avatar_id` in DB after the client confirms the S3 upload completed.

---

## Responsibilities

| Responsibility | Owner |
|---|---|
| Auth | `lib/server/firebaseAdmin.ts:verifyIdToken()` |
| S3 presign | `lib/server/` — AWS SDK `@aws-sdk/s3-request-presigner` |
| Cloudinary fallback | `lib/storage.ts` |
| Profile update | `prisma.user.update()` in route handler |
