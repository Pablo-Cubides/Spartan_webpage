---
version: "1.0"
status: active
owner: engineering
last_changed: "2026-04-29"
---

# Spec: Environment Variables

## Problem

El proyecto usa ~40 variables de entorno. Sin un mapa centralizado es difícil saber qué variables son necesarias para cada feature, cuáles son críticas para producción y cuáles son opcionales.

## Goal

Documentar cada variable de entorno: a qué feature pertenece, su nivel de criticidad y si es pública (expuesta al navegador) o privada.

## Criticality Legend

| Level | Meaning |
|-------|---------|
| `critical` | App falla o queda insegura sin esta variable |
| `high` | Feature principal no funciona sin ella |
| `medium` | Feature degradada o parcial sin ella |
| `low` | Mejora de rendimiento / monitoreo / logging |

---

## Application Settings

| Variable | Criticality | Visibility | Feature Spec | Notes |
|----------|-------------|------------|--------------|-------|
| `NODE_ENV` | `high` | server | — | Controla optimizaciones de Next.js y logging |
| `NEXT_PUBLIC_API_URL` | `medium` | public | — | Base URL para llamadas client-side |
| `NEXT_PUBLIC_APP_NAME` | `low` | public | — | Nombre mostrado en UI |

---

## Database

| Variable | Criticality | Visibility | Feature Spec | Notes |
|----------|-------------|------------|--------------|-------|
| `DATABASE_URL` | `critical` | server | [docs/specs/database-migrations.md](database-migrations.md) | Connection pooler URL (PgBouncer / Supabase) |
| `DIRECT_URL` | `critical` | server | [docs/specs/database-migrations.md](database-migrations.md) | Direct URL para Prisma migrate/generate |

---

## Firebase Authentication

| Variable | Criticality | Visibility | Feature Spec | Notes |
|----------|-------------|------------|--------------|-------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | `critical` | public | [docs/specs/auth-admin/spec.md](auth-admin/spec.md) | Firebase web client key |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | `critical` | public | [docs/specs/auth-admin/spec.md](auth-admin/spec.md) | |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | `critical` | public | [docs/specs/auth-admin/spec.md](auth-admin/spec.md) | |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | `critical` | public | [docs/specs/auth-admin/spec.md](auth-admin/spec.md) | |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | `critical` | public | [docs/specs/auth-admin/spec.md](auth-admin/spec.md) | |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | `critical` | public | [docs/specs/auth-admin/spec.md](auth-admin/spec.md) | |
| `FIREBASE_PROJECT_ID` | `critical` | server | [docs/specs/auth-admin/spec.md](auth-admin/spec.md) | Server-side admin SDK |
| `FIREBASE_CLIENT_EMAIL` | `critical` | server | [docs/specs/auth-admin/spec.md](auth-admin/spec.md) | Service account email |
| `FIREBASE_PRIVATE_KEY` | `critical` | server | [docs/specs/auth-admin/spec.md](auth-admin/spec.md) | **Never log or expose** |

---

## Google Gemini AI

| Variable | Criticality | Visibility | Feature Spec | Notes |
|----------|-------------|------------|--------------|-------|
| `GEMINI_API_KEY_FACE` | `high` | server | [docs/specs/ia-tools/spec.md](ia-tools/spec.md) | Asesor forma de cara |
| `GEMINI_API_KEY_CLOTHING` | `high` | server | [docs/specs/ia-tools/spec.md](ia-tools/spec.md) | Asesor de estilo |
| `GEMINI_API_KEY_COACH` | `high` | server | [docs/specs/ia-tools/spec.md](ia-tools/spec.md) | Coach Espartano |
| `GEMINI_API_KEY` | `medium` | server | [docs/specs/ia-tools/spec.md](ia-tools/spec.md) | Fallback si clave específica no configurada |

---

## Cloudinary — Image Processing

| Variable | Criticality | Visibility | Feature Spec | Notes |
|----------|-------------|------------|--------------|-------|
| `CLOUDINARY_CLOUD_NAME` | `high` | server | [docs/specs/ia-tools/spec.md](ia-tools/spec.md) | Subida y transformación de imágenes |
| `CLOUDINARY_API_KEY` | `high` | server | [docs/specs/ia-tools/spec.md](ia-tools/spec.md) | |
| `CLOUDINARY_API_SECRET` | `critical` | server | [docs/specs/ia-tools/spec.md](ia-tools/spec.md) | **Never log or expose** |

---

## Payments — MercadoPago

| Variable | Criticality | Visibility | Feature Spec | Notes |
|----------|-------------|------------|--------------|-------|
| `MERCADOPAGO_ACCESS_TOKEN` | `critical` | server | [docs/specs/pagos/spec.md](pagos/spec.md) | Token de acceso a la API |
| `NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY` | `critical` | public | [docs/specs/pagos/spec.md](pagos/spec.md) | Llave pública para el SDK del browser |
| `MERCADOPAGO_WEBHOOK_SECRET` | `critical` | server | [docs/specs/pagos/spec.md](pagos/spec.md) | Verificación de firma de webhooks. Sin esto, webhooks no verificados en producción |

---

## Payments — Stripe

| Variable | Criticality | Visibility | Feature Spec | Notes |
|----------|-------------|------------|--------------|-------|
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `critical` | public | [docs/specs/pagos/spec.md](pagos/spec.md) | Llave pública para Stripe.js |
| `STRIPE_SECRET_KEY` | `critical` | server | [docs/specs/pagos/spec.md](pagos/spec.md) | **Never log or expose** |
| `STRIPE_WEBHOOK_SECRET` | `critical` | server | [docs/specs/pagos/spec.md](pagos/spec.md) | Verificación de firma de webhooks. Sin esto, webhooks no verificados |

---

## Redis Cache

| Variable | Criticality | Visibility | Feature Spec | Notes |
|----------|-------------|------------|--------------|-------|
| `UPSTASH_REDIS_REST_URL` | `medium` | server | — | Sin Redis se usa caché en memoria |
| `UPSTASH_REDIS_REST_TOKEN` | `medium` | server | — | |
| `REDIS_URL` | `medium` | server | — | Alias alternativo |
| `REDIS_TOKEN` | `medium` | server | — | Alias alternativo |

---

## Security

| Variable | Criticality | Visibility | Feature Spec | Notes |
|----------|-------------|------------|--------------|-------|
| `ALLOWED_UPLOAD_ORIGINS` | `high` | server | [docs/specs/001-blog-media-upload](001-blog-media-upload/) | Origins permitidos para uploads |

---

## Email — Brevo

| Variable | Criticality | Visibility | Feature Spec | Notes |
|----------|-------------|------------|--------------|-------|
| `BREVO_API_KEY` | `high` | server | [docs/specs/pagos/spec.md](pagos/spec.md) | Emails transaccionales (confirmación de compra) |
| `BREVO_SENDER_EMAIL` | `medium` | server | [docs/specs/pagos/spec.md](pagos/spec.md) | |
| `BREVO_TEMPLATE_WELCOME` | `low` | server | [docs/specs/pagos/spec.md](pagos/spec.md) | ID de template en Brevo |
| `BREVO_TEMPLATE_NEWSLETTER` | `low` | server | [docs/specs/pagos/spec.md](pagos/spec.md) | |
| `BREVO_TEMPLATE_PURCHASE` | `medium` | server | [docs/specs/pagos/spec.md](pagos/spec.md) | |
| `BREVO_TEMPLATE_CREDIT_LOW` | `low` | server | [docs/specs/pagos/spec.md](pagos/spec.md) | |
| `BREVO_LIST_NEWSLETTER` | `low` | server | — | |
| `BREVO_LIST_USERS` | `low` | server | — | |

---

## AI Service Configuration

| Variable | Criticality | Visibility | Feature Spec | Notes |
|----------|-------------|------------|--------------|-------|
| `AI_ANALYSIS_TIMEOUT` | `low` | server | [docs/specs/ia-tools/spec.md](ia-tools/spec.md) | Default: 45000ms |
| `AI_GENERATION_TIMEOUT` | `low` | server | [docs/specs/ia-tools/spec.md](ia-tools/spec.md) | Default: 60000ms |
| `AI_MAX_RETRIES` | `low` | server | [docs/specs/ia-tools/spec.md](ia-tools/spec.md) | Default: 2 |
| `AI_RETRY_DELAY` | `low` | server | [docs/specs/ia-tools/spec.md](ia-tools/spec.md) | Default: 2000ms |
| `AI_CIRCUIT_THRESHOLD` | `low` | server | [docs/specs/ia-tools/spec.md](ia-tools/spec.md) | Fallos antes de abrir el circuit breaker |
| `AI_CIRCUIT_RESET` | `low` | server | [docs/specs/ia-tools/spec.md](ia-tools/spec.md) | Default: 30000ms |

---

## Credit System

| Variable | Criticality | Visibility | Feature Spec | Notes |
|----------|-------------|------------|--------------|-------|
| `CREDIT_COST_ANALYSIS` | `medium` | server | [docs/specs/ia-tools/spec.md](ia-tools/spec.md) | Créditos por análisis de imagen |
| `CREDIT_COST_GENERATION` | `medium` | server | [docs/specs/ia-tools/spec.md](ia-tools/spec.md) | Créditos por generación |
| `COACH_MESSAGES_PER_CREDIT` | `medium` | server | [docs/specs/ia-tools/spec.md](ia-tools/spec.md) | Mensajes antes de consumir 1 crédito |
| `STARTING_CREDITS` | `medium` | server | [docs/specs/ia-tools/spec.md](ia-tools/spec.md) | Créditos iniciales para nuevos usuarios |
| `ENFORCE_CREDITS` | `medium` | server | [docs/specs/ia-tools/spec.md](ia-tools/spec.md) | `false` deshabilita cobro (testing) |

---

## Rate Limiting

| Variable | Criticality | Visibility | Feature Spec | Notes |
|----------|-------------|------------|--------------|-------|
| `RATE_LIMIT_ENABLED` | `medium` | server | — | Auto-habilitado en producción |
| `RATE_LIMIT_MAX` | `low` | server | — | Default: 100 req/ventana |
| `RATE_LIMIT_ITERATIONS` | `low` | server | — | Default: 50 |
| `RATE_LIMIT_WINDOW` | `low` | server | — | Default: 3600s |

---

## Image Validation

| Variable | Criticality | Visibility | Feature Spec | Notes |
|----------|-------------|------------|--------------|-------|
| `MAX_IMAGE_SIZE_MB` | `medium` | server | [docs/specs/001-blog-media-upload](001-blog-media-upload/) | Default: 10 |
| `MIN_IMAGE_WIDTH` | `low` | server | [docs/specs/001-blog-media-upload](001-blog-media-upload/) | Default: 512px |
| `MIN_IMAGE_HEIGHT` | `low` | server | [docs/specs/001-blog-media-upload](001-blog-media-upload/) | Default: 512px |
| `MAX_IMAGE_WIDTH` | `low` | server | [docs/specs/001-blog-media-upload](001-blog-media-upload/) | Default: 4096px |
| `MAX_IMAGE_HEIGHT` | `low` | server | [docs/specs/001-blog-media-upload](001-blog-media-upload/) | Default: 4096px |
| `ALLOWED_IMAGE_TYPES` | `medium` | server | [docs/specs/001-blog-media-upload](001-blog-media-upload/) | Default: jpeg,png,webp |

---

## Feature Flags

| Variable | Criticality | Visibility | Feature Spec | Notes |
|----------|-------------|------------|--------------|-------|
| `MODERATION_ENABLED` | `medium` | server | [docs/specs/ia-tools/spec.md](ia-tools/spec.md) | Moderación de imágenes subidas |
| `WATERMARK_ENABLED` | `low` | server | [docs/specs/ia-tools/spec.md](ia-tools/spec.md) | Watermark en imágenes generadas |
| `ANALYTICS_ENABLED` | `low` | server | — | Default: false |

---

## Monitoring

| Variable | Criticality | Visibility | Feature Spec | Notes |
|----------|-------------|------------|--------------|-------|
| `MONITORING_ENABLED` | `low` | server | — | |
| `LOG_LEVEL` | `low` | server | — | Default: info |
| `SENTRY_DSN` | `medium` | server | — | Server-side error tracking. See `frontend/sentry.server.config.ts` |
| `NEXT_PUBLIC_SENTRY_DSN` | `medium` | public | — | Browser error tracking. See `frontend/sentry.client.config.ts` |
| `SENTRY_AUTH_TOKEN` | `low` | server (build only) | — | Used by Sentry CLI to upload sourcemaps at build time |
| `SENTRY_ENABLE_DEV` | `low` | server | — | `1` to send Sentry events from local dev |
| `NEXT_PUBLIC_SENTRY_ENABLE_DEV` | `low` | public | — | `1` to send client Sentry events from local dev |
| `NEXT_PUBLIC_ENV` | `low` | public | — | Environment label (e.g. `staging`, `production`) for Sentry tagging |

---

## Feature Flags (Harness FF)

| Variable | Criticality | Visibility | Feature Spec | Notes |
|----------|-------------|------------|--------------|-------|
| `HARNESS_FF_SDK_KEY` | `medium` | server | — | Server-side SDK key. See `frontend/src/lib/feature-flags/server.ts` |
| `NEXT_PUBLIC_HARNESS_FF_SDK_KEY` | `medium` | public | — | Client SDK key. See `frontend/src/lib/feature-flags/client.ts` |

---

## Definition of Done

- [ ] Toda variable en `.env.example` aparece en este documento
- [ ] Cada variable `critical` o `high` tiene enlace a su feature spec
- [ ] Variables marcadas "Never log or expose" no aparecen en logs de CI ni en mensajes de error
- [ ] Al añadir una nueva variable de entorno, este doc se actualiza en el mismo PR
