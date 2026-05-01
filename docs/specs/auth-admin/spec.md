---
version: "1.1"
status: active
owner: engineering
last_changed: "2026-04-29"
---

# Spec: Auth & Admin

## Problem

Spartan Club necesita controlar el acceso a contenido y funcionalidades según el rol del usuario. Los administradores deben poder gestionar usuarios, roles y contenido desde un panel dedicado sin exponer esas capacidades a usuarios regulares.

## Goal

Proveer un sistema de autenticación basado en Firebase con roles en DB (user, editor, admin) que proteja rutas sensibles en el servidor y en el edge (middleware), y un panel de administración funcional.

## Scope

### In
- Login/Logout con Firebase Authentication (email + Google)
- 3 roles: `user`, `editor`, `admin`
- Protección de `/admin/**` y `/dashboard/**` en edge (middleware)
- Sincronización del usuario Firebase con la DB en cada login
- Panel admin: lista de usuarios, cambio de roles
- Panel admin: lista de compras/pagos
- Panel admin: gestión de blog posts
- Sesión via cookie `__session` (HttpOnly, Secure)

### Out
- 2FA / MFA
- Recuperación de contraseña (delegado a Firebase)
- OAuth providers adicionales (por ahora solo Google + email)
- Permisos granulares por recurso (roles planos son suficientes)

## Roles y Permisos

| Capacidad | `user` | `editor` | `admin` |
|-----------|:------:|:--------:|:-------:|
| Ver blog público | ✅ | ✅ | ✅ |
| Comentar | ✅ | ✅ | ✅ |
| Acceder a herramientas IA | ✅ | ✅ | ✅ |
| Crear/editar posts | ❌ | ✅ | ✅ |
| Publicar posts | ❌ | ❌ | ✅ |
| Gestionar usuarios | ❌ | ❌ | ✅ |
| Ver compras | ❌ | ❌ | ✅ |
| Cambiar configuración | ❌ | ❌ | ✅ |

## Acceptance Criteria

- Un usuario no autenticado es redirigido a `/` con `?auth=required` al acceder a `/admin` o `/dashboard`.
- Un usuario autenticado con `role: user` recibe `403` al llamar rutas de admin.
- Un administrador puede ver la lista de usuarios paginada.
- Un administrador puede cambiar el rol de cualquier usuario.
- El cambio de rol es efectivo inmediatamente (no requiere logout/login del afectado en el servidor — el token se revalida en cada request).
- Al hacer login, `POST /api/auth/sync` crea o actualiza el registro en DB.
- Al hacer logout, la cookie `__session` es eliminada.

## API Contracts

- `POST /api/auth/session` — crear/eliminar cookie de sesión — ver `docs/specs/api-contracts/auth-session.md`
- `POST /api/auth/sync` — sincronizar usuario Firebase ↔ DB — ver `docs/specs/api-contracts/auth-sync.md`
- `GET  /api/admin/users` — listar usuarios — ver `docs/specs/api-contracts/admin-users.md`
- `PUT  /api/admin/users/[id]/role` — cambiar rol — ver `docs/specs/api-contracts/admin-users.md`
- `GET  /api/admin/purchases` — ver compras — ver `docs/specs/api-contracts/admin-purchases.md`
- `GET/PUT /api/admin/settings` — configuración del sitio — ver `docs/specs/api-contracts/admin-settings.md`

## Implementation

| Spec requirement | Code location |
|-----------------|---------------|
| Cookie de sesión (crear/eliminar) | `frontend/src/app/api/auth/session/route.ts` |
| Sync Firebase → DB | `frontend/src/app/api/auth/sync/route.ts` |
| Edge protection (middleware) | `frontend/src/middleware.ts` |
| Token verification (edge) | `frontend/src/middleware.ts:verifyFirebaseIdToken()` |
| Token verification (server) | `frontend/src/lib/server/firebaseAdmin.ts:verifyIdToken()` |
| Admin SDK init | `frontend/src/lib/server/firebaseAdmin.ts:1–29` |
| Role check en server routes | `frontend/src/lib/server/auth.ts` |
| Lista usuarios (admin) | `frontend/src/app/api/admin/users/route.ts` |
| Cambio de rol | `frontend/src/app/api/admin/users/[id]/role/route.ts` |
| User model con role | `frontend/prisma/schema.prisma` |

## Non-Functional Requirements

- El middleware corre en Edge runtime — no puede usar `firebase-admin` (Node.js only). Usa REST API de Identity Toolkit como fallback (ver ADR en `docs/adr/`).
- Los tokens no se almacenan en `localStorage` — solo en cookies HttpOnly para prevenir XSS.
- El campo `role` en DB es la fuente de verdad — no se usan custom claims de Firebase.

## Test Scenarios

`frontend/tests/users/signup-bonus.test.ts`

### Scenario 1 — Unauthenticated redirect
- GET `/admin` sin cookie → redirect a `/?auth=required`

### Scenario 2 — User role blocked
- GET `/api/admin/users` con token de `role: user` → `403 forbidden`

### Scenario 3 — Admin role allowed
- GET `/api/admin/users` con token de `role: admin` → `200` con lista de usuarios

### Scenario 4 — Role change effective
- PUT `/api/admin/users/7/role` `{ role: "editor" }` → `200`
- GET `/api/admin/users/7` → role is now `editor`

### Scenario 5 — First login creates user
- POST `/api/auth/sync` con token de usuario nuevo → `200 { isNew: true }`
- Usuario aparece en DB con `role: user`, `credits: 0`

## Definition of Done

- [x] Login/Logout funcional con Firebase
- [x] Middleware protege `/admin` y `/dashboard`
- [x] Roles en DB con enforcement en rutas server
- [x] Panel admin: lista de usuarios y cambio de roles
- [x] API contracts documentados
- [ ] End-to-end tests login + role enforcement completos
- [x] Runbook — `docs/runbooks/auth-admin-runbook.md`
