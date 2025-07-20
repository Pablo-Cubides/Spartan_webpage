from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel

from ..core.firebase_auth import get_current_user, check_rate_limit
from ..core.database import get_db
from ..db.models import CreditPackage, Purchase
from ..users.services import UserProfileService
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/credits", tags=["Credit Packages"])

class CreditPackageResponse(BaseModel):
    id: int
    name: str
    credits: int
    price: float
    is_active: bool

class PurchaseRequest(BaseModel):
    package_id: int

class PurchaseResponse(BaseModel):
    id: int
    package_id: int
    amount_paid: float
    credits_received: int
    payment_method: str
    status: str
    created_at: str

@router.get("/packages", response_model=List[CreditPackageResponse])
async def get_credit_packages(
    db: AsyncSession = Depends(get_db)
):
    """
    Obtener todos los paquetes de créditos disponibles
    """
    try:
        from sqlalchemy import select
        
        # Obtener paquetes activos
        stmt = select(CreditPackage).where(CreditPackage.is_active == True)
        result = await db.execute(stmt)
        packages = result.scalars().all()
        
        return [CreditPackageResponse(
            id=pkg.id,
            name=pkg.name,
            credits=pkg.credits,
            price=pkg.price,
            is_active=pkg.is_active
        ) for pkg in packages]
        
    except Exception as e:
        logger.error(f"Error getting credit packages: {str(e)}")
        raise HTTPException(status_code=500, detail="Error obteniendo paquetes de créditos")

@router.get("/packages/{package_id}", response_model=CreditPackageResponse)
async def get_credit_package(
    package_id: int,
    db: AsyncSession = Depends(get_db)
):
    """
    Obtener un paquete de créditos específico
    """
    try:
        from sqlalchemy import select
        
        stmt = select(CreditPackage).where(CreditPackage.id == package_id)
        result = await db.execute(stmt)
        package = result.scalar_one_or_none()
        
        if not package:
            raise HTTPException(
                status_code=404,
                detail="Paquete de créditos no encontrado"
            )
        
        return CreditPackageResponse(
            id=package.id,
            name=package.name,
            credits=package.credits,
            price=package.price,
            is_active=package.is_active
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting credit package {package_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Error obteniendo paquete de créditos")

@router.post("/buy", response_model=PurchaseResponse)
async def buy_credits(
    purchase_data: PurchaseRequest,
    current_user: Dict[str, Any] = Depends(check_rate_limit),
    db: AsyncSession = Depends(get_db)
):
    """
    Comprar créditos usando un paquete específico
    """
    try:
        # Verificar que el usuario tiene un perfil
        profile = await UserProfileService.get_profile_by_uid(
            db, current_user['uid']
        )
        
        if not profile:
            raise HTTPException(
                status_code=404,
                detail="Perfil no encontrado. Complete su perfil primero."
            )
        
        # Obtener el paquete de créditos
        from sqlalchemy import select
        
        stmt = select(CreditPackage).where(
            CreditPackage.id == purchase_data.package_id,
            CreditPackage.is_active == True
        )
        result = await db.execute(stmt)
        package = result.scalar_one_or_none()
        
        if not package:
            raise HTTPException(
                status_code=404,
                detail="Paquete de créditos no encontrado o no disponible"
            )
        
        # Crear registro de compra
        purchase = Purchase(
            user_id=profile.id,
            package_id=package.id,
            amount_paid=package.price,
            credits_received=package.credits,
            payment_method="mercadopago",  # Por defecto
            status="pending"
        )
        
        db.add(purchase)
        await db.commit()
        await db.refresh(purchase)
        
        logger.info(f"Purchase created for user {current_user['uid']}: package {package.id}")
        
        return PurchaseResponse(
            id=purchase.id,
            package_id=purchase.package_id,
            amount_paid=purchase.amount_paid,
            credits_received=purchase.credits_received,
            payment_method=purchase.payment_method,
            status=purchase.status,
            created_at=purchase.created_at.isoformat()
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating purchase for user {current_user['uid']}: {str(e)}")
        raise HTTPException(status_code=500, detail="Error creando compra")

@router.get("/my-purchases", response_model=List[PurchaseResponse])
async def get_my_purchases(
    page: int = Query(1, ge=1, description="Número de página"),
    limit: int = Query(10, ge=1, le=50, description="Elementos por página"),
    status: Optional[str] = Query(None, description="Filtrar por estado"),
    current_user: Dict[str, Any] = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Obtener historial de compras del usuario
    """
    try:
        # Verificar que el usuario tiene un perfil
        profile = await UserProfileService.get_profile_by_uid(
            db, current_user['uid']
        )
        
        if not profile:
            raise HTTPException(
                status_code=404,
                detail="Perfil no encontrado. Complete su perfil primero."
            )
        
        # Construir consulta
        from sqlalchemy import select, and_
        
        conditions = [Purchase.user_id == profile.id]
        if status:
            conditions.append(Purchase.status == status)
        
        stmt = select(Purchase).where(and_(*conditions)).order_by(Purchase.created_at.desc())
        
        # Aplicar paginación
        offset = (page - 1) * limit
        stmt = stmt.offset(offset).limit(limit)
        
        result = await db.execute(stmt)
        purchases = result.scalars().all()
        
        return [PurchaseResponse(
            id=purchase.id,
            package_id=purchase.package_id,
            amount_paid=purchase.amount_paid,
            credits_received=purchase.credits_received,
            payment_method=purchase.payment_method,
            status=purchase.status,
            created_at=purchase.created_at.isoformat()
        ) for purchase in purchases]
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting purchases for user {current_user['uid']}: {str(e)}")
        raise HTTPException(status_code=500, detail="Error obteniendo historial de compras") 