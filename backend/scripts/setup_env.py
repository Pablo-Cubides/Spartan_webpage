#!/usr/bin/env python3
"""
Script para configurar las variables de entorno automáticamente
"""

import os
import shutil
from pathlib import Path

def setup_environment():
    """Configurar archivo .env para desarrollo"""
    
    # Verificar si existe .env
    env_file = Path(".env")
    env_example = Path("env.example")
    
    if env_file.exists():
        print("✅ Archivo .env ya existe")
        return
    
    if not env_example.exists():
        print("❌ Archivo env.example no encontrado")
        return
    
    # Copiar env.example a .env
    try:
        shutil.copy(env_example, env_file)
        print("✅ Archivo .env creado desde env.example")
        print("📝 Recuerda configurar las variables específicas para tu entorno")
        
    except Exception as e:
        print(f"❌ Error creando archivo .env: {str(e)}")

def check_required_services():
    """Verificar servicios requeridos"""
    
    print("\n🔍 Verificando servicios requeridos...")
    
    # Verificar PostgreSQL
    try:
        import psycopg2
        print("✅ psycopg2 disponible")
    except ImportError:
        print("❌ psycopg2 no instalado. Ejecuta: pip install psycopg2-binary")
    
    # Verificar Redis
    try:
        import redis
        print("✅ redis disponible")
    except ImportError:
        print("❌ redis no instalado. Ejecuta: pip install redis")
    
    # Verificar boto3
    try:
        import boto3
        print("✅ boto3 disponible")
    except ImportError:
        print("❌ boto3 no instalado. Ejecuta: pip install boto3")
    
    # Verificar Firebase
    try:
        import firebase_admin
        print("✅ firebase-admin disponible")
    except ImportError:
        print("❌ firebase-admin no instalado. Ejecuta: pip install firebase-admin")

def main():
    """Función principal"""
    print("🚀 Configurando entorno de desarrollo...")
    
    # Configurar .env
    setup_environment()
    
    # Verificar servicios
    check_required_services()
    
    print("\n📋 Próximos pasos:")
    print("1. Configura las variables de entorno en .env")
    print("2. Ejecuta: alembic upgrade head")
    print("3. Ejecuta: python scripts/init_credit_packages.py")
    print("4. Inicia el servidor: uvicorn main:app --reload")

if __name__ == "__main__":
    main() 