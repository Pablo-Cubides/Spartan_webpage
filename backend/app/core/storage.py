import os
import uuid
import boto3
from typing import Optional, Tuple
from fastapi import UploadFile, HTTPException
import logging
from pathlib import Path
from botocore.exceptions import ClientError

logger = logging.getLogger(__name__)

# Configuración de Cloudflare R2
R2_ENDPOINT_URL = os.getenv("R2_ENDPOINT_URL")
R2_ACCESS_KEY_ID = os.getenv("R2_ACCESS_KEY_ID")
R2_SECRET_ACCESS_KEY = os.getenv("R2_SECRET_ACCESS_KEY")
R2_BUCKET_NAME = os.getenv("R2_BUCKET_NAME", "spartan-avatars")

# Cliente R2
r2_client = boto3.client(
    's3',
    endpoint_url=R2_ENDPOINT_URL,
    aws_access_key_id=R2_ACCESS_KEY_ID,
    aws_secret_access_key=R2_SECRET_ACCESS_KEY,
    region_name='auto'  # R2 usa 'auto' como región
)

class R2Storage:
    """Sistema de almacenamiento usando Cloudflare R2"""
    
    def __init__(self, bucket_name: str = R2_BUCKET_NAME):
        self.bucket_name = bucket_name
        self.client = r2_client
    
    async def generate_presigned_upload_url(self, user_id: str, file_extension: str) -> Tuple[str, str]:
        """
        Generar URL firmada para subir avatar
        
        Args:
            user_id: ID del usuario
            file_extension: Extensión del archivo
        
        Returns:
            Tuple[str, str]: (presigned_url, object_key)
        """
        try:
            # Generar nombre único para el archivo
            object_key = f"avatars/avatar_{user_id}_{uuid.uuid4()}{file_extension}"
            
            # Generar URL firmada para PUT (subida)
            presigned_url = self.client.generate_presigned_url(
                'put_object',
                Params={
                    'Bucket': self.bucket_name,
                    'Key': object_key,
                    'ContentType': self._get_content_type(file_extension)
                },
                ExpiresIn=3600  # 1 hora
            )
            
            logger.info(f"Generated presigned upload URL for user {user_id}: {object_key}")
            return presigned_url, object_key
            
        except Exception as e:
            logger.error(f"Error generating presigned upload URL for user {user_id}: {str(e)}")
            raise HTTPException(status_code=500, detail="Error generando URL de subida")
    
    async def generate_presigned_download_url(self, avatar_id: str) -> str:
        """
        Generar URL firmada para descargar avatar
        
        Args:
            avatar_id: ID del avatar
        
        Returns:
            str: URL firmada para descarga
        """
        try:
            object_key = f"avatars/{avatar_id}"
            
            # Verificar que el archivo existe
            try:
                self.client.head_object(Bucket=self.bucket_name, Key=object_key)
            except ClientError as e:
                if e.response['Error']['Code'] == '404':
                    raise HTTPException(status_code=404, detail="Avatar no encontrado")
                raise
            
            # Generar URL firmada para GET (descarga)
            presigned_url = self.client.generate_presigned_url(
                'get_object',
                Params={
                    'Bucket': self.bucket_name,
                    'Key': object_key
                },
                ExpiresIn=3600  # 1 hora
            )
            
            logger.info(f"Generated presigned download URL for avatar {avatar_id}")
            return presigned_url
            
        except Exception as e:
            logger.error(f"Error generating presigned download URL for avatar {avatar_id}: {str(e)}")
            raise HTTPException(status_code=500, detail="Error generando URL de descarga")
    
    async def delete_avatar(self, avatar_id: str) -> bool:
        """
        Eliminar avatar de R2
        
        Args:
            avatar_id: ID del avatar
        
        Returns:
            bool: True si se eliminó correctamente
        """
        try:
            object_key = f"avatars/{avatar_id}"
            self.client.delete_object(Bucket=self.bucket_name, Key=object_key)
            logger.info(f"Avatar deleted from R2: {avatar_id}")
            return True
        except Exception as e:
            logger.error(f"Error deleting avatar {avatar_id} from R2: {str(e)}")
            return False
    
    def _get_content_type(self, file_extension: str) -> str:
        """Obtener content type basado en la extensión del archivo"""
        content_types = {
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png',
            '.gif': 'image/gif',
            '.webp': 'image/webp'
        }
        return content_types.get(file_extension.lower(), 'application/octet-stream')

# Instancia global del storage R2
r2_storage = R2Storage() 