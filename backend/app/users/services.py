from typing import Optional, List, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete
from sqlalchemy.orm import selectinload
from fastapi import HTTPException
import logging

from .models import UserProfile, UserPrivacySettings, UserPurchase
from .schemas import (
    CompleteProfileRequest, UpdateProfileRequest, 
    UserProfileResponse, PublicProfileResponse,
    AVATAR_ICONS
)
from .utils import (
    validate_alias_with_lock, sanitize_text, 
    generate_avatar_url, calculate_profile_completion
)
from ..core.privacy import PrivacyManager, get_user_privacy_settings

logger = logging.getLogger(__name__)

class UserProfileService:
    """Servicio para gestión de perfiles de usuario"""
    
    @staticmethod
    async def create_profile(
        db: AsyncSession, 
        uid: str, 
        profile_data: CompleteProfileRequest
    ) -> UserProfile:
        """
        Crea un nuevo perfil de usuario
        
        Args:
            db: Sesión de base de datos
            uid: Firebase UID del usuario
            profile_data: Datos del perfil
        
        Returns:
            UserProfile: Perfil creado
        
        Raises:
            HTTPException: Si el alias ya existe o datos inválidos
        """
        try:
            # Validar alias único
            is_available, message = await validate_alias_with_lock(
                profile_data.alias, db
            )
            
            if not is_available:
                raise HTTPException(status_code=409, detail=message)
            
            # Sanitizar datos
            sanitized_data = {
                'uid': uid,
                'alias': profile_data.alias.lower(),
                'name': sanitize_text(profile_data.name),
                'age': profile_data.age,
                'gender': profile_data.gender.value,
                'location': profile_data.location.value,
                'phrase': sanitize_text(profile_data.phrase) if profile_data.phrase else None,
                'about_me': sanitize_text(profile_data.about_me) if profile_data.about_me else None,
                'interests': sanitize_text(profile_data.interests) if profile_data.interests else None,
                'avatar_type': 'icon',
                'avatar_url': generate_avatar_url('icon', 'user')
            }
            
            # Crear perfil
            profile = UserProfile(**sanitized_data)
            db.add(profile)
            await db.commit()
            await db.refresh(profile)
            
            # Crear configuración de privacidad por defecto
            await PrivacyManager.create_default_privacy_settings(db, profile.id)
            
            logger.info(f"Created profile for user {uid} with alias {profile_data.alias}")
            return profile
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error creating profile for user {uid}: {str(e)}")
            await db.rollback()
            raise HTTPException(status_code=500, detail="Error interno al crear perfil")
    
    @staticmethod
    async def get_profile_by_uid(db: AsyncSession, uid: str) -> Optional[UserProfile]:
        """
        Obtiene perfil por Firebase UID
        
        Args:
            db: Sesión de base de datos
            uid: Firebase UID
        
        Returns:
            UserProfile or None: Perfil encontrado
        """
        try:
            query = select(UserProfile).where(UserProfile.uid == uid)
            result = await db.execute(query)
            return result.scalar_one_or_none()
        except Exception as e:
            logger.error(f"Error getting profile for UID {uid}: {str(e)}")
            return None
    
    @staticmethod
    async def get_profile_by_alias(db: AsyncSession, alias: str) -> Optional[UserProfile]:
        """
        Obtiene perfil por alias
        
        Args:
            db: Sesión de base de datos
            alias: Alias del usuario
        
        Returns:
            UserProfile or None: Perfil encontrado
        """
        try:
            query = select(UserProfile).where(UserProfile.alias == alias.lower())
            result = await db.execute(query)
            return result.scalar_one_or_none()
        except Exception as e:
            logger.error(f"Error getting profile for alias {alias}: {str(e)}")
            return None
    
    @staticmethod
    async def update_profile(
        db: AsyncSession, 
        profile_id: int, 
        update_data: UpdateProfileRequest
    ) -> UserProfile:
        """
        Actualiza un perfil existente
        
        Args:
            db: Sesión de base de datos
            profile_id: ID del perfil
            update_data: Datos a actualizar
        
        Returns:
            UserProfile: Perfil actualizado
        
        Raises:
            HTTPException: Si el alias ya existe o datos inválidos
        """
        try:
            # Obtener perfil actual
            query = select(UserProfile).where(UserProfile.id == profile_id)
            result = await db.execute(query)
            profile = result.scalar_one_or_none()
            
            if not profile:
                raise HTTPException(status_code=404, detail="Perfil no encontrado")
            
            # Preparar datos de actualización
            update_fields = {}
            
            if update_data.name is not None:
                update_fields['name'] = sanitize_text(update_data.name)
            
            if update_data.age is not None:
                update_fields['age'] = update_data.age
            
            if update_data.gender is not None:
                update_fields['gender'] = update_data.gender.value
            
            if update_data.location is not None:
                update_fields['location'] = update_data.location.value
            
            if update_data.alias is not None:
                # Validar alias único (excluyendo el usuario actual)
                is_available, message = await validate_alias_with_lock(
                    update_data.alias, db, profile_id
                )
                
                if not is_available:
                    raise HTTPException(status_code=409, detail=message)
                
                update_fields['alias'] = update_data.alias.lower()
            
            if update_data.phrase is not None:
                update_fields['phrase'] = sanitize_text(update_data.phrase)
            
            if update_data.about_me is not None:
                update_fields['about_me'] = sanitize_text(update_data.about_me)
            
            if update_data.interests is not None:
                update_fields['interests'] = sanitize_text(update_data.interests)
            
            # Actualizar perfil
            if update_fields:
                stmt = (
                    update(UserProfile)
                    .where(UserProfile.id == profile_id)
                    .values(**update_fields)
                )
                await db.execute(stmt)
                await db.commit()
                await db.refresh(profile)
            
            logger.info(f"Updated profile {profile_id}")
            return profile
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error updating profile {profile_id}: {str(e)}")
            await db.rollback()
            raise HTTPException(status_code=500, detail="Error interno al actualizar perfil")
    
    @staticmethod
    async def get_public_profile(
        db: AsyncSession, 
        alias: str, 
        viewer_type: str = "public"
    ) -> Optional[Dict[str, Any]]:
        """
        Obtiene perfil público filtrado por privacidad
        
        Args:
            db: Sesión de base de datos
            alias: Alias del usuario
            viewer_type: Tipo de visor (public, admin, owner)
        
        Returns:
            dict or None: Datos públicos del perfil
        """
        try:
            # Obtener perfil con configuración de privacidad
            query = (
                select(UserProfile)
                .options(selectinload(UserProfile.privacy_settings))
                .where(UserProfile.alias == alias.lower())
            )
            result = await db.execute(query)
            profile = result.scalar_one_or_none()
            
            if not profile:
                return None
            
            # Obtener configuración de privacidad
            privacy_settings = profile.privacy_settings
            
            if not privacy_settings:
                # Crear configuración por defecto si no existe
                privacy_settings = await PrivacyManager.create_default_privacy_settings(
                    db, profile.id
                )
            
            # Filtrar campos según privacidad
            public_data = PrivacyManager.get_public_fields_for_viewer(
                profile, privacy_settings, viewer_type
            )
            
            return public_data
            
        except Exception as e:
            logger.error(f"Error getting public profile for alias {alias}: {str(e)}")
            return None
    
    @staticmethod
    async def update_avatar(
        db: AsyncSession, 
        profile_id: int, 
        avatar_type: str, 
        icon_name: Optional[str] = None,
        image_filename: Optional[str] = None
    ) -> UserProfile:
        """
        Actualiza el avatar del usuario
        
        Args:
            db: Sesión de base de datos
            profile_id: ID del perfil
            avatar_type: Tipo de avatar (icon, uploaded)
            icon_name: Nombre del ícono (si avatar_type es icon)
            image_filename: Nombre del archivo (si avatar_type es uploaded)
        
        Returns:
            UserProfile: Perfil actualizado
        """
        try:
            # Obtener perfil
            query = select(UserProfile).where(UserProfile.id == profile_id)
            result = await db.execute(query)
            profile = result.scalar_one_or_none()
            
            if not profile:
                raise HTTPException(status_code=404, detail="Perfil no encontrado")
            
            # Generar URL del avatar
            if avatar_type == 'icon' and icon_name:
                avatar_url = generate_avatar_url('icon', icon_name)
            elif avatar_type == 'uploaded' and image_filename:
                avatar_url = generate_avatar_url('uploaded', image_filename)
            else:
                raise HTTPException(status_code=400, detail="Datos de avatar inválidos")
            
            # Actualizar avatar
            profile.avatar_type = avatar_type
            profile.avatar_url = avatar_url
            
            await db.commit()
            await db.refresh(profile)
            
            logger.info(f"Updated avatar for profile {profile_id}")
            return profile
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error updating avatar for profile {profile_id}: {str(e)}")
            await db.rollback()
            raise HTTPException(status_code=500, detail="Error interno al actualizar avatar")
    
    @staticmethod
    async def get_avatar_options() -> List[Dict[str, str]]:
        """
        Obtiene opciones de avatar disponibles
        
        Returns:
            List[Dict]: Lista de íconos disponibles
        """
        return AVATAR_ICONS
    
    @staticmethod
    async def get_profile_completion(profile: UserProfile) -> Dict[str, Any]:
        """
        Calcula el porcentaje de completado del perfil
        
        Args:
            profile: Perfil del usuario
        
        Returns:
            dict: Información de completado
        """
        return calculate_profile_completion(profile)

class PrivacyService:
    """Servicio para gestión de privacidad"""
    
    @staticmethod
    async def get_privacy_settings(
        db: AsyncSession, 
        user_id: int
    ) -> Optional[UserPrivacySettings]:
        """
        Obtiene configuración de privacidad
        
        Args:
            db: Sesión de base de datos
            user_id: ID del usuario
        
        Returns:
            UserPrivacySettings or None: Configuración de privacidad
        """
        return await get_user_privacy_settings(db, user_id)
    
    @staticmethod
    async def update_privacy_settings(
        db: AsyncSession, 
        user_id: int, 
        privacy_data: Dict[str, bool]
    ) -> UserPrivacySettings:
        """
        Actualiza configuración de privacidad
        
        Args:
            db: Sesión de base de datos
            user_id: ID del usuario
            privacy_data: Datos de privacidad
        
        Returns:
            UserPrivacySettings: Configuración actualizada
        """
        return await PrivacyManager.update_privacy_settings(db, user_id, privacy_data)

class PurchaseService:
    """Servicio para gestión de compras"""
    
    @staticmethod
    async def get_user_purchases(
        db: AsyncSession, 
        user_id: int, 
        page: int = 1, 
        limit: int = 10,
        status: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Obtiene historial de compras del usuario
        
        Args:
            db: Sesión de base de datos
            user_id: ID del usuario
            page: Número de página
            limit: Elementos por página
            status: Filtrar por estado
        
        Returns:
            dict: Historial de compras paginado
        """
        try:
            # Construir query base
            query = select(UserPurchase).where(UserPurchase.user_id == user_id)
            
            # Filtrar por estado si se especifica
            if status:
                query = query.where(UserPurchase.status == status)
            
            # Contar total
            count_query = select(UserPurchase).where(UserPurchase.user_id == user_id)
            if status:
                count_query = count_query.where(UserPurchase.status == status)
            
            count_result = await db.execute(count_query)
            total = len(count_result.scalars().all())
            
            # Paginar
            offset = (page - 1) * limit
            query = query.offset(offset).limit(limit)
            query = query.order_by(UserPurchase.created_at.desc())
            
            result = await db.execute(query)
            purchases = result.scalars().all()
            
            return {
                'purchases': purchases,
                'total': total,
                'page': page,
                'limit': limit,
                'pages': (total + limit - 1) // limit
            }
            
        except Exception as e:
            logger.error(f"Error getting purchases for user {user_id}: {str(e)}")
            return {
                'purchases': [],
                'total': 0,
                'page': page,
                'limit': limit,
                'pages': 0
            } 