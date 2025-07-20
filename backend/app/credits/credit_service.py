from typing import Dict, Any, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from fastapi import HTTPException
import logging
from datetime import datetime
import uuid

from ..users.models import UserProfile, UserPurchase
from ..payments.mercadopago_service import mercadopago_service

logger = logging.getLogger(__name__)

class CreditService:
    """Servicio para gestión de créditos"""
    
    # Configuración de créditos
    CREDIT_PACKAGES = {
        100: {"credits": 100, "price": 1000},  # 100 créditos = $10.00
        500: {"credits": 500, "price": 4500},  # 500 créditos = $45.00
        1000: {"credits": 1000, "price": 8000},  # 1000 créditos = $80.00
        2000: {"credits": 2000, "price": 15000},  # 2000 créditos = $150.00
    }
    
    @staticmethod
    async def get_user_credits(db: AsyncSession, user_id: int) -> Dict[str, Any]:
        """
        Obtener créditos del usuario
        
        Args:
            db: Sesión de base de datos
            user_id: ID del usuario
        
        Returns:
            dict: Información de créditos
        """
        try:
            # Obtener perfil del usuario
            query = select(UserProfile).where(UserProfile.id == user_id)
            result = await db.execute(query)
            profile = result.scalar_one_or_none()
            
            if not profile:
                raise HTTPException(status_code=404, detail="Perfil no encontrado")
            
            # Calcular créditos ganados y gastados
            earned_query = select(UserPurchase).where(
                UserPurchase.user_id == user_id,
                UserPurchase.purchase_type == "credits",
                UserPurchase.status == "approved"
            )
            earned_result = await db.execute(earned_query)
            earned_purchases = earned_result.scalars().all()
            
            total_earned = sum(purchase.amount for purchase in earned_purchases)
            
            # TODO: Implementar sistema de gasto de créditos
            # Por ahora, asumimos que no se han gastado créditos
            total_spent = 0
            current_credits = total_earned - total_spent
            
            return {
                "credits": current_credits,
                "total_earned": total_earned,
                "total_spent": total_spent,
                "user_id": user_id
            }
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error getting credits for user {user_id}: {str(e)}")
            raise HTTPException(status_code=500, detail="Error interno del servidor")
    
    @staticmethod
    async def buy_credits(
        db: AsyncSession, 
        user_id: int, 
        amount: int
    ) -> Dict[str, Any]:
        """
        Comprar créditos
        
        Args:
            db: Sesión de base de datos
            user_id: ID del usuario
            amount: Cantidad de créditos a comprar
        
        Returns:
            dict: Información de la compra
        """
        try:
            # Validar cantidad de créditos
            if amount not in CreditService.CREDIT_PACKAGES:
                raise HTTPException(
                    status_code=400, 
                    detail=f"Cantidad de créditos inválida. Opciones disponibles: {list(CreditService.CREDIT_PACKAGES.keys())}"
                )
            
            package = CreditService.CREDIT_PACKAGES[amount]
            price_cents = package["price"]  # Precio en centavos
            
            # Obtener perfil del usuario
            query = select(UserProfile).where(UserProfile.id == user_id)
            result = await db.execute(query)
            profile = result.scalar_one_or_none()
            
            if not profile:
                raise HTTPException(status_code=404, detail="Perfil no encontrado")
            
            # Crear referencia externa única
            external_reference = f"credits_{user_id}_{uuid.uuid4().hex[:8]}"
            
            # Crear preferencia de pago
            preference = await mercadopago_service.create_payment_preference(
                user_id=str(user_id),
                amount=price_cents,
                description=f"Compra de {amount} créditos - Spartan Market",
                external_reference=external_reference
            )
            
            # Crear registro de compra
            purchase = UserPurchase(
                user_id=user_id,
                purchase_type="credits",
                amount=amount,
                currency="ARS",
                status="pending",
                mercadopago_payment_id=preference["preference_id"]
            )
            
            db.add(purchase)
            await db.commit()
            await db.refresh(purchase)
            
            logger.info(f"Credit purchase initiated: {amount} credits for user {user_id}")
            
            return {
                "purchase_id": purchase.id,
                "credits": amount,
                "price_cents": price_cents,
                "price_ars": price_cents / 100.0,
                "preference_id": preference["preference_id"],
                "init_point": preference["init_point"],
                "sandbox_init_point": preference["sandbox_init_point"],
                "external_reference": external_reference,
                "is_sandbox": mercadopago_service.is_sandbox_mode()
            }
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error buying credits for user {user_id}: {str(e)}")
            raise HTTPException(status_code=500, detail="Error interno del servidor")
    
    @staticmethod
    async def process_credit_purchase(
        db: AsyncSession, 
        payment_id: str, 
        status: str
    ) -> Dict[str, Any]:
        """
        Procesar compra de créditos después del pago
        
        Args:
            db: Sesión de base de datos
            payment_id: ID del pago de MercadoPago
            status: Estado del pago
        
        Returns:
            dict: Información del procesamiento
        """
        try:
            # Buscar compra por payment_id
            query = select(UserPurchase).where(
                UserPurchase.mercadopago_payment_id == payment_id,
                UserPurchase.purchase_type == "credits"
            )
            result = await db.execute(query)
            purchase = result.scalar_one_or_none()
            
            if not purchase:
                raise HTTPException(status_code=404, detail="Compra no encontrada")
            
            # Actualizar estado de la compra
            purchase.status = status
            
            if status == "approved":
                # Los créditos se acreditan automáticamente al usuario
                logger.info(f"Credits approved for user {purchase.user_id}: {purchase.amount} credits")
            
            await db.commit()
            await db.refresh(purchase)
            
            return {
                "purchase_id": purchase.id,
                "user_id": purchase.user_id,
                "credits": purchase.amount,
                "status": purchase.status,
                "processed_at": datetime.now().isoformat()
            }
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error processing credit purchase {payment_id}: {str(e)}")
            raise HTTPException(status_code=500, detail="Error interno del servidor")
    
    @staticmethod
    async def spend_credits(
        db: AsyncSession, 
        user_id: int, 
        amount: int, 
        description: str
    ) -> Dict[str, Any]:
        """
        Gastar créditos del usuario
        
        Args:
            db: Sesión de base de datos
            user_id: ID del usuario
            amount: Cantidad de créditos a gastar
            description: Descripción del gasto
        
        Returns:
            dict: Información del gasto
        """
        try:
            # Verificar créditos disponibles
            credits_info = await CreditService.get_user_credits(db, user_id)
            
            if credits_info["credits"] < amount:
                raise HTTPException(
                    status_code=400, 
                    detail=f"Créditos insuficientes. Disponibles: {credits_info['credits']}, Requeridos: {amount}"
                )
            
            # Crear registro de gasto
            purchase = UserPurchase(
                user_id=user_id,
                purchase_type="product",
                amount=-amount,  # Negativo para indicar gasto
                currency="ARS",
                status="approved",
                payment_method="credits"
            )
            
            db.add(purchase)
            await db.commit()
            await db.refresh(purchase)
            
            logger.info(f"Credits spent for user {user_id}: {amount} credits - {description}")
            
            return {
                "purchase_id": purchase.id,
                "credits_spent": amount,
                "description": description,
                "remaining_credits": credits_info["credits"] - amount,
                "spent_at": datetime.now().isoformat()
            }
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error spending credits for user {user_id}: {str(e)}")
            raise HTTPException(status_code=500, detail="Error interno del servidor")
    
    @staticmethod
    async def get_credit_packages() -> Dict[str, Any]:
        """
        Obtener paquetes de créditos disponibles
        
        Returns:
            dict: Paquetes de créditos
        """
        return {
            "packages": CreditService.CREDIT_PACKAGES,
            "currency": "ARS",
            "description": "Paquetes de créditos disponibles"
        }

# Instancia global del servicio
credit_service = CreditService() 