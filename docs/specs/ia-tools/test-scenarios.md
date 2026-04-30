# Test Scenarios — IA Tools (Coach Espartano + Asesor de Estilo)

Test file: `frontend/tests/asesor-estilo/config.test.ts`  
Implementation: `frontend/src/app/herramientas/couch_spartano/`, `frontend/src/app/api/asesor-estilo/`

---

## Coach Espartano

### Scenario 1 — Onboarding requerido antes de chatear

**Given** un usuario autenticado sin `SpartanProfile.onboardingDone = true`  
**When** envía POST a `/herramientas/couch_spartano/api/chat`  
**Then** responde `400 { error: "ONBOARDING_REQUIRED" }`  

Reference: `frontend/src/app/herramientas/couch_spartano/api/chat/route.ts:39`

---

### Scenario 2 — Mensaje exitoso con cuota gratuita disponible

**Given** un usuario con onboarding completo y cuota gratuita disponible  
**When** envía mensaje a coach `general`  
**Then** responde `200` con `{ response: "...", creditsUsed: 0, creditsRemaining: N }`  
**And** `CoachFreeMessages.count` se incrementa en 1  
**And** el mensaje se almacena cifrado en `CoachMessage`  

Reference: `frontend/src/lib/coach-espartano/credits.ts:canSendMessage()`

---

### Scenario 3 — Sin cuota gratuita, descuenta crédito

**Given** un usuario con cuota gratuita agotada y 5 créditos  
**When** envía mensaje a cualquier coach habilitado  
**Then** responde `200` con `{ creditsUsed: 1, creditsRemaining: 4 }`  
**And** `User.credits` se reduce en 1  

Reference: `frontend/src/lib/coach-espartano/credits.ts:recordMessageSent()`

---

### Scenario 4 — Sin cuota ni créditos, rechazado

**Given** un usuario con cuota agotada y `User.credits = 0`  
**When** envía mensaje  
**Then** responde `402 { error: "INSUFFICIENT_CREDITS" }`  
**And** ningún mensaje se almacena ni se llama al modelo IA  

Reference: `frontend/src/lib/coach-espartano/credits.ts:canSendMessage()`

---

### Scenario 5 — Coach no habilitado

**Given** un usuario con onboarding completo cuyo `enabledCoaches` solo tiene `["general"]`  
**When** intenta chatear con coach `cuerpo`  
**Then** responde `400 { error: "COACH_NOT_ENABLED" }`  

Reference: `frontend/src/app/herramientas/couch_spartano/api/chat/route.ts:58`

---

### Scenario 6 — Mensaje de seguridad bloqueado

**Given** un usuario envía un mensaje que viola las reglas de seguridad  
**When** `checkMessageSafety()` detecta contenido no permitido  
**Then** responde `400 { error: "MESSAGE_FLAGGED" }`  
**And** el mensaje no llega al modelo IA  
**And** no se consumen créditos  

Reference: `frontend/src/lib/coach-espartano/safety.ts:checkMessageSafety()`

---

### Scenario 7 — Reset de cuota mensual automático

**Given** un usuario con `CoachFreeMessages.monthYear = "2024-11"` y `count = N` (agotado)  
**When** envía un mensaje en el mes "2024-12"  
**Then** el sistema detecta que `monthYear` cambió y reinicia `count = 0`  
**And** el mensaje se procesa con cuota disponible  

Reference: `frontend/src/lib/coach-espartano/credits.ts` — reset por monthYear mismatch

---

## Asesor de Estilo

### Scenario 8 — Análisis de imagen válida

**Given** un usuario autenticado con créditos suficientes  
**When** sube una imagen WEBP (< 10 MB) a `/api/asesor-estilo/upload` y luego llama a `/api/asesor-estilo/analyze`  
**Then** responde `200` con análisis de estilo en texto  
**And** los créditos se descuentan  

Reference: `frontend/src/app/api/asesor-estilo/analyze/route.ts`  
Test: `frontend/tests/asesor-estilo/config.test.ts`

---

### Scenario 9 — Imagen con tipo inválido rechazada

**Given** un usuario sube un PDF a `/api/asesor-estilo/upload`  
**Then** responde `422 { error: "invalid_file_type" }`  

Reference: `frontend/src/lib/asesor-estilo/validation/image.ts`

---

### Scenario 10 — Iteración sobre análisis previo

**Given** un usuario tiene un análisis de imagen previo  
**When** envía texto adicional a `/api/asesor-estilo/iterate`  
**Then** responde `200` con respuesta contextualizada al análisis anterior  

Reference: `frontend/src/app/api/asesor-estilo/iterate/route.ts`
