import asyncio
import aiohttp
import logging
from typing import Dict, Any, List, Optional
from datetime import datetime
import json
import os

logger = logging.getLogger(__name__)

class NotificationService:
    """Servicio para notificaciones y webhooks"""
    
    def __init__(self):
        self.webhook_url = os.getenv("WEBHOOK_URL")
        self.notification_queue = asyncio.Queue()
        self.is_running = False
    
    async def start(self):
        """Iniciar servicio de notificaciones"""
        if not self.is_running:
            self.is_running = True
            asyncio.create_task(self._process_notifications())
            logger.info("Notification service started")
    
    async def stop(self):
        """Detener servicio de notificaciones"""
        self.is_running = False
        logger.info("Notification service stopped")
    
    async def send_notification(
        self, 
        user_id: str, 
        notification_type: str, 
        data: Dict[str, Any]
    ):
        """
        Enviar notificación
        
        Args:
            user_id: ID del usuario
            notification_type: Tipo de notificación
            data: Datos de la notificación
        """
        notification = {
            "user_id": user_id,
            "type": notification_type,
            "data": data,
            "timestamp": datetime.now().isoformat(),
            "id": f"notif_{user_id}_{datetime.now().timestamp()}"
        }
        
        await self.notification_queue.put(notification)
        logger.info(f"Notification queued: {notification_type} for user {user_id}")
    
    async def _process_notifications(self):
        """Procesar cola de notificaciones"""
        while self.is_running:
            try:
                # Procesar notificaciones en lotes
                notifications = []
                for _ in range(10):  # Procesar hasta 10 notificaciones por lote
                    try:
                        notification = await asyncio.wait_for(
                            self.notification_queue.get(), timeout=1.0
                        )
                        notifications.append(notification)
                    except asyncio.TimeoutError:
                        break
                
                if notifications:
                    await self._send_notifications_batch(notifications)
                
                await asyncio.sleep(0.1)  # Pequeña pausa
                
            except Exception as e:
                logger.error(f"Error processing notifications: {str(e)}")
                await asyncio.sleep(1)  # Pausa más larga en caso de error
    
    async def _send_notifications_batch(self, notifications: List[Dict[str, Any]]):
        """Enviar lote de notificaciones"""
        try:
            if self.webhook_url:
                async with aiohttp.ClientSession() as session:
                    payload = {
                        "notifications": notifications,
                        "batch_size": len(notifications),
                        "timestamp": datetime.now().isoformat()
                    }
                    
                    async with session.post(
                        self.webhook_url,
                        json=payload,
                        headers={"Content-Type": "application/json"}
                    ) as response:
                        if response.status == 200:
                            logger.info(f"Sent {len(notifications)} notifications via webhook")
                        else:
                            logger.error(f"Webhook failed: {response.status}")
            
            # También procesar localmente según el tipo
            for notification in notifications:
                await self._process_notification_locally(notification)
                
        except Exception as e:
            logger.error(f"Error sending notifications batch: {str(e)}")
    
    async def _process_notification_locally(self, notification: Dict[str, Any]):
        """Procesar notificación localmente"""
        try:
            notification_type = notification["type"]
            user_id = notification["user_id"]
            data = notification["data"]
            
            if notification_type == "credit_purchase_approved":
                logger.info(f"Credit purchase approved for user {user_id}: {data.get('credits', 0)} credits")
                
            elif notification_type == "profile_updated":
                logger.info(f"Profile updated for user {user_id}")
                
            elif notification_type == "avatar_updated":
                logger.info(f"Avatar updated for user {user_id}")
                
            elif notification_type == "privacy_updated":
                logger.info(f"Privacy settings updated for user {user_id}")
                
            elif notification_type == "payment_failed":
                logger.warning(f"Payment failed for user {user_id}: {data.get('reason', 'Unknown')}")
                
            else:
                logger.info(f"Unknown notification type: {notification_type} for user {user_id}")
                
        except Exception as e:
            logger.error(f"Error processing notification locally: {str(e)}")
    
    async def send_credit_purchase_notification(
        self, 
        user_id: str, 
        credits: int, 
        status: str
    ):
        """Enviar notificación de compra de créditos"""
        data = {
            "credits": credits,
            "status": status,
            "currency": "ARS"
        }
        
        await self.send_notification(user_id, "credit_purchase_approved", data)
    
    async def send_profile_update_notification(self, user_id: str, fields_updated: List[str]):
        """Enviar notificación de actualización de perfil"""
        data = {
            "fields_updated": fields_updated,
            "updated_at": datetime.now().isoformat()
        }
        
        await self.send_notification(user_id, "profile_updated", data)
    
    async def send_avatar_update_notification(self, user_id: str, avatar_type: str):
        """Enviar notificación de actualización de avatar"""
        data = {
            "avatar_type": avatar_type,
            "updated_at": datetime.now().isoformat()
        }
        
        await self.send_notification(user_id, "avatar_updated", data)
    
    async def send_privacy_update_notification(self, user_id: str, settings_updated: List[str]):
        """Enviar notificación de actualización de privacidad"""
        data = {
            "settings_updated": settings_updated,
            "updated_at": datetime.now().isoformat()
        }
        
        await self.send_notification(user_id, "privacy_updated", data)
    
    async def send_payment_failed_notification(self, user_id: str, reason: str):
        """Enviar notificación de pago fallido"""
        data = {
            "reason": reason,
            "failed_at": datetime.now().isoformat()
        }
        
        await self.send_notification(user_id, "payment_failed", data)

class WebhookService:
    """Servicio para manejo de webhooks"""
    
    @staticmethod
    async def process_mercadopago_webhook(webhook_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Procesar webhook de MercadoPago
        
        Args:
            webhook_data: Datos del webhook
        
        Returns:
            dict: Información procesada
        """
        try:
            from ..payments.mercadopago_service import mercadopago_service
            from ..credits.credit_service import credit_service
            from ..core.database import get_db
            
            # Procesar webhook con MercadoPago
            payment_info = await mercadopago_service.process_webhook(webhook_data)
            
            # Si es una compra de créditos, procesarla
            if payment_info.get("external_reference", "").startswith("credits_"):
                # Extraer user_id de la referencia externa
                # Formato: credits_{user_id}_{uuid}
                external_ref = payment_info["external_reference"]
                user_id = external_ref.split("_")[1]
                
                # Procesar compra de créditos
                async for db in get_db():
                    credit_result = await credit_service.process_credit_purchase(
                        db, payment_info["payment_id"], payment_info["status"]
                    )
                    
                    # Enviar notificación
                    notification_service = NotificationService()
                    await notification_service.send_credit_purchase_notification(
                        user_id, credit_result["credits"], payment_info["status"]
                    )
                    
                    payment_info["credit_processed"] = True
                    payment_info["user_id"] = user_id
            
            logger.info(f"Webhook processed successfully: {payment_info['payment_id']}")
            return payment_info
            
        except Exception as e:
            logger.error(f"Error processing webhook: {str(e)}")
            raise
    
    @staticmethod
    async def validate_webhook_signature(
        webhook_data: Dict[str, Any], 
        signature: str
    ) -> bool:
        """
        Validar firma del webhook (placeholder)
        
        Args:
            webhook_data: Datos del webhook
            signature: Firma del webhook
        
        Returns:
            bool: True si la firma es válida
        """
        # TODO: Implementar validación de firma real
        # Por ahora, siempre retorna True
        return True

# Instancia global del servicio de notificaciones
notification_service = NotificationService() 