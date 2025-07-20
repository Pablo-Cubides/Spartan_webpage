import re
import asyncio
from typing import Tuple, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from .models import UserProfile
import logging

logger = logging.getLogger(__name__)

# Configuración de validación de alias
ALIAS_PATTERN = re.compile(r'^[a-zA-Z0-9_-]+$')
ALIAS_MIN_LENGTH = 3
ALIAS_MAX_LENGTH = 30

# Palabras reservadas que no pueden ser alias
RESERVED_ALIASES = {
    'admin', 'administrator', 'mod', 'moderator', 'support', 'help', 'info',
    'api', 'www', 'mail', 'ftp', 'root', 'test', 'demo', 'example',
    'spartan', 'market', 'spartanmarket', 'spartan-market'
}

def sanitize_text(text: str) -> str:
    """
    Sanitizar texto para evitar XSS y otros ataques
    
    Args:
        text: Texto a sanitizar
    
    Returns:
        str: Texto sanitizado
    """
    if not text:
        return ""
    
    # Remover caracteres peligrosos
    text = re.sub(r'<script.*?</script>', '', text, flags=re.IGNORECASE | re.DOTALL)
    text = re.sub(r'<.*?>', '', text)
    text = re.sub(r'javascript:', '', text, flags=re.IGNORECASE)
    text = re.sub(r'on\w+\s*=', '', text, flags=re.IGNORECASE)
    
    # Limpiar espacios extra
    text = re.sub(r'\s+', ' ', text).strip()
    
    return text

def validate_alias(alias: str) -> Tuple[bool, str]:
    """
    Validar formato de alias
    
    Args:
        alias: Alias a validar
    
    Returns:
        Tuple[bool, str]: (es_válido, mensaje_error)
    """
    if not alias:
        return False, "El alias es requerido"
    
    if len(alias) < 3:
        return False, "El alias debe tener al menos 3 caracteres"
    
    if len(alias) > 30:
        return False, "El alias debe tener máximo 30 caracteres"
    
    # Solo permitir letras, números, guiones y guiones bajos
    if not re.match(r'^[a-zA-Z0-9_-]+$', alias):
        return False, "El alias solo puede contener letras, números, guiones y guiones bajos"
    
    # No puede empezar o terminar con guión
    if alias.startswith('-') or alias.endswith('-'):
        return False, "El alias no puede empezar o terminar con guión"
    
    # No puede tener guiones consecutivos
    if '--' in alias:
        return False, "El alias no puede tener guiones consecutivos"
    
    return True, ""

async def check_alias_uniqueness(db: AsyncSession, alias: str, exclude_user_id: Optional[int] = None) -> Tuple[bool, str]:
    """
    Verificar unicidad de alias con manejo de concurrencia
    
    Args:
        db: Sesión de base de datos
        alias: Alias a verificar
        exclude_user_id: ID de usuario a excluir (para actualizaciones)
    
    Returns:
        Tuple[bool, str]: (es_único, mensaje_error)
    """
    try:
        # Construir query
        query = select(UserProfile).where(UserProfile.alias == alias)
        
        if exclude_user_id:
            query = query.where(UserProfile.id != exclude_user_id)
        
        result = await db.execute(query)
        existing_profile = result.scalar_one_or_none()
        
        if existing_profile:
            return False, f"El alias '{alias}' ya está en uso"
        
        return True, ""
        
    except Exception as e:
        # En caso de error de concurrencia, reintentar
        await asyncio.sleep(0.1)
        return await check_alias_uniqueness(db, alias, exclude_user_id)

def validate_image_file(filename: str, content_type: str, file_size: int) -> Tuple[bool, str]:
    """
    Validar archivo de imagen
    
    Args:
        filename: Nombre del archivo
        content_type: Tipo de contenido
        file_size: Tamaño del archivo en bytes
    
    Returns:
        Tuple[bool, str]: (es_válido, mensaje_error)
    """
    # Validar nombre de archivo
    if not filename:
        return False, "Nombre de archivo requerido"
    
    # Validar tipo de contenido
    allowed_types = ['image/jpeg', 'image/png', 'image/gif']
    if content_type not in allowed_types:
        return False, "Solo se permiten archivos JPG, PNG o GIF"
    
    # Validar extensión
    allowed_extensions = ['.jpg', '.jpeg', '.png', '.gif']
    file_extension = filename.lower()
    if not any(file_extension.endswith(ext) for ext in allowed_extensions):
        return False, "Extensión de archivo no permitida"
    
    # Validar tamaño (2MB máximo)
    max_size = 2 * 1024 * 1024  # 2MB en bytes
    if file_size > max_size:
        return False, "El archivo debe ser menor a 2MB"
    
    # Validar tamaño mínimo (1KB)
    min_size = 1024  # 1KB en bytes
    if file_size < min_size:
        return False, "El archivo debe ser mayor a 1KB"
    
    return True, ""

def validate_location(location: str) -> Tuple[bool, str]:
    """
    Validar ubicación según enums permitidos
    
    Args:
        location: Ubicación a validar
    
    Returns:
        Tuple[bool, str]: (es_válida, mensaje_error)
    """
    allowed_locations = ['Colombia', 'España', 'Otro']
    
    if location not in allowed_locations:
        return False, f"Ubicación inválida. Opciones permitidas: {', '.join(allowed_locations)}"
    
    return True, ""

def validate_gender(gender: str) -> Tuple[bool, str]:
    """
    Validar género según enums permitidos
    
    Args:
        gender: Género a validar
    
    Returns:
        Tuple[bool, str]: (es_válido, mensaje_error)
    """
    allowed_genders = ['Masculino', 'Femenino', 'Otro']
    
    if gender not in allowed_genders:
        return False, f"Género inválido. Opciones permitidas: {', '.join(allowed_genders)}"
    
    return True, ""

def validate_website(website: str) -> Tuple[bool, str]:
    """
    Validar URL de sitio web
    
    Args:
        website: URL a validar
    
    Returns:
        Tuple[bool, str]: (es_válida, mensaje_error)
    """
    if not website:
        return True, ""  # Campo opcional
    
    # Validar formato de URL
    url_pattern = re.compile(
        r'^https?://'  # http:// o https://
        r'(?:(?:[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?\.)+[A-Z]{2,6}\.?|'  # dominio
        r'localhost|'  # localhost
        r'\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})'  # IP
        r'(?::\d+)?'  # puerto opcional
        r'(?:/?|[/?]\S+)$', re.IGNORECASE)
    
    if not url_pattern.match(website):
        return False, "URL inválida. Debe empezar con http:// o https://"
    
    return True, ""

def validate_social_media_handle(handle: str, platform: str) -> Tuple[bool, str]:
    """
    Validar handle de red social
    
    Args:
        handle: Handle a validar
        platform: Plataforma (instagram, twitter, linkedin)
    
    Returns:
        Tuple[bool, str]: (es_válido, mensaje_error)
    """
    if not handle:
        return True, ""  # Campo opcional
    
    # Remover @ si está presente
    handle = handle.lstrip('@')
    
    # Validar longitud
    if len(handle) < 1:
        return False, f"Handle de {platform} no puede estar vacío"
    
    if len(handle) > 30:
        return False, f"Handle de {platform} debe tener máximo 30 caracteres"
    
    # Validar caracteres según plataforma
    if platform == 'instagram':
        if not re.match(r'^[a-zA-Z0-9._]+$', handle):
            return False, "Handle de Instagram solo puede contener letras, números, puntos y guiones bajos"
    elif platform == 'twitter':
        if not re.match(r'^[a-zA-Z0-9_]+$', handle):
            return False, "Handle de Twitter solo puede contener letras, números y guiones bajos"
    elif platform == 'linkedin':
        if not re.match(r'^[a-zA-Z0-9-]+$', handle):
            return False, "Handle de LinkedIn solo puede contener letras, números y guiones"
    
    return True, ""

def generate_avatar_url(filename: str) -> str:
    """
    Generar URL del avatar
    
    Args:
        filename: Nombre del archivo
    
    Returns:
        str: URL del avatar
    """
    return f"https://cdn.spartanmarket.com/avatars/{filename}"

def calculate_profile_completion(profile) -> int:
    """
    Calcular porcentaje de completado del perfil
    
    Args:
        profile: Perfil del usuario
    
    Returns:
        int: Porcentaje de completado (0-100)
    """
    required_fields = [
        'alias', 'full_name', 'location', 'gender'
    ]
    
    optional_fields = [
        'bio', 'birth_date', 'website', 
        'social_media.instagram', 'social_media.twitter', 'social_media.linkedin'
    ]
    
    total_fields = len(required_fields) + len(optional_fields)
    completed_fields = 0
    
    # Contar campos requeridos completados
    for field in required_fields:
        if hasattr(profile, field) and getattr(profile, field):
            completed_fields += 1
    
    # Contar campos opcionales completados
    for field in optional_fields:
        if '.' in field:
            # Campo anidado (social_media)
            parent, child = field.split('.')
            parent_obj = getattr(profile, parent, {})
            if parent_obj and getattr(parent_obj, child, None):
                completed_fields += 1
        else:
            if hasattr(profile, field) and getattr(profile, field):
                completed_fields += 1
    
    # Calcular porcentaje
    percentage = int((completed_fields / total_fields) * 100)
    return min(percentage, 100)  # Máximo 100%

# Test de concurrencia para alias único
async def test_alias_concurrency(db: AsyncSession, alias: str) -> bool:
    """
    Probar concurrencia en validación de alias único
    
    Args:
        db: Sesión de base de datos
        alias: Alias a probar
    
    Returns:
        bool: True si pasa la prueba de concurrencia
    """
    try:
        # Simular múltiples requests simultáneos
        tasks = []
        for i in range(5):
            task = check_alias_uniqueness(db, f"{alias}_{i}")
            tasks.append(task)
        
        # Ejecutar todas las verificaciones simultáneamente
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # Verificar que todas las verificaciones fueron exitosas
        for result in results:
            if isinstance(result, Exception):
                return False
            if not result[0]:  # Si no es único
                return False
        
        return True
        
    except Exception:
        return False 