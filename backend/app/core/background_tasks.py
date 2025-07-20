import asyncio
import logging
from typing import Dict, Any, Callable, List
from datetime import datetime
import traceback
from concurrent.futures import ThreadPoolExecutor
import threading

logger = logging.getLogger(__name__)

class BackgroundTaskManager:
    """Gestor de tareas en segundo plano"""
    
    def __init__(self):
        self.tasks: Dict[str, asyncio.Task] = {}
        self.executor = ThreadPoolExecutor(max_workers=4)
        self.is_running = True
    
    async def start(self):
        """Iniciar gestor de tareas"""
        self.is_running = True
        logger.info("Background task manager started")
    
    async def stop(self):
        """Detener gestor de tareas"""
        self.is_running = False
        
        # Cancelar todas las tareas pendientes
        for task_id, task in self.tasks.items():
            if not task.done():
                task.cancel()
                try:
                    await task
                except asyncio.CancelledError:
                    pass
        
        self.executor.shutdown(wait=True)
        logger.info("Background task manager stopped")
    
    async def add_task(
        self, 
        task_id: str, 
        coro: Callable, 
        *args, 
        **kwargs
    ) -> str:
        """
        Agregar tarea en segundo plano
        
        Args:
            task_id: ID único de la tarea
            coro: Corrutina a ejecutar
            *args: Argumentos posicionales
            **kwargs: Argumentos nombrados
        
        Returns:
            str: ID de la tarea
        """
        if task_id in self.tasks and not self.tasks[task_id].done():
            raise ValueError(f"Task {task_id} already exists and is running")
        
        task = asyncio.create_task(self._execute_task(task_id, coro, *args, **kwargs))
        self.tasks[task_id] = task
        
        logger.info(f"Background task added: {task_id}")
        return task_id
    
    async def _execute_task(
        self, 
        task_id: str, 
        coro: Callable, 
        *args, 
        **kwargs
    ):
        """Ejecutar tarea con manejo de errores"""
        try:
            start_time = datetime.now()
            logger.info(f"Starting background task: {task_id}")
            
            if asyncio.iscoroutinefunction(coro):
                result = await coro(*args, **kwargs)
            else:
                # Ejecutar función síncrona en thread pool
                loop = asyncio.get_event_loop()
                result = await loop.run_in_executor(
                    self.executor, coro, *args, **kwargs
                )
            
            end_time = datetime.now()
            duration = (end_time - start_time).total_seconds()
            
            logger.info(f"Background task completed: {task_id} (took {duration:.2f}s)")
            return result
            
        except Exception as e:
            logger.error(f"Background task failed: {task_id} - {str(e)}")
            logger.error(traceback.format_exc())
            raise
        finally:
            # Limpiar tarea completada
            if task_id in self.tasks:
                del self.tasks[task_id]
    
    async def get_task_status(self, task_id: str) -> Dict[str, Any]:
        """
        Obtener estado de una tarea
        
        Args:
            task_id: ID de la tarea
        
        Returns:
            dict: Estado de la tarea
        """
        if task_id not in self.tasks:
            return {"status": "not_found"}
        
        task = self.tasks[task_id]
        
        if task.done():
            if task.cancelled():
                return {"status": "cancelled"}
            elif task.exception():
                return {
                    "status": "failed",
                    "error": str(task.exception())
                }
            else:
                return {"status": "completed"}
        else:
            return {"status": "running"}
    
    async def cancel_task(self, task_id: str) -> bool:
        """
        Cancelar una tarea
        
        Args:
            task_id: ID de la tarea
        
        Returns:
            bool: True si se canceló correctamente
        """
        if task_id not in self.tasks:
            return False
        
        task = self.tasks[task_id]
        if not task.done():
            task.cancel()
            logger.info(f"Background task cancelled: {task_id}")
            return True
        
        return False
    
    async def get_running_tasks(self) -> List[str]:
        """
        Obtener lista de tareas en ejecución
        
        Returns:
            list: IDs de tareas en ejecución
        """
        return [
            task_id for task_id, task in self.tasks.items() 
            if not task.done()
        ]

class ImageProcessingTask:
    """Tarea de procesamiento de imágenes"""
    
    @staticmethod
    async def process_avatar_image(
        file_path: str, 
        user_id: str, 
        max_size: tuple = (400, 400)
    ) -> Dict[str, Any]:
        """
        Procesar imagen de avatar
        
        Args:
            file_path: Ruta del archivo
            user_id: ID del usuario
            max_size: Tamaño máximo (ancho, alto)
        
        Returns:
            dict: Información del procesamiento
        """
        try:
            # TODO: Implementar procesamiento real de imagen
            # Por ahora, solo simulamos el procesamiento
            
            import time
            await asyncio.sleep(2)  # Simular procesamiento
            
            logger.info(f"Avatar image processed for user {user_id}: {file_path}")
            
            return {
                "user_id": user_id,
                "file_path": file_path,
                "processed": True,
                "size": max_size,
                "processed_at": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error processing avatar image for user {user_id}: {str(e)}")
            raise

class DataProcessingTask:
    """Tarea de procesamiento de datos"""
    
    @staticmethod
    async def generate_user_analytics(user_id: str) -> Dict[str, Any]:
        """
        Generar analytics del usuario
        
        Args:
            user_id: ID del usuario
        
        Returns:
            dict: Analytics del usuario
        """
        try:
            # TODO: Implementar generación real de analytics
            # Por ahora, solo simulamos el procesamiento
            
            await asyncio.sleep(3)  # Simular procesamiento
            
            analytics = {
                "user_id": user_id,
                "profile_completion": 85,
                "total_purchases": 12,
                "total_spent": 15000,
                "favorite_categories": ["tecnología", "hogar"],
                "generated_at": datetime.now().isoformat()
            }
            
            logger.info(f"User analytics generated for user {user_id}")
            return analytics
            
        except Exception as e:
            logger.error(f"Error generating analytics for user {user_id}: {str(e)}")
            raise
    
    @staticmethod
    async def cleanup_old_files(days_old: int = 30) -> Dict[str, Any]:
        """
        Limpiar archivos antiguos
        
        Args:
            days_old: Archivos más antiguos que este número de días
        
        Returns:
            dict: Información de la limpieza
        """
        try:
            # TODO: Implementar limpieza real de archivos
            # Por ahora, solo simulamos el proceso
            
            await asyncio.sleep(1)  # Simular procesamiento
            
            cleanup_info = {
                "files_removed": 15,
                "space_freed_mb": 45.2,
                "days_old": days_old,
                "cleaned_at": datetime.now().isoformat()
            }
            
            logger.info(f"Old files cleanup completed: {cleanup_info['files_removed']} files removed")
            return cleanup_info
            
        except Exception as e:
            logger.error(f"Error cleaning old files: {str(e)}")
            raise

class NotificationTask:
    """Tarea de envío de notificaciones"""
    
    @staticmethod
    async def send_bulk_notifications(
        notifications: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Enviar notificaciones en lote
        
        Args:
            notifications: Lista de notificaciones
        
        Returns:
            dict: Resultado del envío
        """
        try:
            # TODO: Implementar envío real de notificaciones
            # Por ahora, solo simulamos el envío
            
            await asyncio.sleep(len(notifications) * 0.1)  # Simular envío
            
            result = {
                "total_sent": len(notifications),
                "successful": len(notifications),
                "failed": 0,
                "sent_at": datetime.now().isoformat()
            }
            
            logger.info(f"Bulk notifications sent: {result['total_sent']} notifications")
            return result
            
        except Exception as e:
            logger.error(f"Error sending bulk notifications: {str(e)}")
            raise

# Instancia global del gestor de tareas
background_task_manager = BackgroundTaskManager() 