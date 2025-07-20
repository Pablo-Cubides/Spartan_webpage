#!/usr/bin/env python3
"""
Script para configurar PostgreSQL con las credenciales correctas
"""

import psycopg2
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def setup_postgres():
    """Configurar PostgreSQL con las credenciales correctas"""
    try:
        # Intentar conectar con credenciales por defecto
        logger.info("🔍 Intentando conectar a PostgreSQL...")
        
        # Primero intentar con postgres/postgres
        try:
            conn = psycopg2.connect(
                host="localhost",
                port=5432,
                database="postgres",
                user="postgres",
                password="postgres"
            )
            logger.info("✅ Conexión exitosa con postgres/postgres")
        except:
            # Intentar con postgres sin contraseña
            try:
                conn = psycopg2.connect(
                    host="localhost",
                    port=5432,
                    database="postgres",
                    user="postgres",
                    password=""
                )
                logger.info("✅ Conexión exitosa con postgres sin contraseña")
            except:
                # Intentar con spartan_user/spartan_password
                try:
                    conn = psycopg2.connect(
                        host="localhost",
                        port=5432,
                        database="spartan_market",
                        user="spartan_user",
                        password="spartan_password"
                    )
                    logger.info("✅ Conexión exitosa con spartan_user/spartan_password")
                except Exception as e:
                    logger.error(f"❌ No se pudo conectar a PostgreSQL: {e}")
                    return False
        
        # Verificar conexión
        cur = conn.cursor()
        cur.execute("SELECT version();")
        version = cur.fetchone()
        logger.info(f"✅ PostgreSQL version: {version[0]}")
        
        # Crear usuario spartan_user si no existe
        try:
            cur.execute("SELECT 1 FROM pg_roles WHERE rolname='spartan_user'")
            user_exists = cur.fetchone()
            
            if not user_exists:
                logger.info("📝 Creando usuario spartan_user...")
                cur.execute("CREATE USER spartan_user WITH PASSWORD 'spartan_password'")
                logger.info("✅ Usuario spartan_user creado")
            else:
                logger.info("✅ Usuario spartan_user ya existe")
            
            # Crear base de datos spartan_market si no existe
            cur.execute("SELECT 1 FROM pg_database WHERE datname='spartan_market'")
            db_exists = cur.fetchone()
            
            if not db_exists:
                logger.info("📝 Creando base de datos spartan_market...")
                cur.execute("CREATE DATABASE spartan_market OWNER spartan_user")
                logger.info("✅ Base de datos spartan_market creada")
            else:
                logger.info("✅ Base de datos spartan_market ya existe")
            
            # Dar permisos al usuario
            cur.execute("GRANT ALL PRIVILEGES ON DATABASE spartan_market TO spartan_user")
            logger.info("✅ Permisos otorgados a spartan_user")
            
            conn.commit()
            cur.close()
            conn.close()
            
            logger.info("✅ PostgreSQL configurado correctamente")
            return True
            
        except Exception as e:
            logger.error(f"❌ Error configurando PostgreSQL: {e}")
            return False
            
    except Exception as e:
        logger.error(f"❌ Error general: {e}")
        return False

def test_connection():
    """Probar conexión con las credenciales finales"""
    try:
        conn = psycopg2.connect(
            host="localhost",
            port=5432,
            database="spartan_market",
            user="spartan_user",
            password="spartan_password"
        )
        
        cur = conn.cursor()
        cur.execute("SELECT 1")
        result = cur.fetchone()
        
        cur.close()
        conn.close()
        
        logger.info("✅ Conexión de prueba exitosa")
        return True
        
    except Exception as e:
        logger.error(f"❌ Error en conexión de prueba: {e}")
        return False

def main():
    """Función principal"""
    logger.info("🚀 Configurando PostgreSQL...")
    
    if setup_postgres():
        logger.info("✅ PostgreSQL configurado correctamente")
        
        if test_connection():
            logger.info("✅ Conexión verificada correctamente")
            logger.info("\n📋 Próximos pasos:")
            logger.info("1. Ejecuta: python scripts/create_tables.py")
            logger.info("2. Inicia el servidor: uvicorn main:app --reload")
        else:
            logger.error("❌ Error verificando conexión")
    else:
        logger.error("❌ Error configurando PostgreSQL")

if __name__ == "__main__":
    main() 