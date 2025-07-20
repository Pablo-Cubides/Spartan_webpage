import firebase_admin
from firebase_admin import auth, credentials
from fastapi import HTTPException, Depends, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional, Dict, Any
import logging
import os
from functools import wraps

logger = logging.getLogger(__name__)

# Configuración de Firebase
FIREBASE_PROJECT_ID = os.getenv("FIREBASE_PROJECT_ID", "spartan-market")
FIREBASE_PRIVATE_KEY = os.getenv("FIREBASE_PRIVATE_KEY")
FIREBASE_CLIENT_EMAIL = os.getenv("FIREBASE_CLIENT_EMAIL")

# Inicializar Firebase Admin SDK
try:
    if not firebase_admin._apps:
        if FIREBASE_PRIVATE_KEY and FIREBASE_CLIENT_EMAIL:
            # Usar credenciales de servicio
            cred = credentials.Certificate({
                "type": "service_account",
                "project_id": FIREBASE_PROJECT_ID,
                "private_key_id": os.getenv("FIREBASE_PRIVATE_KEY_ID"),
                "private_key": FIREBASE_PRIVATE_KEY.replace('\\n', '\n'),
                "client_email": FIREBASE_CLIENT_EMAIL,
                "client_id": os.getenv("FIREBASE_CLIENT_ID"),
                "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                "token_uri": "https://oauth2.googleapis.com/token",
                "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
                "client_x509_cert_url": f"https://www.googleapis.com/robot/v1/metadata/x509/{FIREBASE_CLIENT_EMAIL}"
            })
        else:
            # Usar credenciales por defecto (para desarrollo)
            cred = credentials.ApplicationDefault()
        
        firebase_admin.initialize_app(cred, {
            'projectId': FIREBASE_PROJECT_ID,
        })
        logger.info("Firebase Admin SDK initialized successfully")
    else:
        logger.info("Firebase Admin SDK already initialized")
except Exception as e:
    logger.error(f"Error initializing Firebase Admin SDK: {str(e)}")
    raise

# Security scheme
security = HTTPBearer()

class FirebaseAuth:
    """Clase para manejar autenticación de Firebase"""
    
    @staticmethod
    async def verify_token(token: str) -> Dict[str, Any]:
        """
        Verifica el token de Firebase y retorna la información del usuario
        
        Args:
            token: JWT token de Firebase
        
        Returns:
            dict: Información del usuario autenticado
        
        Raises:
            HTTPException: Si el token es inválido
        """
        try:
            # Decodificar y verificar el token
            decoded_token = auth.verify_id_token(token)
            
            # Extraer información relevante
            user_info = {
                'uid': decoded_token['uid'],
                'email': decoded_token.get('email'),
                'email_verified': decoded_token.get('email_verified', False),
                'name': decoded_token.get('name'),
                'picture': decoded_token.get('picture'),
                'provider_id': decoded_token.get('firebase', {}).get('sign_in_provider', 'unknown')
            }
            
            logger.info(f"Token verified for user: {user_info['uid']}")
            return user_info
            
        except auth.ExpiredIdTokenError:
            logger.warning("Expired ID token")
            raise HTTPException(status_code=401, detail="Token expirado")
        except auth.RevokedIdTokenError:
            logger.warning("Revoked ID token")
            raise HTTPException(status_code=401, detail="Token revocado")
        except auth.InvalidIdTokenError:
            logger.warning("Invalid ID token")
            raise HTTPException(status_code=401, detail="Token inválido")
        except Exception as e:
            logger.error(f"Error verifying token: {str(e)}")
            raise HTTPException(status_code=401, detail="Error al verificar token")

    @staticmethod
    async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> Dict[str, Any]:
        """
        Obtiene el usuario actual basado en el token de autenticación
        
        Args:
            credentials: Credenciales de autenticación
        
        Returns:
            dict: Información del usuario autenticado
        """
        token = credentials.credentials
        return await FirebaseAuth.verify_token(token)

    @staticmethod
    async def get_optional_user(request: Request) -> Optional[Dict[str, Any]]:
        """
        Obtiene el usuario actual si existe token, None si no hay token
        
        Args:
            request: Request de FastAPI
        
        Returns:
            dict or None: Información del usuario o None
        """
        try:
            auth_header = request.headers.get('Authorization')
            if not auth_header or not auth_header.startswith('Bearer '):
                return None
            
            token = auth_header.split('Bearer ')[1]
            return await FirebaseAuth.verify_token(token)
        except Exception:
            return None

    @staticmethod
    async def require_auth(func):
        """
        Decorador para requerir autenticación en endpoints
        
        Args:
            func: Función a decorar
        
        Returns:
            function: Función decorada
        """
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # La autenticación se maneja automáticamente por FastAPI
            # cuando se usa Depends(get_current_user)
            return await func(*args, **kwargs)
        return wrapper

    @staticmethod
    async def require_email_verified(func):
        """
        Decorador para requerir email verificado
        
        Args:
            func: Función a decorar
        
        Returns:
            function: Función decorada
        """
        @wraps(func)
        async def wrapper(*args, current_user: Dict[str, Any] = Depends(FirebaseAuth.get_current_user), **kwargs):
            if not current_user.get('email_verified', False):
                raise HTTPException(
                    status_code=403, 
                    detail="Email no verificado. Por favor verifica tu email antes de continuar."
                )
            return await func(*args, current_user=current_user, **kwargs)
        return wrapper

# Funciones de utilidad para autenticación
async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> Dict[str, Any]:
    """
    Dependency para obtener el usuario actual
    
    Args:
        credentials: Credenciales de autenticación
    
    Returns:
        dict: Información del usuario autenticado
    """
    return await FirebaseAuth.get_current_user(credentials)

async def get_optional_user(request: Request) -> Optional[Dict[str, Any]]:
    """
    Dependency para obtener el usuario actual opcionalmente
    
    Args:
        request: Request de FastAPI
    
    Returns:
        dict or None: Información del usuario o None
    """
    return await FirebaseAuth.get_optional_user(request)

async def require_email_verified(current_user: Dict[str, Any] = Depends(get_current_user)) -> Dict[str, Any]:
    """
    Dependency para requerir email verificado
    
    Args:
        current_user: Usuario actual
    
    Returns:
        dict: Usuario actual si email está verificado
    
    Raises:
        HTTPException: Si email no está verificado
    """
    if not current_user.get('email_verified', False):
        raise HTTPException(
            status_code=403,
            detail="Email no verificado. Por favor verifica tu email antes de continuar."
        )
    return current_user

# Rate limiting
from collections import defaultdict
import time
import asyncio

class RateLimiter:
    """Rate limiter simple para endpoints"""
    
    def __init__(self, requests_per_minute: int = 100):
        self.requests_per_minute = requests_per_minute
        self.requests = defaultdict(list)
    
    async def check_rate_limit(self, user_id: str) -> bool:
        """
        Verifica si el usuario ha excedido el límite de requests
        
        Args:
            user_id: ID del usuario
        
        Returns:
            bool: True si está dentro del límite, False si lo ha excedido
        """
        now = time.time()
        window_start = now - 60  # Ventana de 1 minuto
        
        # Limpiar requests antiguos
        self.requests[user_id] = [
            req_time for req_time in self.requests[user_id] 
            if req_time > window_start
        ]
        
        # Verificar límite
        if len(self.requests[user_id]) >= self.requests_per_minute:
            return False
        
        # Agregar request actual
        self.requests[user_id].append(now)
        return True

# Instancia global del rate limiter
rate_limiter = RateLimiter()

async def check_rate_limit(current_user: Dict[str, Any] = Depends(get_current_user)) -> Dict[str, Any]:
    """
    Dependency para verificar rate limiting
    
    Args:
        current_user: Usuario actual
    
    Returns:
        dict: Usuario actual si está dentro del límite
    
    Raises:
        HTTPException: Si se ha excedido el límite
    """
    user_id = current_user['uid']
    
    if not await rate_limiter.check_rate_limit(user_id):
        raise HTTPException(
            status_code=429,
            detail="Demasiadas requests. Intenta de nuevo en un minuto."
        )
    
    return current_user

# Middleware para logging de autenticación
async def auth_logging_middleware(request: Request, call_next):
    """
    Middleware para logging de autenticación
    """
    start_time = time.time()
    
    # Obtener información de autenticación
    auth_header = request.headers.get('Authorization')
    user_id = None
    
    if auth_header and auth_header.startswith('Bearer '):
        try:
            token = auth_header.split('Bearer ')[1]
            user_info = await FirebaseAuth.verify_token(token)
            user_id = user_info['uid']
        except Exception:
            pass
    
    # Procesar request
    response = await call_next(request)
    
    # Logging
    process_time = time.time() - start_time
    logger.info(
        f"Request: {request.method} {request.url.path} - "
        f"User: {user_id or 'anonymous'} - "
        f"Status: {response.status_code} - "
        f"Time: {process_time:.3f}s"
    )
    
    return response 