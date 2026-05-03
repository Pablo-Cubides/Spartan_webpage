# API Contract — Admin Settings

Implementation: `frontend/src/app/api/admin/settings/route.ts`

```
Schema: `None`
Auth: Admin Bearer token (all routes)
```

---

## GET /api/admin/settings — Get site settings

```
Status: 200
```
```json
{
  "maintenanceMode": false,
  "allowRegistrations": true,
  "freeMessagesPerMonth": 10
}
```

## PUT /api/admin/settings — Update settings

### Request

```json
{
  "maintenanceMode": false,
  "allowRegistrations": true,
  "freeMessagesPerMonth": 10
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
| 401 | `unauthorized` | Token missing |
| 403 | `forbidden` | Not admin |
| 400 | `invalid_value` | Value out of allowed range |
| 500 | `internal_error` | DB failure |
