# API Contract — Asesor de Estilo

Implementation: `frontend/src/app/api/asesor-estilo/`

---

## POST /api/asesor-estilo/upload — Upload image

```
Method:     POST
Path:       /api/asesor-estilo/upload
Auth:       Bearer <Firebase ID Token>
Body:       multipart/form-data
Rate:       Per-user, enforced by credit system
```

### Request

```
Content-Type: multipart/form-data
Authorization: Bearer <id_token>

file: <binary image> (JPEG | PNG | WEBP, max 10 MB)
```

### Response — Success

```
Status: 200
```
```json
{
  "url": "https://res.cloudinary.com/...",
  "publicId": "asesor/abc123",
  "width": 1024,
  "height": 768
}
```

### Response — Errors

| Status | `error` code | Condition |
|--------|-------------|-----------|
| 400 | `missing_file` | No file in request |
| 401 | `unauthorized` | Token missing or invalid |
| 413 | `file_too_large` | File exceeds 10 MB |
| 422 | `invalid_file_type` | Not JPEG, PNG, or WEBP |
| 422 | `moderation_rejected` | Content policy violation |
| 500 | `upload_error` | Cloudinary or storage failure |

---

## POST /api/asesor-estilo/analyze — Analyze outfit

```
Method:     POST
Path:       /api/asesor-estilo/analyze
Auth:       Bearer <Firebase ID Token>
Idempotent: no (consumes credits)
```

### Request

```json
{
  "imageUrl": "https://res.cloudinary.com/...",
  "context": "optional user context string"
}
```

### Response — Success

```
Status: 200
```
```json
{
  "analysis": "string (Gemini Vision response)",
  "creditsUsed": 2,
  "creditsRemaining": 48,
  "analysisId": "uuid"
}
```

### Response — Errors

| Status | `error` code | Condition |
|--------|-------------|-----------|
| 400 | `missing_image_url` | `imageUrl` absent |
| 401 | `unauthorized` | Token missing or invalid |
| 402 | `INSUFFICIENT_CREDITS` | Not enough credits |
| 422 | `moderation_rejected` | Image rejected by safety filter |
| 502 | `ai_error` | Gemini API failure |
| 500 | `internal_error` | Unexpected failure |

---

## POST /api/asesor-estilo/analyze-clothing — Clothing-specific analysis

```
Method: POST
Path:   /api/asesor-estilo/analyze-clothing
Auth:   Bearer <Firebase ID Token>
```

Same request/response shape as `/analyze` but uses a clothing-specific prompt.

---

## POST /api/asesor-estilo/iterate — Follow-up on analysis

```
Method:     POST
Path:       /api/asesor-estilo/iterate
Schema:     IterateImageSchema
Auth:       Bearer <Firebase ID Token>
Idempotent: no (consumes credits)
```

### Request

```json
{
  "analysisId": "uuid",
  "message": "string (follow-up question or instruction)"
}
```

### Response — Success

```json
{
  "response": "string (AI response to follow-up)",
  "creditsUsed": 1,
  "creditsRemaining": 47
}
```

---

## Data Contract

| Field | Description |
|-------|-------------|
| `imageUrl` | Cloudinary CDN URL (permanent, served via HTTPS) |
| `analysisId` | UUID linking upload → analysis → iterate sessions |
| `creditsUsed` | Credits deducted for this request (configurable per operation) |

## Responsibilities

| Responsibility | Owner |
|---|---|
| Auth | `lib/server/firebaseAdmin.ts:verifyIdToken()` |
| Image validation | `lib/asesor-estilo/validation/image.ts` |
| Moderation | `lib/asesor-estilo/moderation.ts` |
| Storage (Cloudinary) | `lib/storage.ts` |
| AI analysis | `lib/asesor-estilo/ai/gemini.ts` |
| Credit gate | `lib/asesor-estilo/credits.ts` |
