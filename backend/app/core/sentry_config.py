import os
import sentry_sdk
from sentry_sdk.integrations.fastapi import FastApiIntegration
from sentry_sdk.integrations.starlette import StarletteIntegration
from sentry_sdk.integrations.logging import LoggingIntegration
from sentry_sdk.integrations.redis import RedisIntegration
from sentry_sdk.integrations.sqlalchemy import SqlalchemyIntegration
from sentry_sdk.integrations.asyncio import AsyncioIntegration
from sentry_sdk.integrations.httpx import HttpxIntegration
from loguru import logger
import logging

def init_sentry():
    """
    Inicializar Sentry SDK con todas las integraciones necesarias
    """
    # Configurar logging para Sentry
    logging.basicConfig(level=logging.INFO)
    sentry_logging = LoggingIntegration(
        level=logging.INFO,        # Capturar logs de nivel INFO y superior
        event_level=logging.ERROR  # Enviar a Sentry solo errores
    )
    
    # Inicializar Sentry
    sentry_sdk.init(
        dsn=os.getenv("SENTRY_DSN"),
        traces_sample_rate=float(os.getenv("SENTRY_TRACES_SAMPLE_RATE", "0.2")),
        environment=os.getenv("ENVIRONMENT", "development"),
        release=os.getenv("GIT_SHA", "unknown"),  # Git SHA para tracking de releases
        debug=os.getenv("ENVIRONMENT") == "development",
        
        # Integraciones
        integrations=[
            FastApiIntegration(),
            StarletteIntegration(),
            sentry_logging,
            RedisIntegration(),
            SqlalchemyIntegration(),
            AsyncioIntegration(),
            HttpxIntegration(),
        ],
        
        # Configuración adicional
        before_send=before_send_to_sentry,
        before_breadcrumb=before_breadcrumb_to_sentry,
        
        # Configuración de performance
        profiles_sample_rate=float(os.getenv("SENTRY_PROFILES_SAMPLE_RATE", "0.1")),
        
        # Configuración de errores
        max_breadcrumbs=50,
        attach_stacktrace=True,
        send_default_pii=False,  # No enviar datos personales por defecto
    )
    
    logger.info("Sentry initialized successfully")

def before_send_to_sentry(event, hint):
    """
    Filtrar eventos antes de enviar a Sentry
    
    Args:
        event: Evento de Sentry
        hint: Información adicional del evento
    
    Returns:
        Evento filtrado o None para no enviar
    """
    # No enviar errores de desarrollo a Sentry
    if os.getenv("ENVIRONMENT") == "development":
        return None
    
    # Filtrar errores específicos que no queremos reportar
    if hint and "exc_info" in hint:
        exc_type, exc_value, exc_traceback = hint["exc_info"]
        
        # No reportar errores de validación de Pydantic
        if "pydantic" in str(exc_type).lower():
            return None
        
        # No reportar errores de autenticación
        if "unauthorized" in str(exc_value).lower():
            return None
    
    # Añadir tags adicionales
    event.setdefault("tags", {}).update({
        "service": "spartan-market-api",
        "version": os.getenv("APP_VERSION", "1.0.0"),
    })
    
    return event

def before_breadcrumb_to_sentry(breadcrumb, hint):
    """
    Filtrar breadcrumbs antes de enviar a Sentry
    
    Args:
        breadcrumb: Breadcrumb de Sentry
        hint: Información adicional
    
    Returns:
        Breadcrumb filtrado o None para no enviar
    """
    # No enviar breadcrumbs de desarrollo
    if os.getenv("ENVIRONMENT") == "development":
        return None
    
    # Filtrar breadcrumbs sensibles
    if "password" in str(breadcrumb).lower() or "token" in str(breadcrumb).lower():
        return None
    
    return breadcrumb

def set_user_context(user_id: str, user_email: str = None, user_alias: str = None):
    """
    Establecer contexto de usuario en Sentry
    
    Args:
        user_id: ID del usuario
        user_email: Email del usuario (opcional)
        user_alias: Alias del usuario (opcional)
    """
    sentry_sdk.set_user({
        "id": user_id,
        "email": user_email,
        "username": user_alias,
    })

def set_tag(key: str, value: str):
    """
    Establecer tag en Sentry
    
    Args:
        key: Clave del tag
        value: Valor del tag
    """
    sentry_sdk.set_tag(key, value)

def set_context(name: str, data: dict):
    """
    Establecer contexto en Sentry
    
    Args:
        name: Nombre del contexto
        data: Datos del contexto
    """
    sentry_sdk.set_context(name, data)

def capture_exception(error: Exception, user_id: str = None, **kwargs):
    """
    Capturar excepción en Sentry
    
    Args:
        error: Excepción a capturar
        user_id: ID del usuario (opcional)
        **kwargs: Datos adicionales
    """
    if user_id:
        set_user_context(user_id)
    
    # Añadir datos adicionales
    if kwargs:
        set_context("additional_data", kwargs)
    
    sentry_sdk.capture_exception(error)

def capture_message(message: str, level: str = "info", user_id: str = None, **kwargs):
    """
    Capturar mensaje en Sentry
    
    Args:
        message: Mensaje a capturar
        level: Nivel del mensaje (info, warning, error)
        user_id: ID del usuario (opcional)
        **kwargs: Datos adicionales
    """
    if user_id:
        set_user_context(user_id)
    
    # Añadir datos adicionales
    if kwargs:
        set_context("additional_data", kwargs)
    
    sentry_sdk.capture_message(message, level=level)

def start_transaction(name: str, operation: str = None):
    """
    Iniciar transacción en Sentry
    
    Args:
        name: Nombre de la transacción
        operation: Operación (opcional)
    
    Returns:
        Transacción de Sentry
    """
    return sentry_sdk.start_transaction(
        name=name,
        op=operation
    )

# Decorador para capturar errores automáticamente
def sentry_capture_errors(func):
    """
    Decorador para capturar errores automáticamente en Sentry
    
    Args:
        func: Función a decorar
    
    Returns:
        Función decorada
    """
    import functools
    
    @functools.wraps(func)
    async def wrapper(*args, **kwargs):
        try:
            return await func(*args, **kwargs)
        except Exception as e:
            capture_exception(e, context=func.__name__)
            raise
    
    return wrapper

# Configuración de alertas (para Slack)
SENTRY_ALERT_CONFIG = {
    "error_rate_threshold": 0.02,  # 2%
    "error_rate_window": 300,      # 5 minutos
    "slack_channel": "#alerts",
    "slack_webhook_url": os.getenv("SLACK_WEBHOOK_URL"),
}

def configure_sentry_alerts():
    """
    Configurar alertas de Sentry (requiere configuración adicional)
    """
    # Esta función se puede expandir para configurar alertas automáticas
    # Por ahora es un placeholder para futuras implementaciones
    logger.info("Sentry alerts configuration placeholder") 