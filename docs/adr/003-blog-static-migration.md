# ADR 003 — Blog: Migración a datos estáticos JSON

Status: Accepted
Date: 2024-Q4

---

## Context

El blog de Spartan Club originalmente obtenía los posts desde la base de datos en cada request. Esto generaba latencia adicional, dependencia de disponibilidad de la DB en cada page view, y complejidad en el build de Next.js para rutas estáticas.

---

## Decision

Migrar el blog a datos estáticos servidos desde un archivo JSON generado en build time (`frontend/src/lib/blog/static-data.ts`).

Los posts en Markdown residen en `blog-posts/` (source of truth, ver ADR 000). En el proceso de build se parsean con `gray-matter` y se exportan como objeto estático importable por cualquier componente.

**Fuente de verdad:** `blog-posts/*.md` → build → `static-data.ts` → componentes Next.js.

La DB sigue siendo usada para:
- Comentarios (`/api/comments`)
- Contadores de vistas
- Panel de administración del blog (`/api/admin/blog`)

---

## Alternatives Considered

### 1. Mantener DB como fuente primaria de posts
- **Pro:** Panel admin puede editar posts en runtime sin redeploy.
- **Con:** Latencia en cada page view; DB como dependency de disponibilidad para contenido público; ISR compleja de configurar.
- **Descartado:** El contenido del blog cambia infrecuentemente — no justifica DB en el hot path.

### 2. CMS headless (Contentful, Sanity)
- **Pro:** Interfaz de edición amigable para no-devs; webhooks de invalidación de caché.
- **Con:** Costo adicional; otra dependency externa; complejidad de sincronización con Git (ADR 000 requiere markdown en repo).
- **Descartado:** Overhead innecesario para el volumen actual de contenido.

### 3. MDX con file system en runtime
- **Pro:** Sin paso de build extra; edición directa.
- **Con:** No compatible con Edge runtime; `fs` no disponible en Vercel Edge Functions; lento en cold start.
- **Descartado:** Incompatible con el deployment target (Vercel).

---

## Consequences

- **Build time:** El script de parse de markdown corre en build. Si hay un post malformado, el build falla — esto es deseable (falla rápido).
- **Sin hot-reload de posts:** Añadir un nuevo post requiere redeploy. Aceptable dado el ritmo de publicación actual.
- **Sin búsqueda full-text en DB:** La búsqueda de posts se hace en memoria sobre el array estático. Suficiente para el volumen actual (< 200 posts). Si crece, migrar a Algolia/Meilisearch.
- **Sitemap dinámico:** `frontend/src/app/sitemap.ts` usa los datos estáticos para generar el sitemap — no requiere DB.
- **Admin panel:** Las rutas de admin (`/api/admin/blog`) siguen leyendo/escribiendo en DB para gestión. La sincronización DB → markdown es responsabilidad del proceso de administración (ver `docs/runbooks/blog-publish-runbook.md`).
- **Validación en CI:** `scripts/validate-blog-content.js` valida el frontmatter de todos los posts en cada push — previene posts malformados en producción.
