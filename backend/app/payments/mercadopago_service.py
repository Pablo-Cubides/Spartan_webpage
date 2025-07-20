import mercadopago
import os
import logging
from typing import Dict, Any, Optional
from fastapi import HTTPException
from datetime import datetime

logger = logging.getLogger(__name__)

class MercadoPagoService:
    """Servicio para integración con MercadoPago"""
    
    def __init__(self):
        self.access_token = os.getenv("MERCADOPAGO_ACCESS_TOKEN")
        if not self.access_token:
            logger.warning("MERCADOPAGO_ACCESS_TOKEN not found, using sandbox mode")
            self.access_token = "TEST-123456789012345678901234567890"
        
        self.sdk = mercadopago.SDK(self.access_token)
        self.is_sandbox = "TEST-" in self.access_token
    
    async def create_payment_preference(
        self, 
        user_id: str,
        amount: int,
        description: str,
        external_reference: str
    ) -> Dict[str, Any]:
        """
        Crear preferencia de pago
        
        Args:
            user_id: ID del usuario
            amount: Cantidad en centavos
            description: Descripción del pago
            external_reference: Referencia externa
        
        Returns:
            dict: Información de la preferencia
        """
        try:
            preference_data = {
                "items": [
                    {
                        "title": description,
                        "quantity": 1,
                        "unit_price": amount / 100.0,  # Convertir centavos a pesos
                        "currency_id": "ARS"
                    }
                ],
                "external_reference": external_reference,
                "notification_url": os.getenv("MERCADOPAGO_WEBHOOK_URL", "https://webhook.site/your-url"),
                "back_urls": {
                    "success": f"{os.getenv('FRONTEND_URL', 'http://localhost:3000')}/payment/success",
                    "failure": f"{os.getenv('FRONTEND_URL', 'http://localhost:3000')}/payment/failure",
                    "pending": f"{os.getenv('FRONTEND_URL', 'http://localhost:3000')}/payment/pending"
                },
                "auto_return": "approved",
                "expires": True,
                "expiration_date_to": (datetime.now().replace(hour=23, minute=59, second=59) + 
                                     datetime.timedelta(days=1)).isoformat() + "Z"
            }
            
            preference_response = self.sdk.preference().create(preference_data)
            
            if preference_response["status"] == 201:
                preference = preference_response["response"]
                logger.info(f"Payment preference created: {preference['id']} for user {user_id}")
                
                return {
                    "preference_id": preference["id"],
                    "init_point": preference["init_point"],
                    "sandbox_init_point": preference["sandbox_init_point"],
                    "external_reference": external_reference
                }
            else:
                logger.error(f"Error creating payment preference: {preference_response}")
                raise HTTPException(status_code=500, detail="Error al crear preferencia de pago")
                
        except Exception as e:
            logger.error(f"Error creating payment preference for user {user_id}: {str(e)}")
            raise HTTPException(status_code=500, detail="Error interno del servidor")
    
    async def get_payment_info(self, payment_id: str) -> Dict[str, Any]:
        """
        Obtener información de un pago
        
        Args:
            payment_id: ID del pago
        
        Returns:
            dict: Información del pago
        """
        try:
            payment_response = self.sdk.payment().get(payment_id)
            
            if payment_response["status"] == 200:
                payment = payment_response["response"]
                logger.info(f"Payment info retrieved: {payment_id}")
                
                return {
                    "id": payment["id"],
                    "status": payment["status"],
                    "status_detail": payment["status_detail"],
                    "external_reference": payment.get("external_reference"),
                    "transaction_amount": payment["transaction_amount"],
                    "currency": payment["currency_id"],
                    "payment_method": payment["payment_method"]["type"],
                    "payment_method_id": payment["payment_method"]["id"],
                    "created_at": payment["date_created"],
                    "updated_at": payment["date_last_updated"]
                }
            else:
                logger.error(f"Error getting payment info: {payment_response}")
                raise HTTPException(status_code=404, detail="Pago no encontrado")
                
        except Exception as e:
            logger.error(f"Error getting payment info for {payment_id}: {str(e)}")
            raise HTTPException(status_code=500, detail="Error interno del servidor")
    
    async def process_webhook(self, webhook_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Procesar webhook de MercadoPago
        
        Args:
            webhook_data: Datos del webhook
        
        Returns:
            dict: Información procesada
        """
        try:
            payment_id = webhook_data.get("data", {}).get("id")
            if not payment_id:
                raise HTTPException(status_code=400, detail="ID de pago no encontrado en webhook")
            
            # Obtener información del pago
            payment_info = await self.get_payment_info(payment_id)
            
            # Determinar estado del pago
            status_mapping = {
                "approved": "approved",
                "pending": "pending",
                "rejected": "rejected",
                "cancelled": "cancelled",
                "in_process": "pending",
                "authorized": "pending"
            }
            
            mapped_status = status_mapping.get(payment_info["status"], "pending")
            
            logger.info(f"Webhook processed: payment {payment_id} -> status {mapped_status}")
            
            return {
                "payment_id": payment_id,
                "status": mapped_status,
                "external_reference": payment_info.get("external_reference"),
                "amount": payment_info["transaction_amount"],
                "currency": payment_info["currency"],
                "payment_method": payment_info["payment_method"],
                "processed_at": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error processing webhook: {str(e)}")
            raise HTTPException(status_code=500, detail="Error procesando webhook")
    
    async def refund_payment(self, payment_id: str, amount: Optional[float] = None) -> Dict[str, Any]:
        """
        Reembolsar un pago
        
        Args:
            payment_id: ID del pago
            amount: Cantidad a reembolsar (opcional, si no se especifica se reembolsa todo)
        
        Returns:
            dict: Información del reembolso
        """
        try:
            refund_data = {}
            if amount:
                refund_data["amount"] = amount
            
            refund_response = self.sdk.refund().create(payment_id, refund_data)
            
            if refund_response["status"] == 201:
                refund = refund_response["response"]
                logger.info(f"Payment refunded: {payment_id} -> {refund['id']}")
                
                return {
                    "refund_id": refund["id"],
                    "payment_id": payment_id,
                    "amount": refund["amount"],
                    "status": refund["status"],
                    "created_at": refund["date_created"]
                }
            else:
                logger.error(f"Error refunding payment: {refund_response}")
                raise HTTPException(status_code=500, detail="Error al procesar reembolso")
                
        except Exception as e:
            logger.error(f"Error refunding payment {payment_id}: {str(e)}")
            raise HTTPException(status_code=500, detail="Error interno del servidor")
    
    def is_sandbox_mode(self) -> bool:
        """
        Verificar si está en modo sandbox
        
        Returns:
            bool: True si está en modo sandbox
        """
        return self.is_sandbox

# Instancia global del servicio
mercadopago_service = MercadoPagoService() 