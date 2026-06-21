---
version: "1.1"
status: active
owner: engineering
last_changed: "2026-04-29"
---

# Spec: Blog Publish

## Problem

Los posts del blog se crean en Markdown en `blog-posts/` y deben pasar por validaciones antes de ser publicados. Sin un proceso definido, posts con metadata inválida, slugs duplicados o imágenes rotas pueden llegar a producción y dañar el SEO o la experiencia del usuario.

## Goal

Definir un flujo de publicación de posts que garantice: metadata completa y válida, slug único, imágenes accesibles, y sincronización entre los archivos Markdown (fuente de verdad) y la DB.

## Scope

### In
- Validación de frontmatter (título, slug, fecha, categoría, cover image)
- Validación de unicidad de slug
- Verificación de URLs de imágenes accesibles
- Publicación via panel admin (`is_published: true`)
- Datos estáticos servidos en build time (ver ADR 003)
- Sitemap dinámico actualizado en cada build

### Out
- Programación de publicación (scheduling) — backlog
- Preview de posts antes de publicar — backlog
- Versionado de borradores
- Workflow de aprobación multi-usuario (editor → admin)

## Acceptance Criteria

- Un post con frontmatter incompleto (sin `title`, `slug`, `date` o `category`) falla la validación en CI y no llega a producción. {@test: frontend/tests/production-checklist.ts}
- Un post con slug duplicado falla la validación. {@test: frontend/tests/production-checklist.ts}
- Un post con `cover_image` que devuelve 4xx/5xx falla la validación de imágenes en CI. {@test: frontend/tests/production-checklist.ts}
- Un post marcado como `is_published: true` en el panel admin aparece en `GET /api/blog` y en el sitemap. {@test: frontend/tests/production-checklist.ts}
- Los datos estáticos del blog (`static-data.ts`) se regeneran en cada build. {@test: frontend/tests/production-checklist.ts}
- `qa:content:validate` y `qa:images:validate` pasan sin errores en main. {@test: frontend/tests/production-checklist.ts}

## Frontmatter Required Fields

```markdown
---
title: string (required)
slug: string (required, unique, kebab-case)
date: YYYY-MM-DD (required)
category: string (required, must match a category slug in DB)
cover_image: URL (required, must be accessible)
excerpt: string (optional but recommended for SEO)
author: string (optional, defaults to "Spartan Club")
---
```

## Publish Workflow

```
1. Author creates/edits .md file in blog-posts/
2. git commit + push → CI runs qa:content:validate + qa:images:validate
3. If validation passes → merge to main
4. Build regenerates static-data.ts from blog-posts/
5. Admin panel: set is_published = true for the post
6. Post appears in GET /api/blog and sitemap on next build/ISR cycle
```

## API Contracts

- `GET  /api/blog` — listar posts publicados — ver `docs/specs/api-contracts/blog.md`
- `GET  /api/blog/validate-slug` — verificar unicidad de slug — ver `docs/specs/api-contracts/blog.md`
- `POST /api/admin/blog` — crear post — ver `docs/specs/api-contracts/blog.md`
- `PUT  /api/admin/blog/[id]` — actualizar/publicar post — ver `docs/specs/api-contracts/blog.md`
- `POST /api/admin/blog/media` — subir imagen de portada — ver `docs/specs/api-contracts/blog-media.md`

## Implementation

| Spec requirement | Code location |
|-----------------|---------------|
| Validación de frontmatter | `scripts/validate-blog-content.js` |
| Validación de imágenes | `scripts/validate-image-urls.js` |
| Datos estáticos del blog | `frontend/src/lib/blog/static-data.ts` |
| Parser de Markdown | `frontend/src/lib/blog/utils.ts` |
| Sitemap dinámico | `frontend/src/app/sitemap.ts` |
| Schema Markdown a JSON | `frontend/src/lib/blog/utils.ts` |
| Schema de blog (Prisma) | `frontend/prisma/schema.prisma` |
| Panel admin blog | `frontend/src/app/api/admin/blog/route.ts` |
| Edición de post | `frontend/src/app/api/admin/blog/[id]/route.ts` |

## Constraints
- La validación de URLs de imágenes corre en CI pero NO bloquea el dev server local.
- Los datos estáticos se generan en build — el sitio no necesita DB para servir el blog al público.
- El parser de Markdown usa `gray-matter` para extraer frontmatter.
- El sitemap referencia solo posts con `is_published: true`.

## Non-Functional Requirements
- SEO: sitemap actualizado y metadata válida en cada build.

## Test Scenarios

### Scenario 1 — Frontmatter incompleto falla CI
- Post sin campo `slug` → `scripts/validate-blog-content.js` devuelve exit 1.
- CI falla con mensaje indicando el campo faltante.

### Scenario 2 — Imagen rota falla CI
- Post con `cover_image: https://ejemplo.com/imagen-404.jpg` → `scripts/validate-image-urls.js` devuelve exit 1.

### Scenario 3 — Post válido pasa validación
- Post con todos los campos requeridos e imagen accesible → ambos scripts devuelven exit 0.

### Scenario 4 — Post publicado aparece en API
- `PUT /api/admin/blog/7` con `{ is_published: true }` → `GET /api/blog` incluye el post.

### Scenario 5 — Slug duplicado rechazado
- `GET /api/blog/validate-slug?slug=post-existente` → `{ available: false }`.
- El editor no puede guardar el post.

## Definition of Done

- [x] `qa:content:validate` pasa en CI — `scripts/validate-blog-content.js`
- [x] `qa:images:validate` pasa en CI — `scripts/validate-image-urls.js`
- [x] Datos estáticos generados en build — `frontend/src/lib/blog/static-data.ts`
- [x] Sitemap dinámico funcional — `frontend/src/app/sitemap.ts`
- [x] ADR de migración estática — `docs/adr/003-blog-static-migration.md`
- [x] Contratos de API documentados — `docs/specs/api-contracts/blog.md`
- [ ] Scheduling de publicación (backlog)
- [ ] Preview antes de publicar (backlog)
