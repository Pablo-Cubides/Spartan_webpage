import os
import asyncio
import aiohttp
import hmac
import hashlib
import json
from typing import Dict, Any, List, Optional, Callable
from datetime import datetime
from fastapi import HTTPException
from ..core.logging_config import log_business_operation, log_error
from ..core.sentry_config import capture_exception
from ..core.metrics import record_business_metric

class WebhookManager:
    """
    Gestor de webhooks personalizados para integraciones externas
    """
    
    def __init__(self):
        self.webhook_secret = os.getenv("WEBHOOK_SECRET", "your-webhook-secret")
        self.max_retries = int(os.getenv("WEBHOOK_MAX_RETRIES", "3"))
        self.retry_delay = int(os.getenv("WEBHOOK_RETRY_DELAY", "5"))
        self.timeout = int(os.getenv("WEBHOOK_TIMEOUT", "30"))
        
        # Registro de webhooks
        self.webhooks = {}
        
        # Eventos disponibles
        self.available_events = {
            "user.registered": "Usuario se registra",
            "user.profile_completed": "Usuario completa perfil",
            "payment.approved": "Pago aprobado",
            "payment.failed": "Pago fallido",
            "blog.post_created": "Nuevo post del blog",
            "blog.post_liked": "Like en post del blog",
            "credits.low": "Créditos bajos",
            "system.maintenance": "Mantenimiento del sistema",
            "security.alert": "Alerta de seguridad"
        }
    
    def register_webhook(
        self,
        event: str,
        url: str,
        secret: str = None,
        headers: Dict[str, str] = None,
        enabled: bool = True
    ) -> str:
        """
        Registrar un webhook para un evento específico
        
        Args:
            event: Nombre del evento
            url: URL del webhook
            secret: Secreto para firma (opcional)
            headers: Headers adicionales
            enabled: Si el webhook está habilitado
        
        Returns:
            str: ID del webhook registrado
        """
        try:
            if event not in self.available_events:
                raise ValueError(f"Evento '{event}' no válido")
            
            import uuid
            webhook_id = str(uuid.uuid4())
            
            webhook_config = {
                "id": webhook_id,
                "event": event,
                "url": url,
                "secret": secret or self.webhook_secret,
                "headers": headers or {},
                "enabled": enabled,
                "created_at": datetime.now(),
                "last_triggered": None,
                "success_count": 0,
                "failure_count": 0
            }
            
            if event not in self.webhooks:
                self.webhooks[event] = []
            
            self.webhooks[event].append(webhook_config)
            
            log_business_operation(
                operation="webhook_registered",
                webhook_id=webhook_id,
                event=event,
                url=url
            )
            
            return webhook_id
            
        except Exception as e:
            log_error(e, "register_webhook", event=event, url=url)
            capture_exception(e, event=event, url=url)
            raise
    
    async def trigger_webhook(
        self,
        event: str,
        payload: Dict[str, Any],
        webhook_id: str = None
    ) -> List[Dict[str, Any]]:
        """
        Disparar webhooks para un evento específico
        
        Args:
            event: Nombre del evento
            payload: Datos del evento
            webhook_id: ID específico del webhook (opcional)
        
        Returns:
            List[Dict]: Resultados de los webhooks disparados
        """
        try:
            if event not in self.webhooks:
                return []
            
            results = []
            webhooks_to_trigger = self.webhooks[event]
            
            if webhook_id:
                webhooks_to_trigger = [w for w in webhooks_to_trigger if w["id"] == webhook_id]
            
            for webhook in webhooks_to_trigger:
                if not webhook["enabled"]:
                    continue
                
                result = await self._send_webhook(webhook, payload)
                results.append(result)
                
                # Actualizar estadísticas
                webhook["last_triggered"] = datetime.now()
                if result["success"]:
                    webhook["success_count"] += 1
                else:
                    webhook["failure_count"] += 1
            
            # Registrar métrica
            record_business_metric("webhook_triggered", "success", event=event, count=len(results))
            
            return results
            
        except Exception as e:
            log_error(e, "trigger_webhook", event=event)
            capture_exception(e, event=event)
            record_business_metric("webhook_triggered", "error", event=event)
            return []
    
    async def _send_webhook(
        self,
        webhook: Dict[str, Any],
        payload: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Enviar webhook individual con reintentos
        """
        webhook_id = webhook["id"]
        url = webhook["url"]
        secret = webhook["secret"]
        headers = webhook["headers"].copy()
        
        # Agregar headers estándar
        headers.update({
            "Content-Type": "application/json",
            "User-Agent": "Spartan-Market-API/1.0",
            "X-Webhook-Event": webhook["event"],
            "X-Webhook-ID": webhook_id,
            "X-Timestamp": str(int(datetime.now().timestamp()))
        })
        
        # Firmar payload si hay secreto
        if secret:
            signature = self._sign_payload(payload, secret)
            headers["X-Signature"] = signature
        
        # Agregar metadatos al payload
        webhook_payload = {
            "event": webhook["event"],
            "webhook_id": webhook_id,
            "timestamp": datetime.now().isoformat(),
            "data": payload
        }
        
        # Reintentos
        for attempt in range(self.max_retries):
            try:
                async with aiohttp.ClientSession() as session:
                    async with session.post(
                        url,
                        json=webhook_payload,
                        headers=headers,
                        timeout=aiohttp.ClientTimeout(total=self.timeout)
                    ) as response:
                        
                        if response.status in [200, 201, 202]:
                            log_business_operation(
                                operation="webhook_sent_success",
                                webhook_id=webhook_id,
                                event=webhook["event"],
                                status_code=response.status
                            )
                            
                            return {
                                "webhook_id": webhook_id,
                                "success": True,
                                "status_code": response.status,
                                "attempt": attempt + 1
                            }
                        else:
                            raise HTTPException(
                                status_code=response.status,
                                detail=f"Webhook failed with status {response.status}"
                            )
                            
            except Exception as e:
                if attempt == self.max_retries - 1:
                    log_error(e, "_send_webhook", webhook_id=webhook_id, attempt=attempt + 1)
                    capture_exception(e, webhook_id=webhook_id)
                    
                    return {
                        "webhook_id": webhook_id,
                        "success": False,
                        "error": str(e),
                        "attempt": attempt + 1
                    }
                else:
                    await asyncio.sleep(self.retry_delay * (attempt + 1))
    
    def _sign_payload(self, payload: Dict[str, Any], secret: str) -> str:
        """
        Firmar payload con HMAC-SHA256
        """
        payload_str = json.dumps(payload, sort_keys=True)
        signature = hmac.new(
            secret.encode('utf-8'),
            payload_str.encode('utf-8'),
            hashlib.sha256
        ).hexdigest()
        
        return f"sha256={signature}"
    
    def unregister_webhook(self, webhook_id: str) -> bool:
        """
        Desregistrar un webhook
        """
        try:
            for event in self.webhooks:
                self.webhooks[event] = [
                    w for w in self.webhooks[event] if w["id"] != webhook_id
                ]
            
            log_business_operation(
                operation="webhook_unregistered",
                webhook_id=webhook_id
            )
            
            return True
            
        except Exception as e:
            log_error(e, "unregister_webhook", webhook_id=webhook_id)
            capture_exception(e, webhook_id=webhook_id)
            return False
    
    def get_webhook_stats(self, webhook_id: str = None) -> Dict[str, Any]:
        """
        Obtener estadísticas de webhooks
        """
        try:
            stats = {
                "total_webhooks": 0,
                "enabled_webhooks": 0,
                "events": {},
                "webhooks": []
            }
            
            for event, webhooks in self.webhooks.items():
                stats["events"][event] = len(webhooks)
                stats["total_webhooks"] += len(webhooks)
                stats["enabled_webhooks"] += len([w for w in webhooks if w["enabled"]])
                
                for webhook in webhooks:
                    if webhook_id and webhook["id"] != webhook_id:
                        continue
                    
                    stats["webhooks"].append({
                        "id": webhook["id"],
                        "event": webhook["event"],
                        "url": webhook["url"],
                        "enabled": webhook["enabled"],
                        "created_at": webhook["created_at"].isoformat(),
                        "last_triggered": webhook["last_triggered"].isoformat() if webhook["last_triggered"] else None,
                        "success_count": webhook["success_count"],
                        "failure_count": webhook["failure_count"]
                    })
            
            return stats
            
        except Exception as e:
            log_error(e, "get_webhook_stats")
            capture_exception(e)
            return {}
    
    async def trigger_user_registered_webhook(self, user_data: Dict[str, Any]):
        """
        Disparar webhook cuando un usuario se registra
        """
        payload = {
            "user_id": user_data.get("uid"),
            "email": user_data.get("email"),
            "full_name": user_data.get("full_name"),
            "alias": user_data.get("alias"),
            "registration_date": datetime.now().isoformat()
        }
        
        return await self.trigger_webhook("user.registered", payload)
    
    async def trigger_payment_webhook(self, payment_data: Dict[str, Any], status: str):
        """
        Disparar webhook cuando hay un pago
        """
        event = f"payment.{status}"
        payload = {
            "payment_id": payment_data.get("id"),
            "user_id": payment_data.get("user_id"),
            "amount": payment_data.get("amount"),
            "currency": payment_data.get("currency"),
            "credits": payment_data.get("credits"),
            "status": status,
            "timestamp": datetime.now().isoformat()
        }
        
        return await self.trigger_webhook(event, payload)
    
    async def trigger_blog_like_webhook(self, like_data: Dict[str, Any]):
        """
        Disparar webhook cuando hay un like en el blog
        """
        payload = {
            "post_id": like_data.get("post_id"),
            "post_title": like_data.get("post_title"),
            "liker_id": like_data.get("liker_id"),
            "liker_alias": like_data.get("liker_alias"),
            "author_id": like_data.get("author_id"),
            "timestamp": datetime.now().isoformat()
        }
        
        return await self.trigger_webhook("blog.post_liked", payload)
    
    async def trigger_credits_alert_webhook(self, user_data: Dict[str, Any], credits: int):
        """
        Disparar webhook cuando un usuario tiene créditos bajos
        """
        payload = {
            "user_id": user_data.get("uid"),
            "email": user_data.get("email"),
            "alias": user_data.get("alias"),
            "credits": credits,
            "alert_threshold": 10,
            "timestamp": datetime.now().isoformat()
        }
        
        return await self.trigger_webhook("credits.low", payload)

# Instancia global del gestor de webhooks
webhook_manager = WebhookManager()

# Funciones helper para disparar webhooks automáticamente
async def trigger_user_registered_webhook(user_data: Dict[str, Any]):
    """
    Función helper para disparar webhook de registro de usuario
    """
    try:
        await webhook_manager.trigger_user_registered_webhook(user_data)
    except Exception as e:
        log_error(e, "trigger_user_registered_webhook_helper")
        capture_exception(e)

async def trigger_payment_webhook(payment_data: Dict[str, Any], status: str):
    """
    Función helper para disparar webhook de pago
    """
    try:
        await webhook_manager.trigger_payment_webhook(payment_data, status)
    except Exception as e:
        log_error(e, "trigger_payment_webhook_helper")
        capture_exception(e)

async def trigger_blog_like_webhook(like_data: Dict[str, Any]):
    """
    Función helper para disparar webhook de like en blog
    """
    try:
        await webhook_manager.trigger_blog_like_webhook(like_data)
    except Exception as e:
        log_error(e, "trigger_blog_like_webhook_helper")
        capture_exception(e) 