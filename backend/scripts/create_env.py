#!/usr/bin/env python3
"""
Script para crear el archivo .env con las variables correctas para Docker
"""

import os
from pathlib import Path

def create_env_file():
    """Crear archivo .env con las variables correctas"""
    
    env_content = """# =============================================================================
# SPARTAN MARKET API - DESARROLLO
# =============================================================================

# =============================================================================
# DOCKER COMPOSE VARIABLES
# =============================================================================
POSTGRES_USER=spartan_user
POSTGRES_PASSWORD=spartan_password
POSTGRES_DB=spartan_market

# =============================================================================
# BASE DE DATOS
# =============================================================================
DB_HOST=localhost
DB_PORT=5432
DB_NAME=spartan_market
DB_USER=spartan_user
DB_PASSWORD=spartan_password
DATABASE_URL=postgresql://spartan_user:spartan_password@localhost:5432/spartan_market

# =============================================================================
# REDIS
# =============================================================================
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_URL=redis://localhost:6379/0

# =============================================================================
# CLOUDFLARE R2 (STORAGE) - CONFIGURAR EN PRODUCCIÓN
# =============================================================================
R2_ENDPOINT_URL=https://your-account-id.r2.cloudflarestorage.com
R2_ACCESS_KEY_ID=your-access-key-id
R2_SECRET_ACCESS_KEY=your-secret-access-key
R2_BUCKET_NAME=spartan-avatars
R2_BACKUP_BUCKET_NAME=spartan-backups

# =============================================================================
# FIREBASE (AUTHENTICATION) - CONFIGURAR EN PRODUCCIÓN
# =============================================================================
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\nYOUR_PRIVATE_KEY\\n-----END PRIVATE KEY-----\\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com

# =============================================================================
# MERCADOPAGO - CONFIGURAR EN PRODUCCIÓN
# =============================================================================
MERCADOPAGO_ACCESS_TOKEN=your-mercadopago-access-token
MERCADOPAGO_PUBLIC_KEY=your-mercadopago-public-key

# =============================================================================
# SENDINBLUE (EMAIL) - CONFIGURAR EN PRODUCCIÓN
# =============================================================================
SENDINBLUE_API_KEY=your-sendinblue-api-key
SENDINBLUE_SMTP_KEY=your-sendinblue-smtp-key

# =============================================================================
# SENTRY (MONITORING) - CONFIGURAR EN PRODUCCIÓN
# =============================================================================
SENTRY_DSN=your-sentry-dsn

# =============================================================================
# APP CONFIGURATION
# =============================================================================
ENVIRONMENT=development
DEBUG=true
LOG_LEVEL=INFO
API_VERSION=v1
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000

# =============================================================================
# SECURITY
# =============================================================================
SECRET_KEY=dev-secret-key-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# =============================================================================
# RATE LIMITING
# =============================================================================
RATE_LIMIT_REQUESTS=100
RATE_LIMIT_WINDOW=3600
"""
    
    env_file = Path(".env")
    
    if env_file.exists():
        print("✅ Archivo .env ya existe")
        return
    
    try:
        with open(env_file, "w") as f:
            f.write(env_content)
        
        print("✅ Archivo .env creado exitosamente")
        print("📝 Variables de entorno configuradas para desarrollo")
        
    except Exception as e:
        print(f"❌ Error creando archivo .env: {str(e)}")

def main():
    """Función principal"""
    print("🚀 Configurando variables de entorno...")
    create_env_file()
    print("\n📋 Próximos pasos:")
    print("1. Reinicia los servicios: docker-compose down && docker-compose up -d db redis")
    print("2. Ejecuta: alembic upgrade head")
    print("3. Ejecuta: python scripts/init_credit_packages.py")

if __name__ == "__main__":
    main() 