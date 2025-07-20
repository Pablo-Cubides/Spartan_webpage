from typing import Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File, Form, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
import logging

from ..core.firebase_auth import get_current_user, check_rate_limit
from ..core.database import get_db
from ..core.storage import file_storage
from ..core.cache import cache_manager
from ..core.background_tasks import background_task_manager, ImageProcessingTask
from ..core.metrics import metrics_collector
from ..credits.credit_service import credit_service
from ..payments.mercadopago_service import mercadopago_service
from ..notifications.notification_service import notification_service
from .services import UserProfileService, PrivacyService, PurchaseService
from .schemas import (
    CompleteProfileRequest, UpdateProfileRequest, UserProfileResponse,
    PublicProfileResponse, AvatarResponse, AvatarOptionsResponse,
    UpdatePrivacyRequest, PrivacySettingsResponse, PurchasesResponse
)

from app.services.email_service import email_service
from app.core.logging_config import log_business_operation, log_error
from app.core.sentry_config import capture_exception, set_user_context
import asyncio

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/advanced", tags=["Advanced Features"])

# ========================================
# AVATAR CON PROCESAMIENTO REAL
# ========================================

@router.post("/profile/avatar/upload", response_model=AvatarResponse)
async def upload_avatar_with_processing(
    image: UploadFile = File(..., description="Imagen de avatar"),
    current_user: Dict[str, Any] = Depends(check_rate_limit),
    background_tasks: BackgroundTasks = None,
    db: AsyncSession = Depends(get_db)
):
    """
    Subir avatar con procesamiento en segundo plano
    """
    try:
        # Obtener perfil actual
        profile = await UserProfileService.get_profile_by_uid(
            db, current_user['uid']
        )
        
        if not profile:
            raise HTTPException(
                status_code=404, 
                detail="Perfil no encontrado. Complete su perfil primero."
            )
        
        # Validar archivo
        from .utils import validate_image_file
        is_valid, message = validate_image_file(
            image.filename, image.content_type, image.size
        )
        
        if not is_valid:
            raise HTTPException(status_code=400, detail=message)
        
        # Guardar archivo
        filename, file_path = await file_storage.save_avatar(image, current_user['uid'])
        
        # Actualizar avatar en base de datos
        updated_profile = await UserProfileService.update_avatar(
            db, profile.id, 'uploaded', image_filename=filename
        )
        
        # Procesar imagen en segundo plano
        task_id = f"avatar_process_{current_user['uid']}_{filename}"
        await background_task_manager.add_task(
            task_id,
            ImageProcessingTask.process_avatar_image,
            file_path,
            current_user['uid'],
            (400, 400)
        )
        
        # Enviar notificación
        await notification_service.send_avatar_update_notification(
            current_user['uid'], 'uploaded'
        )
        
        # Limpiar avatares antiguos en segundo plano
        await file_storage.cleanup_old_avatars(current_user['uid'], filename)
        
        return AvatarResponse(
            avatar_url=updated_profile.avatar_url,
            avatar_type=updated_profile.avatar_type,
            message="Avatar subido exitosamente. Procesamiento en segundo plano.",
            task_id=task_id
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error uploading avatar for user {current_user['uid']}: {str(e)}")
        raise HTTPException(status_code=500, detail="Error interno del servidor")

# ========================================
# CRÉDITOS FUNCIONALES
# ========================================

@router.get("/credits/me")
async def get_my_credits_cached(
    current_user: Dict[str, Any] = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Obtener créditos del usuario con caché
    """
    try:
        # Intentar obtener del caché
        cached_credits = await cache_manager.get_user_credits(current_user['uid'])
        
        if cached_credits:
            return cached_credits
        
        # Obtener de la base de datos
        profile = await UserProfileService.get_profile_by_uid(
            db, current_user['uid']
        )
        
        if not profile:
            raise HTTPException(
                status_code=404, 
                detail="Perfil no encontrado. Complete su perfil primero."
            )
        
        credits_info = await credit_service.get_user_credits(db, profile.id)
        
        # Guardar en caché
        await cache_manager.set_user_credits(current_user['uid'], credits_info)
        
        return credits_info
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting credits for user {current_user['uid']}: {str(e)}")
        raise HTTPException(status_code=500, detail="Error interno del servidor")

@router.post("/credits/buy")
async def buy_credits_advanced(
    amount: int,
    current_user: Dict[str, Any] = Depends(check_rate_limit),
    db: AsyncSession = Depends(get_db)
):
    """
    Comprar créditos con integración completa
    """
    try:
        # Obtener perfil
        profile = await UserProfileService.get_profile_by_uid(
            db, current_user['uid']
        )
        
        if not profile:
            raise HTTPException(
                status_code=404, 
                detail="Perfil no encontrado. Complete su perfil primero."
            )
        
        # Comprar créditos
        purchase_info = await credit_service.buy_credits(db, profile.id, amount)
        
        # Invalidar caché de créditos
        await cache_manager.invalidate_user_credits(current_user['uid'])
        
        return {
            "purchase_id": purchase_info["purchase_id"],
            "credits": purchase_info["credits"],
            "price_ars": purchase_info["price_ars"],
            "payment_url": purchase_info["init_point"] if not purchase_info["is_sandbox"] else purchase_info["sandbox_init_point"],
            "is_sandbox": purchase_info["is_sandbox"],
            "external_reference": purchase_info["external_reference"]
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error buying credits for user {current_user['uid']}: {str(e)}")
        raise HTTPException(status_code=500, detail="Error interno del servidor")

@router.get("/credits/packages")
async def get_credit_packages():
    """
    Obtener paquetes de créditos disponibles
    """
    try:
        # Intentar obtener del caché
        cached_packages = await cache_manager.cache.get("credit_packages")
        
        if cached_packages:
            return cached_packages
        
        # Obtener paquetes
        packages = await credit_service.get_credit_packages()
        
        # Guardar en caché
        await cache_manager.cache.set("credit_packages", packages, expire=3600)
        
        return packages
        
    except Exception as e:
        logger.error(f"Error getting credit packages: {str(e)}")
        raise HTTPException(status_code=500, detail="Error interno del servidor")

# ========================================
# WEBHOOKS Y NOTIFICACIONES
# ========================================

@router.post("/webhooks/mercadopago")
async def mercadopago_webhook(
    webhook_data: Dict[str, Any],
    db: AsyncSession = Depends(get_db)
):
    """
    Webhook de MercadoPago
    """
    try:
        from ..notifications.notification_service import WebhookService
        
        # Procesar webhook
        result = await WebhookService.process_mercadopago_webhook(webhook_data)
        
        # Si el pago es aprobado, enviar email
        if result.get("status") == "approved":
            try:
                payment_data = result.get("payment_data", {})
                payment_id = payment_data.get("id")
                external_reference = payment_data.get("external_reference")
                
                # Obtener datos del usuario desde la referencia externa
                if external_reference and external_reference.startswith("credits_"):
                    user_uid = external_reference.split("_")[1]
                    
                    # Obtener perfil del usuario
                    profile = await UserProfileService.get_profile_by_uid(db, user_uid)
                    
                    if profile:
                        user_data = {
                            "uid": profile.uid,
                            "email": profile.email,  # Asumiendo que tenemos email
                            "full_name": profile.full_name,
                            "alias": profile.alias
                        }
                        
                        # Obtener información del pago
                        credits_amount = payment_data.get("credits", 0)
                        payment_amount = payment_data.get("transaction_amount", 0)
                        
                        # Enviar email de pago aprobado de forma asíncrona
                        asyncio.create_task(
                            email_service.send_payment_approved(
                                user=user_data,
                                credits=credits_amount,
                                amount=payment_amount,
                                currency="ARS"
                            )
                        )
                        
                        log_business_operation(
                            operation="payment_approved_email_triggered",
                            user_id=profile.uid,
                            payment_id=payment_id,
                            credits=credits_amount,
                            amount=payment_amount
                        )
                        
            except Exception as e:
                log_error(e, "payment_approved_email_send", payment_id=payment_data.get("id"))
                capture_exception(e, payment_id=payment_data.get("id"))
                # No fallar el webhook si el email falla
        
        return {
            "status": "processed",
            "payment_id": result.get("payment_id"),
            "credit_processed": result.get("credit_processed", False)
        }
        
    except Exception as e:
        logger.error(f"Error processing MercadoPago webhook: {str(e)}")
        capture_exception(e)
        raise HTTPException(status_code=500, detail="Error procesando webhook")

# ========================================
# MÉTRICAS Y MONITOREO
# ========================================

@router.get("/metrics/system")
async def get_system_metrics():
    """
    Obtener métricas del sistema
    """
    try:
        return metrics_collector.get_system_metrics()
    except Exception as e:
        logger.error(f"Error getting system metrics: {str(e)}")
        raise HTTPException(status_code=500, detail="Error obteniendo métricas")

@router.get("/metrics/requests")
async def get_request_metrics(
    time_window: int = Query(3600, description="Ventana de tiempo en segundos")
):
    """
    Obtener métricas de requests
    """
    try:
        return metrics_collector.get_request_metrics(time_window)
    except Exception as e:
        logger.error(f"Error getting request metrics: {str(e)}")
        raise HTTPException(status_code=500, detail="Error obteniendo métricas")

@router.get("/metrics/endpoints")
async def get_endpoint_metrics():
    """
    Obtener métricas por endpoint
    """
    try:
        return metrics_collector.get_endpoint_metrics()
    except Exception as e:
        logger.error(f"Error getting endpoint metrics: {str(e)}")
        raise HTTPException(status_code=500, detail="Error obteniendo métricas")

@router.get("/health")
async def health_check():
    """
    Verificación de salud del sistema
    """
    try:
        from ..core.metrics import health_checker
        return await health_checker.run_health_checks()
    except Exception as e:
        logger.error(f"Error running health checks: {str(e)}")
        return {
            "overall_status": "error",
            "error": str(e)
        }

# ========================================
# BACKGROUND TASKS
# ========================================

@router.get("/tasks/{task_id}")
async def get_task_status(task_id: str):
    """
    Obtener estado de una tarea en segundo plano
    """
    try:
        return await background_task_manager.get_task_status(task_id)
    except Exception as e:
        logger.error(f"Error getting task status {task_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Error obteniendo estado de tarea")

@router.delete("/tasks/{task_id}")
async def cancel_task(task_id: str):
    """
    Cancelar una tarea en segundo plano
    """
    try:
        cancelled = await background_task_manager.cancel_task(task_id)
        return {"cancelled": cancelled}
    except Exception as e:
        logger.error(f"Error cancelling task {task_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Error cancelando tarea")

@router.get("/tasks")
async def get_running_tasks():
    """
    Obtener lista de tareas en ejecución
    """
    try:
        tasks = await background_task_manager.get_running_tasks()
        return {"running_tasks": tasks}
    except Exception as e:
        logger.error(f"Error getting running tasks: {str(e)}")
        raise HTTPException(status_code=500, detail="Error obteniendo tareas")

# ========================================
# CACHE MANAGEMENT
# ========================================

@router.delete("/cache/user/{user_id}")
async def invalidate_user_cache(
    user_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Invalidar caché de un usuario
    """
    try:
        # Solo el propio usuario puede invalidar su caché
        if current_user['uid'] != user_id:
            raise HTTPException(status_code=403, detail="No autorizado")
        
        await cache_manager.invalidate_user_profile(user_id)
        await cache_manager.invalidate_user_credits(user_id)
        
        return {"message": "Cache invalidado correctamente"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error invalidating cache for user {user_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Error invalidando caché")

@router.delete("/cache/public-profiles")
async def invalidate_public_profiles_cache(
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Invalidar caché de perfiles públicos
    """
    try:
        # Solo administradores pueden invalidar caché global
        # TODO: Implementar verificación de rol de administrador
        
        await cache_manager.cache.delete_pattern("public_profile:*")
        
        return {"message": "Cache de perfiles públicos invalidado"}
        
    except Exception as e:
        logger.error(f"Error invalidating public profiles cache: {str(e)}")
        raise HTTPException(status_code=500, detail="Error invalidando caché")

# ========================================
# ANALYTICS
# ========================================

@router.get("/analytics/user/{user_id}")
async def get_user_analytics(
    user_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Obtener analytics de un usuario
    """
    try:
        # Solo el propio usuario puede ver sus analytics
        if current_user['uid'] != user_id:
            raise HTTPException(status_code=403, detail="No autorizado")
        
        # Generar analytics en segundo plano
        task_id = f"analytics_{user_id}_{int(time.time())}"
        await background_task_manager.add_task(
            task_id,
            DataProcessingTask.generate_user_analytics,
            user_id
        )
        
        return {
            "task_id": task_id,
            "message": "Analytics en generación. Consulta el estado con /tasks/{task_id}"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating analytics for user {user_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Error generando analytics") 