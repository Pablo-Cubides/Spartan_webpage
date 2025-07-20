#!/usr/bin/env python3
"""
Script completo para configurar todo el entorno de desarrollo
"""

import os
import sys
import subprocess
import time
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def run_command(command, description):
    """Ejecutar comando y mostrar resultado"""
    logger.info(f"🔄 {description}...")
    try:
        result = subprocess.run(command, shell=True, capture_output=True, text=True)
        if result.returncode == 0:
            logger.info(f"✅ {description} completado")
            return True
        else:
            logger.error(f"❌ {description} falló: {result.stderr}")
            return False
    except Exception as e:
        logger.error(f"❌ Error ejecutando {description}: {e}")
        return False

def setup_docker_services():
    """Configurar servicios Docker"""
    logger.info("🚀 Configurando servicios Docker...")
    
    # Detener servicios existentes
    run_command("docker-compose down", "Deteniendo servicios existentes")
    
    # Iniciar servicios
    if run_command("docker-compose up -d db redis", "Iniciando servicios Docker"):
        logger.info("⏳ Esperando que los servicios se inicien...")
        time.sleep(15)  # Esperar 15 segundos
        return True
    return False

def create_env_file():
    """Crear archivo .env si no existe"""
    env_file = ".env"
    if not os.path.exists(env_file):
        logger.info("📝 Creando archivo .env...")
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
        
        with open(env_file, "w") as f:
            f.write(env_content)
        
        logger.info("✅ Archivo .env creado")
    else:
        logger.info("✅ Archivo .env ya existe")

def test_database_connection():
    """Probar conexión a la base de datos"""
    try:
        import psycopg2
        conn = psycopg2.connect(
            host="localhost",
            port=5432,
            database="spartan_market",
            user="spartan_user",
            password="spartan_password"
        )
        conn.close()
        logger.info("✅ Conexión a PostgreSQL exitosa")
        return True
    except Exception as e:
        logger.error(f"❌ Error conectando a PostgreSQL: {e}")
        return False

def create_tables_directly():
    """Crear tablas directamente usando SQLAlchemy"""
    try:
        import asyncio
        from app.core.database import engine, Base
        from app.db.models import User, CreditPackage, Purchase
        
        async def create_tables():
            async with engine.begin() as conn:
                await conn.run_sync(Base.metadata.create_all)
        
        asyncio.run(create_tables())
        logger.info("✅ Tablas creadas exitosamente")
        return True
    except Exception as e:
        logger.error(f"❌ Error creando tablas: {e}")
        return False

def init_credit_packages():
    """Inicializar paquetes de créditos"""
    try:
        import asyncio
        from sqlalchemy import select
        from app.core.database import AsyncSessionLocal
        from app.db.models import CreditPackage
        
        packages = [
            {"name": "Paquete Básico", "credits": 100, "price": 5.00, "is_active": True},
            {"name": "Paquete Estándar", "credits": 500, "price": 20.00, "is_active": True},
            {"name": "Paquete Premium", "credits": 1000, "price": 35.00, "is_active": True},
            {"name": "Paquete Pro", "credits": 2000, "price": 60.00, "is_active": True}
        ]
        
        async def init_packages():
            async with AsyncSessionLocal() as db:
                # Verificar si ya existen paquetes
                stmt = select(CreditPackage)
                result = await db.execute(stmt)
                existing = result.scalars().all()
                
                if existing:
                    logger.info(f"✅ Ya existen {len(existing)} paquetes de créditos")
                    return True
                
                # Crear paquetes
                for package_data in packages:
                    package = CreditPackage(**package_data)
                    db.add(package)
                
                await db.commit()
                logger.info(f"✅ Se crearon {len(packages)} paquetes de créditos")
                return True
        
        asyncio.run(init_packages())
        return True
    except Exception as e:
        logger.error(f"❌ Error inicializando paquetes: {e}")
        return False

def main():
    """Función principal"""
    logger.info("🚀 Configuración completa del entorno de desarrollo...")
    
    # 1. Crear archivo .env
    create_env_file()
    
    # 2. Configurar servicios Docker
    if not setup_docker_services():
        logger.error("❌ No se pudieron configurar los servicios Docker")
        return
    
    # 3. Probar conexión a base de datos
    if not test_database_connection():
        logger.error("❌ No se pudo conectar a la base de datos")
        logger.info("💡 Intenta ejecutar manualmente: docker-compose logs db")
        return
    
    # 4. Crear tablas
    if not create_tables_directly():
        logger.error("❌ No se pudieron crear las tablas")
        return
    
    # 5. Inicializar paquetes de créditos
    if not init_credit_packages():
        logger.error("❌ No se pudieron inicializar los paquetes de créditos")
        return
    
    logger.info("\n🎉 ¡Configuración completada exitosamente!")
    logger.info("\n📋 Próximos pasos:")
    logger.info("1. Inicia el servidor: uvicorn main:app --reload")
    logger.info("2. Accede a la documentación: http://localhost:8000/api/v1/docs")
    logger.info("3. Accede al panel admin: http://localhost:3000/admin")
    logger.info("\n🔧 Para configurar en producción:")
    logger.info("- Actualiza las variables de entorno en .env")
    logger.info("- Configura Cloudflare R2, Firebase y MercadoPago")
    logger.info("- Ejecuta: python scripts/backup_daily.py")

if __name__ == "__main__":
    main() 