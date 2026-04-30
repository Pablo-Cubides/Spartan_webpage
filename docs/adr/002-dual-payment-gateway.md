# ADR 002 — Dual Payment Gateway: MercadoPago + Stripe

Status: Accepted
Date: 2024-Q4

---

## Context

Spartan Club vende paquetes de créditos a usuarios de Latinoamérica y potencialmente otros mercados. Se necesita una estrategia de pagos que maximice la conversión local sin sacrificar cobertura internacional.

---

## Decision

Soportar dos pasarelas simultáneamente:
- **MercadoPago** — pagos locales Colombia/LATAM (PSE, Nequi, efectivo, tarjetas locales).
- **Stripe** — pagos internacionales (tarjetas globales, Apple Pay, Google Pay).

Cada gateway tiene su propio endpoint de webhook independiente:
- `POST /api/payments/webhook` — MercadoPago
- `POST /api/payments/stripe/webhook` — Stripe

Ambos webhooks escriben al mismo modelo `Purchase` con idempotencia garantizada (chequeo de `status !== 'completed'` antes de otorgar créditos).

**Contrato completo:** Ver `docs/specs/api-contracts/payments-mercadopago-webhook.md` y `payments-stripe-webhook.md`.

---

## Alternatives Considered

### 1. Solo MercadoPago
- **Pro:** Menor complejidad, mejor experiencia LATAM.
- **Con:** Sin cobertura internacional; limita crecimiento fuera de Colombia/Argentina/México.
- **Descartado:** El roadmap incluye usuarios fuera de LATAM.

### 2. Solo Stripe
- **Pro:** API unificada, mejor DX, soporte global.
- **Con:** Stripe no opera directamente en Colombia — las tarjetas locales tienen alta tasa de rechazo; PSE/Nequi no disponibles.
- **Descartado:** La mayoría de usuarios actuales son colombianos.

### 3. Pasarela unificada (ej. dLocal, PayU)
- **Pro:** Una sola integración para LATAM + global.
- **Con:** Mayor costo de comisiones; APIs menos maduras; vendor lock-in.
- **Descartado:** Complejidad operacional similar con peor DX.

---

## Consequences

- **Estado compartido:** La tabla `Purchase` es la fuente de verdad. El campo `gateway` (`mercadopago` | `stripe`) permite reconciliación y debugging.
- **Idempotencia crítica:** Ambos webhooks deben ser idempotentes. La verificación `purchase.status !== 'completed'` previene doble otorgamiento de créditos si el proveedor reintenta el webhook.
- **Firma de webhook:** Cada gateway usa un esquema de firma diferente:
  - MercadoPago: `HMAC-SHA256(requestId + timestamp + secret)` via `X-Signature`.
  - Stripe: SDK `stripe.webhooks.constructEvent()` via `stripe-signature`.
- **Email de confirmación:** Ambos webhooks envían email de confirmación via Brevo pero usan diferente template ID (MP: template 2, Stripe: template 1). Unificar en el futuro si los contenidos son idénticos.
- **Testing:** Los tests de webhooks deben cubrir ambos gateways. Ver `frontend/tests/payments/flow.test.ts`.
