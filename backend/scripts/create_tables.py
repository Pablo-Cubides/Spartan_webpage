#!/usr/bin/env python3
"""
Script para crear las tablas directamente usando SQLAlchemy
"""

import asyncio
import sys
import os

# Añadir el directorio raíz al path
sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from app.core.database import engine, Base
from app.db.models import User, CreditPackage, Purchase
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def create_tables():
    """Crear todas las tablas usando SQLAlchemy"""
    try:
        logger.info("🚀 Creando tablas de base de datos...")
        
        # Importar todos los modelos para que SQLAlchemy los registre
        from app.db.models import User, CreditPackage, Purchase
        
        async with engine.begin() as conn:
            # Crear todas las tablas
            await conn.run_sync(Base.metadata.create_all)
        
        logger.info("✅ Tablas creadas exitosamente")
        return True
        
    except Exception as e:
        logger.error(f"❌ Error creando tablas: {str(e)}")
        return False

async def init_credit_packages():
    """Inicializar paquetes de créditos básicos"""
    try:
        from sqlalchemy.ext.asyncio import AsyncSession
        from sqlalchemy import select
        from app.core.database import AsyncSessionLocal
        from app.db.models import CreditPackage
        
        # Paquetes básicos a crear
        packages = [
            {
                "name": "Paquete Básico",
                "credits": 100,
                "price": 5.00,
                "is_active": True
            },
            {
                "name": "Paquete Estándar", 
                "credits": 500,
                "price": 20.00,
                "is_active": True
            },
            {
                "name": "Paquete Premium",
                "credits": 1000,
                "price": 35.00,
                "is_active": True
            },
            {
                "name": "Paquete Pro",
                "credits": 2000,
                "price": 60.00,
                "is_active": True
            }
        ]
        
        async with AsyncSessionLocal() as db:
            # Verificar si ya existen paquetes
            stmt = select(CreditPackage)
            result = await db.execute(stmt)
            existing_packages = result.scalars().all()
            
            if existing_packages:
                logger.info(f"Ya existen {len(existing_packages)} paquetes de créditos")
                for pkg in existing_packages:
                    logger.info(f"  - {pkg.name}: {pkg.credits} créditos por ${pkg.price}")
                return True
            
            # Crear paquetes básicos
            for package_data in packages:
                package = CreditPackage(**package_data)
                db.add(package)
                logger.info(f"Creando paquete: {package_data['name']}")
            
            await db.commit()
            logger.info(f"✅ Se crearon {len(packages)} paquetes de créditos básicos")
            
            # Mostrar paquetes creados
            stmt = select(CreditPackage)
            result = await db.execute(stmt)
            created_packages = result.scalars().all()
            
            logger.info("\nPaquetes disponibles:")
            for pkg in created_packages:
                logger.info(f"  - {pkg.name}: {pkg.credits} créditos por ${pkg.price}")
                
        return True
                
    except Exception as e:
        logger.error(f"❌ Error inicializando paquetes de créditos: {str(e)}")
        return False

async def main():
    """Función principal"""
    logger.info("🔧 Configurando base de datos...")
    
    # Crear tablas
    if await create_tables():
        logger.info("✅ Tablas creadas correctamente")
        
        # Inicializar paquetes de créditos
        if await init_credit_packages():
            logger.info("✅ Paquetes de créditos inicializados correctamente")
        else:
            logger.error("❌ Error inicializando paquetes de créditos")
    else:
        logger.error("❌ Error creando tablas")
        return
    
    logger.info("\n🎉 Configuración completada exitosamente!")
    logger.info("📋 Próximos pasos:")
    logger.info("1. Inicia el servidor: uvicorn main:app --reload")
    logger.info("2. Accede a la documentación: http://localhost:8000/api/v1/docs")

if __name__ == "__main__":
    asyncio.run(main()) 