-- =============================================================================
-- SPARTAN MARKET API - DATABASE INITIALIZATION
-- =============================================================================

-- Crear extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Crear índices para optimización
CREATE INDEX IF NOT EXISTS idx_user_profiles_uid ON user_profiles(uid);
CREATE INDEX IF NOT EXISTS idx_user_profiles_alias ON user_profiles(alias);
CREATE INDEX IF NOT EXISTS idx_user_profiles_location ON user_profiles(location);
CREATE INDEX IF NOT EXISTS idx_user_profiles_gender ON user_profiles(gender);

-- Crear índices para blog
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON blog_posts(published);
CREATE INDEX IF NOT EXISTS idx_blog_posts_created_at ON blog_posts(created_at);
CREATE INDEX IF NOT EXISTS idx_post_likes_post_id ON post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_user_id ON post_likes(user_id);

-- Crear índices para pagos
CREATE INDEX IF NOT EXISTS idx_user_purchases_user_id ON user_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_user_purchases_status ON user_purchases(status);
CREATE INDEX IF NOT EXISTS idx_user_purchases_created_at ON user_purchases(created_at);

-- Crear índices para A/B testing
CREATE INDEX IF NOT EXISTS idx_ab_tests_name ON ab_tests(name);
CREATE INDEX IF NOT EXISTS idx_ab_tests_status ON ab_tests(status);
CREATE INDEX IF NOT EXISTS idx_ab_test_results_test_id ON ab_test_results(test_id);
CREATE INDEX IF NOT EXISTS idx_ab_test_results_user_id ON ab_test_results(user_id);

-- Configurar timezone
SET timezone = 'UTC';

-- Crear usuario para la aplicación (opcional)
-- CREATE USER spartan_app WITH PASSWORD 'spartan_password';
-- GRANT ALL PRIVILEGES ON DATABASE spartan_market TO spartan_app;
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO spartan_app;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO spartan_app; 