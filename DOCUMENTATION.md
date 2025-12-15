# Spartan Club - Documentación Técnica

> **Nota**: Este documento complementa al [README.md](README.md) con información técnica detallada para desarrolladores.

---

## Tabla de Contenidos

- [Arquitectura del Sistema](#arquitectura-del-sistema)
- [Base de Datos](#base-de-datos)
- [Sistema de Autenticación](#sistema-de-autenticación)
- [Sistema de Créditos y Pagos](#sistema-de-créditos-y-pagos)
- [Herramientas de IA](#herramientas-de-ia)
- [API Reference Detallada](#api-reference-detallada)
- [Sistema de Contenido](#sistema-de-contenido)
- [Panel de Administración](#panel-de-administración)
- [Manejo de Errores](#manejo-de-errores)
- [Validación de Datos](#validación-de-datos)
- [Performance y Caché](#performance-y-caché)
- [Troubleshooting](#troubleshooting)

---

## Arquitectura del Sistema

### Diagrama de Alto Nivel

```
┌──────────────────────────────────────────────────────────────────────────┐
│                              CLIENTE                                      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │   Páginas   │  │ Componentes │  │    Hooks    │  │   Context   │     │
│  │  (App Dir)  │  │   (React)   │  │  (useAuth)  │  │  (Firebase) │     │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘     │
└─────────┼────────────────┼────────────────┼────────────────┼────────────┘
          │                │                │                │
          ▼                ▼                ▼                ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                          API LAYER (Serverless)                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │  API Routes │  │   Error     │  │    Auth     │  │    Rate     │     │
│  │  /api/*     │  │  Handler    │  │ Middleware  │  │   Limiter   │     │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘     │
└─────────┼────────────────┼────────────────┼────────────────┼────────────┘
          │                │                │                │
          ▼                ▼                ▼                ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                         SERVICIOS EXTERNOS                               │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │  PostgreSQL │  │   Firebase  │  │   Gemini    │  │ MercadoPago │     │
│  │  (Prisma)   │  │    Auth     │  │     AI      │  │   Payments  │     │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                      │
│  │  Cloudinary │  │   Upstash   │  │   Stripe    │                      │
│  │   Images    │  │    Redis    │  │   Payments  │                      │
│  └─────────────┘  └─────────────┘  └─────────────┘                      │
└──────────────────────────────────────────────────────────────────────────┘
```

### Flujo de Request Típico

```
Cliente → API Route → Auth Middleware → Rate Limiter → Handler → Response
                           │                │              │
                           ▼                ▼              ▼
                      Firebase         Upstash         Prisma/
                      Verify           Redis           External APIs
```

---

## Base de Datos

### Diagrama Entidad-Relación

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│      User       │       │    Purchase     │       │  CreditPackage  │
├─────────────────┤       ├─────────────────┤       ├─────────────────┤
│ id (PK)         │──┐    │ id (PK)         │    ┌──│ id (PK)         │
│ uid (unique)    │  │    │ user_id (FK)    │────┘  │ name            │
│ email (unique)  │  └───►│ package_id (FK) │◄──────│ credits         │
│ name            │       │ amount_paid     │       │ price           │
│ alias (unique)  │       │ credits_received│       │ is_active       │
│ avatar_id       │       │ payment_method  │       │ created_at      │
│ role            │       │ payment_id      │       │ updated_at      │
│ credits         │       │ status          │       └─────────────────┘
│ is_active       │       │ created_at      │
│ created_at      │       │ completed_at    │
│ updated_at      │       └─────────────────┘
└────────┬────────┘
         │
         │        ┌─────────────────┐
         │        │    BlogPost     │
         │        ├─────────────────┤
         └───────►│ id (PK)         │
                  │ slug (unique)   │
                  │ title           │
                  │ content         │
                  │ excerpt         │
                  │ cover_image     │
                  │ author_id (FK)  │
                  │ is_published    │
                  │ published_at    │
                  │ created_at      │
                  │ updated_at      │
                  └─────────────────┘

┌─────────────────┐
│   AppSetting    │
├─────────────────┤
│ key (PK)        │
│ value           │
│ description     │
│ updated_at      │
└─────────────────┘
```

### Índices y Optimizaciones

```sql
-- Índices implícitos por Prisma
CREATE UNIQUE INDEX "User_uid_key" ON "User"("uid");
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_alias_key" ON "User"("alias");
CREATE UNIQUE INDEX "BlogPost_slug_key" ON "BlogPost"("slug");

-- Índices de Foreign Key
CREATE INDEX "Purchase_user_id_idx" ON "Purchase"("user_id");
CREATE INDEX "Purchase_package_id_idx" ON "Purchase"("package_id");
CREATE INDEX "BlogPost_author_id_idx" ON "BlogPost"("author_id");
```

### Comandos de Base de Datos

```bash
# Generar cliente Prisma después de cambios en schema
npm run prisma:generate

# Crear y aplicar migración
npm run prisma:migrate

# Abrir GUI de base de datos
npm run prisma:studio

# Resetear base de datos (SOLO desarrollo)
npx prisma migrate reset

# Ver SQL de una migración
npx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma
```

---

## Sistema de Autenticación

### Flujo de Autenticación

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Cliente   │     │   Firebase  │     │  API Route  │     │   Prisma    │
└──────┬──────┘     └──────┬──────┘     └──────┬──────┘     └──────┬──────┘
       │                   │                   │                   │
       │  1. Login         │                   │                   │
       │──────────────────►│                   │                   │
       │                   │                   │                   │
       │  2. ID Token      │                   │                   │
       │◄──────────────────│                   │                   │
       │                   │                   │                   │
       │  3. Request + Bearer Token            │                   │
       │──────────────────────────────────────►│                   │
       │                   │                   │                   │
       │                   │  4. Verify Token  │                   │
       │                   │◄──────────────────│                   │
       │                   │                   │                   │
       │                   │  5. Decoded User  │                   │
       │                   │──────────────────►│                   │
       │                   │                   │                   │
       │                   │                   │  6. Get/Create    │
       │                   │                   │──────────────────►│
       │                   │                   │                   │
       │                   │                   │  7. User Data     │
       │                   │                   │◄──────────────────│
       │                   │                   │                   │
       │  8. Response with user data           │                   │
       │◄──────────────────────────────────────│                   │
```

### Implementación del Middleware de Auth

```typescript
// lib/server/firebase-admin.ts
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

const firebaseAdminConfig = {
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  }),
};

if (!getApps().length) {
  initializeApp(firebaseAdminConfig);
}

export const adminAuth = getAuth();

export async function verifyIdToken(token: string) {
  return adminAuth.verifyIdToken(token);
}
```

### Roles y Permisos

| Rol | Descripción | Permisos |
|-----|-------------|----------|
| `user` | Usuario estándar | Perfil, compras, herramientas IA |
| `admin` | Administrador | Todo + panel admin |

```typescript
// Verificar rol admin
const user = await prisma.user.findUnique({ where: { uid } });
if (user?.role !== 'admin') {
  throw new AuthorizationError('Admin access required');
}
```

---

## Sistema de Créditos y Pagos

### Flujo de Compra Completo

```
┌─────────┐   ┌──────────┐   ┌────────────┐   ┌────────────┐   ┌─────────┐
│ Cliente │   │   API    │   │ MercadoPago│   │  Webhook   │   │  Prisma │
└────┬────┘   └────┬─────┘   └─────┬──────┘   └─────┬──────┘   └────┬────┘
     │             │               │                │               │
     │ 1. Select   │               │                │               │
     │    Package  │               │                │               │
     │────────────►│               │                │               │
     │             │               │                │               │
     │             │ 2. Create     │                │               │
     │             │    Preference │                │               │
     │             │──────────────►│                │               │
     │             │               │                │               │
     │             │ 3. Preference │                │               │
     │             │    ID + URL   │                │               │
     │             │◄──────────────│                │               │
     │             │               │                │               │
     │ 4. Redirect │               │                │               │
     │    to MP    │               │                │               │
     │◄────────────│               │                │               │
     │             │               │                │               │
     │ 5. Pay in   │               │                │               │
     │    MP       │               │                │               │
     │────────────────────────────►│                │               │
     │             │               │                │               │
     │             │               │ 6. Webhook     │               │
     │             │               │    Notification│               │
     │             │               │───────────────►│               │
     │             │               │                │               │
     │             │               │                │ 7. Verify     │
     │             │               │                │    Signature  │
     │             │               │                │───────────────│
     │             │               │                │               │
     │             │               │                │ 8. Update     │
     │             │               │                │    Credits    │
     │             │               │                │──────────────►│
     │             │               │                │               │
     │ 9. Success  │               │                │               │
     │    Redirect │               │                │               │
     │◄────────────────────────────│                │               │
```

### Configuración de Paquetes de Créditos

```typescript
// Paquetes predefinidos (COP - Pesos Colombianos)
const packages = [
  { name: 'Iniciación', credits: 5,   price: 10000 },  // ~$2.50 USD
  { name: 'Guerrero',   credits: 20,  price: 30000 },  // ~$7.50 USD
  { name: 'Leónidas',   credits: 100, price: 100000 }, // ~$25.00 USD
];
```

### Costos de Operaciones

| Operación | Costo | Descripción |
|-----------|-------|-------------|
| Análisis de imagen | 1 crédito | Análisis facial con Gemini |
| Generación de imagen | 1 crédito | Edición de imagen con IA |
| Coach Espartano | 1 crédito / 5 mensajes | Chat con coach IA |
| Registro nuevo usuario | +2 créditos | Bonus de bienvenida |

### Verificación de Webhook (Seguridad)

```typescript
// api/payments/webhook/route.ts
function verifyWebhookSignature(
  payload: string, 
  signature: string, 
  secret: string
): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}
```

---

## Herramientas de IA

### Arquitectura del Asesor de Estilo

```
┌─────────────────────────────────────────────────────────────────────┐
│                        FLUJO DE ANÁLISIS                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐     │
│  │  Upload  │───►│ Validate │───►│  Gemini  │───►│  Cache   │     │
│  │  Image   │    │  Image   │    │ Analysis │    │  Result  │     │
│  └──────────┘    └──────────┘    └──────────┘    └──────────┘     │
│       │               │               │               │            │
│       ▼               ▼               ▼               ▼            │
│  Cloudinary      Size/Format      Prompt ES/EN    Redis/Memory    │
│  Upload          Validation       Processing      7 days TTL      │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                      FLUJO DE GENERACIÓN                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐     │
│  │ Previous │───►│  User    │───►│  Gemini  │───►│  Return  │     │
│  │ Analysis │    │  Request │    │  Edit    │    │  Image   │     │
│  └──────────┘    └──────────┘    └──────────┘    └──────────┘     │
│       │               │               │               │            │
│       ▼               ▼               ▼               ▼            │
│  Face data       "Quiero un      Image Gen        Cloudinary      │
│  from cache      fade alto"      with prompt      URL + ID        │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Estructura del Prompt de Análisis

```typescript
const analysisPrompt = `
Analiza esta imagen de una persona y responde SOLO con JSON válido.

EVALUACIÓN REQUERIDA:
1. faceOk: boolean - ¿Hay una cara frontal clara visible?
2. pose: "frontal" | "ladeado" | "perfil"
3. hair: {
     length: "muy corto" | "corto" | "medio" | "largo",
     color: string,
     density: "bajo" | "medio" | "alto"
   }
4. beard: {
     present: boolean,
     style: "afeitado" | "stubble" | "corta" | "media" | "larga",
     density: "baja" | "media" | "alta"
   }
5. lighting: "buena" | "regular" | "pobre"
6. suggestedText: string (recomendación personalizada de 2-3 oraciones)

FORMATO DE RESPUESTA (JSON estricto):
{
  "faceOk": true,
  "pose": "frontal",
  "hair": { "length": "corto", "color": "castaño", "density": "medio" },
  "beard": { "present": true, "style": "stubble", "density": "media" },
  "lighting": "buena",
  "suggestedText": "Recomendación personalizada aquí..."
}
`;
```

### Coach Espartano - Sistema de Coaching IA

```
┌─────────────────────────────────────────────────────────────────────┐
│                      ARQUITECTURA DEL COACH                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                    COACHES ESPECIALIZADOS                     │  │
│  ├──────────────────────────────────────────────────────────────┤  │
│  │  General      │ Guía principal, coordina con otros coaches   │  │
│  │  Cuerpo       │ Entrenamiento, nutrición, fuerza             │  │
│  │  Estilo       │ Imagen personal, vestimenta, presencia       │  │
│  │  Mentalidad   │ Disciplina, fortaleza mental, hábitos        │  │
│  │  Productividad│ Gestión del tiempo, objetivos, sistemas      │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐     │
│  │  User    │───►│ Profile  │───►│  Gemini  │───►│ Encrypted│     │
│  │  Chat    │    │ Context  │    │   AI     │    │  Storage │     │
│  └──────────┘    └──────────┘    └──────────┘    └──────────┘     │
│       │               │               │               │            │
│       ▼               ▼               ▼               ▼            │
│  Message Input   User Goals      gemini-1.5-flash  AES-256-GCM    │
│  Coach Select    Personality     System Prompts    BD Messages    │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

#### APIs del Coach Espartano

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/herramientas/couch_spartano/api/chat` | POST | Enviar mensaje al coach |
| `/herramientas/couch_spartano/api/profile` | GET | Obtener perfil de coaching |
| `/herramientas/couch_spartano/api/profile` | POST | Crear/actualizar perfil de onboarding |
| `/herramientas/couch_spartano/api/coaches` | GET | Lista de coaches disponibles |

#### Modelo de Créditos del Coach

```typescript
// Sistema de créditos para el coach
const MESSAGES_PER_CREDIT = 5;

// Consumo: 1 crédito cada 5 mensajes enviados
// El conteo se reinicia al comprar más créditos
```

### Configuración de IA

```typescript
// lib/asesor-estilo/config/app.config.ts
export const APP_CONFIG = {
  ai: {
    ANALYSIS_TIMEOUT_MS: 45000,    // 45 segundos
    GENERATION_TIMEOUT_MS: 60000,  // 60 segundos
    MAX_RETRIES: 2,
    RETRY_DELAY_MS: 2000,
  },
  credits: {
    COST_PER_ANALYSIS: 1,
    COST_PER_GENERATION: 1,
    STARTING_CREDITS: 2,
  },
  rateLimit: {
    ENABLED: true,                  // Auto-enabled in production
    MAX_REQUESTS_PER_WINDOW: 100,
    MAX_ITERATIONS_PER_WINDOW: 50,
    WINDOW_SECONDS: 3600,          // 1 hora
  },
  cache: {
    ENABLED: true,
    TTL_SECONDS: 604800,           // 7 días
  },
  image: {
    MAX_SIZE_MB: 10,
    MIN_DIMENSIONS: 512,
    MAX_DIMENSIONS: 4096,
    ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  },
};
```

### Circuit Breaker para Gemini

```typescript
// Protección contra fallos en cascada
const circuitBreaker = {
  failures: 0,
  threshold: 5,
  resetTimeout: 30000,
  isOpen: false,
  
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.isOpen) {
      throw new ServiceUnavailableError('AI service temporarily unavailable');
    }
    
    try {
      const result = await fn();
      this.failures = 0;
      return result;
    } catch (error) {
      this.failures++;
      if (this.failures >= this.threshold) {
        this.isOpen = true;
        setTimeout(() => {
          this.isOpen = false;
          this.failures = 0;
        }, this.resetTimeout);
      }
      throw error;
    }
  }
};
```

---

## API Reference Detallada

### Códigos de Error Estándar

| Código | Nombre | Descripción |
|--------|--------|-------------|
| `AUTH_REQUIRED` | 401 | Token de autenticación faltante |
| `INVALID_TOKEN` | 401 | Token inválido o expirado |
| `FORBIDDEN` | 403 | Sin permisos para el recurso |
| `NOT_FOUND` | 404 | Recurso no encontrado |
| `VALIDATION_ERROR` | 400 | Datos de entrada inválidos |
| `INSUFFICIENT_CREDITS` | 402 | Créditos insuficientes |
| `RATE_LIMITED` | 429 | Demasiadas solicitudes |
| `SERVICE_UNAVAILABLE` | 503 | Servicio externo no disponible |

### Endpoints de Usuario

#### GET `/api/users/profile`

```typescript
// Request
Headers: {
  Authorization: "Bearer <firebase-id-token>"
}

// Response 200
{
  "user": {
    "id": 1,
    "uid": "firebase-uid-xxx",
    "email": "user@example.com",
    "name": "Juan Pérez",
    "alias": "juanp",
    "avatar_id": "avatar-spartan-1",
    "role": "user",
    "credits": 15,
    "is_active": true,
    "created_at": "2025-01-15T10:30:00Z"
  }
}

// Response 401
{
  "error": "AUTH_REQUIRED",
  "message": "Authentication required"
}
```

#### PUT `/api/users/profile`

```typescript
// Request
Headers: {
  Authorization: "Bearer <firebase-id-token>",
  "Content-Type": "application/json"
}
Body: {
  "name": "Juan Carlos Pérez",    // opcional
  "alias": "jcperez",             // opcional, único
  "avatar_id": "avatar-spartan-2" // opcional
}

// Response 200
{
  "user": { /* updated user object */ },
  "message": "Profile updated successfully"
}

// Response 400 (alias duplicado)
{
  "error": "VALIDATION_ERROR",
  "message": "Alias already in use"
}
```

### Endpoints de Asesor de Estilo

#### POST `/api/asesor-estilo/analyze`

```typescript
// Request
Headers: {
  Authorization: "Bearer <firebase-id-token>",
  "Content-Type": "application/json"
}
Body: {
  "imageUrl": "https://cloudinary.com/...",
  "locale": "es"  // "es" | "en"
}

// Response 200
{
  "analysis": {
    "faceOk": true,
    "pose": "frontal",
    "hair": {
      "length": "corto",
      "color": "castaño oscuro",
      "density": "medio"
    },
    "beard": {
      "present": true,
      "style": "stubble",
      "density": "media"
    },
    "lighting": "buena",
    "suggestedText": "Tu estructura facial cuadrada combina bien con un fade medio..."
  },
  "cached": false,
  "creditsRemaining": 14
}

// Response 402
{
  "error": "INSUFFICIENT_CREDITS",
  "message": "Not enough credits. Required: 1, Available: 0"
}

// Response 429
{
  "error": "RATE_LIMITED",
  "message": "Too many requests. Try again in 45 minutes."
}
```

#### POST `/api/asesor-estilo/iterate`

```typescript
// Request
Headers: {
  Authorization: "Bearer <firebase-id-token>",
  "Content-Type": "application/json"
}
Body: {
  "sessionId": "session-abc123",
  "originalImageUrl": "https://cloudinary.com/original...",
  "userText": "Quiero ver cómo me vería con un fade alto y barba más definida",
  "prevPublicId": "spartan/analyses/prev-id",
  "analysis": { /* previous analysis object */ }
}

// Response 200
{
  "editedUrl": "https://res.cloudinary.com/spartan/image/upload/v123/edited.jpg",
  "publicId": "spartan/analyses/new-id",
  "note": "Imagen generada con fade alto y barba definida",
  "creditsRemaining": 13
}
```

### Endpoints de Pagos

#### POST `/api/credits/buy` (MercadoPago)

```typescript
// Request
Headers: {
  Authorization: "Bearer <firebase-id-token>",
  "Content-Type": "application/json"
}
Body: {
  "packageId": 2
}

// Response 200
{
  "preferenceId": "mp-preference-xxx",
  "initPoint": "https://www.mercadopago.com/checkout/v1/redirect?pref_id=xxx",
  "sandboxInitPoint": "https://sandbox.mercadopago.com/checkout/v1/redirect?pref_id=xxx"
}
```

#### POST `/api/credits/buy-stripe` (Stripe)

```typescript
// Request
Headers: {
  Authorization: "Bearer <firebase-id-token>",
  "Content-Type": "application/json"
}
Body: {
  "packageId": 2
}

// Response 200
{
  "sessionId": "cs_xxx",
  "url": "https://checkout.stripe.com/pay/cs_xxx"
}
```

#### POST `/api/payments/webhook` (MercadoPago)

```typescript
// Request (from MercadoPago)
Headers: {
  "x-signature": "ts=1234567890,v1=abc123...",
  "x-request-id": "request-id-xxx"
}
Body: {
  "action": "payment.updated",
  "data": { "id": "12345678" }
}

// Response 200
{ "status": "processed" }
```

#### POST `/api/payments/stripe/webhook` (Stripe)

```typescript
// Request (from Stripe)
Headers: {
  "stripe-signature": "t=1234567890,v1=abc123..."
}
Body: {
  "type": "checkout.session.completed",
  "data": {
    "object": {
      "id": "cs_xxx",
      "metadata": { "userId": "1", "packageId": "2" }
    }
  }
}

// Response 200
{ "received": true }
```

---

## Sistema de Contenido

### Blog: Flujo de Publicación

```
┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐
│  Draft  │───►│ Review  │───►│Schedule │───►│Published│
│         │    │         │    │         │    │         │
│is_pub=F │    │is_pub=F │    │is_pub=T │    │is_pub=T │
│pub_at=∅ │    │pub_at=∅ │    │pub_at>now│   │pub_at≤now│
└─────────┘    └─────────┘    └─────────┘    └─────────┘
```

### Newsletter: Validaciones

```typescript
// POST /api/newsletter
// Validaciones:
// 1. Email válido (Zod)
// 2. No duplicado
// 3. Rate limiting (5/hora por IP)
// 4. Almacenamiento GDPR compliant
```

### Comentarios: Flujo de Moderación

```
Usuario ──► Comentario ──► Cola Moderación ──► Admin Review ──► Publicado
                              (pending)           │
                                                  └──► Rechazado
```

---

## Panel de Administración

### Endpoints Admin

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/api/v1/admin/users` | GET | Listar usuarios (paginado) |
| `/api/v1/admin/users/:id` | GET | Detalle de usuario |
| `/api/v1/admin/users/:id` | PUT | Actualizar usuario |
| `/api/admin/purchases` | GET | Historial de compras |
| `/api/admin/blog` | GET/POST | Gestión de posts |
| `/api/admin/blog/:id` | PUT/DELETE | Editar/eliminar post |

### Verificación de Admin

```typescript
async function requireAdmin(request: NextRequest) {
  const token = extractToken(request);
  const decoded = await verifyIdToken(token);
  
  const user = await prisma.user.findUnique({
    where: { uid: decoded.uid }
  });
  
  if (user?.role !== 'admin') {
    throw new AuthorizationError('Admin access required');
  }
  
  return user;
}
```

---

## Manejo de Errores

### Jerarquía de Errores

```typescript
// lib/api/errors.ts
export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code: string
  ) {
    super(message);
  }
}

export class AuthenticationError extends AppError {
  constructor(message = 'Authentication required') {
    super(message, 401, 'AUTH_REQUIRED');
  }
}

export class AuthorizationError extends AppError {
  constructor(message = 'Access forbidden') {
    super(message, 403, 'FORBIDDEN');
  }
}

export class ValidationError extends AppError {
  constructor(message: string, public errors?: ZodIssue[]) {
    super(message, 400, 'VALIDATION_ERROR');
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, 404, 'NOT_FOUND');
  }
}

export class InsufficientCreditsError extends AppError {
  constructor(required: number, available: number) {
    super(
      `Insufficient credits. Required: ${required}, Available: ${available}`,
      402,
      'INSUFFICIENT_CREDITS'
    );
  }
}

export class RateLimitError extends AppError {
  constructor(retryAfter?: number) {
    super(
      `Rate limit exceeded${retryAfter ? `. Try again in ${retryAfter}s` : ''}`,
      429,
      'RATE_LIMITED'
    );
  }
}
```

### Error Handler Wrapper

```typescript
// lib/api/error-handler.ts
export function withErrorHandler(
  handler: (request: NextRequest) => Promise<NextResponse>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    try {
      return await handler(request);
    } catch (error) {
      if (error instanceof AppError) {
        return NextResponse.json(
          { error: error.code, message: error.message },
          { status: error.statusCode }
        );
      }
      
      // Error inesperado - log y respuesta genérica
      console.error('Unhandled error:', error);
      return NextResponse.json(
        { error: 'INTERNAL_ERROR', message: 'An unexpected error occurred' },
        { status: 500 }
      );
    }
  };
}
```

---

## Validación de Datos

### Schemas Zod Principales

```typescript
// lib/validation/schemas.ts
import { z } from 'zod';

export const UpdateProfileSchema = z.object({
  name: z.string().min(2).max(50).optional(),
  alias: z.string()
    .min(3).max(20)
    .regex(/^[a-zA-Z0-9_-]+$/, 'Solo letras, números, guiones')
    .optional(),
  avatar_id: z.string().optional(),
});

export const AnalyzeImageSchema = z.object({
  imageUrl: z.string().url('URL de imagen inválida'),
  locale: z.enum(['es', 'en']).default('es'),
});

export const IterateSchema = z.object({
  sessionId: z.string().min(1),
  originalImageUrl: z.string().url(),
  userText: z.string().min(1).max(500),
  prevPublicId: z.string().optional(),
  analysis: z.object({
    faceOk: z.boolean(),
    pose: z.string(),
    hair: z.object({
      length: z.string(),
      color: z.string(),
      density: z.string(),
    }),
    beard: z.object({
      present: z.boolean(),
      style: z.string(),
      density: z.string(),
    }),
  }),
});

export const NewsletterSchema = z.object({
  email: z.string().email('Email inválido'),
});

export const CommentSchema = z.object({
  postSlug: z.string().min(1),
  name: z.string().min(2).max(50),
  content: z.string().min(10).max(1000),
});
```

---

## Performance y Caché

### Estrategia de Caché

```
┌─────────────────────────────────────────────────────────────────┐
│                    CAPAS DE CACHÉ                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  L1: Memory (Node.js Map)                                      │
│  ├── TTL: 5 minutos                                            │
│  ├── Máximo: 1000 entradas                                     │
│  └── Uso: Fallback cuando Redis no disponible                  │
│                                                                 │
│  L2: Redis (Upstash)                                           │
│  ├── TTL: 7 días                                               │
│  ├── Uso: Análisis de IA, rate limiting                        │
│  └── Key pattern: spartan:{type}:{hash}                        │
│                                                                 │
│  L3: CDN (Vercel Edge)                                         │
│  ├── Caché automático de assets estáticos                      │
│  └── Headers: Cache-Control en responses                       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Cache Keys

```typescript
const cacheKeys = {
  analysis: (imageHash: string) => `spartan:analysis:${imageHash}`,
  rateLimit: (ip: string, type: string) => `spartan:ratelimit:${type}:${ip}`,
  session: (sessionId: string) => `spartan:session:${sessionId}`,
};
```

### Rate Limiting

```typescript
export async function checkRateLimit(
  identifier: string,
  type: 'analysis' | 'iteration'
): Promise<{ allowed: boolean; remaining: number; resetIn: number }> {
  const key = `spartan:ratelimit:${type}:${identifier}`;
  const limit = type === 'analysis' 
    ? APP_CONFIG.rateLimit.MAX_REQUESTS_PER_WINDOW 
    : APP_CONFIG.rateLimit.MAX_ITERATIONS_PER_WINDOW;
  
  const current = await redis.incr(key);
  
  if (current === 1) {
    await redis.expire(key, APP_CONFIG.rateLimit.WINDOW_SECONDS);
  }
  
  const ttl = await redis.ttl(key);
  
  return {
    allowed: current <= limit,
    remaining: Math.max(0, limit - current),
    resetIn: ttl,
  };
}
```

---

## Troubleshooting

### Problemas Comunes

| Error | Causa | Solución |
|-------|-------|----------|
| `P1001: Can't reach database` | BD no accesible | Verificar `DATABASE_URL` y conexión |
| `auth/invalid-api-key` | Firebase mal configurado | Revisar `NEXT_PUBLIC_FIREBASE_*` |
| `Gemini INVALID_ARGUMENT` | Imagen inválida o API key | Verificar formato imagen y `GEMINI_API_KEY` |
| `401 Invalid webhook signature` | Webhook secret incorrecto | Verificar `MERCADOPAGO_WEBHOOK_SECRET` |
| `429 Rate limited` | Demasiadas solicitudes | Esperar tiempo indicado o deshabilitar en dev |

### Comandos de Debug

```bash
# Verificar build
npm run build

# Type checking
npm run type-check

# Limpiar caché Next.js
rm -rf .next && npm run dev

# Resetear BD (SOLO desarrollo)
npx prisma migrate reset

# Ver estado de BD
npm run prisma:studio
```

### Logs Estructurados

```typescript
// Formato recomendado para debugging
console.log(JSON.stringify({
  timestamp: new Date().toISOString(),
  level: 'error',
  phase: 'ai-analysis',
  userId: user.uid,
  action: 'gemini-request',
  error: error.message,
  metadata: { imageSize: '2.5MB' }
}));
```

---

## Contacto y Soporte

- **Repositorio**: [github.com/Pablo-Cubides/Spartan](https://github.com/Pablo-Cubides/Spartan)
- **Issues**: GitHub Issues para bugs y features

---

*Última actualización: Diciembre 2025 - v1.1.0*

*Cambios recientes:*
- *Integración de Stripe como pasarela de pago global*
- *Coach Espartano migrado a Google Gemini (gemini-1.5-flash)*
- *Sistema de coaches especializados (5 áreas de desarrollo)*
- *Encriptación AES-256-GCM para mensajes del coach*

*© 2025 Spartan Club. Todos los derechos reservados.*
