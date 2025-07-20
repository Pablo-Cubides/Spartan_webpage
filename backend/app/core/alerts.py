import os
import asyncio
import aiohttp
from typing import Dict, Any, Optional, List
from datetime import datetime, timedelta
from ..core.logging_config import log_business_operation, log_error
from ..core.sentry_config import capture_exception
from ..core.metrics import metrics_collector

class AlertManager:
    """
    Gestor de alertas para Sentry y Slack
    """
    
    def __init__(self):
        self.sentry_dsn = os.getenv("SENTRY_DSN")
        self.slack_webhook_url = os.getenv("SENTRY_SLACK_WEBHOOK_URL")
        self.alert_error_rate_threshold = float(os.getenv("SENTRY_ALERT_ERROR_RATE_THRESHOLD", "0.02"))  # 2%
        self.alert_error_rate_window = int(os.getenv("SENTRY_ALERT_ERROR_RATE_WINDOW", "300"))  # 5 minutos
        self.slack_channel = os.getenv("SENTRY_SLACK_CHANNEL", "#alerts")
        
        # Almacén temporal de métricas para alertas
        self.error_counts = {}
        self.request_counts = {}
        self.last_alert_time = {}
        
    async def check_error_rate_alert(self):
        """
        Verificar si la tasa de error supera el umbral
        """
        try:
            current_time = datetime.now()
            window_start = current_time - timedelta(seconds=self.alert_error_rate_window)
            
            # Obtener métricas de los últimos 5 minutos
            total_requests = 0
            total_errors = 0
            
            # TODO: Implementar consulta real a métricas
            # Por ahora usamos valores de ejemplo
            total_requests = 1000
            total_errors = 25
            
            if total_requests > 0:
                error_rate = total_errors / total_requests
                
                if error_rate > self.alert_error_rate_threshold:
                    await self.send_error_rate_alert(error_rate, total_errors, total_requests)
                    
        except Exception as e:
            log_error(e, "check_error_rate_alert")
            capture_exception(e)
    
    async def send_error_rate_alert(self, error_rate: float, error_count: int, total_requests: int):
        """
        Enviar alerta de tasa de error alta
        """
        try:
            alert_key = "error_rate_high"
            current_time = datetime.now()
            
            # Evitar spam de alertas (máximo 1 por hora)
            if alert_key in self.last_alert_time:
                time_since_last = current_time - self.last_alert_time[alert_key]
                if time_since_last.total_seconds() < 3600:  # 1 hora
                    return
            
            self.last_alert_time[alert_key] = current_time
            
            # Mensaje para Slack
            message = {
                "channel": self.slack_channel,
                "text": f"🚨 *ALERTA: Tasa de Error Alta*",
                "attachments": [
                    {
                        "color": "danger",
                        "fields": [
                            {
                                "title": "Tasa de Error",
                                "value": f"{error_rate:.2%}",
                                "short": True
                            },
                            {
                                "title": "Errores",
                                "value": f"{error_count}",
                                "short": True
                            },
                            {
                                "title": "Total Requests",
                                "value": f"{total_requests}",
                                "short": True
                            },
                            {
                                "title": "Umbral",
                                "value": f"{self.alert_error_rate_threshold:.2%}",
                                "short": True
                            },
                            {
                                "title": "Timestamp",
                                "value": current_time.strftime("%Y-%m-%d %H:%M:%S"),
                                "short": False
                            }
                        ],
                        "footer": "Spartan Market API",
                        "footer_icon": "https://spartanmarket.com/favicon.ico"
                    }
                ]
            }
            
            await self.send_slack_message(message)
            
            # Log de alerta
            log_business_operation(
                operation="error_rate_alert_sent",
                error_rate=error_rate,
                error_count=error_count,
                total_requests=total_requests
            )
            
        except Exception as e:
            log_error(e, "send_error_rate_alert")
            capture_exception(e)
    
    async def send_slack_message(self, message: Dict[str, Any]):
        """
        Enviar mensaje a Slack
        """
        if not self.slack_webhook_url:
            return
        
        try:
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    self.slack_webhook_url,
                    json=message,
                    timeout=aiohttp.ClientTimeout(total=10)
                ) as response:
                    if response.status != 200:
                        log_error(
                            Exception(f"Slack webhook failed: {response.status}"),
                            "send_slack_message"
                        )
                        
        except Exception as e:
            log_error(e, "send_slack_message")
            capture_exception(e)
    
    async def send_custom_alert(self, title: str, message: str, level: str = "info", **kwargs):
        """
        Enviar alerta personalizada
        """
        try:
            colors = {
                "info": "#36a64f",
                "warning": "#ff9500",
                "error": "#ff0000",
                "critical": "#8b0000"
            }
            
            color = colors.get(level, "#36a64f")
            
            slack_message = {
                "channel": self.slack_channel,
                "text": f"🔔 *{title}*",
                "attachments": [
                    {
                        "color": color,
                        "text": message,
                        "fields": [
                            {
                                "title": key.replace("_", " ").title(),
                                "value": str(value),
                                "short": True
                            }
                            for key, value in kwargs.items()
                        ],
                        "footer": "Spartan Market API",
                        "footer_icon": "https://spartanmarket.com/favicon.ico",
                        "ts": int(datetime.now().timestamp())
                    }
                ]
            }
            
            await self.send_slack_message(slack_message)
            
            # Log de alerta
            log_business_operation(
                operation="custom_alert_sent",
                alert_title=title,
                alert_level=level,
                **kwargs
            )
            
        except Exception as e:
            log_error(e, "send_custom_alert")
            capture_exception(e)
    
    async def send_performance_alert(self, metric: str, value: float, threshold: float):
        """
        Enviar alerta de performance
        """
        try:
            title = f"ALERTA: Performance Degradada"
            message = f"La métrica {metric} ha superado el umbral de {threshold}"
            
            await self.send_custom_alert(
                title=title,
                message=message,
                level="warning",
                metric=metric,
                current_value=value,
                threshold=threshold
            )
            
        except Exception as e:
            log_error(e, "send_performance_alert")
            capture_exception(e)
    
    async def send_security_alert(self, event_type: str, details: Dict[str, Any]):
        """
        Enviar alerta de seguridad
        """
        try:
            title = f"ALERTA: Evento de Seguridad"
            message = f"Se detectó un evento de seguridad: {event_type}"
            
            await self.send_custom_alert(
                title=title,
                message=message,
                level="error",
                event_type=event_type,
                **details
            )
            
        except Exception as e:
            log_error(e, "send_security_alert")
            capture_exception(e)
    
    async def send_business_alert(self, operation: str, details: Dict[str, Any]):
        """
        Enviar alerta de negocio
        """
        try:
            title = f"ALERTA: Evento de Negocio"
            message = f"Evento importante de negocio: {operation}"
            
            await self.send_custom_alert(
                title=title,
                message=message,
                level="info",
                operation=operation,
                **details
            )
            
        except Exception as e:
            log_error(e, "send_business_alert")
            capture_exception(e)

# Instancia global del gestor de alertas
alert_manager = AlertManager()

# Función helper para registrar alertas automáticamente
async def auto_alert_on_error(error: Exception, context: str, **kwargs):
    """
    Registrar error y enviar alerta si es necesario
    """
    try:
        # Capturar en Sentry
        capture_exception(error, **kwargs)
        
        # Verificar si es un error crítico que requiere alerta inmediata
        error_message = str(error)
        if any(keyword in error_message.lower() for keyword in [
            "database", "connection", "timeout", "critical", "fatal"
        ]):
            await alert_manager.send_custom_alert(
                title="ERROR CRÍTICO",
                message=f"Error crítico en {context}: {error_message}",
                level="critical",
                context=context,
                error_type=type(error).__name__,
                **kwargs
            )
            
    except Exception as e:
        # No queremos que las alertas fallen
        log_error(e, "auto_alert_on_error")

# Función helper para alertas de rate limiting
async def alert_rate_limit_exceeded(endpoint: str, user_id: str = None, ip: str = None):
    """
    Alerta cuando se excede el rate limiting
    """
    try:
        await alert_manager.send_security_alert(
            event_type="rate_limit_exceeded",
            details={
                "endpoint": endpoint,
                "user_id": user_id,
                "ip_address": ip,
                "timestamp": datetime.now().isoformat()
            }
        )
        
    except Exception as e:
        log_error(e, "alert_rate_limit_exceeded")

# Función helper para alertas de autenticación
async def alert_auth_failure(user_id: str = None, ip: str = None, reason: str = None):
    """
    Alerta cuando falla la autenticación
    """
    try:
        await alert_manager.send_security_alert(
            event_type="auth_failure",
            details={
                "user_id": user_id,
                "ip_address": ip,
                "reason": reason,
                "timestamp": datetime.now().isoformat()
            }
        )
        
    except Exception as e:
        log_error(e, "alert_auth_failure")

# Función helper para alertas de pagos
async def alert_payment_issue(payment_id: str, amount: float, currency: str, issue: str):
    """
    Alerta cuando hay problemas con pagos
    """
    try:
        await alert_manager.send_business_alert(
            operation="payment_issue",
            details={
                "payment_id": payment_id,
                "amount": amount,
                "currency": currency,
                "issue": issue,
                "timestamp": datetime.now().isoformat()
            }
        )
        
    except Exception as e:
        log_error(e, "alert_payment_issue")

# Tarea en background para monitoreo continuo
async def background_alert_monitor():
    """
    Monitoreo en background para alertas automáticas
    """
    while True:
        try:
            # Verificar tasa de error
            await alert_manager.check_error_rate_alert()
            
            # Esperar 1 minuto antes de la siguiente verificación
            await asyncio.sleep(60)
            
        except Exception as e:
            log_error(e, "background_alert_monitor")
            await asyncio.sleep(60)  # Continuar a pesar del error 