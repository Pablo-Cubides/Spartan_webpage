-- =============================================================================
-- BACKUP REFERENCE: init-db.sql de backend_legacy
-- =============================================================================
-- Este archivo contiene las configuraciones iniciales de la base de datos
-- PostgreSQL del sistema legacy.
--
-- Guardado el: 2025-11-18
--
-- NOTA: En Vercel + Prisma, los índices se manejan automáticamente a través
-- de las migraciones de Prisma. Este archivo es solo para referencia.
-- =============================================================================

-- =============================================================================
-- EXTENSIONES NECESARIAS
-- =============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- =============================================================================
-- ÍNDICES PARA USUARIOS
-- =============================================================================
-- Optimización de búsquedas por UID, alias, ubicación y género
CREATE INDEX IF NOT EXISTS idx_user_profiles_uid ON user_profiles(uid);
CREATE INDEX IF NOT EXISTS idx_user_profiles_alias ON user_profiles(alias);
CREATE INDEX IF NOT EXISTS idx_user_profiles_location ON user_profiles(location);
CREATE INDEX IF NOT EXISTS idx_user_profiles_gender ON user_profiles(gender);

-- =============================================================================
-- ÍNDICES PARA BLOG
-- =============================================================================
-- Optimización de búsquedas por slug, estado de publicación y fechas
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON blog_posts(published);
CREATE INDEX IF NOT EXISTS idx_blog_posts_created_at ON blog_posts(created_at);

-- Índices para likes de posts
CREATE INDEX IF NOT EXISTS idx_post_likes_post_id ON post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_user_id ON post_likes(user_id);

-- =============================================================================
-- ÍNDICES PARA PAGOS Y COMPRAS
-- =============================================================================
-- Optimización de búsquedas por usuario y estado
CREATE INDEX IF NOT EXISTS idx_user_purchases_user_id ON user_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_user_purchases_status ON user_purchases(status);
CREATE INDEX IF NOT EXISTS idx_user_purchases_created_at ON user_purchases(created_at);

-- =============================================================================
-- ÍNDICES PARA A/B TESTING
-- =============================================================================
-- Optimización de búsquedas de tests y resultados
CREATE INDEX IF NOT EXISTS idx_ab_tests_name ON ab_tests(name);
CREATE INDEX IF NOT EXISTS idx_ab_tests_status ON ab_tests(status);
CREATE INDEX IF NOT EXISTS idx_ab_test_results_test_id ON ab_test_results(test_id);
CREATE INDEX IF NOT EXISTS idx_ab_test_results_user_id ON ab_test_results(user_id);

-- =============================================================================
-- CONFIGURACIÓN GLOBAL
-- =============================================================================
SET timezone = 'UTC';

-- =============================================================================
-- CONFIGURACIÓN DE USUARIO (OPCIONAL)
-- =============================================================================
-- Descomentar si se necesita crear un usuario específico para la aplicación
-- CREATE USER spartan_app WITH PASSWORD 'spartan_password';
-- GRANT ALL PRIVILEGES ON DATABASE spartan_market TO spartan_app;
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO spartan_app;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO spartan_app;

-- =============================================================================
-- NOTAS PARA EL NUEVO SISTEMA (Vercel + Prisma)
-- =============================================================================
-- En el nuevo sistema:
--
-- 1. Las extensiones (uuid-ossp, pg_trgm) se pueden crear manualmente en Supabase
--    si se necesitan
--
-- 2. Los índices se definen en el schema.prisma con:
--    @index([field_name])
--
-- 3. Ejemplo en Prisma:
--    model User {
--      id    Int     @id @default(autoincrement())
--      uid   String  @unique
--      @@index([uid])
--    }
--
-- 4. Las migraciones se aplican con: prisma migrate deploy
-- =============================================================================
