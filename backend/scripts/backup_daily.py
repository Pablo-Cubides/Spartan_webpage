#!/usr/bin/env python3
"""
Script de backup diario para PostgreSQL y Redis
Genera backups comprimidos y los sube a Cloudflare R2
"""

import os
import sys
import subprocess
import tarfile
import tempfile
from datetime import datetime, timedelta
import boto3
import logging
from pathlib import Path

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Configuración de R2
R2_ENDPOINT_URL = os.getenv("R2_ENDPOINT_URL")
R2_ACCESS_KEY_ID = os.getenv("R2_ACCESS_KEY_ID")
R2_SECRET_ACCESS_KEY = os.getenv("R2_SECRET_ACCESS_KEY")
R2_BUCKET_NAME = os.getenv("R2_BUCKET_NAME", "spartan-backups")

# Configuración de base de datos
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "5432")
DB_NAME = os.getenv("DB_NAME", "spartan_db")
DB_USER = os.getenv("DB_USER", "postgres")
DB_PASSWORD = os.getenv("DB_PASSWORD", "password")

# Configuración de Redis
REDIS_HOST = os.getenv("REDIS_HOST", "localhost")
REDIS_PORT = os.getenv("REDIS_PORT", "6379")
REDIS_PASSWORD = os.getenv("REDIS_PASSWORD", "")

# Cliente R2
r2_client = boto3.client(
    's3',
    endpoint_url=R2_ENDPOINT_URL,
    aws_access_key_id=R2_ACCESS_KEY_ID,
    aws_secret_access_key=R2_SECRET_ACCESS_KEY,
    region_name='auto'
)

def backup_postgresql():
    """Generar backup de PostgreSQL"""
    try:
        logger.info("Iniciando backup de PostgreSQL...")
        
        # Crear directorio temporal
        with tempfile.TemporaryDirectory() as temp_dir:
            backup_file = os.path.join(temp_dir, f"backup-postgres-{datetime.now().strftime('%Y%m%d')}.sql")
            
            # Comando pg_dump
            cmd = [
                "pg_dump",
                f"--host={DB_HOST}",
                f"--port={DB_PORT}",
                f"--username={DB_USER}",
                f"--dbname={DB_NAME}",
                "--verbose",
                "--clean",
                "--no-owner",
                "--no-privileges",
                f"--file={backup_file}"
            ]
            
            # Configurar variable de entorno para la contraseña
            env = os.environ.copy()
            env["PGPASSWORD"] = DB_PASSWORD
            
            # Ejecutar pg_dump
            result = subprocess.run(cmd, env=env, capture_output=True, text=True)
            
            if result.returncode != 0:
                logger.error(f"Error en pg_dump: {result.stderr}")
                return None
            
            logger.info(f"Backup PostgreSQL creado: {backup_file}")
            
            # Comprimir archivo
            compressed_file = f"{backup_file}.tar.gz"
            with tarfile.open(compressed_file, "w:gz") as tar:
                tar.add(backup_file, arcname=os.path.basename(backup_file))
            
            logger.info(f"Backup PostgreSQL comprimido: {compressed_file}")
            return compressed_file
            
    except Exception as e:
        logger.error(f"Error generando backup PostgreSQL: {str(e)}")
        return None

def backup_redis():
    """Generar backup de Redis"""
    try:
        logger.info("Iniciando backup de Redis...")
        
        # Crear directorio temporal
        with tempfile.TemporaryDirectory() as temp_dir:
            backup_file = os.path.join(temp_dir, f"backup-redis-{datetime.now().strftime('%Y%m%d')}.rdb")
            
            # Conectar a Redis y ejecutar SAVE
            import redis
            
            redis_client = redis.Redis(
                host=REDIS_HOST,
                port=int(REDIS_PORT),
                password=REDIS_PASSWORD if REDIS_PASSWORD else None,
                decode_responses=False
            )
            
            # Ejecutar SAVE para generar snapshot
            redis_client.save()
            
            # Obtener la ruta del archivo RDB
            rdb_path = redis_client.config_get("dir")["dir"] + "/dump.rdb"
            
            # Copiar archivo RDB
            import shutil
            shutil.copy2(rdb_path, backup_file)
            
            logger.info(f"Backup Redis creado: {backup_file}")
            
            # Comprimir archivo
            compressed_file = f"{backup_file}.tar.gz"
            with tarfile.open(compressed_file, "w:gz") as tar:
                tar.add(backup_file, arcname=os.path.basename(backup_file))
            
            logger.info(f"Backup Redis comprimido: {compressed_file}")
            return compressed_file
            
    except Exception as e:
        logger.error(f"Error generando backup Redis: {str(e)}")
        return None

def upload_to_r2(file_path, object_key):
    """Subir archivo a R2"""
    try:
        logger.info(f"Subiendo {file_path} a R2...")
        
        with open(file_path, 'rb') as f:
            r2_client.upload_fileobj(f, R2_BUCKET_NAME, object_key)
        
        logger.info(f"Archivo subido exitosamente: {object_key}")
        return True
        
    except Exception as e:
        logger.error(f"Error subiendo archivo a R2: {str(e)}")
        return False

def cleanup_old_backups():
    """Eliminar backups antiguos (más de 7 días)"""
    try:
        logger.info("Limpiando backups antiguos...")
        
        # Listar objetos en R2
        response = r2_client.list_objects_v2(Bucket=R2_BUCKET_NAME)
        
        cutoff_date = datetime.now() - timedelta(days=7)
        
        for obj in response.get('Contents', []):
            # Extraer fecha del nombre del archivo
            filename = obj['Key']
            if 'backup-' in filename and '.tar.gz' in filename:
                try:
                    # Extraer fecha del nombre (formato: backup-{type}-YYYYMMDD.tar.gz)
                    date_str = filename.split('-')[-1].replace('.tar.gz', '')
                    file_date = datetime.strptime(date_str, '%Y%m%d')
                    
                    if file_date < cutoff_date:
                        logger.info(f"Eliminando backup antiguo: {filename}")
                        r2_client.delete_object(Bucket=R2_BUCKET_NAME, Key=filename)
                        
                except ValueError:
                    logger.warning(f"No se pudo parsear fecha del archivo: {filename}")
                    continue
        
        logger.info("Limpieza de backups completada")
        
    except Exception as e:
        logger.error(f"Error limpiando backups antiguos: {str(e)}")

def main():
    """Función principal"""
    logger.info("Iniciando proceso de backup diario...")
    
    # Generar backups
    postgres_backup = backup_postgresql()
    redis_backup = backup_redis()
    
    # Subir a R2 si se generaron correctamente
    if postgres_backup:
        object_key = f"backups/{os.path.basename(postgres_backup)}"
        upload_to_r2(postgres_backup, object_key)
    
    if redis_backup:
        object_key = f"backups/{os.path.basename(redis_backup)}"
        upload_to_r2(redis_backup, object_key)
    
    # Limpiar backups antiguos
    cleanup_old_backups()
    
    logger.info("Proceso de backup diario completado")

if __name__ == "__main__":
    main() 