from typing import Dict, Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel

from ..core.firebase_auth import get_current_user, check_rate_limit
from ..core.database import get_db
from ..core.storage import r2_storage
from .services import UserProfileService
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/users", tags=["Avatar Management"])

class PresignedUploadResponse(BaseModel):
    presigned_url: str
    object_key: str
    expires_in: int = 3600

class PresignedDownloadResponse(BaseModel):
    presigned_url: str
    expires_in: int = 3600

@router.post("/avatar/presign-upload", response_model=PresignedUploadResponse)
async def generate_avatar_upload_url(
    file_extension: str,
    current_user: Dict[str, Any] = Depends(check_rate_limit),
    db: AsyncSession = Depends(get_db)
):
    """
    Generar URL firmada para subir avatar
    
    Args:
        file_extension: Extensión del archivo (ej: .jpg, .png)
    
    Returns:
        PresignedUploadResponse: URL firmada y metadata
    """
    try:
        # Validar extensión del archivo
        allowed_extensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp']
        if file_extension.lower() not in allowed_extensions:
            raise HTTPException(
                status_code=400,
                detail=f"Extensión no válida. Permitidas: {', '.join(allowed_extensions)}"
            )
        
        # Verificar que el usuario tiene un perfil
        profile = await UserProfileService.get_profile_by_uid(
            db, current_user['uid']
        )
        
        if not profile:
            raise HTTPException(
                status_code=404,
                detail="Perfil no encontrado. Complete su perfil primero."
            )
        
        # Generar URL firmada para subida
        presigned_url, object_key = await r2_storage.generate_presigned_upload_url(
            current_user['uid'], file_extension
        )
        
        logger.info(f"Generated presigned upload URL for user {current_user['uid']}: {object_key}")
        
        return PresignedUploadResponse(
            presigned_url=presigned_url,
            object_key=object_key,
            expires_in=3600
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating upload URL for user {current_user['uid']}: {str(e)}")
        raise HTTPException(status_code=500, detail="Error generando URL de subida")

@router.get("/avatar/presign-download/{avatar_id}", response_model=PresignedDownloadResponse)
async def generate_avatar_download_url(
    avatar_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Generar URL firmada para descargar avatar
    
    Args:
        avatar_id: ID del avatar a descargar
    
    Returns:
        PresignedDownloadResponse: URL firmada para descarga
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
        
        # Generar URL firmada para descarga
        presigned_url = await r2_storage.generate_presigned_download_url(avatar_id)
        
        logger.info(f"Generated presigned download URL for avatar {avatar_id}")
        
        return PresignedDownloadResponse(
            presigned_url=presigned_url,
            expires_in=3600
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating download URL for avatar {avatar_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Error generando URL de descarga")

@router.post("/avatar/confirm-upload")
async def confirm_avatar_upload(
    object_key: str,
    current_user: Dict[str, Any] = Depends(check_rate_limit),
    db: AsyncSession = Depends(get_db)
):
    """
    Confirmar que el avatar se subió correctamente y actualizar el perfil
    
    Args:
        object_key: Clave del objeto en R2
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
        
        # Extraer avatar_id del object_key (formato: avatars/avatar_{user_id}_{uuid}.ext)
        avatar_id = object_key.split('/')[-1]
        
        # Actualizar perfil con el nuevo avatar
        updated_profile = await UserProfileService.update_avatar(
            db, profile.id, 'uploaded', avatar_id=avatar_id
        )
        
        logger.info(f"Avatar upload confirmed for user {current_user['uid']}: {avatar_id}")
        
        return {
            "message": "Avatar actualizado exitosamente",
            "avatar_id": avatar_id,
            "avatar_url": updated_profile.avatar_url
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error confirming avatar upload for user {current_user['uid']}: {str(e)}")
        raise HTTPException(status_code=500, detail="Error confirmando subida de avatar")

@router.delete("/avatar/{avatar_id}")
async def delete_avatar(
    avatar_id: str,
    current_user: Dict[str, Any] = Depends(check_rate_limit),
    db: AsyncSession = Depends(get_db)
):
    """
    Eliminar avatar del usuario
    
    Args:
        avatar_id: ID del avatar a eliminar
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
        
        # Eliminar avatar de R2
        deleted = await r2_storage.delete_avatar(avatar_id)
        
        if not deleted:
            raise HTTPException(
                status_code=404,
                detail="Avatar no encontrado"
            )
        
        # Actualizar perfil para remover referencia al avatar
        updated_profile = await UserProfileService.update_avatar(
            db, profile.id, 'icon', icon_name='default'
        )
        
        logger.info(f"Avatar deleted for user {current_user['uid']}: {avatar_id}")
        
        return {
            "message": "Avatar eliminado exitosamente",
            "avatar_url": updated_profile.avatar_url
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting avatar {avatar_id} for user {current_user['uid']}: {str(e)}")
        raise HTTPException(status_code=500, detail="Error eliminando avatar") 