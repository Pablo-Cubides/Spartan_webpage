# API Contract — Admin Users

Implementation: `frontend/src/app/api/admin/users/route.ts`, `frontend/src/app/api/admin/users/[id]/role/route.ts`

All routes require admin role (`User.role = 'admin'`).

---

## GET /api/admin/users — List users

```
Method: GET
Path:   /api/admin/users
Auth:   Admin Bearer token
```

### Query Parameters

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | Int | `1` | Page number |
| `limit` | Int | `20` | Users per page (max 100) |
| `search` | String | — | Filter by name or email |
| `role` | String | — | Filter by role |

### Response — Success

```
Status: 200
```
```json
{
  "users": [
    {
      "id": 1,
      "uid": "firebase_uid",
      "name": "string",
      "email": "string",
      "role": "user | editor | admin",
      "credits": 50,
      "is_active": true,
      "created_at": "ISO8601"
    }
  ],
  "total": 120,
  "page": 1,
  "totalPages": 6
}
```

---

## PUT /api/admin/users/[id]/role — Update user role

```
Method: PUT
Path:   /api/admin/users/[id]/role
Auth:   Admin Bearer token
```

### Request

```json
{ "role": "user | editor | admin" }
```

### Response — Success

```
Status: 200
```
```json
{ "ok": true, "id": 7, "role": "editor" }
```

### Response — Errors

| Status | `error` code | Condition |
|--------|-------------|-----------|
| 400 | `invalid_role` | Role not in allowed enum |
| 401 | `unauthorized` | Token missing or invalid |
| 403 | `forbidden` | Authenticated but not admin |
| 404 | `user_not_found` | No user with given ID |
| 500 | `internal_error` | DB failure |

---

## Data Contract

```
Model: User  (frontend/prisma/schema.prisma)
```

| Field | Type | Values |
|-------|------|--------|
| `role` | String | `user` \| `editor` \| `admin` |
| `is_active` | Boolean | `true` \| `false` |

### Role permissions

| Role | Can read blog | Can write blog | Can manage users | Can view purchases |
|------|:---:|:---:|:---:|:---:|
| `user` | ✅ | ❌ | ❌ | ❌ |
| `editor` | ✅ | ✅ | ❌ | ❌ |
| `admin` | ✅ | ✅ | ✅ | ✅ |

## Responsibilities

| Responsibility | Owner |
|---|---|
| Auth + role check | `lib/server/auth.ts` |
| User pagination | `lib/api/pagination.ts` |
