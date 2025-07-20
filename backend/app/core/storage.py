import os
import uuid
import aiofiles
from typing import Optional, Tuple
from fastapi import UploadFile, HTTPException
import logging
from pathlib import Path

logger = logging.getLogger(__name__)

class FileStorage:
    """Sistema de almacenamiento de archivos"""
    
    def __init__(self, upload_dir: str = "uploads"):
        self.upload_dir = Path(upload_dir)
        self.avatar_dir = self.upload_dir / "avatars"
        self.ensure_directories()
    
    def ensure_directories(self):
        """Crear directorios necesarios"""
        try:
            self.upload_dir.mkdir(exist_ok=True)
            self.avatar_dir.mkdir(exist_ok=True)
            logger.info(f"Storage directories created: {self.upload_dir}")
        except Exception as e:
            logger.error(f"Error creating storage directories: {str(e)}")
            raise
    
    async def save_avatar(self, file: UploadFile, user_id: str) -> Tuple[str, str]:
        """
        Guardar avatar de usuario
        
        Args:
            file: Archivo subido
            user_id: ID del usuario
        
        Returns:
            Tuple[str, str]: (filename, file_path)
        """
        try:
            # Validar archivo
            if not file.filename:
                raise HTTPException(status_code=400, detail="Nombre de archivo requerido")
            
            # Generar nombre único
            file_extension = Path(file.filename).suffix
            filename = f"avatar_{user_id}_{uuid.uuid4()}{file_extension}"
            file_path = self.avatar_dir / filename
            
            # Guardar archivo
            async with aiofiles.open(file_path, 'wb') as f:
                content = await file.read()
                await f.write(content)
            
            logger.info(f"Avatar saved: {filename} for user {user_id}")
            return filename, str(file_path)
            
        except Exception as e:
            logger.error(f"Error saving avatar for user {user_id}: {str(e)}")
            raise HTTPException(status_code=500, detail="Error al guardar avatar")
    
    async def delete_avatar(self, filename: str) -> bool:
        """
        Eliminar avatar
        
        Args:
            filename: Nombre del archivo
        
        Returns:
            bool: True si se eliminó correctamente
        """
        try:
            file_path = self.avatar_dir / filename
            if file_path.exists():
                file_path.unlink()
                logger.info(f"Avatar deleted: {filename}")
                return True
            return False
        except Exception as e:
            logger.error(f"Error deleting avatar {filename}: {str(e)}")
            return False
    
    def get_avatar_url(self, filename: str) -> str:
        """
        Obtener URL del avatar
        
        Args:
            filename: Nombre del archivo
        
        Returns:
            str: URL del avatar
        """
        return f"/uploads/avatars/{filename}"
    
    async def cleanup_old_avatars(self, user_id: str, keep_filename: str):
        """
        Limpiar avatares antiguos del usuario
        
        Args:
            user_id: ID del usuario
            keep_filename: Nombre del archivo a mantener
        """
        try:
            for file_path in self.avatar_dir.iterdir():
                if file_path.is_file() and f"avatar_{user_id}_" in file_path.name:
                    if file_path.name != keep_filename:
                        file_path.unlink()
                        logger.info(f"Cleaned up old avatar: {file_path.name}")
        except Exception as e:
            logger.error(f"Error cleaning up old avatars for user {user_id}: {str(e)}")

# Instancia global del storage
file_storage = FileStorage() 