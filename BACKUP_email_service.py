"""
BACKUP REFERENCE: email_service.py de backend_legacy
================================================================================
Este archivo es una referencia del servicio de email del backend legacy.
Contiene la lógica de integración con Brevo (Sendinblue).

En el nuevo sistema (Vercel + Next.js), los emails se pueden enviar de forma similar
usando la librería Brevo para Node.js o directamente a través de HTTP requests.

Guardado el: 2025-11-18
================================================================================
"""

import os
import asyncio
from typing import Optional, Dict, Any
from sib_api_v3_sdk import ApiClient, TransactionalEmailsApi, SendSmtpEmail
from sib_api_v3_sdk.rest import ApiException
from tenacity import retry, stop_after_attempt, wait_exponential
from loguru import logger
from app.core.sentry_config import capture_exception, set_user_context
from app.core.logging_config import log_business_operation, log_error

class EmailService:
    """
    Servicio de email usando Brevo (Sendinblue)
    """
    
    def __init__(self):
        self.api_key = os.getenv("BREVO_API_KEY")
        self.default_sender = os.getenv("BREVO_DEFAULT_SENDER", "spartanmarket@gmail.com")
        self.welcome_template_id = int(os.getenv("BREVO_TEMPLATE_WELCOME_ID", "12"))
        self.payment_template_id = int(os.getenv("BREVO_TEMPLATE_PAYMENT_ID", "13"))
        
        # Configurar cliente de API
        self.api_client = ApiClient()
        self.api_client.set_api_key('api-key', self.api_key)
        self.transactional_api = TransactionalEmailsApi(self.api_client)
        
        logger.info("EmailService initialized with Brevo")
    
    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=1, max=10),
        reraise=True
    )
    async def send_template_email(
        self,
        template_id: int,
        to_email: str,
        to_name: str,
        template_data: Dict[str, Any],
        user_id: Optional[str] = None
    ) -> bool:
        """
        Enviar email usando template de Brevo
        
        Args:
            template_id: ID del template en Brevo
            to_email: Email del destinatario
            to_name: Nombre del destinatario
            template_data: Datos para el template
            user_id: ID del usuario (opcional)
        
        Returns:
            bool: True si se envió correctamente
        """
        try:
            # Configurar email
            send_email = SendSmtpEmail(
                to=[{"email": to_email, "name": to_name}],
                template_id=template_id,
                params=template_data,
                sender={"email": self.default_sender, "name": "Spartan Market"}
            )
            
            # Enviar email
            response = self.transactional_api.send_transac_email(send_email)
            
            # Log de éxito
            log_business_operation(
                operation="email_sent",
                user_id=user_id,
                email_type=f"template_{template_id}",
                recipient=to_email,
                message_id=response.message_id
            )
            
            logger.info(f"Email sent successfully: {response.message_id}")
            return True
            
        except ApiException as e:
            # Log de error
            log_error(
                error=e,
                context="email_send",
                user_id=user_id,
                template_id=template_id,
                recipient=to_email
            )
            
            # Capturar en Sentry
            capture_exception(e, user_id=user_id, template_id=template_id, recipient=to_email)
            
            logger.error(f"Failed to send email: {e}")
            raise
    
    async def send_welcome(self, user: Dict[str, Any]) -> bool:
        """
        Enviar email de bienvenida
        
        Args:
            user: Datos del usuario
        
        Returns:
            bool: True si se envió correctamente
        """
        try:
            # Preparar datos del template
            template_data = {
                "name": user.get("full_name", "Usuario"),
                "alias": user.get("alias", ""),
                "profile_url": f"https://spartanmarket.com/profile/{user.get('alias', '')}",
                "welcome_message": "¡Bienvenido a Spartan Market!"
            }
            
            # Enviar email
            success = await self.send_template_email(
                template_id=self.welcome_template_id,
                to_email=user.get("email"),
                to_name=user.get("full_name", "Usuario"),
                template_data=template_data,
                user_id=user.get("uid")
            )
            
            if success:
                logger.info(f"Welcome email sent to {user.get('email')}")
            
            return success
            
        except Exception as e:
            logger.error(f"Failed to send welcome email: {e}")
            capture_exception(e, user_id=user.get("uid"))
            return False
    
    async def send_payment_approved(
        self,
        user: Dict[str, Any],
        credits: int,
        amount: float,
        currency: str = "ARS"
    ) -> bool:
        """
        Enviar email de pago aprobado
        
        Args:
            user: Datos del usuario
            credits: Cantidad de créditos comprados
            amount: Monto pagado
            currency: Moneda (default: ARS)
        
        Returns:
            bool: True si se envió correctamente
        """
        try:
            # Preparar datos del template
            template_data = {
                "name": user.get("full_name", "Usuario"),
                "alias": user.get("alias", ""),
                "credits": credits,
                "amount": f"{amount:.2f}",
                "currency": currency,
                "profile_url": f"https://spartanmarket.com/profile/{user.get('alias', '')}",
                "payment_message": f"Tu compra de {credits} créditos por {amount:.2f} {currency} ha sido aprobada."
            }
            
            # Enviar email
            success = await self.send_template_email(
                template_id=self.payment_template_id,
                to_email=user.get("email"),
                to_name=user.get("full_name", "Usuario"),
                template_data=template_data,
                user_id=user.get("uid")
            )
            
            if success:
                logger.info(f"Payment approved email sent to {user.get('email')}")
            
            return success
            
        except Exception as e:
            logger.error(f"Failed to send payment approved email: {e}")
            capture_exception(e, user_id=user.get("uid"))
            return False
    
    async def send_custom_email(
        self,
        to_email: str,
        to_name: str,
        subject: str,
        html_content: str,
        text_content: str = None,
        user_id: Optional[str] = None
    ) -> bool:
        """
        Enviar email personalizado
        
        Args:
            to_email: Email del destinatario
            to_name: Nombre del destinatario
            subject: Asunto del email
            html_content: Contenido HTML
            text_content: Contenido de texto (opcional)
            user_id: ID del usuario (opcional)
        
        Returns:
            bool: True si se envió correctamente
        """
        try:
            # Configurar email
            send_email = SendSmtpEmail(
                to=[{"email": to_email, "name": to_name}],
                sender={"email": self.default_sender, "name": "Spartan Market"},
                subject=subject,
                html_content=html_content,
                text_content=text_content
            )
            
            # Enviar email
            response = self.transactional_api.send_transac_email(send_email)
            
            # Log de éxito
            log_business_operation(
                operation="custom_email_sent",
                user_id=user_id,
                recipient=to_email,
                subject=subject,
                message_id=response.message_id
            )
            
            logger.info(f"Custom email sent successfully: {response.message_id}")
            return True
            
        except ApiException as e:
            # Log de error
            log_error(
                error=e,
                context="custom_email_send",
                user_id=user_id,
                recipient=to_email,
                subject=subject
            )
            
            # Capturar en Sentry
            capture_exception(e, user_id=user_id, recipient=to_email, subject=subject)
            
            logger.error(f"Failed to send custom email: {e}")
            raise
    
    async def send_bulk_emails(
        self,
        emails: list,
        template_id: int,
        template_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Enviar emails en lote
        
        Args:
            emails: Lista de emails con formato [{"email": "...", "name": "..."}]
            template_id: ID del template
            template_data: Datos del template
        
        Returns:
            Dict con resultados del envío
        """
        try:
            # Configurar email en lote
            send_email = SendSmtpEmail(
                to=emails,
                template_id=template_id,
                params=template_data,
                sender={"email": self.default_sender, "name": "Spartan Market"}
            )
            
            # Enviar emails
            response = self.transactional_api.send_transac_email(send_email)
            
            # Log de éxito
            log_business_operation(
                operation="bulk_emails_sent",
                template_id=template_id,
                recipients_count=len(emails),
                message_id=response.message_id
            )
            
            logger.info(f"Bulk emails sent successfully: {response.message_id}")
            
            return {
                "success": True,
                "message_id": response.message_id,
                "recipients_count": len(emails)
            }
            
        except ApiException as e:
            # Log de error
            log_error(
                error=e,
                context="bulk_email_send",
                template_id=template_id,
                recipients_count=len(emails)
            )
            
            # Capturar en Sentry
            capture_exception(e, template_id=template_id, recipients_count=len(emails))
            
            logger.error(f"Failed to send bulk emails: {e}")
            
            return {
                "success": False,
                "error": str(e),
                "recipients_count": len(emails)
            }
    
    def get_email_stats(self) -> Dict[str, Any]:
        """
        Obtener estadísticas de emails enviados
        
        Returns:
            Dict con estadísticas
        """
        try:
            # Obtener estadísticas de la API de Brevo
            # Esta funcionalidad dependería de la API específica de Brevo
            # Por ahora retornamos un placeholder
            
            return {
                "total_sent": 0,  # Placeholder
                "delivered": 0,   # Placeholder
                "bounced": 0,     # Placeholder
                "opened": 0,      # Placeholder
                "clicked": 0      # Placeholder
            }
            
        except Exception as e:
            logger.error(f"Failed to get email stats: {e}")
            capture_exception(e)
            return {}

# Instancia global del servicio de email
email_service = EmailService()
