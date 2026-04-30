# IA Tools Runbook

Cubre: Coach Espartano + Asesor de Estilo | Modelos: Gemini (Google) + OpenAI | Env: `GEMINI_*`, `OPENAI_*`, `COACH_ENCRYPTION_KEY`

---

## 1. Usuario no puede enviar mensajes al Coach

### Síntomas
- Error `402 INSUFFICIENT_CREDITS` o `400 ONBOARDING_REQUIRED`.
- El chat no responde.

### Diagnóstico

```sql
-- Verificar estado del usuario
SELECT u.id, u.credits, sp.onboarding_done, sp.enabled_coaches
FROM "User" u
LEFT JOIN "SpartanProfile" sp ON sp.user_id = u.id
WHERE u.uid = '<firebase_uid>';

-- Ver cuota gratuita del mes actual
SELECT count, month_year FROM "CoachFreeMessages"
WHERE user_id = <user_id>;
```

### Casos y solución

| Error | Causa | Solución |
|-------|-------|---------|
| `ONBOARDING_REQUIRED` | `SpartanProfile.onboarding_done = false` | El usuario debe completar el onboarding en la UI |
| `INSUFFICIENT_CREDITS` | `credits = 0` y cuota agotada | El usuario debe comprar créditos |
| `COACH_NOT_ENABLED` | `coachType` no está en `enabled_coaches` | Actualizar `enabled_coaches` en `SpartanProfile` si corresponde |
| Sin respuesta | Error en Gemini API | Ver sección 3 |

---

## 2. Rotación de `COACH_ENCRYPTION_KEY`

**Frecuencia recomendada:** ante sospecha de compromiso. No rotar rutinariamente (requiere re-encriptado de datos).

⚠️ **CRÍTICO:** Si rotás la clave sin migrar los mensajes existentes, el historial de conversaciones se vuelve ilegible.

### Proceso de rotación

1. **Generar nueva clave:**
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

2. **Script de migración (re-encriptar mensajes existentes):**
   ```bash
   # Antes de cambiar la env var, ejecutar migración con ambas claves
   # OLD_KEY=<clave_actual> NEW_KEY=<clave_nueva> node scripts/migrate-encryption.js
   # (script pendiente de crear si se necesita rotación)
   ```

3. **Si no hay script de migración:** hacer un dump de los mensajes desencriptados con la clave actual antes de rotar.

4. Actualizar `COACH_ENCRYPTION_KEY` en Vercel → Settings → Environment Variables.
5. Redeploy.
6. Verificar que el historial de conversaciones sigue siendo legible en la UI.

---

## 3. Errores de API de Gemini / OpenAI

### Síntomas
- Respuestas de chat con `500 internal_error`.
- Logs muestran `GoogleGenerativeAI Error` o similar.

### Diagnóstico

Verificar en Vercel → Functions → logs de `/herramientas/couch_spartano/api/chat`:
- ¿Error de autenticación? → `GEMINI_API_KEY` expirado o incorrecto.
- ¿Rate limit? → Revisar cuotas en [Google AI Studio](https://aistudio.google.com).
- ¿Timeout? → El modelo tardó más de lo esperado — reintentar.

### Pasos

1. **Verificar API key:**
   ```bash
   curl -H "x-goog-api-key: $GEMINI_API_KEY" \
     "https://generativelanguage.googleapis.com/v1/models"
   ```
   Respuesta válida: JSON con lista de modelos.

2. **Regenerar API key (si expirada o comprometida):**
   - Google AI Studio → API Keys → crear nueva clave.
   - Actualizar `GEMINI_API_KEY` en Vercel.
   - Redeploy.

3. **Rate limit:** Verificar dashboard de cuotas en Google Cloud → APIs → Generative Language API → Quotas. Si se alcanzó el límite, esperar o aumentar cuota.

---

## 4. Monitoreo de costos de Gemini

**Dónde:** Google Cloud Console → Billing → Reports → filtrar por "Generative Language API".

**Alertas recomendadas:**
- Configurar budget alert en Google Cloud cuando el gasto mensual supere $X.
- Si el costo sube de forma inesperada: revisar `CoachFreeMessages` por usuarios con `count` anormalmente alto.

```sql
-- Usuarios con más mensajes este mes
SELECT user_id, count, month_year
FROM "CoachFreeMessages"
WHERE month_year = TO_CHAR(NOW(), 'YYYY-MM')
ORDER BY count DESC
LIMIT 10;

-- Total de mensajes por día (aproximado)
SELECT DATE(created_at), COUNT(*) as msg_count
FROM "CoachMessage"
WHERE created_at > NOW() - INTERVAL '30 days'
GROUP BY 1
ORDER BY 1 DESC;
```

---

## 5. Asesor de Estilo — imagen no procesa

### Síntomas
- Upload devuelve `422` o el análisis tarda más de 15s.

### Diagnóstico

**Upload falla:**
- Verificar tipo MIME: solo JPEG, PNG, WEBP.
- Verificar tamaño: max 10 MB.
- Si Cloudinary falla: verificar `CLOUDINARY_URL` en Vercel.

**Análisis falla:**
- Ver logs de `/api/asesor-estilo/analyze`.
- Gemini Vision puede rechazar imágenes que violan políticas de contenido (moderación).

### Verificar Cloudinary

```bash
curl -X GET "https://api.cloudinary.com/v1_1/<cloud_name>/resources/image" \
  -u "<api_key>:<api_secret>"
```

Si falla: regenerar credenciales en [Cloudinary Console](https://cloudinary.com/console) y actualizar `CLOUDINARY_URL` en Vercel.

---

## 6. Reset manual de cuota gratuita

En casos excepcionales (usuario con problema legítimo):

```sql
-- Resetear cuota del mes actual
UPDATE "CoachFreeMessages"
SET count = 0, month_year = TO_CHAR(NOW(), 'YYYY-MM')
WHERE user_id = <user_id>;
```

---

## 7. Variables de entorno requeridas

| Variable | Descripción | Quién la configura |
|----------|------------|-------------------|
| `GEMINI_API_KEY` | API key de Google Generative AI | Google AI Studio → API Keys |
| `OPENAI_API_KEY` | API key de OpenAI (fallback/asesor) | OpenAI Platform → API Keys |
| `COACH_ENCRYPTION_KEY` | Clave AES-256 para cifrar mensajes (64 hex chars) | Generar con `crypto.randomBytes(32).toString('hex')` |
| `CLOUDINARY_URL` | URL de conexión Cloudinary | Cloudinary Console → Dashboard |
