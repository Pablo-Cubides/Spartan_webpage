# Spartan Club - Complete Documentation

## Introduction

Spartan Club is a comprehensive web platform dedicated to male personal development, focusing on forging character, discipline, and excellence. The application combines educational content through a blog, interactive AI-powered personal styling tools, and a credit-based membership system.

### Core Philosophy
Spartan Club embodies the principles of ancient Spartan warriors adapted to modern life: discipline, resilience, physical excellence, and mental fortitude. The platform serves as a digital gymnasium where men can access tools and knowledge to become the best version of themselves.

### Serverless Architecture Approach
This application leverages a modern serverless architecture built on Next.js 15 with Vercel, providing several key advantages:

- **Zero Server Management**: Automatic scaling, deployment, and maintenance handled by Vercel
- **Edge Computing**: Global CDN distribution for optimal performance worldwide
- **API Routes as Functions**: Serverless functions for backend logic with automatic scaling
- **Database as a Service**: PostgreSQL via connection pooling, no infrastructure overhead
- **Cost Efficiency**: Pay only for actual usage, no idle server costs
- **Developer Experience**: Focus on code, not infrastructure; instant deployments and previews

### Key Features

- **AI-Powered Style Advisor**: Face analysis using Google Gemini for personalized styling recommendations
- **Educational Blog**: Content management system with scheduled publishing
- **Credit-Based Monetization**: Freemium model with premium AI features
- **Admin Dashboard**: Complete content and user management interface
- **Comment System**: User engagement with moderation capabilities
- **Newsletter System**: Email subscription management
- **Secure Authentication**: Firebase Auth with role-based access control
- **Payment Integration**: MercadoPago for Latin American markets
- **Multi-tenant Storage**: AWS S3 and Cloudinary for media assets

## System Architecture

### High-Level Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   API Routes    │    │   External      │
│   (Next.js)     │◄──►│   (Serverless)  │◄──►│   Services      │
│                 │    │                 │    │                 │
│ - React 19      │    │ - Edge Runtime  │    │ - Firebase Auth │
│ - TypeScript    │    │ - Auto-scaling  │    │ - Google Gemini │
│ - Tailwind CSS  │    │ - Global CDN    │    │ - PostgreSQL    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Technology Stack

#### Frontend Layer
- **Next.js 15**: React framework with App Router and server components
- **React 19**: Latest React with concurrent features and hooks
- **TypeScript**: Static typing for maintainable code
- **Tailwind CSS v4**: Utility-first CSS with modern features
- **Lucide React**: Optimized SVG icon library

#### Backend Layer (Serverless)
- **Next.js API Routes**: Serverless functions with edge runtime
- **Prisma ORM**: Type-safe database access with connection pooling
- **PostgreSQL**: ACID-compliant relational database
- **Firebase Admin SDK**: Server-side authentication and user management
- **Google Generative AI**: Advanced AI for image analysis

#### External Services
- **Firebase Authentication**: User auth with email/password and OAuth
- **AWS S3**: Scalable object storage for user uploads
- **Cloudinary**: Image processing and CDN
- **Upstash Redis**: Caching and rate limiting
- **MercadoPago**: Payment processing for LATAM
- **Vercel**: Hosting, CDN, and serverless platform

#### Development & Quality
- **ESLint**: Code linting with Next.js rules
- **Prettier**: Automated code formatting
- **TypeScript Compiler**: Type checking
- **Jest/RTL**: Component and integration testing
- **Prisma Studio**: Database GUI for development

## Installation & Setup

### Prerequisites

- **Node.js**: Version 18.17.0 or higher
- **PostgreSQL**: Database instance (local or cloud)
- **Git**: Version control system

### Installation Steps

1. **Clone Repository**
   ```bash
   git clone https://github.com/Pablo-Cubides/spartan-club.git
   cd spartan-club/frontend
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create `.env.local` with required variables:

   ```env
   # Database
   DATABASE_URL="postgresql://user:password@localhost:5432/spartan_db"

   # Firebase Configuration
   NEXT_PUBLIC_FIREBASE_API_KEY="your-firebase-api-key"
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your-project.firebaseapp.com"
   NEXT_PUBLIC_FIREBASE_PROJECT_ID="your-project-id"
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="your-project.appspot.com"
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="123456789"
   NEXT_PUBLIC_FIREBASE_APP_ID="1:123456789:web:abcdef123456"

   # AI Services
   GEMINI_API_KEY="your-gemini-api-key"
   PERSONAL_SHOPPER_GEMINI_KEY="your-gemini-api-key"

   # Cloud Storage
   AWS_ACCESS_KEY_ID="your-aws-access-key"
   AWS_SECRET_ACCESS_KEY="your-aws-secret-key"
   AWS_S3_BUCKET_NAME="your-s3-bucket"

   # Caching & Rate Limiting
   REDIS_URL="redis://your-redis-url"

   # Payment Processing
   MERCADOPAGO_ACCESS_TOKEN="your-mercadopago-token"

   # Application URLs
   NEXT_PUBLIC_API_URL="http://localhost:3000"
   API_URL="http://localhost:3000"
   ```

4. **Database Setup**
   ```bash
   # Generate Prisma client
   npm run prisma:generate

   # Run database migrations
   npm run prisma:migrate
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```

   Access at `http://localhost:3000`

## Database Schema

### Prisma Schema Overview

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id         Int      @id @default(autoincrement())
  uid        String   @unique
  email      String   @unique
  name       String?
  alias      String?  @unique
  avatar_id  String?
  role       String   @default("user")
  credits    Int      @default(0)
  is_active  Boolean  @default(true)
  created_at DateTime @default(now())
  updated_at DateTime?
  purchases  Purchase[]
  posts      BlogPost[]
}

model CreditPackage {
  id         Int      @id @default(autoincrement())
  name       String
  credits    Int
  price      Float
  is_active  Boolean  @default(true)
  created_at DateTime @default(now())
  updated_at DateTime?
  purchases  Purchase[]
}

model Purchase {
  id               Int      @id @default(autoincrement())
  user             User     @relation(fields: [user_id], references: [id])
  user_id          Int
  package          CreditPackage @relation(fields: [package_id], references: [id])
  package_id       Int
  amount_paid      Float
  credits_received Int
  payment_method   String?
  payment_id       String?
  status           String   @default("pending")
  created_at       DateTime @default(now())
  completed_at     DateTime?
}

model BlogPost {
  id          Int      @id @default(autoincrement())
  slug        String   @unique
  title       String
  content     String
  excerpt     String?
  cover_image String?
  author_id   Int
  author      User     @relation(fields: [author_id], references: [id])
  is_published Boolean @default(false)
  published_at DateTime?
  created_at  DateTime @default(now())
  updated_at  DateTime @updatedAt
}

model AppSetting {
  key         String   @id
  value       String
  description String?
  updated_at  DateTime @updatedAt
}
```

### Database Operations

```bash
# Generate Prisma client
npm run prisma:generate

# Create and run migrations
npm run prisma:migrate

# Open Prisma Studio (database GUI)
npm run prisma:studio

# Reset database (development only)
npx prisma migrate reset
```

## Authentication System

### Firebase Authentication Integration

The application uses Firebase Authentication for secure user management:

- **Registration/Login**: Email/password authentication
- **OAuth Integration**: Google Sign-In support
- **Email Verification**: Required for premium features
- **JWT Tokens**: Automatic token management via Firebase SDK

### Server-Side Authentication

```typescript
// Token verification in API routes
const auth = request.headers.get('authorization')
if (!auth.startsWith('Bearer ')) {
  throw new AuthenticationError('Missing authorization header')
}

const idToken = auth.split('Bearer ')[1]
const decoded = await verifyIdToken(idToken)
```

### Session Management

- **Secure Cookies**: HTTP-only cookies for token storage
- **Client State**: `useAuth()` hook for authentication state
- **Server Validation**: Token verification on protected routes

## Credit System & Monetization

### Business Model

Users receive 2 free credits upon registration and must purchase additional credits for premium AI features:

- **Style Analysis**: 1 credit per analysis
- **Style Generation**: 2 credits per generation
- **Freemium Approach**: Basic features free, advanced features premium

### Purchase Flow

1. **Package Selection**: User chooses credit package
2. **Payment Processing**: MercadoPago integration
3. **Webhook Confirmation**: Automatic credit allocation
4. **Usage Tracking**: Real-time credit consumption

### Credit Management API

```typescript
// Check sufficient credits
const hasCredits = await hasSufficientCredits(userId, cost)

// Consume credits
const consumed = await consumeCredits(userId, cost, 'analysis')
```

## AI-Powered Tools

### Style Advisor (Outfit Recommendations)

The primary AI tool provides personalized outfit and style recommendations based on full-body analysis:

**Features:**
- Full-body silhouette analysis
- Outfit recommendations by body type (rectangle, hourglass, etc.)
- Color combination suggestions
- Professional vs. casual style guidance
- Seasonal fashion recommendations

**AI Pipeline:**
```
Body Photo → Gemini Analysis → Outfit Recommendations → Visual Examples
```

**Use Cases:**
- "Suggest a casual outfit for a rectangle body type"
- "Recommend office attire for my proportions"
- "What clothing cuts flatter my silhouette?"

### Face Shape Advisor (Hair & Beard Styling)

Specialized tool for facial analysis and grooming recommendations:

**Features:**
- Facial structure analysis (oval, round, square, etc.)
- Beard style recommendations by face shape
- Haircut suggestions for face balancing
- Grooming product recommendations
- Visual before/after simulations

**AI Pipeline:**
```
Face Photo → Gemini Analysis → Style Recommendations → Edited Image Generation
```

**Use Cases:**
- "Create a beard style that elongates my round face"
- "Suggest low-maintenance hairstyles for wavy hair"
- "What products do I need for healthy beard care?"

### Technical Implementation

Both tools share the same underlying AI infrastructure but use specialized prompts:

### Technical Implementation

Both AI tools currently share the same underlying API infrastructure and analysis engine, which performs facial feature analysis. The distinction lies in their user interfaces and intended use cases:

- **Style Advisor**: General-purpose style recommendations with image editing
- **Face Shape Advisor**: Specialized facial grooming advice with enhanced image generation

The shared API uses Google Gemini for intelligent analysis:

```typescript
// Facial Analysis Prompt (used by both tools)
const facialAnalysisPrompt = `
Analyze this facial image and provide styling recommendations.
Focus on: face shape, hair length, beard density, facial balancing.
Evaluate: faceOk, pose, hair, beard, lighting, and suggested changes.
`;
```

### Interactive Features

**Conversational AI Interface:**
- Real-time style recommendations
- Follow-up questions and refinements
- Visual style comparisons
- Before/after image generation

**Credit System Integration:**
- Analysis: 1 credit per facial analysis
- Image Generation: 2 credits per edited image
- Freemium access with 2 free credits for new users

**Multi-modal Input:**
- Image upload via file selection
- Drag & drop functionality
- Live camera capture
- Mobile-responsive interface

## Content Management System

### Blog System

- **Dynamic Content**: Server-side rendered blog posts
- **SEO Optimization**: Meta tags and structured data
- **Scheduled Publishing**: Future-dated post publishing
- **Author Management**: Multi-author support with permissions

### Comment System

- **User Engagement**: Comments on blog posts
- **Moderation Queue**: Admin approval workflow
- **Spam Prevention**: Basic filtering and rate limiting
- **Threaded Discussions**: Nested comment support

### Newsletter System

- **Email Collection**: GDPR-compliant subscription management
- **Automated Processing**: Background email processing
- **Unsubscribe Handling**: One-click unsubscribe support
- **Analytics**: Subscription metrics and engagement tracking

## Admin Dashboard

### Administrative Features

The comprehensive admin panel provides full platform management:

- **User Management**: View, edit, and manage user accounts
- **Purchase Monitoring**: Track all transactions and credit allocations
- **Content Management**: Create, edit, and publish blog posts
- **Package Configuration**: Manage credit packages and pricing
- **System Settings**: Dynamic configuration management

### Admin API Endpoints

#### User Management
```typescript
GET /api/admin/users     // List users with pagination
GET /api/admin/users/:id // Get specific user details
```

#### Purchase Management
```typescript
GET /api/admin/purchases // List all purchases
POST /api/admin/purchases/:id/refund // Process refunds
```

#### Content Management
```typescript
GET /api/admin/blog      // List blog posts
POST /api/admin/blog     // Create new post
PUT /api/admin/blog/:id  // Update existing post
DELETE /api/admin/blog/:id // Delete post
```

#### Settings Management
```typescript
GET /api/admin/settings  // Get current settings
POST /api/admin/settings // Update application settings
```

## API Reference

### Authentication Endpoints

#### `GET /api/users/profile`
Retrieve authenticated user's profile.

**Headers:**
```
Authorization: Bearer <firebase-token>
```

**Response:**
```json
{
  "user": {
    "id": 1,
    "uid": "firebase-uid",
    "email": "user@example.com",
    "name": "User Name",
    "credits": 5
  }
}
```

#### `PUT /api/users/profile`
Update user profile information.

**Body:**
```json
{
  "name": "Updated Name",
  "alias": "new_alias",
  "avatar_id": "avatar-123"
}
```

### Credit & Payment Endpoints

#### `GET /api/credits/packages`
Get available credit packages.

#### `POST /api/payments/create-preference`
Create MercadoPago payment preference.

**Body:**
```json
{
  "packageId": 1,
  "userId": "firebase-uid"
}
```

#### `POST /api/payments/webhook`
Handle payment confirmation webhooks.

### AI Tools Endpoints

The platform provides two AI-powered tools that share the same underlying API infrastructure but serve different purposes:

#### Style Advisor (`/asesor-estilo`)
Analyzes images for style recommendations, currently focused on facial features and grooming. Used by both the Style Advisor and Face Shape Advisor tools.

#### Face Shape Advisor (`/asesor-forma-cara`)  
Uses the same API endpoints as the Style Advisor but provides specialized facial analysis with image generation capabilities.

#### `POST /api/asesor-estilo/analyze`
Analyze an image for facial features and provide style recommendations.

**Headers:**
```
Authorization: Bearer <firebase-token>
```

**Body:**
```json
{
  "imageUrl": "https://example.com/image.jpg",
  "locale": "es"
}
```

**Response:**
```json
{
  "analysis": {
    "faceOk": true,
    "pose": "frontal",
    "hair": {
      "length": "medium",
      "color": "brown",
      "density": "medium"
    },
    "beard": {
      "present": true,
      "style": "stubble",
      "density": "low"
    },
    "suggestedText": "Recommended styling advice..."
  }
}
```

#### `POST /api/asesor-estilo/iterate`
Generate edited images based on analysis and user requests.

**Body:**
```json
{
  "sessionId": "session-123",
  "originalImageUrl": "https://example.com/image.jpg",
  "userText": "Apply modern haircut with fade",
  "prevPublicId": "cloudinary-public-id",
  "analysis": { /* analysis object from /analyze */ }
}
```

**Response:**
```json
{
  "editedUrl": "https://cloudinary.com/edited-image.jpg",
  "publicId": "new-cloudinary-public-id",
  "note": "Image edited successfully"
}
```

### Content Endpoints

#### `GET /api/blog/posts`
Get paginated blog posts.

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Posts per page (default: 10)

#### `GET /api/blog/posts/[slug]`
Get specific blog post by slug.

#### `POST /api/comments`
Create new comment (pending moderation).

**Body:**
```json
{
  "postSlug": "article-slug",
  "name": "Commenter Name",
  "content": "Comment content"
}
```

#### `GET /api/comments`
Get approved comments for a post.

**Query Parameters:**
- `post`: Post slug to filter comments

#### `POST /api/newsletter`
Subscribe to newsletter.

**Body:**
```json
{
  "email": "user@example.com"
}
```

## Frontend Components

### Component Architecture

```
components/
├── Header.tsx           # Navigation and auth state
├── Footer.tsx           # Site footer
├── ModalLogin.tsx       # Authentication modal
├── Card.tsx            # Reusable card component
├── BuyCredits.tsx      # Credit purchase interface
├── AvatarSelector.tsx  # User avatar management
├── BlogPostLayout.tsx  # Blog post rendering
├── Comments.tsx        # Comment display and interaction
├── NewsletterForm.tsx  # Email subscription form
└── AdminDashboard.tsx  # Administrative interface
```

### Key Components

#### Header Component
- Responsive navigation with mobile menu
- Authentication state management
- Integrated login modal

#### ModalLogin Component
- Tabbed interface for login/registration
- Google OAuth integration
- Form validation and error handling
- Secure password requirements

#### Admin Dashboard
- Multi-tab interface for different management areas
- Real-time data fetching and updates
- CRUD operations for content and users
- Settings management interface

## Testing Suite

### Automated Test Coverage

The application includes comprehensive testing for critical functionality:

```bash
# Run all tests
npm run test

# Run specific test suites
npm run test:payments
npm run test:users
npm run test:asesor-estilo
```

### Test Categories

#### Payment Flow Tests
- User creation and credit allocation
- Purchase simulation with MercadoPago
- Webhook processing and credit updates
- Credit consumption validation

#### User Management Tests
- Registration bonus credit allocation
- Profile update functionality
- Authentication flow validation

#### AI Configuration Tests
- Environment variable validation
- Credit cost configuration
- Rate limiting setup verification

### Test Execution

```typescript
// tests/run-all.ts
import { runPaymentFlowTest } from './payments/flow.test.js';
import { runSignupBonusTest } from './users/signup-bonus.test.js';
import { runAsesorEstiloConfigTest } from './asesor-estilo/config.test.js';

async function runAllTests() {
  await runPaymentFlowTest();
  await runSignupBonusTest();
  await runAsesorEstiloConfigTest();
}
```

## Deployment & Production

### Environment Variables (Production)

Ensure all critical environment variables are configured:

```env
# Production Environment
NODE_ENV=production
DATABASE_URL="postgresql://..."
NEXT_PUBLIC_API_URL="https://your-domain.com"

# Firebase (Production Keys)
NEXT_PUBLIC_FIREBASE_API_KEY="..."
# ... other Firebase variables

# AI & External Services
GEMINI_API_KEY="..."
AWS_ACCESS_KEY_ID="..."
MERCADOPAGO_ACCESS_TOKEN="..."
```

### Build & Deploy Commands

```bash
# Production build
npm run build

# Start production server
npm start
```

### Vercel Deployment

1. Connect repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Set build commands:
   - Build: `npm run build`
   - Install: `npm install`

### Docker Deployment

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## Developer Guidelines

### Code Standards

#### TypeScript Best Practices
- Strict typing for all function parameters
- Interface definitions for complex objects
- Utility types for unions and transformations

#### React Component Patterns
```tsx
// Preferred arrow function with typed props
interface ComponentProps {
  title: string;
  onClick: () => void;
}

const MyComponent: React.FC<ComponentProps> = ({ title, onClick }) => {
  return (
    <button onClick={onClick}>
      {title}
    </button>
  );
};
```

#### API Route Structure
```typescript
// Consistent error handling pattern
import { NextResponse } from 'next/server';
import { withErrorHandler } from '@/lib/api/error-handler';

const handler = async (request: NextRequest) => {
  // Business logic implementation
  return NextResponse.json({ data: 'response' });
};

export const GET = withErrorHandler(handler);
```

### Error Handling

#### Custom Error Classes
```typescript
export class AuthenticationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthenticationError';
  }
}

export class NotFoundError extends Error {
  constructor(resource: string) {
    super(`${resource} not found`);
    this.name = 'NotFoundError';
  }
}
```

#### Error Handler Middleware
```typescript
// lib/api/error-handler.ts
export const withErrorHandler = (handler: Function) => {
  return async (request: NextRequest) => {
    try {
      return await handler(request);
    } catch (error) {
      if (error instanceof AuthenticationError) {
        return NextResponse.json(
          { error: 'UNAUTHORIZED', message: error.message },
          { status: 401 }
        );
      }
      // Handle other error types...
    }
  };
};
```

### Data Validation

#### Zod Schema Validation
```typescript
// lib/validation/schemas.ts
import { z } from 'zod';

export const UpdateUserProfileSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2).max(50),
  alias: z.string().regex(/^[a-zA-Z0-9_-]+$/).optional(),
});
```

### Security Best Practices

#### Security Principles
- **Authentication**: Token verification on all protected routes
- **Authorization**: Role-based access control
- **Input Validation**: Sanitization of all user inputs
- **Rate Limiting**: Abuse prevention mechanisms
- **HTTPS Only**: Encrypted communication channels

#### Implementation Guidelines
- Never log sensitive information
- Use parameterized queries (automatic with Prisma)
- Validate and sanitize all inputs
- Implement request timeouts
- Regular security audits

### Performance Optimization

#### Implemented Optimizations
- **Caching Layer**: Redis for AI analysis results
- **Lazy Loading**: On-demand component loading
- **Image Optimization**: Next.js Image component with WebP
- **Database Indexing**: Optimized queries with proper indexing

#### Monitoring & Analytics
- Structured logging for debugging
- Credit usage metrics
- API response time monitoring
- Error rate tracking

## Troubleshooting

### Common Issues & Solutions

#### Database Connection Error
```
Error: P1001: Can't reach database server
```
**Solution:**
- Verify `DATABASE_URL` configuration
- Check PostgreSQL service status
- Run `npm run prisma:migrate`

#### Firebase Configuration Error
```
Firebase: Error (auth/invalid-api-key)
```
**Solution:**
- Confirm production Firebase keys
- Verify authorized domains
- Check API key permissions

#### AI Service Error
```
Gemini API Error: INVALID_ARGUMENT
```
**Solution:**
- Validate `GEMINI_API_KEY`
- Check image format requirements
- Monitor API quota limits

#### Build Failures
```
Build failed: Module not found
```
**Solution:**
- Run `npm install` to update dependencies
- Verify `package.json` integrity
- Clear Next.js cache: `rm -rf .next`

### Logging & Debugging

#### Application Logging
```typescript
// Structured logging implementation
await appendLog({
  phase: 'operation_name',
  userId: user?.id,
  error: error?.message,
  timestamp: Date.now(),
});
```

#### Debug Configuration
```bash
# Enable debug logging
DEBUG=* npm run dev
NODE_ENV=development npm run build
```

### Support & Contact

For technical support or development inquiries:
- **Technical Issues**: GitHub repository issues
- **Documentation Updates**: Pull requests welcome
- **Security Concerns**: security@spartanclub.com

---

*This documentation represents a comprehensive guide for the Spartan Club platform, designed to enable developers to understand, maintain, and extend the application effectively. The serverless architecture and modern tech stack provide a scalable foundation for continued growth and feature development.*

*Last updated: November 27, 2025*

## Arquitectura del Sistema

### Arquitectura General

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   API Routes    │    │   Servicios     │
│   (Next.js)     │◄──►│   (Next.js)     │◄──►│   Externos      │
│                 │    │                 │    │                 │
│ - React 19      │    │ - REST APIs     │    │ - Firebase Auth │
│ - TypeScript    │    │ - Auth Middleware│    │ - Google Gemini │
│ - Tailwind CSS  │    │ - Error Handling│    │ - PostgreSQL    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Estructura del Proyecto

```
spartan-club/
├── frontend/                    # Aplicación principal Next.js
│   ├── src/
│   │   ├── app/                 # App Router
│   │   │   ├── api/             # API Routes
│   │   │   ├── blog/            # Páginas del blog
│   │   │   ├── credits/         # Sistema de créditos
│   │   │   ├── herramientas/    # Herramientas IA
│   │   │   └── perfil/          # Perfil de usuario
│   │   ├── components/          # Componentes React reutilizables
│   │   ├── lib/                 # Utilidades y configuración
│   │   └── types/               # Definiciones TypeScript
│   ├── prisma/                  # Esquema de base de datos
│   ├── public/                  # Assets estáticos
│   └── tests/                   # Suite de pruebas
├── scripts/                     # Scripts de automatización
└── docs/                       # Documentación adicional
```

## Tecnologías Utilizadas

### Frontend
- **Next.js 15**: Framework React con App Router
- **React 19**: Biblioteca de UI con hooks modernos
- **TypeScript**: Tipado estático para mayor robustez
- **Tailwind CSS**: Framework CSS utility-first
- **Lucide React**: Iconos SVG optimizados

### Backend & APIs
- **Next.js API Routes**: Backend serverless integrado
- **Prisma**: ORM moderno para PostgreSQL
- **PostgreSQL**: Base de datos relacional robusta
- **Firebase Admin SDK**: Autenticación y gestión de usuarios
- **Google Generative AI (Gemini)**: IA para análisis de estilo

### Servicios Externos
- **Firebase Authentication**: Autenticación de usuarios
- **AWS S3**: Almacenamiento de archivos
- **Cloudinary**: Procesamiento y optimización de imágenes
- **Upstash Redis**: Caché y rate limiting
- **MercadoPago**: Procesamiento de pagos

### Desarrollo & Calidad
- **ESLint**: Linting de código
- **Prettier**: Formateo automático
- **TypeScript**: Verificación de tipos
- **Jest/Testing Library**: Testing automatizado

## Instalación y Configuración

### Prerrequisitos

- **Node.js**: Versión 18.17.0 o superior
- **PostgreSQL**: Base de datos configurada
- **Git**: Control de versiones

### Instalación

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/Pablo-Cubides/spartan-club.git
   cd spartan-club/frontend
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   Crear archivo `.env.local` con las siguientes variables:

   ```env
   # Base de datos
   DATABASE_URL="postgresql://user:password@localhost:5432/spartan_db"

   # Firebase
   NEXT_PUBLIC_FIREBASE_API_KEY="your-firebase-api-key"
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your-project.firebaseapp.com"
   NEXT_PUBLIC_FIREBASE_PROJECT_ID="your-project-id"
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="your-project.appspot.com"
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="123456789"
   NEXT_PUBLIC_FIREBASE_APP_ID="1:123456789:web:abcdef123456"

   # Google AI (Gemini)
   GEMINI_API_KEY="your-gemini-api-key"
   PERSONAL_SHOPPER_GEMINI_KEY="your-gemini-api-key"

   # AWS S3
   AWS_ACCESS_KEY_ID="your-aws-access-key"
   AWS_SECRET_ACCESS_KEY="your-aws-secret-key"
   AWS_S3_BUCKET_NAME="your-s3-bucket"

   # Redis (Upstash)
   REDIS_URL="redis://your-redis-url"

   # MercadoPago
   MERCADOPAGO_ACCESS_TOKEN="your-mercadopago-token"

   # API URLs
   NEXT_PUBLIC_API_URL="http://localhost:3000"
   API_URL="http://localhost:3000"
   ```

4. **Configurar base de datos**
   ```bash
   # Generar cliente Prisma
   npm run prisma:generate

   # Ejecutar migraciones
   npm run prisma:migrate
   ```

5. **Iniciar servidor de desarrollo**
   ```bash
   npm run dev
   ```

   La aplicación estará disponible en `http://localhost:3000`

## Base de Datos

### Esquema Prisma

El esquema de base de datos está definido en `prisma/schema.prisma`:

```prisma
model User {
  id         Int      @id @default(autoincrement())
  uid        String   @unique
  email      String   @unique
  name       String?
  alias      String?  @unique
  avatar_id  String?
  role       String   @default("user")
  credits    Int      @default(0)
  is_active  Boolean  @default(true)
  created_at DateTime @default(now())
  updated_at DateTime?
  purchases  Purchase[]
  posts      BlogPost[]
}

model CreditPackage {
  id         Int      @id @default(autoincrement())
  name       String
  credits    Int
  price      Float
  is_active  Boolean  @default(true)
  created_at DateTime @default(now())
  updated_at DateTime?
  purchases  Purchase[]
}

model Purchase {
  id               Int      @id @default(autoincrement())
  user             User     @relation(fields: [user_id], references: [id])
  user_id          Int
  package          CreditPackage @relation(fields: [package_id], references: [id])
  package_id       Int
  amount_paid      Float
  credits_received Int
  payment_method   String?
  payment_id       String?
  status           String   @default("pending")
  created_at       DateTime @default(now())
  completed_at     DateTime?
}

model BlogPost {
  id          Int      @id @default(autoincrement())
  slug        String   @unique
  title       String
  content     String
  excerpt     String?
  cover_image String?
  author_id   Int
  author      User     @relation(fields: [author_id], references: [id])
  is_published Boolean @default(false)
  published_at DateTime?
  created_at  DateTime @default(now())
  updated_at  DateTime @updatedAt
}
```

### Migraciones

Para crear nuevas migraciones después de cambios en el esquema:

```bash
npx prisma migrate dev --name nombre-de-la-migracion
```

### Comandos Útiles de Prisma

```bash
# Generar cliente
npm run prisma:generate

# Ejecutar migraciones
npm run prisma:migrate

# Abrir Prisma Studio (GUI)
npm run prisma:studio

# Resetear base de datos (desarrollo)
npx prisma migrate reset
```

## Autenticación

### Firebase Authentication

La aplicación utiliza Firebase Authentication para gestionar usuarios:

- **Registro/Login**: Email y contraseña
- **OAuth**: Google Sign-In
- **Verificación**: Email verification requerida para ciertas acciones
- **Tokens**: JWT tokens manejados automáticamente por Firebase SDK

### Middleware de Autenticación

```typescript
// Verificación de token en API routes
const auth = request.headers.get('authorization')
if (!auth.startsWith('Bearer ')) {
  throw new AuthenticationError('Missing authorization header')
}

const idToken = auth.split('Bearer ')[1]
const decoded = await verifyIdToken(idToken)
```

### Gestión de Sesiones

- **Cookies**: Tokens almacenados en cookies httpOnly
- **Cliente**: Hook `useAuth()` para estado de autenticación
- **Servidor**: Verificación de tokens en cada request protegido

## Sistema de Créditos

### Funcionamiento

Los usuarios deben adquirir créditos para acceder a funcionalidades premium:

- **Análisis de Estilo**: 1 crédito por análisis
- **Generación de Imágenes**: 2 créditos por generación
- **Créditos Iniciales**: 2 créditos gratuitos al registrarse

### Flujo de Compra

1. **Selección de Paquete**: Usuario elige paquete de créditos
2. **Pago**: Procesamiento via MercadoPago
3. **Webhook**: Confirmación de pago y acreditación
4. **Uso**: Consumo automático al usar servicios

### API de Créditos

```typescript
// Verificar créditos suficientes
const hasCredits = await hasSufficientCredits(userId, cost)

// Consumir créditos
const consumed = await consumeCredits(userId, cost, 'analysis')
```

## Asesor de Estilo IA

### Funcionalidad Principal

El asesor de estilo utiliza Google Gemini para analizar imágenes faciales y proporcionar recomendaciones personalizadas de estilo.

### Arquitectura de IA

```
Imagen → Validación → Análisis Gemini → Recomendaciones → Caché
    ↓         ↓            ↓              ↓          ↓
Validar  Rate Limit   Prompt en ES/EN  Estructurar  Redis
```

### Configuración de IA

```typescript
// Configuración en lib/asesor-estilo/config/app.config.ts
export const APP_CONFIG = {
  ai: {
    ANALYSIS_TIMEOUT_MS: 60000,
    GENERATION_TIMEOUT_MS: 120000,
  },
  credits: {
    COST_PER_ANALYSIS: 1,
    COST_PER_GENERATION: 2,
    STARTING_CREDITS: 2,
  },
  rateLimit: {
    ENABLED: true,
    MAX_REQUESTS_PER_WINDOW: 10,
  },
}
```

### Prompt de Análisis

El sistema utiliza prompts específicos en español e inglés para obtener análisis estructurados:

```typescript
const prompt = `
Analiza esta imagen de una persona y responde SOLO con JSON válido.
Evalúa:
- faceOk: true si hay una cara frontal clara
- pose: "frontal" o "ladeado"
- hair: {length, color, density}
- beard: {present, style, density}
- lighting: "buena"|"regular"|"pobre"
- recommendedChanges: estructura específica
`;
```

### Rate Limiting y Caché

- **Rate Limiting**: Máximo 10 requests por ventana de tiempo por IP
- **Caché**: Resultados almacenados en Redis por hash de imagen
- **Timeout**: 60 segundos máximo por análisis

## API Endpoints

### Autenticación

#### `GET /api/users/profile`
Obtiene el perfil del usuario autenticado.

**Headers:**
```
Authorization: Bearer <firebase-token>
```

**Response:**
```json
{
  "user": {
    "id": 1,
    "uid": "firebase-uid",
    "email": "user@example.com",
    "name": "Usuario",
    "credits": 5
  }
}
```

#### `PUT /api/users/profile`
Actualiza el perfil del usuario.

**Body:**
```json
{
  "name": "Nuevo Nombre",
  "alias": "nuevo_alias",
  "avatar_id": "avatar-123"
}
```

### Créditos y Pagos

#### `GET /api/credits/packages`
Obtiene los paquetes de créditos disponibles.

#### `POST /api/payments/create-preference`
Crea una preferencia de pago en MercadoPago.

**Body:**
```json
{
  "packageId": 1,
  "userId": "firebase-uid"
}
```

#### `POST /api/payments/webhook`
Webhook para confirmación de pagos.

### Asesor de Estilo

#### `POST /api/asesor-estilo/analyze`
Analiza una imagen y proporciona recomendaciones de estilo.

**Headers:**
```
Authorization: Bearer <firebase-token>
```

**Body:**
```json
{
  "imageUrl": "https://example.com/image.jpg",
  "locale": "es"
}
```

**Response:**
```json
{
  "analysis": {
    "faceOk": true,
    "pose": "frontal",
    "hair": {
      "length": "medium",
      "color": "castaño",
      "density": "medium"
    },
    "beard": {
      "present": true,
      "style": "stubble",
      "density": "low"
    },
    "suggestedText": "Recomendación personalizada..."
  }
}
```

#### `POST /api/asesor-estilo/iterate`
Genera variaciones de estilo basadas en análisis previo.

### Contenido

#### `GET /api/home-content`
Obtiene contenido para la página principal.

#### `GET /api/blog/posts`
Obtiene lista de posts del blog.

#### `GET /api/blog/posts/[slug]`
Obtiene un post específico por slug.

## Componentes Frontend

### Estructura de Componentes

```
components/
├── Header.tsx          # Navegación principal
├── Footer.tsx          # Pie de página
├── ModalLogin.tsx      # Modal de autenticación
├── Card.tsx           # Componente genérico de tarjeta
├── BuyCredits.tsx     # Componente de compra de créditos
├── AvatarSelector.tsx # Selector de avatar
├── BlogPostLayout.tsx # Layout para posts
├── Comments.tsx       # Sistema de comentarios
└── NewsletterForm.tsx # Formulario de newsletter
```

### Componentes Clave

#### Header
- Navegación responsive
- Estado de autenticación
- Modal de login integrado

#### ModalLogin
- Tabs para login/registro
- Google OAuth integration
- Validación de formularios
- Manejo de errores

#### BuyCredits
- Lista de paquetes disponibles
- Integración con MercadoPago
- Estados de carga y error

## Testing

### Suite de Pruebas

La aplicación incluye tests automatizados para funcionalidades críticas:

```bash
# Ejecutar todos los tests
npm run test

# Tests específicos
npm run test:payments
npm run test:users
npm run test:asesor-estilo
```

### Tests Incluidos

#### Payment Flow Test
- Creación de usuario de prueba
- Simulación de compra de créditos
- Verificación de acreditación
- Consumo de créditos

#### Signup Bonus Test
- Verificación de créditos iniciales (2)
- Flujo de registro simulado

#### Config Test
- Validación de variables de entorno
- Verificación de configuración de IA
- Rate limiting y créditos

### Ejecución de Tests

```typescript
// tests/run-all.ts
import { runPaymentFlowTest } from './payments/flow.test.js';
import { runSignupBonusTest } from './users/signup-bonus.test.js';
import { runAsesorEstiloConfigTest } from './asesor-estilo/config.test.js';

async function runAllTests() {
  // Ejecutar tests en secuencia
  await runPaymentFlowTest();
  await runSignupBonusTest();
  await runAsesorEstiloConfigTest();
}
```

## Despliegue

### Variables de Entorno de Producción

Asegurarse de configurar todas las variables de entorno críticas:

```env
# Producción
NODE_ENV=production
DATABASE_URL="postgresql://..."
NEXT_PUBLIC_API_URL="https://your-domain.com"

# Firebase (producción)
NEXT_PUBLIC_FIREBASE_API_KEY="..."
# ... otras variables de Firebase

# IA y Servicios Externos
GEMINI_API_KEY="..."
AWS_ACCESS_KEY_ID="..."
MERCADOPAGO_ACCESS_TOKEN="..."
```

### Build y Deploy

```bash
# Build de producción
npm run build

# Iniciar servidor de producción
npm start
```

### Deploy en Vercel

1. Conectar repositorio a Vercel
2. Configurar variables de entorno
3. Configurar build commands:
   - Build: `npm run build`
   - Install: `npm install`

### Deploy en Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## Guía para Desarrolladores

### Convenciones de Código

#### TypeScript
- Usar tipos estrictos en todas las funciones
- Interfaces para objetos complejos
- Types para uniones y primitivos

#### Componentes React
```tsx
// Preferir arrow functions con typed props
interface ComponentProps {
  title: string;
  onClick: () => void;
}

const MyComponent: React.FC<ComponentProps> = ({ title, onClick }) => {
  return (
    <button onClick={onClick}>
      {title}
    </button>
  );
};
```

#### API Routes
```typescript
// Estructura estándar de API route
import { NextResponse } from 'next/server';
import { withErrorHandler } from '@/lib/api/error-handler';

const handler = async (request: NextRequest) => {
  // Lógica del endpoint
  return NextResponse.json({ data: 'response' });
};

export const GET = withErrorHandler(handler);
```

### Manejo de Errores

#### Error Handler Middleware
```typescript
// lib/api/error-handler.ts
export const withErrorHandler = (handler: Function) => {
  return async (request: NextRequest) => {
    try {
      return await handler(request);
    } catch (error) {
      if (error instanceof AuthenticationError) {
        return NextResponse.json(
          { error: 'UNAUTHORIZED', message: error.message },
          { status: 401 }
        );
      }
      // Otros tipos de error...
    }
  };
};
```

#### Tipos de Error Personalizados
```typescript
export class AuthenticationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthenticationError';
  }
}

export class NotFoundError extends Error {
  constructor(resource: string) {
    super(`${resource} not found`);
    this.name = 'NotFoundError';
  }
}
```

### Validación de Datos

#### Zod Schemas
```typescript
// lib/validation/schemas.ts
import { z } from 'zod';

export const UpdateUserProfileSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2).max(50),
  alias: z.string().regex(/^[a-zA-Z0-9_-]+$/).optional(),
});
```

### Seguridad

#### Principios de Seguridad
- **Autenticación**: Verificación de tokens en cada request
- **Autorización**: Validación de permisos por rol
- **Validación**: Sanitización de inputs del usuario
- **Rate Limiting**: Protección contra abuso
- **HTTPS**: Comunicación encriptada

#### Mejores Prácticas
- Nunca loggear información sensible
- Usar prepared statements (Prisma los maneja automáticamente)
- Validar y sanitizar todos los inputs
- Implementar timeouts en operaciones externas

### Performance

#### Optimizaciones Implementadas
- **Caché**: Redis para resultados de IA
- **Lazy Loading**: Componentes cargados bajo demanda
- **Image Optimization**: Next.js Image component
- **Database Indexing**: Índices en campos frecuentemente consultados

#### Monitoreo
- Logs estructurados para debugging
- Métricas de uso de créditos
- Tiempos de respuesta de APIs externas

## Troubleshooting

### Problemas Comunes

#### Error de Base de Datos
```
Error: P1001: Can't reach database server
```
**Solución:**
- Verificar conexión a PostgreSQL
- Revisar `DATABASE_URL` en variables de entorno
- Ejecutar `npm run prisma:migrate`

#### Error de Firebase
```
Firebase: Error (auth/invalid-api-key)
```
**Solución:**
- Verificar configuración de Firebase
- Asegurar que las claves sean de producción
- Revisar dominios autorizados

#### Error de IA
```
Gemini API Error: INVALID_ARGUMENT
```
**Solución:**
- Verificar `GEMINI_API_KEY`
- Revisar formato de imagen
- Verificar límites de quota

#### Problemas de Build
```
Build failed: Module not found
```
**Solución:**
- Ejecutar `npm install`
- Verificar dependencias en `package.json`
- Limpiar cache: `rm -rf .next && npm run build`

### Logs y Debugging

#### Logs de Aplicación
```typescript
// Logging estructurado
await appendLog({
  phase: 'operation_name',
  userId: user?.id,
  error: error?.message,
  timestamp: Date.now(),
});
```

#### Debug Mode
```bash
# Variables de debug
DEBUG=* npm run dev
NODE_ENV=development npm run build
```

### Contacto y Soporte

Para soporte técnico o preguntas sobre desarrollo:
- **Email**: soporte@spartanclub.com
- **Issues**: GitHub Issues del repositorio
- **Documentación**: Esta documentación se mantiene actualizada

---
© 2025 Spartan Club. Todos los derechos reservados.