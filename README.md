# Spartan Club

<div align="center">
  <img src="frontend/public/Logo spartan club.png" alt="Spartan Club Logo" width="200"/>
  
  **Plataforma de Desarrollo Personal Masculino**
  
  [![Next.js](https://img.shields.io/badge/Next.js-15.3-black?logo=next.js)](https://nextjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/)
  [![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev/)
  [![Prisma](https://img.shields.io/badge/Prisma-5.17-2D3748?logo=prisma)](https://www.prisma.io/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
  
  **Estado:** ✅ Production Ready | **Versión:** 1.0.0
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
- [Contribución](#-contribución)

---

## 📖 Descripción

**Spartan Club** es una plataforma web dedicada al desarrollo personal masculino, combinando contenido educativo, herramientas de IA para asesoría de estilo, y un sistema de monetización basado en créditos.

### Filosofía
Inspirado en los principios de los antiguos guerreros espartanos: disciplina, resiliencia, excelencia física y fortaleza mental.

---

## ✨ Características

### 🤖 Herramientas de IA
- **Asesor de Estilo**: Análisis de imagen con Google Gemini para recomendaciones de vestimenta
- **Asesor de Forma de Cara**: Recomendaciones de cortes de cabello y barba personalizados

### 📝 Sistema de Contenido
- **Blog CMS**: Gestión de artículos con programación de publicación
- **Newsletter**: Sistema de suscripción con gestión GDPR
- **Comentarios**: Sistema de comentarios con moderación

### 💳 Monetización
- **Sistema de Créditos**: Modelo freemium con créditos para funciones premium
- **Integración MercadoPago**: Pagos seguros para mercado LATAM
- **Webhooks Seguros**: Verificación HMAC-SHA256

### 🔐 Panel de Administración
- Gestión de usuarios y roles
- Monitoreo de compras
- Gestión de contenido del blog
- Configuración de paquetes de créditos

---

## 🛠 Stack Tecnológico

| Categoría | Tecnología |
|-----------|------------|
| **Frontend** | Next.js 15, React 19, TypeScript, Tailwind CSS 4 |
| **Backend** | Next.js API Routes (Serverless) |
| **Base de Datos** | PostgreSQL + Prisma ORM |
| **Autenticación** | Firebase Authentication |
| **IA** | Google Gemini API |
| **Pagos** | MercadoPago |
| **Storage** | AWS S3, Cloudinary |
| **Cache** | Upstash Redis (opcional) |
| **Deployment** | Vercel |

---

## 🚀 Inicio Rápido

### Prerrequisitos

- Node.js 18.17.0 o superior
- PostgreSQL (local o Supabase/Neon)
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

# Servidor (privadas)
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
MERCADOPAGO_ACCESS_TOKEN="tu-access-token"
MERCADOPAGO_WEBHOOK_SECRET="tu-webhook-secret"  # OBLIGATORIO en producción
NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY="tu-public-key"

# ============================================
# OPCIONALES
# ============================================
# Redis (mejora performance)
REDIS_URL="redis://..."
UPSTASH_REDIS_REST_URL="https://..."
UPSTASH_REDIS_REST_TOKEN="..."

# AWS S3 (storage alternativo)
AWS_ACCESS_KEY_ID="..."
AWS_SECRET_ACCESS_KEY="..."
AWS_S3_BUCKET_NAME="..."

# Seguridad
ALLOWED_UPLOAD_ORIGINS="https://tudominio.com"  # REQUERIDO en producción
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

4. **Desplegar**
   ```bash
   git push origin main
   ```
   Vercel desplegará automáticamente.

### Verificación Post-Deploy

```bash
# Verificar health endpoint
curl https://tu-dominio.vercel.app/api/health

# Respuesta esperada:
{
  "status": "healthy",
  "service": "spartan-club-api",
  "checks": {
    "database": { "status": "ok", "latencyMs": 15 },
    "environment": { "status": "ok" }
  }
}
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
│   │   │   │   ├── asesor-estilo/  # APIs de IA
│   │   │   │   ├── credits/     # Sistema de créditos
│   │   │   │   ├── health/      # Health check
│   │   │   │   ├── payments/    # Webhooks de pago
│   │   │   │   └── users/       # Gestión de usuarios
│   │   │   ├── admin/           # Panel de administración
│   │   │   ├── blog/            # Páginas del blog
│   │   │   ├── herramientas/    # Herramientas de IA
│   │   │   └── perfil/          # Perfil de usuario
│   │   ├── components/          # Componentes React
│   │   ├── lib/                 # Utilidades y configuración
│   │   │   ├── api/             # Error handling centralizado
│   │   │   ├── asesor-estilo/   # Lógica de IA
│   │   │   ├── security/        # Autenticación y seguridad
│   │   │   ├── server/          # Utilidades del servidor
│   │   │   └── validation/      # Schemas Zod
│   │   └── types/               # Tipos TypeScript
│   ├── prisma/                  # Schema y migraciones
│   ├── public/                  # Assets estáticos
│   └── tests/                   # Suite de pruebas
├── DOCUMENTATION.md             # Documentación técnica completa
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
| `/api/credits/buy` | POST | Iniciar compra de créditos |
| `/api/asesor-estilo/analyze` | POST | Análisis de imagen con IA |
| `/api/asesor-estilo/iterate` | POST | Generar variaciones |

### Admin (requieren rol admin)

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/api/admin/users` | GET | Lista de usuarios |
| `/api/admin/purchases` | GET | Historial de compras |
| `/api/admin/blog` | GET/POST/PUT/DELETE | Gestión de posts |

### Webhooks

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/api/payments/webhook` | POST | Webhook de MercadoPago |

---

## 🔐 Seguridad

### Implementaciones

- ✅ **Autenticación**: Firebase ID Token verification
- ✅ **Autorización**: Role-based access control desde BD
- ✅ **Validación**: Zod schemas en todos los endpoints
- ✅ **Rate Limiting**: Sliding window con Redis/Memory fallback
- ✅ **Webhook Security**: HMAC-SHA256 verification obligatoria en producción
- ✅ **CORS**: Origins configurables, restrictivo en producción
- ✅ **Error Handling**: Sanitización de errores, sin datos sensibles

### Headers de Seguridad (Vercel)

```json
{
  "headers": [
    {
      "source": "/api/:path*",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "Cache-Control", "value": "no-store" }
      ]
    }
  ]
}
```

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

## 🤝 Contribución

1. Fork el repositorio
2. Crear rama feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -m 'Add: nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abrir Pull Request

### Estándares de Código

- TypeScript strict mode
- ESLint + Prettier
- Conventional Commits
- Tests para nuevas funcionalidades

---

## 📄 Licencia

Proyecto privado - Todos los derechos reservados © 2025 Spartan Club

---

## 📞 Contacto

- **GitHub**: [@Pablo-Cubides](https://github.com/Pablo-Cubides)
- **Repositorio**: [Spartan](https://github.com/Pablo-Cubides/Spartan)

---

<div align="center">
  <strong>🏛️ Forge Your Best Version 🏛️</strong>
  <br/>
  <sub>Built with Next.js, TypeScript, and AI</sub>
</div>
