# Test Scenarios — Pagos

Test file: `frontend/tests/payments/flow.test.ts`  
Implementation: `frontend/src/app/api/payments/webhook/route.ts`, `frontend/src/app/api/payments/stripe/webhook/route.ts`

---

## Scenario 1 — MercadoPago: webhook aprobado otorga créditos

**Given** una `Purchase` con `status: pending` en la DB  
**When** MercadoPago envía un webhook con `status: approved` y firma válida  
**Then** la `Purchase` se actualiza a `status: completed`  
**And** el `User.credits` se incrementa en `credits_received`  
**And** se envía email de confirmación via Brevo  
**And** el webhook responde `200 { ok: true, mp_status: "approved" }`  

Reference: `frontend/src/app/api/payments/webhook/route.ts:121–139`  
Test: `frontend/tests/payments/flow.test.ts`

---

## Scenario 2 — Idempotencia: webhook duplicado no duplica créditos

**Given** una `Purchase` ya en `status: completed`  
**When** MercadoPago reenvía el mismo webhook (retry)  
**Then** el `User.credits` NO se incrementa de nuevo  
**And** el webhook responde `200` (no falla — para que MP no reintente indefinidamente)  

Reference: `frontend/src/app/api/payments/webhook/route.ts:122` — guard `purchase.status !== 'completed'`

---

## Scenario 3 — Firma inválida es rechazada

**Given** un webhook entrante de MercadoPago  
**When** el header `X-Signature` no coincide con el HMAC calculado  
**Then** el webhook responde `403 { error: "invalid_signature" }`  
**And** ningún cambio se realiza en la DB  

Reference: `frontend/src/app/api/payments/webhook/route.ts:11–49`

---

## Scenario 4 — MercadoPago: pago fallido actualiza estado

**Given** una `Purchase` con `status: pending`  
**When** MercadoPago envía webhook con `status: rejected` (o similar)  
**Then** la `Purchase` se actualiza a `status: failed`  
**And** no se otorgan créditos  
**And** no se envía email de confirmación  

Reference: `frontend/src/app/api/payments/webhook/route.ts:148–154`

---

## Scenario 5 — Stripe: checkout.session.completed otorga créditos

**Given** una `Purchase` con `status: pending` y `session.metadata.purchase_id` válido  
**When** Stripe envía evento `checkout.session.completed` con firma válida  
**Then** la `Purchase` se actualiza a `status: completed`  
**And** el `User.credits` se incrementa  
**And** se envía email de confirmación  
**And** el webhook responde `200 { received: true }`  

Reference: `frontend/src/app/api/payments/stripe/webhook/route.ts:38–103`  
Test: `frontend/tests/payments/flow.test.ts`

---

## Scenario 6 — Stripe: firma inválida rechazada

**Given** un webhook de Stripe con `stripe-signature` inválido  
**When** el SDK de Stripe no puede verificar la firma  
**Then** el webhook responde `403 { error: "invalid_signature" }`  

Reference: `frontend/src/app/api/payments/stripe/webhook/route.ts:30–34`

---

## Scenario 7 — Email falla pero pago se confirma

**Given** el servicio de email (Brevo) está caído  
**When** MercadoPago o Stripe envía webhook de pago aprobado  
**Then** la `Purchase` se actualiza a `completed` y los créditos se otorgan  
**And** el error de email se logea pero no se propaga  
**And** el webhook responde `200`  

Reference: `frontend/src/app/api/payments/webhook/route.ts:163–177` — try/catch en envío de email
