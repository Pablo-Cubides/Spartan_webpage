# API Contract — Credits

Implementation: `frontend/src/app/api/credits/`

---

## GET /api/credits/packages — List credit packages

```
Method: GET
Path:   /api/credits/packages
Auth:   None (public)
```

### Response — Success

```
Status: 200
```
```json
{
  "packages": [
    {
      "id": 1,
      "name": "Starter",
      "credits": 100,
      "price": 9.99,
      "currency": "USD",
      "description": "string"
    }
  ]
}
```

---

## POST /api/credits/buy — Initiate MercadoPago purchase

```
Method: POST
Path:   /api/credits/buy
Auth:   Bearer <Firebase ID Token>
```

### Request

```json
{ "packageId": 1 }
```

### Response — Success

```
Status: 200
```
```json
{
  "preferenceId": "mp_preference_id",
  "initPoint": "https://www.mercadopago.com.co/checkout/v1/redirect?pref_id=...",
  "purchaseId": 42
}
```

### Response — Errors

| Status | `error` code | Condition |
|--------|-------------|-----------|
| 400 | `missing_package_id` | `packageId` absent |
| 401 | `unauthorized` | Token missing or invalid |
| 404 | `package_not_found` | No package with given ID |
| 500 | `mp_error` | MercadoPago API failure |
| 500 | `internal_error` | DB or unexpected error |

---

## POST /api/credits/buy-stripe — Initiate Stripe checkout

```
Method: POST
Path:   /api/credits/buy-stripe
Auth:   Bearer <Firebase ID Token>
```

### Request

```json
{ "packageId": 1 }
```

### Response — Success

```
Status: 200
```
```json
{
  "url": "https://checkout.stripe.com/pay/cs_...",
  "purchaseId": 43
}
```

### Response — Errors

| Status | `error` code | Condition |
|--------|-------------|-----------|
| 400 | `missing_package_id` | `packageId` absent |
| 401 | `unauthorized` | Token missing or invalid |
| 404 | `package_not_found` | No package with given ID |
| 500 | `stripe_error` | Stripe API failure |
| 500 | `internal_error` | Unexpected error |

---

## Data Contract

```
Model: CreditPackage  (frontend/prisma/schema.prisma)
Model: Purchase       (frontend/prisma/schema.prisma)
```

### Purchase lifecycle

```
POST /api/credits/buy        → Purchase created (status: pending)
POST /api/payments/webhook   → status: completed | failed  (MercadoPago)
POST /api/payments/stripe/webhook → status: completed | failed (Stripe)
```

| Purchase Field | Type | Description |
|---------------|------|-------------|
| `id` | Int | Auto PK, used as `external_reference` in MP |
| `user_id` | Int | FK → User |
| `package_id` | Int | FK → CreditPackage |
| `status` | String | `pending` \| `completed` \| `failed` |
| `payment_id` | String? | Gateway-provided payment/session ID |
| `credits_received` | Int | Credits to grant (copied from package at purchase time) |
| `amount_paid` | Decimal | Amount charged |
| `gateway` | String | `mercadopago` \| `stripe` |
| `completed_at` | DateTime? | Set on completion |
