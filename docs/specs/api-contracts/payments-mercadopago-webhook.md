# API Contract — MercadoPago Webhook

```
Method:     POST
Path:       /api/payments/webhook
Auth:       X-Signature header (HMAC-SHA256, verified server-side)
Idempotent: yes — duplicate events are safe (status check prevents double-credit)
```

Implementation: `frontend/src/app/api/payments/webhook/route.ts`

---

## Request

### Headers (inbound from MercadoPago)

```
X-Signature:  ts=<timestamp>,v1=<sha256_hex>
X-Request-Id: <uuid>
Content-Type: application/json
```

Signature algorithm:
```
data   = "<X-Request-Id><timestamp><MERCADOPAGO_WEBHOOK_SECRET>"
hash   = SHA256(data).hex()
verify = timingSafeEqual(hash, v1_from_header)
```

### Body

```json
{
  "type": "payment",
  "data": { "id": "123456789" },
  "resource": "<optional_fallback_id>"
}
```

Payment ID is resolved from: `body.data.id` → `body.resource` → `body.id` (first non-null).

---

## Processing Flow

1. Verify `X-Signature` → 403 on failure.
2. Extract `paymentId` → fetch `GET https://api.mercadopago.com/v1/payments/{id}`.
3. Resolve `Purchase` via `external_reference` (primary) or `payment_id` (fallback).
4. Apply state transition (see state machine below).
5. If `approved/paid` and purchase was not already completed → grant credits + send email.
6. Return `200 { ok: true, mp_status: "<status>" }`.

### Payment state machine

```
pending ──approved──► completed  (credits granted, email sent)
        ──failed ──► failed
        ──pending──► pending     (no-op update)
completed              (terminal — no further transitions)
failed                 (terminal — no further transitions)
```

---

## Response — Success

```
Status: 200
```
```json
{ "ok": true, "mp_status": "approved" }
```

## Response — Errors

| Status | `error` code | Condition |
|--------|-------------|-----------|
| 400 | `missing_payment_id` | No payment ID in payload |
| 401 | `missing_signature` | `X-Signature` or `X-Request-Id` header absent |
| 403 | `invalid_signature` | HMAC verification failed |
| 500 | `webhook_not_configured` | `MERCADOPAGO_WEBHOOK_SECRET` env var missing |
| 500 | `mp_token_not_configured` | `MERCADOPAGO_ACCESS_TOKEN` env var missing |
| 502 | `mp_verify_error` | MercadoPago API returned non-2xx |
| 500 | `webhook_error` | Unexpected exception |

---

## Data Contract

```
Model: Purchase  (frontend/prisma/schema.prisma:~60)
```

| Field | Type | Description |
|-------|------|-------------|
| `id` | Int | Primary key, matches `external_reference` |
| `payment_id` | String | MercadoPago payment ID |
| `status` | String | `pending` \| `completed` \| `failed` |
| `credits_received` | Int | Credits to grant on approval |
| `amount_paid` | Decimal | Amount charged |
| `completed_at` | DateTime? | Set when status → completed |

## Responsibilities

| Responsibility | Owner |
|---------------|-------|
| Signature verification | `verifyMercadopagoSignature()` in route handler |
| Payment status fetch | MercadoPago REST API |
| Purchase lookup | Prisma — `Purchase` model |
| Credit grant | `prisma.user.update({ credits: { increment } })` |
| Email notification | `lib/server/email.ts` — Brevo template `BREVO_TEMPLATE_PURCHASE` |

## Environment Variables Required

| Variable | Purpose |
|----------|---------|
| `MERCADOPAGO_WEBHOOK_SECRET` | HMAC signing secret |
| `MERCADOPAGO_ACCESS_TOKEN` | Bearer token for MP API |
| `BREVO_TEMPLATE_PURCHASE` | Brevo email template ID (default: 2) |
