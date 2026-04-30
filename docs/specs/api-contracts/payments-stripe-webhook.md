# API Contract — Stripe Webhook

```
Method:     POST
Path:       /api/payments/stripe/webhook
Auth:       stripe-signature header (Stripe SDK verification)
Idempotent: yes — completed status check prevents double-credit
```

Implementation: `frontend/src/app/api/payments/stripe/webhook/route.ts`

---

## Request

### Headers (inbound from Stripe)

```
stripe-signature: t=<timestamp>,v1=<hmac_sha256>
Content-Type: application/json
```

Verification: `stripe.webhooks.constructEvent(rawBody, signature, STRIPE_WEBHOOK_SECRET)`

### Body

Stripe sends a `Stripe.Event` object. Raw body (string) must be used for signature verification — do **not** parse JSON before verifying.

---

## Events Handled

| Stripe event | Action |
|---|---|
| `checkout.session.completed` | Mark purchase `completed`, grant credits, send email |
| `payment_intent.payment_failed` | Mark purchase `failed` (if not already completed) |
| Any other event | Log and return `200 { received: true }` (no-op) |

### `checkout.session.completed` flow

1. Extract `session.metadata.purchase_id` and `session.metadata.credits`.
2. Look up `Purchase` by `purchase_id` → 404 if not found.
3. If `purchase.status !== 'completed'`:
   - Update `status = completed`, `payment_id = session.id`, `completed_at = now`.
   - Increment `user.credits` by `purchase.credits_received`.
   - Send Brevo email (template `1`).

### Payment state machine

```
pending ──checkout.session.completed──► completed
        ──payment_intent.failed      ──► failed
completed                                (terminal)
failed                                   (terminal)
```

---

## Response — Success

```
Status: 200
```
```json
{ "received": true }
```

## Response — Errors

| Status | `error` code | Condition |
|--------|-------------|-----------|
| 400 | `missing_purchase_id` | `session.metadata.purchase_id` absent |
| 401 | `missing_signature` | `stripe-signature` header absent |
| 403 | `invalid_signature` | Stripe SDK signature check failed |
| 404 | `purchase_not_found` | No Purchase record for given ID |
| 500 | `stripe_not_configured` | Stripe client not initialized |
| 500 | `webhook_not_configured` | `STRIPE_WEBHOOK_SECRET` env var missing |
| 500 | `webhook_error` | Unexpected exception |

---

## Data Contract

Same `Purchase` model as MercadoPago webhook.

```
Model: Purchase  (frontend/prisma/schema.prisma:~60)
```

| Field | Type | Description |
|-------|------|-------------|
| `id` | Int | Matches `session.metadata.purchase_id` |
| `payment_id` | String | Set to `session.id` on completion |
| `status` | String | `pending` \| `completed` \| `failed` |
| `credits_received` | Int | Credits granted on approval |
| `completed_at` | DateTime? | Set when status → completed |

## Responsibilities

| Responsibility | Owner |
|---|---|
| Signature verification | `verifyWebhookSignature()` in `lib/server/stripe.ts` |
| Event dispatch | `switch (event.type)` in route handler |
| Credit grant | `prisma.user.update({ credits: { increment } })` |
| Email notification | `lib/server/email.ts` — Brevo template `1` |

## Environment Variables Required

| Variable | Purpose |
|----------|---------|
| `STRIPE_SECRET_KEY` | Stripe API key (used by `lib/server/stripe.ts`) |
| `STRIPE_WEBHOOK_SECRET` | Webhook signing secret (`whsec_...`) |
