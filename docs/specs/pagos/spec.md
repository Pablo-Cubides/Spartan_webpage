# Spec: Pagos — Sistema de Créditos

## Problem

Los usuarios de Spartan Club necesitan comprar créditos para acceder a herramientas IA premium (Coach Espartano, Asesor de Estilo). El sistema debe soportar usuarios colombianos (MercadoPago) e internacionales (Stripe) con un flujo confiable de confirmación y anti-duplicación.

## Goal

Proveer un sistema de pagos dual (MercadoPago + Stripe) que: crea una `Purchase` pendiente al iniciar el pago, confirma y otorga créditos via webhook cuando el proveedor notifica el éxito, y garantiza idempotencia ante reintentos de webhook.

## Scope

### In
- Paquetes de créditos con precio fijo (no suscripciones)
- Flujo de checkout via MercadoPago (LATAM) y Stripe (global)
- Confirmación por webhook con otorgamiento de créditos
- Email de confirmación de compra (Brevo)
- Panel admin para reconciliación de pagos

### Out
- Suscripciones o pagos recurrentes
- Reembolsos automáticos (proceso manual por ahora)
- Pagos en efectivo (OXXO, Baloto) — backlog
- Multi-moneda en el mismo checkout

## Acceptance Criteria

- Un usuario autenticado puede ver los paquetes de créditos disponibles.
- Al seleccionar un paquete, el sistema crea una `Purchase` con `status: pending` y redirige al checkout del proveedor.
- Cuando MercadoPago o Stripe notifica el pago aprobado, los créditos se otorgan **exactamente una vez** (idempotencia garantizada).
- El webhook retorna `200` aunque el email falle — el pago no se revierte por errores de email.
- El usuario recibe un email de confirmación con el nombre del paquete y los créditos comprados.
- Los webhooks con firma inválida son rechazados con `401/403` (no procesados).
- En admin, un administrador puede ver todas las `Purchase` con su estado y proveedor.

## Payment State Machine

```
[User selects package]
        │
        ▼
   status: pending   ──── webhook: approved ────► status: completed
        │                                              (credits granted,
        │                                               email sent)
        └──── webhook: failed/rejected ──────► status: failed
                                                    (terminal)

completed ──── (no transitions — terminal)
failed    ──── (no transitions — terminal)
```

## API Contracts

- `GET  /api/credits/packages` — ver `docs/specs/api-contracts/credits.md`
- `POST /api/credits/buy` — MercadoPago checkout
- `POST /api/credits/buy-stripe` — Stripe checkout
- `POST /api/payments/webhook` — MercadoPago webhook — ver `docs/specs/api-contracts/payments-mercadopago-webhook.md`
- `POST /api/payments/stripe/webhook` — Stripe webhook — ver `docs/specs/api-contracts/payments-stripe-webhook.md`

## Implementation

| Spec requirement | Code location |
|-----------------|---------------|
| Crear Purchase pendiente (MP) | `frontend/src/app/api/credits/buy/route.ts` |
| Crear Purchase pendiente (Stripe) | `frontend/src/app/api/credits/buy-stripe/route.ts` |
| Webhook MP — verificar firma HMAC | `frontend/src/app/api/payments/webhook/route.ts:11–49` |
| Webhook MP — state machine | `frontend/src/app/api/payments/webhook/route.ts:121–155` |
| Webhook Stripe — verificar firma | `frontend/src/app/api/payments/stripe/webhook/route.ts:30` |
| Webhook Stripe — otorgar créditos | `frontend/src/app/api/payments/stripe/webhook/route.ts:64–80` |
| Email confirmación | `frontend/src/lib/server/email.ts` |
| Modelo Purchase | `frontend/prisma/schema.prisma:~60` |

## Non-Functional Requirements

- Idempotencia: verificar `purchase.status !== 'completed'` antes de otorgar créditos.
- Seguridad: validar firma de webhook antes de procesar payload (timing-safe comparison).
- Resiliencia: errores de email no deben fallar el webhook — proveedores reintentarán en 5xx.
- Trazabilidad: el campo `gateway` en `Purchase` identifica qué proveedor procesó el pago.

## Definition of Done

- [x] Tests para webhook processing (MP y Stripe) — `frontend/tests/payments/flow.test.ts`
- [x] Runbook para debugging de webhooks y reconciliación — `docs/runbooks/pagos-runbook.md` (pendiente de crear)
- [x] Contratos de webhook documentados — `docs/specs/api-contracts/payments-mercadopago-webhook.md` y `docs/specs/api-contracts/payments-stripe-webhook.md`
- [x] ADR sobre decisión de dual gateway — `docs/adr/002-dual-payment-gateway.md`
