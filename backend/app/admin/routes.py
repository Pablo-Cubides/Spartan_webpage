from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel

from ..core.firebase_auth import get_current_user
from ..core.database import get_db
from ..db.models import User, Purchase, CreditPackage
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/admin", tags=["Admin"])

class AdminUserResponse(BaseModel):
    id: int
    uid: str
    email: str
    name: str
    alias: str
    credits: int
    avatar_id: str = None
    created_at: str

class AdminPurchaseResponse(BaseModel):
    id: int
    user_id: int
    package_id: int
    amount_paid: float
    credits_received: int
    payment_method: str
    status: str
    created_at: str

def check_admin_permissions(current_user: Dict[str, Any]) -> bool:
    """Verificar si el usuario tiene permisos de administrador"""
    # Verificar si el email es de administrador
    admin_emails = [
        'admin@spartan.com',
        'pablo@spartan.com'
    ]
    
    # También permitir emails que terminen en @spartan.com
    is_admin = (
        current_user.get('email') in admin_emails or
        current_user.get('email', '').endswith('@spartan.com')
    )
    
    if not is_admin:
        raise HTTPException(
            status_code=403,
            detail="Acceso denegado. Se requieren permisos de administrador."
        )
    
    return True

@router.get("/users", response_model=List[AdminUserResponse])
async def get_all_users(
    current_user: Dict[str, Any] = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Obtener todos los usuarios (solo administradores)
    """
    try:
        # Verificar permisos de administrador
        check_admin_permissions(current_user)
        
        # Obtener todos los usuarios
        stmt = select(User).order_by(User.created_at.desc())
        result = await db.execute(stmt)
        users = result.scalars().all()
        
        return [AdminUserResponse(
            id=user.id,
            uid=user.uid,
            email=user.email,
            name=user.name or "Sin nombre",
            alias=user.alias or "sin-alias",
            credits=user.credits,
            avatar_id=user.avatar_id,
            created_at=user.created_at.isoformat() if user.created_at else None
        ) for user in users]
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting users for admin {current_user.get('email')}: {str(e)}")
        raise HTTPException(status_code=500, detail="Error obteniendo usuarios")

@router.get("/purchases", response_model=List[AdminPurchaseResponse])
async def get_all_purchases(
    current_user: Dict[str, Any] = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Obtener todas las compras (solo administradores)
    """
    try:
        # Verificar permisos de administrador
        check_admin_permissions(current_user)
        
        # Obtener todas las compras
        stmt = select(Purchase).order_by(Purchase.created_at.desc())
        result = await db.execute(stmt)
        purchases = result.scalars().all()
        
        return [AdminPurchaseResponse(
            id=purchase.id,
            user_id=purchase.user_id,
            package_id=purchase.package_id,
            amount_paid=purchase.amount_paid,
            credits_received=purchase.credits_received,
            payment_method=purchase.payment_method,
            status=purchase.status,
            created_at=purchase.created_at.isoformat() if purchase.created_at else None
        ) for purchase in purchases]
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting purchases for admin {current_user.get('email')}: {str(e)}")
        raise HTTPException(status_code=500, detail="Error obteniendo compras")

@router.get("/stats")
async def get_admin_stats(
    current_user: Dict[str, Any] = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Obtener estadísticas generales (solo administradores)
    """
    try:
        # Verificar permisos de administrador
        check_admin_permissions(current_user)
        
        from sqlalchemy import func
        
        # Contar usuarios
        users_count = await db.execute(select(func.count(User.id)))
        total_users = users_count.scalar()
        
        # Contar compras
        purchases_count = await db.execute(select(func.count(Purchase.id)))
        total_purchases = purchases_count.scalar()
        
        # Sumar créditos totales
        credits_sum = await db.execute(select(func.sum(User.credits)))
        total_credits = credits_sum.scalar() or 0
        
        # Sumar montos pagados
        payments_sum = await db.execute(
            select(func.sum(Purchase.amount_paid))
            .where(Purchase.status == 'completed')
        )
        total_revenue = payments_sum.scalar() or 0
        
        return {
            "total_users": total_users,
            "total_purchases": total_purchases,
            "total_credits": total_credits,
            "total_revenue": total_revenue,
            "admin_email": current_user.get('email')
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting stats for admin {current_user.get('email')}: {str(e)}")
        raise HTTPException(status_code=500, detail="Error obteniendo estadísticas") 