# ADR 001 — Coach Espartano: Schema y Arquitectura

Status: Accepted
Date: 2024-Q4

---

## Context

Spartan Club necesitaba un sistema de coaching personalizado con IA para guiar a sus usuarios en áreas de cuerpo, estilo, mentalidad y productividad. Las decisiones de diseño del schema afectan privacidad, performance y escalabilidad a largo plazo.

---

## Decision

### 1. Un `SpartanProfile` por usuario (1:1 con `User`)

El perfil de coaching es único por usuario y centraliza todos sus objetivos, niveles, restricciones y preferencias en un único registro con campos `Json` para flexibilidad.

**Alternativas descartadas:**
- Tabla de key-value (`profile_settings`): más flexible pero queries complejos y sin type safety.
- Campos directos en `User`: acoplamiento innecesario entre auth y coaching.

### 2. `CoachConversation` separada por coach type (unique constraint `[profile_id, coachType]`)

Cada tipo de coach mantiene su propio hilo de conversación. Esto preserva el contexto por especialidad sin mezclar temas.

**Alternativas descartadas:**
- Conversación única con todos los coaches: el contexto se contamina entre especialidades, el prompt crece innecesariamente.
- Conversaciones múltiples por coach (historial de sesiones): innecesario para MVP — una conversación continua por coach es suficiente.

### 3. `CoachMessage.content` cifrado en reposo (AES-256)

Los mensajes de coaching pueden contener información personal sensible (salud, finanzas, relaciones). Se cifran en la capa de aplicación antes de persistir.

**Clave:** `COACH_ENCRYPTION_KEY` env var — nunca en código ni repo.
**Implementación:** `lib/coach-espartano/encryption.ts`

**Alternativas descartadas:**
- Cifrado a nivel de columna de Postgres: requiere extensión pgcrypto y complejidad operacional.
- Sin cifrado: riesgo de exposición de datos sensibles en caso de breach de DB.

### 4. `CoachFreeMessages` para cuota mensual (tracking por `monthYear`)

La cuota gratuita se resetea mensualmente. En lugar de un cron de reset, se verifica en runtime si `monthYear` coincide con el mes actual — si no, se reinicia el contador.

**Alternativas descartadas:**
- Cron de reset mensual: infra adicional, race conditions posibles.
- Campo `reset_at` en `User`: acoplamiento de lógica de negocio a entidad genérica.

### 5. Layer 2 — `SpartanProfile.strategistPlan` (Json)

Un "estratega" interno analiza el contexto del usuario periódicamente y escribe un plan de orientación en `strategistPlan`. Los coaches de Layer 1 leen este plan como contexto adicional.

**Por qué Json:** el esquema del plan puede evolucionar sin migraciones de schema. Es interno, no expuesto a clientes.

---

## Consequences

- Las queries de chat requieren `JOIN` sobre `SpartanProfile` + `CoachConversation` + últimos N `CoachMessage` — índice en `(conversationId, created_at)` recomendado.
- El cifrado impide búsqueda full-text en mensajes. Si en el futuro se necesita buscar en historial, se requeriría índice secundario cifrado o búsqueda del lado del cliente.
- `CoachAnalytics` almacena reportes agregados/anonimizados — nunca datos individuales desencriptados.
- Añadir un nuevo tipo de coach (`coachType`) no requiere migración de schema — solo actualizar `COACHES` en `lib/coach-espartano/config/coaches.config.ts` y habilitar en el perfil del usuario.
