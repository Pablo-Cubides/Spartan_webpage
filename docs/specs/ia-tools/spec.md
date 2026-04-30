# Spec: IA Tools — Coach Espartano y Asesor de Estilo

## Problem

Los usuarios de Spartan Club necesitan orientación personalizada en áreas de desarrollo masculino (cuerpo, estilo, mentalidad, productividad). El acceso a coaches humanos es costoso e inaccesible para la mayoría. Las herramientas IA genéricas no conocen el contexto ni los objetivos específicos del usuario.

## Goal

Proveer herramientas IA especializadas que:
1. Conocen el perfil, objetivos y restricciones de cada usuario (onboarding obligatorio).
2. Mantienen contexto de conversación por especialidad.
3. Operan con un sistema de créditos para controlar el costo de inferencia.
4. Protegen la privacidad del usuario cifrando todos los mensajes en reposo.

## Scope

### In
- **Coach Espartano**: 5 coaches especializados (general, cuerpo, estilo, mentalidad, productividad)
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

## Coach Espartano — Acceptance Criteria

- Un usuario nuevo no puede acceder a ningún coach hasta completar el onboarding de perfil.
- El onboarding captura: `mainGoal`, `subGoals`, `levels` (cuerpo/estilo/mentalidad/productividad), `restrictions` (tiempo, presupuesto), `preferences` (gym, home, etc.).
- Al completar onboarding, se habilita el coach `general` por defecto. Los demás coaches se habilitan progresivamente en `enabledCoaches`.
- Cada coach mantiene su propio hilo de conversación (`CoachConversation` único por `[profile_id, coachType]`).
- El sistema verifica la cuota gratuita mensual antes de cada mensaje. Si se agota, descuenta 1 crédito.
- Si el usuario no tiene créditos ni cuota gratuita, el mensaje es rechazado con `402`.
- Todos los mensajes se almacenan cifrados. El contenido nunca se persiste en texto plano.
- El "Estratega" (Layer 2) analiza el perfil periódicamente y actualiza `strategistPlan` para orientar a los coaches de Layer 1.
- Los mensajes que violen las reglas de seguridad son rechazados antes de llegar al modelo IA.

## Asesor de Estilo — Acceptance Criteria

- El usuario puede subir una imagen de ropa/outfit (JPEG, PNG, WEBP, max 10 MB).
- El sistema analiza la imagen con IA visual y devuelve recomendaciones de estilo.
- El análisis cuesta créditos (N créditos por análisis).
- El usuario puede iterar sobre el análisis con texto adicional.
- Las imágenes se almacenan en Cloudinary con fallback local.
- El análisis respeta moderación de contenido (no imágenes inapropiadas).

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

- `POST /herramientas/couch_spartano/api/chat` — ver `docs/specs/api-contracts/coach-chat.md`
- `GET  /herramientas/couch_spartano/api/chat/history`
- `GET  /herramientas/couch_spartano/api/coaches`
- `GET  /herramientas/couch_spartano/api/profile`
- `POST /herramientas/couch_spartano/api/welcome`
- `POST /api/asesor-estilo/upload`
- `POST /api/asesor-estilo/analyze`
- `POST /api/asesor-estilo/iterate`

## Implementation

| Spec requirement | Code location |
|-----------------|---------------|
| Onboarding check | `frontend/src/app/herramientas/couch_spartano/api/chat/route.ts:39` |
| Credit gate | `frontend/src/lib/coach-espartano/credits.ts:canSendMessage()` |
| Safety check | `frontend/src/lib/coach-espartano/safety.ts:checkMessageSafety()` |
| AI response (Gemini) | `frontend/src/lib/coach-espartano/gemini.ts:getChatResponse()` |
| Strategist Layer 2 | `frontend/src/lib/coach-espartano/gemini.ts:runStrategistAnalysis()` |
| Message encryption | `frontend/src/lib/coach-espartano/encryption.ts` |
| Coach config | `frontend/src/lib/coach-espartano/config/coaches.config.ts` |
| Profile model | `frontend/prisma/schema.prisma:122` |
| Conversation model | `frontend/prisma/schema.prisma:142` |
| Message model | `frontend/prisma/schema.prisma:156` |
| Free msg tracking | `frontend/prisma/schema.prisma:167` |
| Asesor upload | `frontend/src/app/api/asesor-estilo/upload/route.ts` |
| Asesor analyze | `frontend/src/app/api/asesor-estilo/analyze/route.ts` |
| Image validation | `frontend/src/lib/asesor-estilo/validation/image.ts` |
| Asesor AI (Gemini) | `frontend/src/lib/asesor-estilo/ai/gemini.ts` |

## Non-Functional Requirements

- Privacidad: mensajes cifrados AES-256 en reposo. Clave via `COACH_ENCRYPTION_KEY`.
- Latencia: respuestas de chat < 5s p95. Asesor análisis < 10s p95.
- Costo: cada mensaje de chat consume inferencia Gemini — el credit gate es la primera línea de control de costos.
- Moderación: todos los mensajes de usuario pasan por `checkMessageSafety()` antes de llegar al modelo.
- Escalabilidad: `CoachFreeMessages.monthYear` permite escalar sin crons de reset.

## Definition of Done

- [x] Onboarding de perfil funcional — `SpartanProfile` creado en DB
- [x] Chat con 5 tipos de coach — `CoachConversation` + `CoachMessage` en DB
- [x] Credit gate funcional — `CoachFreeMessages` + `User.credits`
- [x] Cifrado de mensajes — `encryption.ts`
- [x] Asesor de estilo upload + analyze funcional
- [x] ADR de arquitectura — `docs/adr/001-coach-system-schema.md`
- [x] Contratos de API — `docs/specs/api-contracts/coach-chat.md`
- [ ] Tests de integración — `frontend/tests/asesor-estilo/config.test.ts` (parcial)
- [ ] Runbook operacional del Coach (costos, debugging, rotación de claves)
