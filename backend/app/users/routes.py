from typing import Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File, Form
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from ..core.firebase_auth import get_current_user, check_rate_limit
from ..core.database import get_db
from .models import UserProfile
from .schemas import (
    CompleteProfileRequest, UpdateProfileRequest, UserProfileResponse,
    PublicProfileResponse, AvatarResponse, AvatarOptionsResponse,
    UpdatePrivacyRequest, PrivacySettingsResponse, PurchasesResponse,
    ErrorResponse
)
from .services import UserProfileService, PrivacyService, PurchaseService
from .utils import validate_image_file, generate_avatar_url
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/users", tags=["User Profiles"])

# ========================================
# PERFIL DE USUARIO
# ========================================

@router.post("/profile/complete", response_model=UserProfileResponse)
async def complete_profile(
    profile_data: CompleteProfileRequest,
    current_user: Dict[str, Any] = Depends(check_rate_limit),
    db: AsyncSession = Depends(get_db)
):
    """
    Completar perfil de usuario después del registro
    """
    try:
        # Verificar si ya existe un perfil
        existing_profile = await UserProfileService.get_profile_by_uid(
            db, current_user['uid']
        )
        
        if existing_profile:
            raise HTTPException(
                status_code=400, 
                detail="El usuario ya tiene un perfil completo"
            )
        
        # Crear perfil
        profile = await UserProfileService.create_profile(
            db, current_user['uid'], profile_data
        )
        
        return UserProfileResponse.from_orm(profile)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error completing profile for user {current_user['uid']}: {str(e)}")
        raise HTTPException(status_code=500, detail="Error interno del servidor")

@router.get("/profile/me", response_model=UserProfileResponse)
async def get_my_profile(
    current_user: Dict[str, Any] = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Obtener perfil propio del usuario autenticado
    """
    try:
        profile = await UserProfileService.get_profile_by_uid(
            db, current_user['uid']
        )
        
        if not profile:
            raise HTTPException(
                status_code=404, 
                detail="Perfil no encontrado. Complete su perfil primero."
            )
        
        return UserProfileResponse.from_orm(profile)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting profile for user {current_user['uid']}: {str(e)}")
        raise HTTPException(status_code=500, detail="Error interno del servidor")

@router.put("/profile/me", response_model=UserProfileResponse)
async def update_my_profile(
    update_data: UpdateProfileRequest,
    current_user: Dict[str, Any] = Depends(check_rate_limit),
    db: AsyncSession = Depends(get_db)
):
    """
    Actualizar perfil propio del usuario
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
        
        # Actualizar perfil
        updated_profile = await UserProfileService.update_profile(
            db, profile.id, update_data
        )
        
        return UserProfileResponse.from_orm(updated_profile)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating profile for user {current_user['uid']}: {str(e)}")
        raise HTTPException(status_code=500, detail="Error interno del servidor")

@router.get("/profile/{alias}", response_model=PublicProfileResponse)
async def get_public_profile(
    alias: str,
    viewer: Optional[str] = Query(None, description="Tipo de visor (public, admin)"),
    db: AsyncSession = Depends(get_db)
):
    """
    Obtener perfil público de un usuario por su alias
    """
    try:
        # Determinar tipo de visor
        viewer_type = viewer or "public"
        
        # Obtener perfil público
        public_data = await UserProfileService.get_public_profile(
            db, alias, viewer_type
        )
        
        if not public_data:
            raise HTTPException(
                status_code=404, 
                detail="Usuario no encontrado"
            )
        
        return PublicProfileResponse(**public_data)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting public profile for alias {alias}: {str(e)}")
        raise HTTPException(status_code=500, detail="Error interno del servidor")

# ========================================
# AVATAR
# ========================================

@router.post("/profile/avatar", response_model=AvatarResponse)
async def update_avatar(
    avatar_type: str = Form(..., description="Tipo de avatar (icon, uploaded)"),
    icon_name: Optional[str] = Form(None, description="Nombre del ícono"),
    image: Optional[UploadFile] = File(None, description="Imagen de avatar"),
    current_user: Dict[str, Any] = Depends(check_rate_limit),
    db: AsyncSession = Depends(get_db)
):
    """
    Subir o seleccionar avatar para el usuario
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
        
        # Validar tipo de avatar
        if avatar_type not in ['icon', 'uploaded']:
            raise HTTPException(
                status_code=400, 
                detail="Tipo de avatar inválido. Debe ser 'icon' o 'uploaded'"
            )
        
        if avatar_type == 'icon':
            if not icon_name:
                raise HTTPException(
                    status_code=400, 
                    detail="Nombre del ícono requerido para avatar tipo icon"
                )
            
            # Validar que el ícono existe
            avatar_options = await UserProfileService.get_avatar_options()
            icon_names = [icon['name'] for icon in avatar_options]
            
            if icon_name not in icon_names:
                raise HTTPException(
                    status_code=400, 
                    detail=f"Ícono '{icon_name}' no válido"
                )
            
            # Actualizar avatar con ícono
            updated_profile = await UserProfileService.update_avatar(
                db, profile.id, avatar_type, icon_name=icon_name
            )
            
            return AvatarResponse(
                avatar_url=updated_profile.avatar_url,
                avatar_type=updated_profile.avatar_type,
                message="Avatar actualizado exitosamente"
            )
            
        elif avatar_type == 'uploaded':
            if not image:
                raise HTTPException(
                    status_code=400, 
                    detail="Imagen requerida para avatar tipo uploaded"
                )
            
            # Validar archivo
            is_valid, message = validate_image_file(
                image.filename, image.content_type, image.size
            )
            
            if not is_valid:
                raise HTTPException(status_code=400, detail=message)
            
            # Generar nombre único para el archivo
            import uuid
            import os
            file_extension = os.path.splitext(image.filename)[1]
            filename = f"{uuid.uuid4()}{file_extension}"
            
            # TODO: Implementar subida real del archivo
            # Por ahora, solo actualizamos la URL
            avatar_url = generate_avatar_url('uploaded', filename)
            
            # Actualizar avatar
            updated_profile = await UserProfileService.update_avatar(
                db, profile.id, avatar_type, image_filename=filename
            )
            
            return AvatarResponse(
                avatar_url=updated_profile.avatar_url,
                avatar_type=updated_profile.avatar_type,
                message="Avatar actualizado exitosamente"
            )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating avatar for user {current_user['uid']}: {str(e)}")
        raise HTTPException(status_code=500, detail="Error interno del servidor")

@router.get("/profile/avatar/options", response_model=AvatarOptionsResponse)
async def get_avatar_options():
    """
    Obtener opciones de avatar disponibles
    """
    try:
        icons = await UserProfileService.get_avatar_options()
        return AvatarOptionsResponse(icons=icons)
        
    except Exception as e:
        logger.error(f"Error getting avatar options: {str(e)}")
        raise HTTPException(status_code=500, detail="Error interno del servidor")

# ========================================
# PRIVACIDAD
# ========================================

@router.get("/profile/privacy", response_model=PrivacySettingsResponse)
async def get_privacy_settings(
    current_user: Dict[str, Any] = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Obtener configuración de privacidad del usuario
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
        
        # Obtener configuración de privacidad
        privacy_settings = await PrivacyService.get_privacy_settings(
            db, profile.id
        )
        
        if not privacy_settings:
            raise HTTPException(
                status_code=404, 
                detail="Configuración de privacidad no encontrada"
            )
        
        return PrivacySettingsResponse.from_orm(privacy_settings)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting privacy settings for user {current_user['uid']}: {str(e)}")
        raise HTTPException(status_code=500, detail="Error interno del servidor")

@router.put("/profile/privacy", response_model=PrivacySettingsResponse)
async def update_privacy_settings(
    privacy_data: UpdatePrivacyRequest,
    current_user: Dict[str, Any] = Depends(check_rate_limit),
    db: AsyncSession = Depends(get_db)
):
    """
    Actualizar configuración de privacidad del usuario
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
        
        # Preparar datos de privacidad
        privacy_update_data = {}
        for field, value in privacy_data.dict(exclude_unset=True).items():
            if value is not None:
                privacy_update_data[field] = value
        
        if not privacy_update_data:
            raise HTTPException(
                status_code=400, 
                detail="No se proporcionaron datos para actualizar"
            )
        
        # Actualizar configuración de privacidad
        updated_privacy = await PrivacyService.update_privacy_settings(
            db, profile.id, privacy_update_data
        )
        
        return PrivacySettingsResponse.from_orm(updated_privacy)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating privacy settings for user {current_user['uid']}: {str(e)}")
        raise HTTPException(status_code=500, detail="Error interno del servidor")

# ========================================
# CRÉDITOS
# ========================================

@router.get("/credits/me")
async def get_my_credits(
    current_user: Dict[str, Any] = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Obtener créditos del usuario (placeholder)
    """
    # TODO: Implementar sistema de créditos
    return {
        "credits": 0,
        "total_earned": 0,
        "total_spent": 0
    }

@router.post("/credits/buy")
async def buy_credits(
    amount: int,
    current_user: Dict[str, Any] = Depends(check_rate_limit),
    db: AsyncSession = Depends(get_db)
):
    """
    Comprar créditos (placeholder)
    """
    # TODO: Implementar integración con MercadoPago
    raise HTTPException(
        status_code=501, 
        detail="Compra de créditos no implementada aún"
    )

# ========================================
# HISTORIAL DE COMPRAS
# ========================================

@router.get("/purchases/me", response_model=PurchasesResponse)
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
        # Obtener perfil
        profile = await UserProfileService.get_profile_by_uid(
            db, current_user['uid']
        )
        
        if not profile:
            raise HTTPException(
                status_code=404, 
                detail="Perfil no encontrado. Complete su perfil primero."
            )
        
        # Obtener historial de compras
        purchases_data = await PurchaseService.get_user_purchases(
            db, profile.id, page, limit, status
        )
        
        return PurchasesResponse(
            purchases=purchases_data['purchases'],
            total=purchases_data['total'],
            page=purchases_data['page'],
            limit=purchases_data['limit'],
            pages=purchases_data['pages']
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting purchases for user {current_user['uid']}: {str(e)}")
        raise HTTPException(status_code=500, detail="Error interno del servidor")

# ========================================
# UTILIDADES
# ========================================

@router.get("/profile/me/completion")
async def get_profile_completion(
    current_user: Dict[str, Any] = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Obtener porcentaje de completado del perfil
    """
    try:
        profile = await UserProfileService.get_profile_by_uid(
            db, current_user['uid']
        )
        
        if not profile:
            return {
                "required_completed": 0,
                "required_total": 5,
                "required_percentage": 0.0,
                "optional_completed": 0,
                "optional_total": 4,
                "optional_percentage": 0.0,
                "overall_percentage": 0.0,
                "is_complete": False
            }
        
        completion = await UserProfileService.get_profile_completion(profile)
        return completion
        
    except Exception as e:
        logger.error(f"Error getting profile completion for user {current_user['uid']}: {str(e)}")
        raise HTTPException(status_code=500, detail="Error interno del servidor") 