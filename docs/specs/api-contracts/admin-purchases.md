# API Contract — Admin Purchases

Implementation: `frontend/src/app/api/admin/purchases/route.ts`

---

## GET /api/admin/purchases — List purchases

```
Method: GET
Path:   /api/admin/purchases
Schema: `None`
Auth:   Admin Bearer token
```

### Query Parameters

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | Int | `1` | Page number |
| `limit` | Int | `20` | Per page (max 100) |
| `status` | String | — | Filter: `pending \| completed \| failed` |
| `gateway` | String | — | Filter: `mercadopago \| stripe` |
| `userId` | Int | — | Filter by user |

### Response — Success

```
Status: 200
```
```json
{
  "purchases": [
    {
      "id": 1,
      "user": { "id": 7, "name": "string", "email": "string" },
      "package": { "id": 1, "name": "Starter", "credits": 100 },
      "status": "completed",
      "gateway": "stripe",
      "payment_id": "cs_live_...",
      "amount_paid": "9.99",
      "credits_received": 100,
      "created_at": "ISO8601",
      "completed_at": "ISO8601"
    }
  ],
  "total": 340,
  "page": 1,
  "totalPages": 17
}
```

### Response — Errors

| Status | `error` code | Condition |
|--------|-------------|-----------|
| 401 | `unauthorized` | Token missing or invalid |
| 403 | `forbidden` | Not admin role |
| 500 | `internal_error` | DB failure |
