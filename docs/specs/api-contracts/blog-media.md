# API Contract — Blog Media Upload

See: `docs/specs/api-contracts/blog.md` (admin blog section) and `docs/specs/001-blog-media-upload/spec.md`

---

## POST /api/admin/blog/media — Upload blog cover image

```
Method:      POST
Path:        /api/admin/blog/media
Schema:      `None`
Auth:        Admin Bearer token
Body:        multipart/form-data
Max size:    10 MB
```

Implementation: `frontend/src/app/api/admin/blog/media/route.ts`

### Request

```
Content-Type: multipart/form-data
Authorization: Bearer <id_token>

file: <binary> (JPEG | PNG | WEBP)
```

### Response — Success

```
Status: 200
```
```json
{
  "url": "https://res.cloudinary.com/...",
  "storageId": "blog/covers/abc123"
}
```

### Response — Errors

| Status | `error` code | Condition |
|--------|-------------|-----------|
| 400 | `missing_file` | No file in request |
| 401 | `unauthorized` | Token missing or invalid |
| 403 | `forbidden` | Not admin or editor role |
| 413 | `file_too_large` | File exceeds 10 MB |
| 422 | `invalid_file_type` | Not JPEG, PNG, or WEBP |
| 500 | `upload_error` | Cloudinary or local storage failure |

## Responsibilities

| Responsibility | Owner |
|---|---|
| Auth + role check | `lib/server/auth.ts` |
| File type validation | `lib/asesor-estilo/validation/image.ts` |
| Storage (Cloudinary + fallback) | `lib/storage.ts` |
