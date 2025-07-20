import os
import uuid
from typing import Optional
from loguru import logger
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response
import json
import time

# Configurar logger principal
logger.remove()  # Remover handler por defecto

# Handler para archivos JSON con rotación
logger.add(
    "logs/app_{time}.json",
    rotation="1 day",
    retention="30 days",
    compression="zip",
    serialize=True,
    level="INFO",
    format="{time:YYYY-MM-DD HH:mm:ss} | {level} | {extra[trace_id]} | {extra[user_id]} | {extra[endpoint]} | {extra[status_code]} | {message}"
)

# Handler para consola en desarrollo
if os.getenv("ENVIRONMENT", "development") == "development":
    logger.add(
        "logs/console.log",
        level="DEBUG",
        format="<green>{time:YYYY-MM-DD HH:mm:ss}</green> | <level>{level: <8}</level> | <cyan>{extra[trace_id]}</cyan> | <yellow>{extra[user_id]}</yellow> | <blue>{extra[endpoint]}</blue> | <red>{extra[status_code]}</red> | <white>{message}</white>"
    )

# Handler para errores
logger.add(
    "logs/errors_{time}.json",
    rotation="1 day",
    retention="30 days",
    compression="zip",
    serialize=True,
    level="ERROR",
    format="{time:YYYY-MM-DD HH:mm:ss} | {level} | {extra[trace_id]} | {extra[user_id]} | {extra[endpoint]} | {extra[status_code]} | {message} | {exception}"
)

class LoggingMiddleware(BaseHTTPMiddleware):
    """
    Middleware para logging de requests con contexto
    """
    
    async def dispatch(self, request: Request, call_next):
        # Generar trace_id único
        trace_id = str(uuid.uuid4())
        
        # Extraer user_id del token si existe
        user_id = None
        try:
            auth_header = request.headers.get("Authorization")
            if auth_header and auth_header.startswith("Bearer "):
                # Aquí se podría decodificar el token para extraer user_id
                # Por ahora usamos un placeholder
                user_id = "extracted_from_token"
        except Exception:
            pass
        
        # Crear logger con contexto
        request_logger = logger.bind(
            trace_id=trace_id,
            user_id=user_id or "anonymous",
            endpoint=f"{request.method} {request.url.path}",
            status_code=None
        )
        
        # Log del inicio de request
        request_logger.info(f"Request started: {request.method} {request.url.path}")
        
        # Procesar request
        start_time = time.time()
        try:
            response = await call_next(request)
            
            # Actualizar status_code en el logger
            request_logger = request_logger.bind(status_code=response.status_code)
            
            # Log del fin de request
            duration = time.time() - start_time
            request_logger.info(f"Request completed: {response.status_code} in {duration:.3f}s")
            
            return response
            
        except Exception as e:
            # Log de error
            request_logger = request_logger.bind(status_code=500)
            request_logger.error(f"Request failed: {str(e)}")
            raise

def get_logger(trace_id: Optional[str] = None, user_id: Optional[str] = None, endpoint: Optional[str] = None):
    """
    Obtener logger con contexto
    
    Args:
        trace_id: ID de trazabilidad
        user_id: ID del usuario
        endpoint: Endpoint siendo procesado
    
    Returns:
        Logger con contexto
    """
    extra = {}
    if trace_id:
        extra["trace_id"] = trace_id
    if user_id:
        extra["user_id"] = user_id
    if endpoint:
        extra["endpoint"] = endpoint
    
    return logger.bind(**extra)

# Función helper para logging de operaciones de negocio
def log_business_operation(
    operation: str,
    user_id: Optional[str] = None,
    trace_id: Optional[str] = None,
    **kwargs
):
    """
    Log de operaciones de negocio
    
    Args:
        operation: Nombre de la operación
        user_id: ID del usuario
        trace_id: ID de trazabilidad
        **kwargs: Datos adicionales para el log
    """
    business_logger = get_logger(trace_id=trace_id, user_id=user_id)
    business_logger.info(f"Business operation: {operation}", extra=kwargs)

# Función helper para logging de errores
def log_error(
    error: Exception,
    context: str,
    user_id: Optional[str] = None,
    trace_id: Optional[str] = None,
    **kwargs
):
    """
    Log de errores
    
    Args:
        error: Excepción capturada
        context: Contexto donde ocurrió el error
        user_id: ID del usuario
        trace_id: ID de trazabilidad
        **kwargs: Datos adicionales para el log
    """
    error_logger = get_logger(trace_id=trace_id, user_id=user_id)
    error_logger.error(f"Error in {context}: {str(error)}", extra=kwargs)

# Función helper para logging de métricas
def log_metric(
    metric_name: str,
    value: float,
    tags: Optional[dict] = None,
    user_id: Optional[str] = None,
    trace_id: Optional[str] = None
):
    """
    Log de métricas
    
    Args:
        metric_name: Nombre de la métrica
        value: Valor de la métrica
        tags: Tags adicionales
        user_id: ID del usuario
        trace_id: ID de trazabilidad
    """
    metric_logger = get_logger(trace_id=trace_id, user_id=user_id)
    extra = {"metric_name": metric_name, "value": value}
    if tags:
        extra.update(tags)
    metric_logger.info(f"Metric: {metric_name} = {value}", extra=extra) 