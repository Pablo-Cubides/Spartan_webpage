---
version: "1.0"
status: active
owner: engineering
last_changed: "2026-04-29"
---

# Spec: Database Migrations

## Problem

Sin trazabilidad entre migraciones de base de datos y los features que las motivan, es difícil entender por qué existe cada tabla/columna, o evaluar el impacto de un rollback.

## Goal

Documentar cada migración de Prisma con: qué cambió, qué feature lo motiva, y el riesgo de rollback.

## Approach

- Las migraciones viven en `frontend/prisma/migrations/`
- Cada migración tiene su propio directorio con `migration.sql`
- Este documento es el índice de trazabilidad; para detalle de cada feature ver el spec correspondiente

---

## Migration Index

### `20251120140640_add_admin_tables`

**File:** `frontend/prisma/migrations/20251120140640_add_admin_tables/migration.sql`
**Date:** 2025-11-20
**Author:** Initial schema
**Status:** Applied (production)

#### Tables created

| Table | Purpose | Feature Spec |
|-------|---------|--------------|
| `User` | Usuarios autenticados con roles y créditos | [auth-admin/spec.md](auth-admin/spec.md) |
| `CreditPackage` | Paquetes de créditos disponibles para comprar | [pagos/spec.md](pagos/spec.md) |
| `Purchase` | Registro de compras con estado (pending/completed) | [pagos/spec.md](pagos/spec.md) |
| `AppSetting` | Configuración dinámica (clave/valor) para admins | [auth-admin/spec.md](auth-admin/spec.md) |
| `Announcement` | Anuncios temporales mostrados en la app | [auth-admin/spec.md](auth-admin/spec.md) |
| `BlogPost` | Posts del blog con autor y estado de publicación | [blog-publish/spec.md](blog-publish/spec.md) |

#### Key fields & invariants

- `User.uid` — Firebase UID, único, inmutable
- `User.role` — `'user'` | `'admin'`; default `'user'`
- `User.credits` — entero ≥ 0; nunca negativo
- `Purchase.status` — `'pending'` | `'completed'` | `'failed'`; idempotencia garantizada por `payment_id` único
- `BlogPost.slug` — único; usado como URL permanente

#### Rollback risk

`HIGH` — tablas fundamentales usadas por autenticación, pagos y blog. Un rollback eliminaría todos los datos de usuarios y compras.

---

### `20251207_add_blog_categories_metadata`

**File:** `frontend/prisma/migrations/20251207_add_blog_categories_metadata/migration.sql`
**Date:** 2025-12-07
**Author:** Blog SEO enhancement
**Status:** Applied (production)

#### Tables created

| Table | Purpose | Feature Spec |
|-------|---------|--------------|
| `BlogCategory` | Categorías de blog con metadata SEO | [blog-publish/spec.md](blog-publish/spec.md) |
| `SocialLink` | Links de redes sociales por usuario | [auth-admin/spec.md](auth-admin/spec.md) |

#### Columns added

| Table | Column | Purpose |
|-------|--------|---------|
| `User` | `bio` | Biografía del autor para posts de blog |
| `BlogPost` | `category_id` | FK → `BlogCategory` (nullable) |
| `BlogPost` | `meta_title` | Título SEO |
| `BlogPost` | `meta_description` | Descripción SEO |
| `BlogPost` | `slug_canonical` | URL canónica alternativa |
| `BlogPost` | `cover_image_alt` | Alt text para accesibilidad |
| `BlogPost` | `expertise_areas` | Áreas de expertise del autor |
| `BlogPost` | `tags` | Tags en texto (CSV) |
| `BlogPost` | `reading_time_minutes` | Tiempo estimado de lectura |
| `BlogPost` | `view_count` | Contador de vistas |

#### Rollback risk

`MEDIUM` — las columnas son nullable; los posts existentes no se ven afectados si se elimina esta migración. `BlogCategory` puede tener datos si ya se categoriza contenido.

---

## Adding a New Migration

Cuando crees una nueva migración:

1. Ejecutar `npx prisma migrate dev --name <nombre-descriptivo>`
2. Añadir una sección en este documento con:
   - Nombre del archivo y fecha
   - Tablas/columnas creadas o modificadas
   - Feature spec relacionado
   - Nivel de riesgo de rollback (LOW / MEDIUM / HIGH)
3. Si la migración es destructiva (DROP TABLE, NOT NULL sin default), añadir un runbook de rollback en `docs/runbooks/`

Ver template en [docs/specs/templates/migration.template.md](templates/migration.template.md).

---

## Definition of Done

- [ ] Toda migración en `frontend/prisma/migrations/` tiene entrada en este documento
- [ ] Cada entrada enlaza al feature spec que motivó el cambio
- [ ] Migraciones destructivas tienen runbook de rollback en `docs/runbooks/`
- [ ] Al crear una migración nueva, este doc se actualiza en el mismo PR
