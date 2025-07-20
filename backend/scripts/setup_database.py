#!/usr/bin/env python3
"""
Script para verificar y configurar la base de datos PostgreSQL
"""

import os
import sys
import psycopg2
from psycopg2 import OperationalError
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def check_postgresql_connection():
    """Verificar conexión a PostgreSQL"""
    try:
        # Obtener variables de entorno
        db_host = os.getenv("DB_HOST", "localhost")
        db_port = os.getenv("DB_PORT", "5432")
        db_name = os.getenv("DB_NAME", "spartan_market")
        db_user = os.getenv("DB_USER", "spartan_user")
        db_password = os.getenv("DB_PASSWORD", "spartan_password")
        
        # Intentar conectar
        conn = psycopg2.connect(
            host=db_host,
            port=db_port,
            database=db_name,
            user=db_user,
            password=db_password
        )
        
        # Verificar conexión
        cur = conn.cursor()
        cur.execute("SELECT version();")
        version = cur.fetchone()
        
        cur.close()
        conn.close()
        
        logger.info(f"✅ Conexión exitosa a PostgreSQL: {version[0]}")
        return True
        
    except OperationalError as e:
        logger.error(f"❌ Error de conexión a PostgreSQL: {e}")
        return False
    except Exception as e:
        logger.error(f"❌ Error inesperado: {e}")
        return False

def create_database():
    """Crear base de datos si no existe"""
    try:
        # Conectar a PostgreSQL sin especificar base de datos
        db_host = os.getenv("DB_HOST", "localhost")
        db_port = os.getenv("DB_PORT", "5432")
        db_user = os.getenv("DB_USER", "spartan_user")
        db_password = os.getenv("DB_PASSWORD", "spartan_password")
        db_name = os.getenv("DB_NAME", "spartan_market")
        
        # Conectar a postgres (base de datos por defecto)
        conn = psycopg2.connect(
            host=db_host,
            port=db_port,
            database="postgres",
            user=db_user,
            password=db_password
        )
        
        conn.autocommit = True
        cur = conn.cursor()
        
        # Verificar si la base de datos existe
        cur.execute("SELECT 1 FROM pg_database WHERE datname = %s", (db_name,))
        exists = cur.fetchone()
        
        if not exists:
            logger.info(f"📝 Creando base de datos '{db_name}'...")
            cur.execute(f"CREATE DATABASE {db_name}")
            logger.info(f"✅ Base de datos '{db_name}' creada exitosamente")
        else:
            logger.info(f"✅ Base de datos '{db_name}' ya existe")
        
        cur.close()
        conn.close()
        return True
        
    except Exception as e:
        logger.error(f"❌ Error creando base de datos: {e}")
        return False

def check_docker_compose():
    """Verificar si Docker Compose está disponible"""
    try:
        import subprocess
        result = subprocess.run(["docker", "--version"], capture_output=True, text=True)
        if result.returncode == 0:
            logger.info("✅ Docker está disponible")
            
            # Verificar si hay un docker-compose.yml
            if os.path.exists("docker-compose.yml"):
                logger.info("✅ docker-compose.yml encontrado")
                return True
            else:
                logger.warning("⚠️  docker-compose.yml no encontrado")
                return False
        else:
            logger.warning("⚠️  Docker no está disponible")
            return False
    except Exception as e:
        logger.warning(f"⚠️  No se pudo verificar Docker: {e}")
        return False

def start_docker_services():
    """Iniciar servicios con Docker Compose"""
    try:
        import subprocess
        logger.info("🚀 Iniciando servicios con Docker Compose...")
        
        result = subprocess.run(
            ["docker-compose", "up", "-d", "db", "redis"],
            capture_output=True,
            text=True
        )
        
        if result.returncode == 0:
            logger.info("✅ Servicios iniciados exitosamente")
            return True
        else:
            logger.error(f"❌ Error iniciando servicios: {result.stderr}")
            return False
            
    except Exception as e:
        logger.error(f"❌ Error con Docker Compose: {e}")
        return False

def main():
    """Función principal"""
    logger.info("🔍 Verificando configuración de base de datos...")
    
    # Verificar Docker Compose
    if check_docker_compose():
        logger.info("📋 Opciones disponibles:")
        logger.info("1. Iniciar servicios con Docker Compose")
        logger.info("2. Configurar PostgreSQL manualmente")
        
        choice = input("Selecciona una opción (1/2): ").strip()
        
        if choice == "1":
            if start_docker_services():
                # Esperar un momento para que los servicios se inicien
                import time
                logger.info("⏳ Esperando que los servicios se inicien...")
                time.sleep(10)
            else:
                logger.error("❌ No se pudieron iniciar los servicios")
                return
        else:
            logger.info("📝 Configura PostgreSQL manualmente y ejecuta este script nuevamente")
            return
    
    # Crear base de datos
    if create_database():
        # Verificar conexión
        if check_postgresql_connection():
            logger.info("✅ Base de datos configurada correctamente")
            logger.info("📋 Próximos pasos:")
            logger.info("1. Ejecuta: alembic upgrade head")
            logger.info("2. Ejecuta: python scripts/init_credit_packages.py")
        else:
            logger.error("❌ No se pudo conectar a la base de datos")
    else:
        logger.error("❌ No se pudo configurar la base de datos")

if __name__ == "__main__":
    main() 