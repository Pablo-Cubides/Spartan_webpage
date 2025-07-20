#!/usr/bin/env python3
"""
Script para inicializar los paquetes de créditos básicos
"""

import asyncio
import sys
import os
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

# Añadir el directorio raíz al path
sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from app.core.database import get_db_session
from app.db.models import CreditPackage

async def init_credit_packages():
    """Inicializar paquetes de créditos básicos"""
    
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
    
    async with get_db_session() as db:
        try:
            # Verificar si ya existen paquetes
            stmt = select(CreditPackage)
            result = await db.execute(stmt)
            existing_packages = result.scalars().all()
            
            if existing_packages:
                print(f"Ya existen {len(existing_packages)} paquetes de créditos")
                for pkg in existing_packages:
                    print(f"  - {pkg.name}: {pkg.credits} créditos por ${pkg.price}")
                return
            
            # Crear paquetes básicos
            for package_data in packages:
                package = CreditPackage(**package_data)
                db.add(package)
                print(f"Creando paquete: {package_data['name']}")
            
            await db.commit()
            print(f"✅ Se crearon {len(packages)} paquetes de créditos básicos")
            
            # Mostrar paquetes creados
            stmt = select(CreditPackage)
            result = await db.execute(stmt)
            created_packages = result.scalars().all()
            
            print("\nPaquetes disponibles:")
            for pkg in created_packages:
                print(f"  - {pkg.name}: {pkg.credits} créditos por ${pkg.price}")
                
        except Exception as e:
            print(f"❌ Error inicializando paquetes de créditos: {str(e)}")
            await db.rollback()
            raise

if __name__ == "__main__":
    asyncio.run(init_credit_packages()) 