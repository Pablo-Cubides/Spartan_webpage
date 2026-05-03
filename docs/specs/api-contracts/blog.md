# API Contract — Blog

Implementation: `frontend/src/app/api/blog/route.ts`

---

## GET /api/blog — List posts

```
Method:   POST | GET | PUT | DELETE
Path:     /api/blog[/<id>] | /api/admin/blog[/<id>]
Schema:   `CreateBlogPostSchema` / `UpdateBlogPostSchema`
Auth:     None (GET) | Admin (Mutation)
Idempotent: yes

### Query Parameters

| Param | Type | Default | Constraints | Description |
|-------|------|---------|-------------|-------------|
| `page` | Int | `1` | ≥ 1 | Page number |
| `limit` | Int | `10` | 1–50 | Posts per page |
| `category` | String | — | — | Filter by category slug |
| `search` | String | — | — | Full-text search on title/content |

### Response — Success

```
Status: 200
Cache-Control: public, s-maxage=60, stale-while-revalidate=300
```

```json
{
  "posts": [
    {
      "id": 1,
      "title": "string",
      "slug": "string",
      "excerpt": "string",
      "cover_image": "https://...",
      "published_at": "2024-01-01T00:00:00Z",
      "author": { "name": "string", "avatar": "string" },
      "category": { "name": "string", "slug": "string" }
    }
  ],
  "total": 42,
  "page": 1,
  "limit": 10,
  "totalPages": 5
}
```

### Response — Errors

| Status | `error` code | Condition |
|--------|-------------|-----------|
| 400 | `invalid_params` | `limit` > 50 or `page` < 1 |
| 500 | `internal_error` | DB or unexpected failure |

---

## GET /api/blog/validate-slug — Check slug uniqueness

```
Method: GET
Path:   /api/blog/validate-slug?slug=<value>[&excludeId=<id>]
Auth:   Admin (Bearer token)
```

### Response — Success

```json
{ "available": true }
```
```json
{ "available": false, "conflictId": 7 }
```

---

## Admin Blog Routes

Implementation: `frontend/src/app/api/admin/blog/route.ts`

### POST /api/admin/blog — Create post

```
Auth: Admin Bearer token
```

```json
{
  "title": "string",
  "slug": "string",
  "content": "markdown string",
  "excerpt": "string",
  "cover_image": "https://...",
  "category_id": 1,
  "is_published": false
}
```

Response `201`:
```json
{ "id": 7, "slug": "new-post-slug" }
```

### PUT /api/admin/blog/[id] — Update post

```
Auth: Admin Bearer token
Body: Partial post fields (same shape as POST)
```

Response `200`: `{ "ok": true }`

### DELETE /api/admin/blog/[id] — Delete post

```
Auth: Admin Bearer token
```

Response `204`: empty body.

### Errors (all admin routes)

| Status | `error` code | Condition |
|--------|-------------|-----------|
| 400 | `missing_fields` | Required field absent |
| 401 | `unauthorized` | Token missing |
| 403 | `forbidden` | User is not admin |
| 404 | `not_found` | Post not found |
| 409 | `slug_conflict` | Slug already exists |
| 500 | `internal_error` | DB failure |

---

## Data Contract

```
Model: BlogPost  (frontend/prisma/schema.prisma:~94)
```

| Field | Type | Description |
|-------|------|-------------|
| `id` | Int | Auto PK |
| `title` | String | Post title |
| `slug` | String | Unique URL identifier |
| `content` | String | Markdown body |
| `excerpt` | String? | Short summary |
| `cover_image` | String? | Canonical image URL |
| `is_published` | Boolean | Default false |
| `published_at` | DateTime? | Set when published |
| `author_id` | Int | FK → User |
| `category_id` | Int? | FK → Category |
