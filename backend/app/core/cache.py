import redis.asyncio as redis
import json
import logging
import os
from typing import Any, Optional, Dict
from datetime import timedelta
import pickle

logger = logging.getLogger(__name__)

class CacheService:
    """Servicio de caché con Redis"""
    
    def __init__(self):
        self.redis_url = os.getenv("REDIS_URL", "redis://localhost:6379")
        self.redis_client = None
        self.is_connected = False
    
    async def connect(self):
        """Conectar a Redis"""
        try:
            self.redis_client = redis.from_url(self.redis_url)
            await self.redis_client.ping()
            self.is_connected = True
            logger.info("Connected to Redis cache")
        except Exception as e:
            logger.warning(f"Redis connection failed: {str(e)}")
            self.is_connected = False
    
    async def disconnect(self):
        """Desconectar de Redis"""
        if self.redis_client:
            await self.redis_client.close()
            self.is_connected = False
            logger.info("Disconnected from Redis cache")
    
    async def get(self, key: str) -> Optional[Any]:
        """
        Obtener valor del caché
        
        Args:
            key: Clave del caché
        
        Returns:
            Any or None: Valor almacenado
        """
        if not self.is_connected:
            return None
        
        try:
            value = await self.redis_client.get(key)
            if value:
                return pickle.loads(value)
            return None
        except Exception as e:
            logger.error(f"Error getting cache key {key}: {str(e)}")
            return None
    
    async def set(self, key: str, value: Any, expire: int = 3600):
        """
        Establecer valor en caché
        
        Args:
            key: Clave del caché
            value: Valor a almacenar
            expire: Tiempo de expiración en segundos
        """
        if not self.is_connected:
            return
        
        try:
            serialized_value = pickle.dumps(value)
            await self.redis_client.setex(key, expire, serialized_value)
            logger.debug(f"Cache set: {key} (expires in {expire}s)")
        except Exception as e:
            logger.error(f"Error setting cache key {key}: {str(e)}")
    
    async def delete(self, key: str):
        """
        Eliminar clave del caché
        
        Args:
            key: Clave a eliminar
        """
        if not self.is_connected:
            return
        
        try:
            await self.redis_client.delete(key)
            logger.debug(f"Cache deleted: {key}")
        except Exception as e:
            logger.error(f"Error deleting cache key {key}: {str(e)}")
    
    async def delete_pattern(self, pattern: str):
        """
        Eliminar claves que coincidan con un patrón
        
        Args:
            pattern: Patrón de claves a eliminar
        """
        if not self.is_connected:
            return
        
        try:
            keys = await self.redis_client.keys(pattern)
            if keys:
                await self.redis_client.delete(*keys)
                logger.debug(f"Cache deleted pattern: {pattern} ({len(keys)} keys)")
        except Exception as e:
            logger.error(f"Error deleting cache pattern {pattern}: {str(e)}")
    
    async def exists(self, key: str) -> bool:
        """
        Verificar si existe una clave
        
        Args:
            key: Clave a verificar
        
        Returns:
            bool: True si existe
        """
        if not self.is_connected:
            return False
        
        try:
            return await self.redis_client.exists(key) > 0
        except Exception as e:
            logger.error(f"Error checking cache key {key}: {str(e)}")
            return False
    
    async def increment(self, key: str, amount: int = 1) -> int:
        """
        Incrementar valor numérico
        
        Args:
            key: Clave del caché
            amount: Cantidad a incrementar
        
        Returns:
            int: Nuevo valor
        """
        if not self.is_connected:
            return 0
        
        try:
            return await self.redis_client.incrby(key, amount)
        except Exception as e:
            logger.error(f"Error incrementing cache key {key}: {str(e)}")
            return 0

class CacheManager:
    """Gestor de caché con métodos específicos"""
    
    def __init__(self):
        self.cache = CacheService()
    
    async def get_user_profile(self, user_id: str) -> Optional[Dict[str, Any]]:
        """
        Obtener perfil de usuario del caché
        
        Args:
            user_id: ID del usuario
        
        Returns:
            dict or None: Perfil del usuario
        """
        key = f"user_profile:{user_id}"
        return await self.cache.get(key)
    
    async def set_user_profile(self, user_id: str, profile: Dict[str, Any]):
        """
        Almacenar perfil de usuario en caché
        
        Args:
            user_id: ID del usuario
            profile: Perfil del usuario
        """
        key = f"user_profile:{user_id}"
        await self.cache.set(key, profile, expire=1800)  # 30 minutos
    
    async def invalidate_user_profile(self, user_id: str):
        """
        Invalidar caché del perfil de usuario
        
        Args:
            user_id: ID del usuario
        """
        key = f"user_profile:{user_id}"
        await self.cache.delete(key)
    
    async def get_public_profile(self, alias: str) -> Optional[Dict[str, Any]]:
        """
        Obtener perfil público del caché
        
        Args:
            alias: Alias del usuario
        
        Returns:
            dict or None: Perfil público
        """
        key = f"public_profile:{alias}"
        return await self.cache.get(key)
    
    async def set_public_profile(self, alias: str, profile: Dict[str, Any]):
        """
        Almacenar perfil público en caché
        
        Args:
            alias: Alias del usuario
            profile: Perfil público
        """
        key = f"public_profile:{alias}"
        await self.cache.set(key, profile, expire=3600)  # 1 hora
    
    async def get_user_credits(self, user_id: str) -> Optional[Dict[str, Any]]:
        """
        Obtener créditos del usuario del caché
        
        Args:
            user_id: ID del usuario
        
        Returns:
            dict or None: Información de créditos
        """
        key = f"user_credits:{user_id}"
        return await self.cache.get(key)
    
    async def set_user_credits(self, user_id: str, credits: Dict[str, Any]):
        """
        Almacenar créditos del usuario en caché
        
        Args:
            user_id: ID del usuario
            credits: Información de créditos
        """
        key = f"user_credits:{user_id}"
        await self.cache.set(key, credits, expire=300)  # 5 minutos
    
    async def invalidate_user_credits(self, user_id: str):
        """
        Invalidar caché de créditos del usuario
        
        Args:
            user_id: ID del usuario
        """
        key = f"user_credits:{user_id}"
        await self.cache.delete(key)
    
    async def get_avatar_options(self) -> Optional[list]:
        """
        Obtener opciones de avatar del caché
        
        Returns:
            list or None: Opciones de avatar
        """
        key = "avatar_options"
        return await self.cache.get(key)
    
    async def set_avatar_options(self, options: list):
        """
        Almacenar opciones de avatar en caché
        
        Args:
            options: Opciones de avatar
        """
        key = "avatar_options"
        await self.cache.set(key, options, expire=86400)  # 24 horas
    
    async def get_rate_limit(self, user_id: str) -> int:
        """
        Obtener contador de rate limit
        
        Args:
            user_id: ID del usuario
        
        Returns:
            int: Número de requests
        """
        key = f"rate_limit:{user_id}"
        count = await self.cache.get(key)
        return count if count is not None else 0
    
    async def increment_rate_limit(self, user_id: str, expire: int = 60):
        """
        Incrementar contador de rate limit
        
        Args:
            user_id: ID del usuario
            expire: Tiempo de expiración en segundos
        """
        key = f"rate_limit:{user_id}"
        await self.cache.increment(key)
        await self.cache.set(key, await self.cache.get(key), expire)
    
    async def clear_rate_limit(self, user_id: str):
        """
        Limpiar contador de rate limit
        
        Args:
            user_id: ID del usuario
        """
        key = f"rate_limit:{user_id}"
        await self.cache.delete(key)

# Instancia global del gestor de caché
cache_manager = CacheManager() 