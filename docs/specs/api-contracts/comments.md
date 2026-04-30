# API Contract — Comments

Implementation: `frontend/src/app/api/comments/route.ts`

---

## GET /api/comments — Get comments for a post

```
Method: GET
Path:   /api/comments?postId=<id>
Auth:   None (public)
```

### Response — Success

```
Status: 200
```
```json
{
  "comments": [
    {
      "id": 1,
      "content": "string",
      "author": { "name": "string", "avatar": "string" },
      "created_at": "ISO8601"
    }
  ],
  "total": 12
}
```

---

## POST /api/comments — Create comment

```
Method: POST
Path:   /api/comments
Auth:   Bearer <Firebase ID Token>
```

### Request

```json
{
  "postId": 7,
  "content": "string (max 1000 chars)"
}
```

### Response — Success

```
Status: 201
```
```json
{ "id": 42, "content": "string", "created_at": "ISO8601" }
```

### Response — Errors

| Status | `error` code | Condition |
|--------|-------------|-----------|
| 400 | `missing_fields` | `postId` or `content` absent |
| 400 | `content_too_long` | Content exceeds 1000 chars |
| 401 | `unauthorized` | Token missing or invalid |
| 404 | `post_not_found` | Post does not exist or not published |
| 500 | `internal_error` | DB failure |
