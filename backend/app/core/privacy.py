from typing import Dict, Any, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from ..users.models import UserProfile, UserPrivacySettings
import logging

logger = logging.getLogger(__name__)

class PrivacyManager:
    """Manejador de privacidad para perfiles de usuario"""
    
    @staticmethod
    async def get_privacy_settings(db: AsyncSession, user_id: int) -> Optional[UserPrivacySettings]:
        """
        Obtiene la configuración de privacidad de un usuario
        
        Args:
            db: Sesión de base de datos
            user_id: ID del usuario
        
        Returns:
            UserPrivacySettings or None: Configuración de privacidad
        """
        try:
            query = select(UserPrivacySettings).where(UserPrivacySettings.user_id == user_id)
            result = await db.execute(query)
            return result.scalar_one_or_none()
        except Exception as e:
            logger.error(f"Error getting privacy settings for user {user_id}: {str(e)}")
            return None
    
    @staticmethod
    async def create_default_privacy_settings(db: AsyncSession, user_id: int) -> UserPrivacySettings:
        """
        Crea configuración de privacidad por defecto para un usuario
        
        Args:
            db: Sesión de base de datos
            user_id: ID del usuario
        
        Returns:
            UserPrivacySettings: Configuración de privacidad creada
        """
        try:
            privacy_settings = UserPrivacySettings(
                user_id=user_id,
                name_public=False,
                age_public=False,
                gender_public=False,
                location_public=False,
                phrase_public=False,
                about_me_public=False,
                interests_public=False
            )
            
            db.add(privacy_settings)
            await db.commit()
            await db.refresh(privacy_settings)
            
            logger.info(f"Created default privacy settings for user {user_id}")
            return privacy_settings
            
        except Exception as e:
            logger.error(f"Error creating privacy settings for user {user_id}: {str(e)}")
            await db.rollback()
            raise
    
    @staticmethod
    async def update_privacy_settings(
        db: AsyncSession, 
        user_id: int, 
        privacy_data: Dict[str, bool]
    ) -> UserPrivacySettings:
        """
        Actualiza la configuración de privacidad de un usuario
        
        Args:
            db: Sesión de base de datos
            user_id: ID del usuario
            privacy_data: Datos de privacidad a actualizar
        
        Returns:
            UserPrivacySettings: Configuración de privacidad actualizada
        """
        try:
            privacy_settings = await PrivacyManager.get_privacy_settings(db, user_id)
            
            if not privacy_settings:
                privacy_settings = await PrivacyManager.create_default_privacy_settings(db, user_id)
            
            # Actualizar campos
            for field, value in privacy_data.items():
                if hasattr(privacy_settings, field) and isinstance(value, bool):
                    setattr(privacy_settings, field, value)
            
            await db.commit()
            await db.refresh(privacy_settings)
            
            logger.info(f"Updated privacy settings for user {user_id}")
            return privacy_settings
            
        except Exception as e:
            logger.error(f"Error updating privacy settings for user {user_id}: {str(e)}")
            await db.rollback()
            raise
    
    @staticmethod
    def filter_public_fields(profile: UserProfile, privacy_settings: UserPrivacySettings) -> Dict[str, Any]:
        """
        Filtra los campos del perfil según la configuración de privacidad
        
        Args:
            profile: Perfil del usuario
            privacy_settings: Configuración de privacidad
        
        Returns:
            dict: Campos públicos del perfil
        """
        public_data = {
            'alias': profile.alias,
            'avatar_url': profile.avatar_url,
            'avatar_type': profile.avatar_type
        }
        
        # Mapeo de campos a configuraciones de privacidad
        field_mappings = {
            'name': 'name_public',
            'age': 'age_public',
            'gender': 'gender_public',
            'location': 'location_public',
            'phrase': 'phrase_public',
            'about_me': 'about_me_public',
            'interests': 'interests_public'
        }
        
        # Agregar campos públicos
        for field, privacy_field in field_mappings.items():
            if hasattr(privacy_settings, privacy_field) and getattr(privacy_settings, privacy_field):
                value = getattr(profile, field)
                if value is not None:
                    public_data[field] = value
        
        return public_data
    
    @staticmethod
    def get_public_fields_for_viewer(
        profile: UserProfile, 
        privacy_settings: UserPrivacySettings, 
        viewer_type: str = "public"
    ) -> Dict[str, Any]:
        """
        Obtiene campos públicos según el tipo de visor
        
        Args:
            profile: Perfil del usuario
            privacy_settings: Configuración de privacidad
            viewer_type: Tipo de visor ("public", "admin", "owner")
        
        Returns:
            dict: Campos visibles para el visor
        """
        if viewer_type == "owner":
            # El propietario ve todos los campos
            return {
                'alias': profile.alias,
                'name': profile.name,
                'age': profile.age,
                'gender': profile.gender,
                'location': profile.location,
                'phrase': profile.phrase,
                'about_me': profile.about_me,
                'interests': profile.interests,
                'avatar_url': profile.avatar_url,
                'avatar_type': profile.avatar_type
            }
        elif viewer_type == "admin":
            # Los admins ven todos los campos
            return {
                'alias': profile.alias,
                'name': profile.name,
                'age': profile.age,
                'gender': profile.gender,
                'location': profile.location,
                'phrase': profile.phrase,
                'about_me': profile.about_me,
                'interests': profile.interests,
                'avatar_url': profile.avatar_url,
                'avatar_type': profile.avatar_type
            }
        else:
            # Visores públicos ven solo campos marcados como públicos
            return PrivacyManager.filter_public_fields(profile, privacy_settings)
    
    @staticmethod
    def validate_privacy_data(privacy_data: Dict[str, Any]) -> Dict[str, bool]:
        """
        Valida y normaliza datos de privacidad
        
        Args:
            privacy_data: Datos de privacidad a validar
        
        Returns:
            dict: Datos de privacidad validados
        """
        valid_fields = {
            'name_public', 'age_public', 'gender_public', 'location_public',
            'phrase_public', 'about_me_public', 'interests_public'
        }
        
        validated_data = {}
        
        for field, value in privacy_data.items():
            if field in valid_fields and isinstance(value, bool):
                validated_data[field] = value
        
        return validated_data
    
    @staticmethod
    def get_privacy_summary(privacy_settings: UserPrivacySettings) -> Dict[str, Any]:
        """
        Obtiene un resumen de la configuración de privacidad
        
        Args:
            privacy_settings: Configuración de privacidad
        
        Returns:
            dict: Resumen de privacidad
        """
        public_fields = []
        private_fields = []
        
        field_names = {
            'name_public': 'Nombre',
            'age_public': 'Edad',
            'gender_public': 'Género',
            'location_public': 'Ubicación',
            'phrase_public': 'Frase',
            'about_me_public': 'Sobre mí',
            'interests_public': 'Intereses'
        }
        
        for field, display_name in field_names.items():
            if hasattr(privacy_settings, field) and getattr(privacy_settings, field):
                public_fields.append(display_name)
            else:
                private_fields.append(display_name)
        
        return {
            'public_fields': public_fields,
            'private_fields': private_fields,
            'public_count': len(public_fields),
            'private_count': len(private_fields),
            'total_fields': len(field_names)
        }

# Funciones de utilidad para privacidad
async def get_user_privacy_settings(db: AsyncSession, user_id: int) -> Optional[UserPrivacySettings]:
    """
    Obtiene configuración de privacidad de un usuario
    
    Args:
        db: Sesión de base de datos
        user_id: ID del usuario
    
    Returns:
        UserPrivacySettings or None: Configuración de privacidad
    """
    return await PrivacyManager.get_privacy_settings(db, user_id)

async def ensure_privacy_settings(db: AsyncSession, user_id: int) -> UserPrivacySettings:
    """
    Asegura que un usuario tenga configuración de privacidad
    
    Args:
        db: Sesión de base de datos
        user_id: ID del usuario
    
    Returns:
        UserPrivacySettings: Configuración de privacidad
    """
    privacy_settings = await get_user_privacy_settings(db, user_id)
    
    if not privacy_settings:
        privacy_settings = await PrivacyManager.create_default_privacy_settings(db, user_id)
    
    return privacy_settings

def get_public_profile_data(profile: UserProfile, privacy_settings: UserPrivacySettings) -> Dict[str, Any]:
    """
    Obtiene datos públicos del perfil
    
    Args:
        profile: Perfil del usuario
        privacy_settings: Configuración de privacidad
    
    Returns:
        dict: Datos públicos del perfil
    """
    return PrivacyManager.filter_public_fields(profile, privacy_settings) 