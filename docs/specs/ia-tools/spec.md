---
version: "1.1"
status: active
owner: engineering
last_changed: "2026-04-29"
---

# Spec: IA Tools — Coach Triarvon y Asesor de Estilo

## Problem

Los usuarios de Triarvon Club necesitan orientación personalizada en áreas de desarrollo masculino (cuerpo, estilo, mentalidad, productividad). El acceso a coaches humanos es costoso e inaccesible para la mayoría. Las herramientas IA genéricas no conocen el contexto ni los objetivos específicos del usuario.

## Goal

Proveer herramientas IA especializadas que:
1. Conocen el perfil, objetivos y restricciones de cada usuario (onboarding obligatorio).
2. Mantienen contexto de conversación por especialidad.
3. Operan con un sistema de créditos para controlar el costo de inferencia.
4. Protegen la privacidad del usuario cifrando todos los mensajes en reposo.

## Scope

### In
- **Coach Triarvon**: 5 coaches especializados (general, cuerpo, estilo, mentalidad, productividad)
- **Cuota gratuita mensual** por usuario + sistema de créditos de pago
- **Onboarding** de perfil obligatorio antes de acceder a coaches
- **Asesor de Estilo**: análisis de imagen de ropa/outfit con IA visual
- **Asesor de Forma de Cara**: análisis facial con recomendaciones de estilo
- Cifrado de mensajes en reposo (AES-256)

### Out
- Voz/audio (texto únicamente por ahora)
- Generación de imágenes (solo análisis)
- Entrenadores humanos en la plataforma
- Exportación del historial de conversaciones

## Coach Triarvon — Acceptance Criteria

- Un usuario nuevo no puede acceder a ningún coach hasta completar el onboarding de perfil. {@test: frontend/tests/asesor-estilo/config.test.ts}
- El onboarding captura: `mainGoal`, `subGoals`, `levels` (cuerpo/estilo/mentalidad/productividad), `restrictions` (tiempo, presupuesto), `preferences` (gym, home, etc.). {@test: frontend/tests/asesor-estilo/config.test.ts}
- Al completar onboarding, se habilita el coach `general` por defecto. Los demás coaches se habilitan progresivamente en `enabledCoaches`. {@test: frontend/tests/asesor-estilo/config.test.ts}
- Cada coach mantiene su propio hilo de conversación (`CoachConversation` único por `[profile_id, coachType]`). {@test: frontend/tests/asesor-estilo/config.test.ts}
- El sistema verifica la cuota gratuita mensual antes de cada mensaje. Si se agota, descuenta 1 crédito. {@test: frontend/tests/asesor-estilo/config.test.ts}
- Si el usuario no tiene créditos ni cuota gratuita, el mensaje es rechazado con `402`. {@test: frontend/tests/asesor-estilo/config.test.ts}
- Todos los mensajes se almacenan cifrados. El contenido nunca se persiste en texto plano. {@test: frontend/tests/asesor-estilo/config.test.ts}
- El "Estratega" (Layer 2) analiza el perfil periódicamente y actualiza `strategistPlan` para orientar a los coaches de Layer 1. {@test: frontend/tests/asesor-estilo/config.test.ts}
- Los mensajes que violen las reglas de seguridad son rechazados antes de llegar al modelo IA. {@test: frontend/tests/asesor-estilo/config.test.ts}

## Asesor de Estilo — Acceptance Criteria

- El usuario puede subir una imagen de ropa/outfit (JPEG, PNG, WEBP, max 10 MB). {@test: frontend/tests/asesor-estilo/config.test.ts}
- El sistema analiza la imagen con IA visual y devuelve recomendaciones de estilo. {@test: frontend/tests/asesor-estilo/config.test.ts}
- El análisis cuesta créditos (N créditos por análisis). {@test: frontend/tests/asesor-estilo/config.test.ts}
- El usuario puede iterar sobre el análisis con texto adicional. {@test: frontend/tests/asesor-estilo/config.test.ts}
- Las imágenes se almacenan en Cloudinary con fallback local. {@test: frontend/tests/asesor-estilo/config.test.ts}
- El análisis respeta moderación de contenido (no imágenes inapropiadas). {@test: frontend/tests/asesor-estilo/config.test.ts}

## Coach Types

| `coachType` | Especialidad | Habilitado por defecto |
|-------------|-------------|----------------------|
| `general` | Estratega — coordina todos los demás | Sí (post-onboarding) |
| `cuerpo` | Entrenamiento, nutrición, físico | No (progresivo) |
| `estilo` | Moda, presencia, imagen personal | No (progresivo) |
| `mentalidad` | Psicología, mindset, disciplina | No (progresivo) |
| `productividad` | Gestión del tiempo, hábitos, enfoque | No (progresivo) |

## Credit System

```
Free tier:   N mensajes/mes (N configurado en COACH_SETTINGS)
             Rastreado en CoachFreeMessages.count + monthYear
             Reset automático al detectar nuevo mes

Paid tier:   1 crédito por mensaje adicional
             Deducido de User.credits
             Compra de créditos via /api/credits/*

Asesor:      N créditos por análisis de imagen (configurable)
```

## API Contracts

- `POST /herramientas/couch_triarvono/api/chat` — ver `docs/specs/api-contracts/coach-chat.md`
- `GET  /herramientas/couch_triarvono/api/chat/history`
- `GET  /herramientas/couch_triarvono/api/coaches`
- `GET  /herramientas/couch_triarvono/api/profile`
- `POST /herramientas/couch_triarvono/api/welcome`
- `POST /api/asesor-estilo/upload`
- `POST /api/asesor-estilo/analyze`
- `POST /api/asesor-estilo/iterate`

## Implementation

| Spec requirement | Code location |
|-----------------|---------------|
| Onboarding check | `frontend/src/app/herramientas/couch_triarvono/api/chat/route.ts:39` |
| Credit gate | `frontend/src/lib/coach-triarvon/credits.ts:canSendMessage()` |
| Safety check | `frontend/src/lib/coach-triarvon/safety.ts:checkMessageSafety()` |
| AI response (Gemini) | `frontend/src/lib/coach-triarvon/gemini.ts:getChatResponse()` |
| Strategist Layer 2 | `frontend/src/lib/coach-triarvon/gemini.ts:runStrategistAnalysis()` |
| Message encryption | `frontend/src/lib/coach-triarvon/encryption.ts` |
| Coach config | `frontend/src/lib/coach-triarvon/config/coaches.config.ts` |
| Profile model | `frontend/prisma/schema.prisma:122` |
| Conversation model | `frontend/prisma/schema.prisma:142` |
| Message model | `frontend/prisma/schema.prisma:156` |
| Free msg tracking | `frontend/prisma/schema.prisma:167` |
| Asesor upload | `frontend/src/app/api/asesor-estilo/upload/route.ts` |
| Asesor analyze | `frontend/src/app/api/asesor-estilo/analyze/route.ts` |
| Image validation | `frontend/src/lib/asesor-estilo/validation/image.ts` |
| Asesor AI (Gemini) | `frontend/src/lib/asesor-estilo/ai/gemini.ts` |

## Constraints
- Privacidad: mensajes cifrados AES-256 en reposo. Clave via `COACH_ENCRYPTION_KEY`.
- Costo: cada mensaje de chat consume inferencia Gemini — el credit gate es la primera línea de control de costos.
- Moderación: todos los mensajes de usuario pasan por `checkMessageSafety()` antes de llegar al modelo.
- Escalabilidad: `CoachFreeMessages.monthYear` permite escalar sin crons de reset.

## Non-Functional Requirements
- Latencia: respuestas de chat < 5s p95. Asesor análisis < 10s p95.

## Test Scenarios

See `docs/specs/ia-tools/test-scenarios.md`.

## Definition of Done

- [x] Onboarding de perfil funcional — `TriarvonProfile` creado en DB
- [x] Chat con 5 tipos de coach — `CoachConversation` + `CoachMessage` en DB
- [x] Credit gate funcional — `CoachFreeMessages` + `User.credits`
- [x] Cifrado de mensajes — `encryption.ts`
- [x] Asesor de estilo upload + analyze funcional
- [x] ADR de arquitectura — `docs/adr/001-coach-system-schema.md`
- [x] Contratos de API — `docs/specs/api-contracts/coach-chat.md`
- [ ] Tests de integración — `frontend/tests/asesor-estilo/config.test.ts` (parcial)
- [ ] Runbook operacional del Coach (costos, debugging, rotación de claves)
