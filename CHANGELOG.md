# Changelog - Spartan Club

Todos los cambios notables del proyecto serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es/1.0.0/),
y este proyecto adhiere a [Semantic Versioning](https://semver.org/lang/es/).

---

## [1.1.0] - Diciembre 2025

### ✨ Nuevas Características

#### Pagos
- **Stripe Integration**: Nueva pasarela de pago para pagos internacionales (USD)
  - Endpoint: `/api/credits/buy-stripe`
  - Webhook: `/api/payments/stripe/webhook`
  - Soporte para 46+ países
  - Conversión automática COP → USD

#### Coach Espartano
- **Migración a Gemini**: Coach IA ahora usa Google Gemini (`gemini-1.5-flash`)
- **5 Coaches Especializados**:
  - Coach General (guía principal)
  - Cuerpo Espartano (fitness y nutrición)
  - Estilo Espartano (imagen personal)
  - Mentalidad Espartana (disciplina mental)
  - Productividad Espartana (gestión del tiempo)
- **Sistema de créditos**: 5 mensajes por crédito
- **Encriptación de mensajes**: AES-256-GCM en base de datos

### 🐛 Correcciones

- **Coach Chat**: Input ahora se habilita correctamente después del video de bienvenida
- **Onboarding**: Reducido mínimo de caracteres de 50 a 10
- **Profile Edit**: Corregido error de valor null en formulario de edición
- **Firebase Auth**: Mensajes de error en español

### 🔧 Cambios Técnicos

- Removida dependencia de OpenAI (coach usa Gemini)
- Añadidos paquetes: `stripe`, `@stripe/stripe-js`
- Nuevas variables de entorno para Stripe

---

## [1.0.0] - Noviembre 2025

### ✨ Lanzamiento Inicial

#### Herramientas de IA
- **Asesor de Estilo**: Análisis de imagen con Google Gemini
- **Asesor de Forma de Cara**: Recomendaciones de cortes y barba

#### Sistema de Monetización
- **Sistema de Créditos**: Modelo freemium
- **MercadoPago**: Pagos para LATAM (COP, ARS, BRL, etc.)
- **Paquetes**: Iniciación (5), Guerrero (20), Leónidas (100)

#### Contenido
- **Blog CMS**: Sistema de gestión de artículos
- **Newsletter**: Suscripción con cumplimiento GDPR
- **Comentarios**: Sistema con moderación

#### Infraestructura
- **Firebase Auth**: Autenticación con Email/Password y Google
- **PostgreSQL + Prisma**: Base de datos relacional
- **Cloudinary**: Almacenamiento de imágenes
- **Upstash Redis**: Cache y rate limiting
- **Vercel**: Deployment serverless

#### SEO
- Sitemap dinámico
- robots.txt configurado
- Schema JSON-LD
- Open Graph y Twitter Cards

---

## Próximas Versiones

### [1.2.0] - Planificado

- [ ] Integración con Apple Pay/Google Pay
- [ ] Historial de conversaciones del coach
- [ ] Dashboard de progreso personal
- [ ] Notificaciones push
- [ ] Modo oscuro

---

*Para reportar bugs o sugerir features, visita [GitHub Issues](https://github.com/Pablo-Cubides/Spartan/issues)*
