---
version: "1.0"
status: active
owner: engineering
last_changed: "2026-04-29"
---

# Tutorial: Tu Primer Spec

Este tutorial explica cómo escribir un spec en Spartan Club usando un ejemplo real: una feature de "Compartir Outfit" para el Asesor de Estilo.

---

## ¿Por qué escribir un spec antes de codear?

Un spec es un contrato entre producto, diseño y desarrollo. Sin él:
- El equipo codea features distintas a lo que se necesita
- Los PRs mezclan lógica de negocio no acordada
- El QA no sabe qué testear
- Los bugs de producción no tienen contexto

Con un spec:
- Todos hablan del mismo feature
- El CI puede verificar que el código cumple el contrato
- Los nuevos miembros entienden el "por qué" leyendo docs, no bisectando git log

---

## Paso 1: Identificar el problema real

**Mal comienzo:**
> "Agregar botón de compartir al asesor de estilo"

**Buen comienzo (pregunta el "por qué"):**
> Los usuarios que reciben recomendaciones de outfit no tienen forma de compartirlas con amigos o guardarlas fuera de la app. Esto reduce la retención y el boca a boca orgánico.

El problema debe ser observable y medible. Si no puedes describirlo sin mencionar la solución, es una solución disfrazada de problema.

---

## Paso 2: Definir el Goal

El goal no es "implementar X" — es el **outcome** que el usuario experimenta.

**Mal goal:**
> Implementar un endpoint `/api/outfits/share` y un botón de compartir.

**Buen goal:**
> Permitir que un usuario comparta su recomendación de outfit como imagen o link, desde el resultado del Asesor de Estilo, sin necesidad de salir de la app.

---

## Paso 3: Definir el Scope

El scope previene el scope creep. Sé explícito sobre qué NO incluye.

```markdown
## Scope

### In
- Compartir recomendación como imagen descargable (PNG)
- Link público con resultado (sin login requerido para ver)
- Botón "Compartir" visible en el resultado del asesor

### Out
- Integración directa con Instagram/WhatsApp (versión futura)
- Historial de outfits compartidos
- Comentarios o likes en outfits compartidos
```

---

## Paso 4: Escribir Acceptance Criteria

Los criterios de aceptación son el "definition of done" funcional. Escríbelos desde la perspectiva del usuario o del sistema, no de la implementación.

**Formato recomendado:** "Un usuario autenticado puede..."

```markdown
## Acceptance Criteria

- Un usuario autenticado puede descargar su recomendación de outfit como imagen PNG.
- El sistema genera un link público único para cada recomendación compartida.
- El link público expira después de 30 días.
- Un visitante sin cuenta puede ver el outfit compartido (read-only, sin interacción).
- Si la generación del link falla, el usuario recibe un mensaje de error claro.
```

Cada criterio debe ser **verificable** — debe poder convertirse en un test case.

---

## Paso 5: Mapear el API Contract

Si tu feature tiene endpoints, documenta el contrato **antes** de implementarlo.

```markdown
## API Contracts

### POST /api/outfits/share

Request:
```json
{
  "recommendation_id": "rec_abc123",
  "expires_in_days": 30
}
```

Response 201:
```json
{
  "share_url": "https://spartan-club.vercel.app/shared/outfit/tok_xyz",
  "expires_at": "2026-05-29T00:00:00Z"
}
```

Errors:
- 401 — usuario no autenticado
- 404 — recommendation_id no existe o no pertenece al usuario
- 429 — rate limit (máx 10 shares por hora)
```

El contrato completo va en `docs/specs/api-contracts/<feature>.md` y se registra en `docs/specs/api-contracts/MANIFEST.json`.

---

## Paso 6: Trazar la Implementación

Enlaza el spec con los archivos reales de código. Esto permite que `qa-spec-traceability.js` verifique que los archivos existen.

```markdown
## Implementation

| Endpoint / Component | File | Notes |
|---------------------|------|-------|
| `POST /api/outfits/share` | `frontend/src/app/api/outfits/share/route.ts` | Genera token único y guarda en DB |
| Botón compartir | `frontend/src/components/asesor-estilo/ShareButton.tsx` | Client component |
| Página pública | `frontend/src/app/shared/outfit/[token]/page.tsx` | Server component, sin auth |
```

---

## Paso 7: Definir Test Scenarios

```markdown
## Test Scenarios

| ID | Scenario | Input | Expected |
|----|---------|-------|----------|
| T1 | Happy path — compartir outfit | Usuario autenticado, recommendation_id válido | 201, share_url generada |
| T2 | Recomendación de otro usuario | recommendation_id ajeno | 404 |
| T3 | Usuario no autenticado | Sin token | 401 |
| T4 | Rate limit excedido | 11+ shares en 1 hora | 429 |
| T5 | Link expirado | Token con expires_at en el pasado | 410 Gone |
```

---

## Paso 8: Definition of Done

```markdown
## Definition of Done

- [ ] Todos los acceptance criteria implementados
- [ ] API contract registrado en MANIFEST.json
- [ ] Tests para T1–T5
- [ ] `qa-spec-completeness --strict` pasa
- [ ] `qa-spec-traceability --strict` pasa
- [ ] `qa-spec-structure --strict` pasa
- [ ] Variables de entorno nuevas documentadas en `environment-variables.md`
```

---

## El Spec Completo

Una vez que tienes los 8 pasos, el spec resultante se ve así:

```
docs/specs/outfit-share/
  spec.md          ← este documento
docs/specs/api-contracts/
  outfit-share.md  ← contrato del endpoint
docs/specs/api-contracts/MANIFEST.json
  → añadir entrada para /api/outfits/share
```

Empieza con `cp docs/specs/templates/spec.template.md docs/specs/<feature>/spec.md` y completa sección por sección.

---

## Checklist Rápido

Antes de abrir un PR con la implementación, verifica:

```bash
node scripts/qa-spec-structure.js --strict     # frontmatter + secciones requeridas
node scripts/qa-spec-completeness.js --strict  # todo route.ts tiene contrato
node scripts/qa-spec-traceability.js --strict  # todo archivo referenciado existe
node scripts/scan-secrets.js                   # sin secretos en docs
```

O con npm:

```bash
npm run qa:spec:structure
npm run qa:spec:completeness
npm run qa:spec:traceability
npm run qa:security:secrets
```
