import os
import asyncio
import aiohttp
from typing import Dict, Any, List, Optional
from datetime import datetime
from firebase_admin import messaging
from ..core.logging_config import log_business_operation, log_error
from ..core.sentry_config import capture_exception
from ..core.metrics import record_business_metric

class PushNotificationService:
    """
    Servicio de notificaciones push usando Firebase Cloud Messaging
    """
    
    def __init__(self):
        self.project_id = os.getenv("FIREBASE_PROJECT_ID")
        self.default_topic = "general"
        
        # Templates de notificaciones
        self.notification_templates = {
            "like_received": {
                "title": "Nuevo like en tu post",
                "body": "@{user_alias} dio like a tu post '{post_title}'",
                "data": {
                    "type": "like",
                    "post_id": "{post_id}",
                    "user_id": "{user_id}"
                }
            },
            "comment_received": {
                "title": "Nuevo comentario en tu post",
                "body": "@{user_alias} comentó en tu post '{post_title}'",
                "data": {
                    "type": "comment",
                    "post_id": "{post_id}",
                    "user_id": "{user_id}"
                }
            },
            "payment_approved": {
                "title": "Pago aprobado",
                "body": "Tu compra de {credits} créditos por {amount} {currency} ha sido aprobada",
                "data": {
                    "type": "payment",
                    "credits": "{credits}",
                    "amount": "{amount}",
                    "currency": "{currency}"
                }
            },
            "credits_low": {
                "title": "Créditos bajos",
                "body": "Te quedan {credits} créditos. Recarga para continuar usando Spartan Market",
                "data": {
                    "type": "credits_alert",
                    "credits": "{credits}"
                }
            },
            "new_follower": {
                "title": "Nuevo seguidor",
                "body": "@{user_alias} comenzó a seguirte",
                "data": {
                    "type": "follow",
                    "user_id": "{user_id}"
                }
            },
            "system_maintenance": {
                "title": "Mantenimiento programado",
                "body": "Spartan Market estará en mantenimiento el {date} de {time}",
                "data": {
                    "type": "maintenance",
                    "date": "{date}",
                    "time": "{time}"
                }
            }
        }
    
    async def send_to_user(
        self,
        user_id: str,
        template_name: str,
        template_data: Dict[str, Any],
        priority: str = "normal"
    ) -> bool:
        """
        Enviar notificación a un usuario específico
        
        Args:
            user_id: ID del usuario (Firebase UID)
            template_name: Nombre del template de notificación
            template_data: Datos para el template
            priority: Prioridad de la notificación (normal/high)
        
        Returns:
            bool: True si se envió correctamente
        """
        try:
            # Obtener template
            if template_name not in self.notification_templates:
                raise ValueError(f"Template '{template_name}' no encontrado")
            
            template = self.notification_templates[template_name]
            
            # Preparar datos del template
            title = template["title"]
            body = template["body"]
            data = template["data"].copy()
            
            # Reemplazar placeholders en el template
            for key, value in template_data.items():
                placeholder = f"{{{key}}}"
                title = title.replace(placeholder, str(value))
                body = body.replace(placeholder, str(value))
                
                # Reemplazar en data si existe
                for data_key in data:
                    if isinstance(data[data_key], str):
                        data[data_key] = data[data_key].replace(placeholder, str(value))
            
            # Crear mensaje
            message = messaging.Message(
                notification=messaging.Notification(
                    title=title,
                    body=body
                ),
                data=data,
                token=user_id,  # Firebase token del usuario
                android=messaging.AndroidConfig(
                    priority="high" if priority == "high" else "normal",
                    notification=messaging.AndroidNotification(
                        icon="ic_notification",
                        color="#4CAF50",
                        click_action="FLUTTER_NOTIFICATION_CLICK"
                    )
                ),
                apns=messaging.APNSConfig(
                    payload=messaging.APNSPayload(
                        aps=messaging.Aps(
                            badge=1,
                            sound="default"
                        )
                    )
                )
            )
            
            # Enviar notificación
            response = messaging.send(message)
            
            # Log de éxito
            log_business_operation(
                operation="push_notification_sent",
                user_id=user_id,
                template=template_name,
                message_id=response
            )
            
            # Registrar métrica
            record_business_metric("push_notification_sent", "success", template=template_name)
            
            return True
            
        except Exception as e:
            log_error(e, "send_to_user", user_id=user_id, template=template_name)
            capture_exception(e, user_id=user_id, template=template_name)
            record_business_metric("push_notification_sent", "error", template=template_name)
            return False
    
    async def send_to_topic(
        self,
        topic: str,
        template_name: str,
        template_data: Dict[str, Any],
        priority: str = "normal"
    ) -> bool:
        """
        Enviar notificación a un topic (grupo de usuarios)
        
        Args:
            topic: Nombre del topic
            template_name: Nombre del template
            template_data: Datos para el template
            priority: Prioridad de la notificación
        
        Returns:
            bool: True si se envió correctamente
        """
        try:
            # Obtener template
            if template_name not in self.notification_templates:
                raise ValueError(f"Template '{template_name}' no encontrado")
            
            template = self.notification_templates[template_name]
            
            # Preparar datos del template
            title = template["title"]
            body = template["body"]
            data = template["data"].copy()
            
            # Reemplazar placeholders
            for key, value in template_data.items():
                placeholder = f"{{{key}}}"
                title = title.replace(placeholder, str(value))
                body = body.replace(placeholder, str(value))
                
                for data_key in data:
                    if isinstance(data[data_key], str):
                        data[data_key] = data[data_key].replace(placeholder, str(value))
            
            # Crear mensaje para topic
            message = messaging.Message(
                notification=messaging.Notification(
                    title=title,
                    body=body
                ),
                data=data,
                topic=topic,
                android=messaging.AndroidConfig(
                    priority="high" if priority == "high" else "normal"
                ),
                apns=messaging.APNSConfig(
                    payload=messaging.APNSPayload(
                        aps=messaging.Aps(
                            badge=1,
                            sound="default"
                        )
                    )
                )
            )
            
            # Enviar notificación
            response = messaging.send(message)
            
            # Log de éxito
            log_business_operation(
                operation="push_notification_topic_sent",
                topic=topic,
                template=template_name,
                message_id=response
            )
            
            # Registrar métrica
            record_business_metric("push_notification_topic_sent", "success", topic=topic, template=template_name)
            
            return True
            
        except Exception as e:
            log_error(e, "send_to_topic", topic=topic, template=template_name)
            capture_exception(e, topic=topic, template=template_name)
            record_business_metric("push_notification_topic_sent", "error", topic=topic, template=template_name)
            return False
    
    async def send_like_notification(
        self,
        post_author_id: str,
        liker_user_id: str,
        liker_alias: str,
        post_id: int,
        post_title: str
    ) -> bool:
        """
        Enviar notificación cuando alguien da like a un post
        """
        try:
            template_data = {
                "user_alias": liker_alias,
                "post_title": post_title,
                "post_id": str(post_id),
                "user_id": liker_user_id
            }
            
            return await self.send_to_user(
                user_id=post_author_id,
                template_name="like_received",
                template_data=template_data
            )
            
        except Exception as e:
            log_error(e, "send_like_notification", post_id=post_id, liker_id=liker_user_id)
            capture_exception(e, post_id=post_id, liker_id=liker_user_id)
            return False
    
    async def send_payment_notification(
        self,
        user_id: str,
        credits: int,
        amount: float,
        currency: str = "ARS"
    ) -> bool:
        """
        Enviar notificación de pago aprobado
        """
        try:
            template_data = {
                "credits": credits,
                "amount": f"{amount:.2f}",
                "currency": currency
            }
            
            return await self.send_to_user(
                user_id=user_id,
                template_name="payment_approved",
                template_data=template_data,
                priority="high"
            )
            
        except Exception as e:
            log_error(e, "send_payment_notification", user_id=user_id, credits=credits)
            capture_exception(e, user_id=user_id, credits=credits)
            return False
    
    async def send_credits_alert(
        self,
        user_id: str,
        credits: int
    ) -> bool:
        """
        Enviar alerta de créditos bajos
        """
        try:
            template_data = {
                "credits": credits
            }
            
            return await self.send_to_user(
                user_id=user_id,
                template_name="credits_low",
                template_data=template_data,
                priority="high"
            )
            
        except Exception as e:
            log_error(e, "send_credits_alert", user_id=user_id, credits=credits)
            capture_exception(e, user_id=user_id, credits=credits)
            return False
    
    async def send_system_maintenance_notification(
        self,
        date: str,
        time: str,
        topic: str = "general"
    ) -> bool:
        """
        Enviar notificación de mantenimiento del sistema
        """
        try:
            template_data = {
                "date": date,
                "time": time
            }
            
            return await self.send_to_topic(
                topic=topic,
                template_name="system_maintenance",
                template_data=template_data,
                priority="high"
            )
            
        except Exception as e:
            log_error(e, "send_system_maintenance_notification", date=date, time=time)
            capture_exception(e, date=date, time=time)
            return False
    
    async def subscribe_user_to_topic(
        self,
        user_tokens: List[str],
        topic: str
    ) -> bool:
        """
        Suscribir usuarios a un topic
        """
        try:
            if not user_tokens:
                return True
            
            # Suscribir tokens al topic
            response = messaging.subscribe_to_topic(user_tokens, topic)
            
            log_business_operation(
                operation="users_subscribed_to_topic",
                topic=topic,
                tokens_count=len(user_tokens),
                success_count=response.success_count,
                failure_count=response.failure_count
            )
            
            return response.success_count > 0
            
        except Exception as e:
            log_error(e, "subscribe_user_to_topic", topic=topic, tokens_count=len(user_tokens))
            capture_exception(e, topic=topic)
            return False
    
    async def unsubscribe_user_from_topic(
        self,
        user_tokens: List[str],
        topic: str
    ) -> bool:
        """
        Desuscribir usuarios de un topic
        """
        try:
            if not user_tokens:
                return True
            
            # Desuscribir tokens del topic
            response = messaging.unsubscribe_from_topic(user_tokens, topic)
            
            log_business_operation(
                operation="users_unsubscribed_from_topic",
                topic=topic,
                tokens_count=len(user_tokens),
                success_count=response.success_count,
                failure_count=response.failure_count
            )
            
            return response.success_count > 0
            
        except Exception as e:
            log_error(e, "unsubscribe_user_from_topic", topic=topic, tokens_count=len(user_tokens))
            capture_exception(e, topic=topic)
            return False

# Instancia global del servicio de notificaciones push
push_notification_service = PushNotificationService()

# Función helper para enviar notificación de like (usada en blog routes)
async def send_like_notification(
    post_author_id: str,
    liker_user_id: str,
    liker_alias: str,
    post_id: int,
    post_title: str
):
    """
    Función helper para enviar notificación de like
    """
    try:
        await push_notification_service.send_like_notification(
            post_author_id=post_author_id,
            liker_user_id=liker_user_id,
            liker_alias=liker_alias,
            post_id=post_id,
            post_title=post_title
        )
    except Exception as e:
        log_error(e, "send_like_notification_helper")
        capture_exception(e) 