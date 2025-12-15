# Spartan Club

<div align="center">
  <img src="frontend/public/Logo spartan club.png" alt="Spartan Club Logo" width="200"/>
  
  **Plataforma de Desarrollo Personal Masculino**
  
  [![Next.js](https://img.shields.io/badge/Next.js-15.3-black?logo=next.js)](https://nextjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/)
  [![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev/)
  [![Prisma](https://img.shields.io/badge/Prisma-5.17-2D3748?logo=prisma)](https://www.prisma.io/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
  
  **Estado:** ✅ Production Ready | **Versión:** 1.1.0 | **Última actualización:** Diciembre 2025
</div>

---

## 📋 Tabla de Contenidos

- [Descripción](#-descripción)
- [Características](#-características)
- [Stack Tecnológico](#-stack-tecnológico)
- [Inicio Rápido](#-inicio-rápido)
- [Configuración](#-configuración)
- [Despliegue en Vercel](#-despliegue-en-vercel)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [APIs](#-apis)
- [Seguridad](#-seguridad)
- [Testing](#-testing)

---

## 📖 Descripción

**Spartan Club** es una plataforma web dedicada al desarrollo personal masculino, combinando contenido educativo, herramientas de IA para asesoría de estilo y coaching personalizado, y un sistema de monetización basado en créditos.

### Filosofía
Inspirado en los principios de los antiguos guerreros espartanos: disciplina, resiliencia, excelencia física y fortaleza mental.

---

## ✨ Características

### 🤖 Herramientas de IA

| Herramienta | Descripción | IA |
|-------------|-------------|-----|
| **Asesor de Estilo** | Análisis de imagen con recomendaciones de vestimenta | Google Gemini |
| **Asesor de Forma de Cara** | Recomendaciones de cortes de cabello y barba | Google Gemini |
| **Coach Espartano** | Coaching personalizado en 5 áreas de desarrollo | Google Gemini |

#### Coach Espartano - Sistema de Coaching IA
- **Coach General**: Guía principal y coordinador
- **Cuerpo Espartano**: Entrenamiento, fuerza y nutrición
- **Estilo Espartano**: Imagen personal y presencia
- **Mentalidad Espartana**: Disciplina y fortaleza mental
- **Productividad Espartana**: Gestión del tiempo y objetivos

### 📝 Sistema de Contenido
- **Blog CMS**: Gestión de artículos con programación de publicación
- **Newsletter**: Sistema de suscripción con gestión GDPR
- **Comentarios**: Sistema de comentarios con moderación

### 💳 Monetización

| Pasarela | Cobertura | Moneda |
|----------|-----------|--------|
| **MercadoPago** | Colombia, Argentina, Brasil, México, Chile, Perú, Uruguay | Local (COP, ARS, BRL, etc.) |
| **Stripe** | Global (46+ países) | USD |

#### Paquetes de Créditos
| Paquete | Créditos | Precio COP | Precio USD |
|---------|----------|------------|------------|
| Iniciación | 5 | $10,000 | ~$2.50 |
| Guerrero | 20 | $30,000 | ~$7.50 |
| Leónidas | 100 | $100,000 | ~$25.00 |

#### Consumo de Créditos
- **Asesor de Estilo/Forma de Cara**: 1 crédito por análisis + 1 por generación
- **Coach Espartano**: 5 mensajes por crédito

### 🔐 Panel de Administración
- Gestión de usuarios y roles
- Monitoreo de compras
- Gestión de contenido del blog
- Configuración de paquetes de créditos

---

## 🛠 Stack Tecnológico

| Categoría | Tecnología |
|-----------|------------|
| **Frontend** | Next.js 15.3, React 19, TypeScript 5, Tailwind CSS 4 |
| **Backend** | Next.js API Routes (Serverless) |
| **Base de Datos** | PostgreSQL + Prisma ORM 5.17 |
| **Autenticación** | Firebase Authentication + Firebase Admin SDK |
| **IA** | Google Gemini API (gemini-1.5-flash) |
| **Pagos** | MercadoPago + Stripe |
| **Storage** | Cloudinary (imágenes) |
| **Cache** | Upstash Redis |
| **Deployment** | Vercel |

---

## 🚀 Inicio Rápido

### Prerrequisitos

- Node.js 18.17.0 o superior
- PostgreSQL (Supabase recomendado)
- Cuenta de Firebase
- Cuenta de Google Cloud (para Gemini API)

### Instalación

```bash
# 1. Clonar el repositorio
git clone https://github.com/Pablo-Cubides/Spartan.git
cd Spartan/frontend

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con tus credenciales

# 4. Configurar base de datos
npm run prisma:generate
npm run prisma:migrate

# 5. Iniciar servidor de desarrollo
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000) en el navegador.

---

## ⚙️ Configuración

### Variables de Entorno Requeridas

Crear `frontend/.env.local` con las siguientes variables:

```env
# ============================================
# DATABASE - REQUERIDO
# ============================================
DATABASE_URL="postgresql://user:password@host:5432/database"

# ============================================
# FIREBASE - REQUERIDO
# ============================================
# Cliente (públicas)
NEXT_PUBLIC_FIREBASE_API_KEY="tu-api-key"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="tu-proyecto.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="tu-proyecto-id"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="tu-proyecto.appspot.com"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="123456789"
NEXT_PUBLIC_FIREBASE_APP_ID="1:123456789:web:abcdef"

# Servidor (privadas) - REQUERIDO para verificación de tokens
FIREBASE_CLIENT_EMAIL="firebase-adminsdk@tu-proyecto.iam.gserviceaccount.com"
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# ============================================
# IA - REQUERIDO PARA HERRAMIENTAS
# ============================================
GEMINI_API_KEY="tu-gemini-api-key"

# ============================================
# CLOUDINARY - REQUERIDO PARA HERRAMIENTAS
# ============================================
CLOUDINARY_CLOUD_NAME="tu-cloud-name"
CLOUDINARY_API_KEY="tu-api-key"
CLOUDINARY_API_SECRET="tu-api-secret"

# ============================================
# PAGOS - REQUERIDO PARA MONETIZACIÓN
# ============================================
# MercadoPago (LATAM)
NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY="tu-public-key"
MERCADOPAGO_ACCESS_TOKEN="tu-access-token"
MERCADOPAGO_WEBHOOK_SECRET="tu-webhook-secret"

# Stripe (Global)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_..."
STRIPE_SECRET_KEY="sk_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# ============================================
# OPCIONALES
# ============================================
# Redis (mejora performance)
UPSTASH_REDIS_REST_URL="https://..."
UPSTASH_REDIS_REST_TOKEN="..."

# Seguridad
ALLOWED_UPLOAD_ORIGINS="https://tudominio.com"
```

### Configuración de Firebase

1. Crear proyecto en [Firebase Console](https://console.firebase.google.com/)
2. Habilitar Authentication con Email/Password y Google
3. Descargar Service Account Key para el servidor
4. Configurar dominios autorizados

### Configuración de Base de Datos

```bash
# Generar cliente Prisma
npm run prisma:generate

# Ejecutar migraciones
npm run prisma:migrate

# Ver datos (desarrollo)
npm run prisma:studio
```

---

## 🌐 Despliegue en Vercel

### Opción 1: Deploy Automático

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Pablo-Cubides/Spartan)

### Opción 2: Manual

1. **Conectar Repositorio**
   - Ir a [vercel.com](https://vercel.com)
   - Importar repositorio de GitHub
   - Seleccionar carpeta `frontend` como root

2. **Configurar Variables de Entorno**
   - Agregar todas las variables de `.env.local` en Vercel Dashboard
   - Marcar variables sensibles como "Encrypted"

3. **Configurar Build**
   ```
   Framework: Next.js
   Root Directory: frontend
   Build Command: npm run build
   Install Command: npm install
   ```

4. **Configurar Webhooks de Pago**
   
   **MercadoPago:**
   - URL: `https://tu-dominio.vercel.app/api/payments/webhook`
   - Eventos: payment.created, payment.updated
   
   **Stripe:**
   - URL: `https://tu-dominio.vercel.app/api/payments/stripe/webhook`
   - Eventos: checkout.session.completed, payment_intent.payment_failed

### Verificación Post-Deploy

```bash
# Verificar health endpoint
curl https://tu-dominio.vercel.app/api/health
```

---

## 📁 Estructura del Proyecto

```
Spartan/
├── frontend/                    # Aplicación Next.js
│   ├── src/
│   │   ├── app/                 # App Router (páginas y APIs)
│   │   │   ├── api/             # API Routes
│   │   │   │   ├── admin/       # APIs de administración
│   │   │   │   ├── asesor-estilo/  # APIs de IA (análisis de imagen)
│   │   │   │   ├── credits/     # Sistema de créditos y compras
│   │   │   │   ├── payments/    # Webhooks MercadoPago y Stripe
│   │   │   │   └── users/       # Gestión de usuarios
│   │   │   ├── admin/           # Panel de administración
│   │   │   ├── blog/            # Sistema de blog
│   │   │   ├── herramientas/    # Herramientas de IA
│   │   │   │   ├── asesor-estilo/      # Asesor de vestimenta
│   │   │   │   ├── asesor-forma-cara/  # Asesor de cortes/barba
│   │   │   │   └── couch_spartano/     # Coach IA personalizado
│   │   │   └── perfil/          # Perfil de usuario
│   │   ├── components/          # Componentes React
│   │   ├── lib/                 # Utilidades y configuración
│   │   │   ├── asesor-estilo/   # Lógica de análisis de imagen
│   │   │   ├── coach-espartano/ # Lógica del coach IA
│   │   │   │   ├── config/      # Configuración de coaches
│   │   │   │   ├── gemini.ts    # Cliente Gemini para chat
│   │   │   │   └── credits.ts   # Sistema de créditos del coach
│   │   │   ├── server/          # Utilidades del servidor
│   │   │   │   ├── prisma.ts    # Cliente Prisma
│   │   │   │   ├── stripe.ts    # Cliente Stripe
│   │   │   │   └── mercadopago.ts # Cliente MercadoPago
│   │   │   └── validation/      # Schemas Zod
│   │   └── types/               # Tipos TypeScript
│   ├── prisma/                  # Schema y migraciones
│   └── public/                  # Assets estáticos
├── blog-posts/                  # Artículos en Markdown
├── DOCUMENTATION.md             # Documentación técnica
└── README.md                    # Este archivo
```

---

## 🔌 APIs

### Públicas

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/api/health` | GET | Health check con estado de BD |
| `/api/blog/posts` | GET | Lista de posts publicados |
| `/api/newsletter` | POST | Suscripción al newsletter |

### Autenticadas (requieren Bearer Token)

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/api/users/profile` | GET/PUT | Perfil del usuario |
| `/api/credits/packages` | GET | Paquetes de créditos disponibles |
| `/api/credits/buy` | POST | Iniciar compra (MercadoPago) |
| `/api/credits/buy-stripe` | POST | Iniciar compra (Stripe) |
| `/api/asesor-estilo/analyze` | POST | Análisis de imagen con IA |
| `/api/asesor-estilo/iterate` | POST | Generar variaciones |
| `/herramientas/couch_spartano/api/chat` | POST | Chat con Coach IA |
| `/herramientas/couch_spartano/api/profile` | GET/POST | Perfil de coaching |
| `/herramientas/couch_spartano/api/coaches` | GET | Lista de coaches disponibles |

### Admin (requieren rol admin)

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/api/admin/users` | GET | Lista de usuarios |
| `/api/admin/purchases` | GET | Historial de compras |
| `/api/admin/blog` | GET/POST/PUT/DELETE | Gestión de posts |

### Webhooks

| Endpoint | Método | Pasarela |
|----------|--------|----------|
| `/api/payments/webhook` | POST | MercadoPago |
| `/api/payments/stripe/webhook` | POST | Stripe |

---

## 🔐 Seguridad

### Implementaciones

- ✅ **Autenticación**: Firebase ID Token verification + Admin SDK
- ✅ **Autorización**: Role-based access control desde BD
- ✅ **Validación**: Zod schemas en todos los endpoints
- ✅ **Rate Limiting**: Sliding window con Redis/Memory fallback
- ✅ **Webhook Security**: HMAC-SHA256 verification (MercadoPago y Stripe)
- ✅ **CORS**: Origins configurables, restrictivo en producción
- ✅ **Error Handling**: Sanitización de errores, sin datos sensibles
- ✅ **Encriptación**: Mensajes del coach encriptados en BD

---

## 🧪 Testing

### Ejecutar Tests

```bash
# Todos los tests
npm run test

# Tests específicos
npm run test:payments    # Flujo de pagos
npm run test:users       # Gestión de usuarios
npm run test:asesor-estilo  # Configuración de IA
```

### Type Checking

```bash
npm run type-check
```

### Linting

```bash
npm run lint
```

---

## 📚 Documentación Adicional

- [**DOCUMENTATION.md**](DOCUMENTATION.md) - Documentación técnica completa
- [**frontend/.env.example**](frontend/.env.example) - Todas las variables de entorno
- [**frontend/prisma/schema.prisma**](frontend/prisma/schema.prisma) - Schema de base de datos

---

## 📄 Licencia

Proyecto privado - Todos los derechos reservados © 2025 Spartan Club

---

<div align="center">
  <strong>🏛️ Forge Your Best Version 🏛️</strong>
  <br/>
  <sub>Built with Next.js, TypeScript, Gemini AI, and ❤️</sub>
</div>
