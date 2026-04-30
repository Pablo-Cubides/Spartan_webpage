# API Contract — Coach Espartano Chat

Implementation: `frontend/src/app/herramientas/couch_spartano/api/chat/route.ts`

---

## POST /herramientas/couch_spartano/api/chat — Send message

```
Method:     POST
Path:       /herramientas/couch_spartano/api/chat
Auth:       Bearer <Firebase ID Token>
Rate:       Enforced by credit system (free tier: N msg/month, paid: per-credit)
Idempotent: no
```

### Request

```
Authorization: Bearer <id_token>
Content-Type: application/json
```

```json
{
  "coachType": "general | cuerpo | estilo | mentalidad | productividad",
  "message": "string (user message)"
}
```

### Response — Success

```
Status: 200
```
```json
{
  "response": "string (AI assistant reply)",
  "creditsUsed": 1,
  "creditsRemaining": 49,
  "messageCount": 12
}
```

### Response — Errors

| Status | `error` code | Condition |
|--------|-------------|-----------|
| 400 | `ONBOARDING_REQUIRED` | User has not completed onboarding |
| 400 | `invalid_coach_type` | `coachType` not in allowed list |
| 400 | `COACH_NOT_ENABLED` | Coach not unlocked for this user |
| 400 | `MESSAGE_FLAGGED` | Safety check rejected message |
| 401 | `unauthorized` | Token missing or invalid |
| 402 | `INSUFFICIENT_CREDITS` | User out of free messages and credits |
| 404 | `user_not_found` | Firebase UID has no DB record |
| 500 | `internal_error` | AI or DB failure |

---

## GET /herramientas/couch_spartano/api/chat/history — Chat history

```
Method: GET
Path:   /herramientas/couch_spartano/api/chat/history?coachType=<type>&limit=<n>
Auth:   Bearer <Firebase ID Token>
```

### Query Parameters

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `coachType` | String | required | Coach identifier |
| `limit` | Int | `20` | Max messages to return (max 100) |

### Response — Success

```json
{
  "messages": [
    { "role": "user | assistant", "content": "string", "created_at": "ISO8601" }
  ],
  "welcomeShown": true
}
```

Note: messages are stored encrypted in DB and decrypted on retrieval.

---

## Data Contract

```
Model: CoachConversation  (frontend/prisma/schema.prisma:142)
Model: CoachMessage       (frontend/prisma/schema.prisma:156)
Model: SpartanProfile     (frontend/prisma/schema.prisma:122)
Model: CoachFreeMessages  (frontend/prisma/schema.prisma:167)
```

### Coach types

| `coachType` | Role |
|-------------|------|
| `general` | Estratega general (always available after onboarding) |
| `cuerpo` | Entrenamiento y nutrición |
| `estilo` | Moda y presencia |
| `mentalidad` | Psicología y mindset |
| `productividad` | Gestión del tiempo y hábitos |

### Credit/Free message rules

- Free tier: N messages/month tracked in `CoachFreeMessages` (resets monthly).
- Paid: 1 credit per message beyond free tier, deducted from `User.credits`.
- Gate enforced in `lib/coach-espartano/credits.ts:canSendMessage()`.

### Message encryption

- All `CoachMessage.content` stored AES-256 encrypted.
- Encryption/decryption handled by `lib/coach-espartano/encryption.ts`.
- Keys derived from `COACH_ENCRYPTION_KEY` env var.

## Responsibilities

| Responsibility | Owner |
|---|---|
| Auth | `verifyIdToken()` in `lib/server/firebaseAdmin.ts` |
| Credit gate | `canSendMessage()` / `recordMessageSent()` in `lib/coach-espartano/credits.ts` |
| Safety check | `checkMessageSafety()` in `lib/coach-espartano/safety.ts` |
| AI response | `getChatResponse()` in `lib/coach-espartano/gemini.ts` |
| Encryption | `lib/coach-espartano/encryption.ts` |
| Strategist (Layer 2) | `runStrategistAnalysis()` — async, runs periodically |
