import os
import time
from typing import Dict, Any, Optional
from prometheus_client import Counter, Histogram, Gauge, Summary, generate_latest, CONTENT_TYPE_LATEST
from fastapi import Request, Response
from fastapi.responses import PlainTextResponse
import asyncio
from datetime import datetime, timedelta
from ..core.logging_config import log_metric

class MetricsCollector:
    """
    Colector de métricas para Prometheus y dashboard
    """
    
    def __init__(self):
        # Métricas de requests HTTP
        self.http_requests_total = Counter(
            'http_requests_total',
            'Total de requests HTTP',
            ['method', 'endpoint', 'status']
        )
        
        self.http_request_duration_seconds = Histogram(
            'http_request_duration_seconds',
            'Duración de requests HTTP',
            ['method', 'endpoint']
        )
        
        # Métricas de autenticación
        self.auth_attempts_total = Counter(
            'auth_attempts_total',
            'Total de intentos de autenticación',
            ['status', 'provider']
        )
        
        # Métricas de base de datos
        self.db_queries_total = Counter(
            'db_queries_total',
            'Total de queries a base de datos',
            ['operation', 'table']
        )
        
        self.db_query_duration_seconds = Histogram(
            'db_query_duration_seconds',
            'Duración de queries a base de datos',
            ['operation', 'table']
        )
        
        # Métricas de cache
        self.cache_hits_total = Counter(
            'cache_hits_total',
            'Total de hits en cache',
            ['cache_type']
        )
        
        self.cache_misses_total = Counter(
            'cache_misses_total',
            'Total de misses en cache',
            ['cache_type']
        )
        
        # Métricas de email
        self.email_sent_total = Counter(
            'email_sent_total',
            'Total de emails enviados',
            ['template', 'status']
        )
        
        self.email_delivery_duration_seconds = Histogram(
            'email_delivery_duration_seconds',
            'Duración de envío de emails',
            ['template']
        )
        
        # Métricas de blog y likes
        self.blog_posts_total = Counter(
            'blog_posts_total',
            'Total de posts del blog',
            ['status']
        )
        
        self.blog_post_likes_total = Counter(
            'blog_post_likes_total',
            'Total de likes en posts',
            ['post_id', 'action']
        )
        
        self.blog_post_views_total = Counter(
            'blog_post_views_total',
            'Total de vistas de posts',
            ['post_id']
        )
        
        # Métricas de usuarios
        self.users_registered_total = Counter(
            'users_registered_total',
            'Total de usuarios registrados',
            ['source']
        )
        
        self.users_active_total = Gauge(
            'users_active_total',
            'Usuarios activos en el momento',
            ['period']
        )
        
        # Métricas de pagos
        self.payments_total = Counter(
            'payments_total',
            'Total de pagos procesados',
            ['status', 'provider']
        )
        
        self.payments_amount_total = Counter(
            'payments_amount_total',
            'Monto total de pagos',
            ['currency', 'status']
        )
        
        # Métricas de rate limiting
        self.rate_limit_hits_total = Counter(
            'rate_limit_hits_total',
            'Total de hits en rate limiting',
            ['endpoint', 'action']
        )
        
        # Métricas de errores
        self.errors_total = Counter(
            'errors_total',
            'Total de errores',
            ['type', 'endpoint']
        )
        
        # Métricas de performance
        self.memory_usage_bytes = Gauge(
            'memory_usage_bytes',
            'Uso de memoria en bytes'
        )
        
        self.cpu_usage_percent = Gauge(
            'cpu_usage_percent',
            'Uso de CPU en porcentaje'
        )
        
        # Métricas de negocio
        self.business_operations_total = Counter(
            'business_operations_total',
            'Total de operaciones de negocio',
            ['operation', 'status']
        )
        
        # Almacén temporal para métricas personalizadas
        self.custom_metrics = {}
        
    def increment_counter(self, metric_name: str, labels: Dict[str, str] = None):
        """
        Incrementar contador personalizado
        """
        if metric_name == "blog_post_likes_total":
            post_id = labels.get("post_id", "unknown")
            action = labels.get("action", "like")
            self.blog_post_likes_total.labels(post_id=post_id, action=action).inc()
        elif metric_name == "http_requests_total":
            method = labels.get("method", "unknown")
            endpoint = labels.get("endpoint", "unknown")
            status = labels.get("status", "unknown")
            self.http_requests_total.labels(method=method, endpoint=endpoint, status=status).inc()
        elif metric_name == "errors_total":
            error_type = labels.get("type", "unknown")
            endpoint = labels.get("endpoint", "unknown")
            self.errors_total.labels(type=error_type, endpoint=endpoint).inc()
        elif metric_name == "business_operations_total":
            operation = labels.get("operation", "unknown")
            status = labels.get("status", "success")
            self.business_operations_total.labels(operation=operation, status=status).inc()
        else:
            # Métrica personalizada
            if metric_name not in self.custom_metrics:
                self.custom_metrics[metric_name] = Counter(
                    f'custom_{metric_name}_total',
                    f'Custom metric: {metric_name}',
                    list(labels.keys()) if labels else []
                )
            self.custom_metrics[metric_name].labels(**labels).inc()
    
    def record_histogram(self, metric_name: str, value: float, labels: Dict[str, str] = None):
        """
        Registrar valor en histograma
        """
        if metric_name == "http_request_duration_seconds":
            method = labels.get("method", "unknown")
            endpoint = labels.get("endpoint", "unknown")
            self.http_request_duration_seconds.labels(method=method, endpoint=endpoint).observe(value)
        elif metric_name == "db_query_duration_seconds":
            operation = labels.get("operation", "unknown")
            table = labels.get("table", "unknown")
            self.db_query_duration_seconds.labels(operation=operation, table=table).observe(value)
        elif metric_name == "email_delivery_duration_seconds":
            template = labels.get("template", "unknown")
            self.email_delivery_duration_seconds.labels(template=template).observe(value)
    
    def set_gauge(self, metric_name: str, value: float, labels: Dict[str, str] = None):
        """
        Establecer valor de gauge
        """
        if metric_name == "users_active_total":
            period = labels.get("period", "current")
            self.users_active_total.labels(period=period).set(value)
        elif metric_name == "memory_usage_bytes":
            self.memory_usage_bytes.set(value)
        elif metric_name == "cpu_usage_percent":
            self.cpu_usage_percent.set(value)
    
    async def collect_system_metrics(self):
        """
        Recolectar métricas del sistema
        """
        try:
            import psutil
            
            # Métricas de memoria
            memory = psutil.virtual_memory()
            self.set_gauge("memory_usage_bytes", memory.used)
            
            # Métricas de CPU
            cpu_percent = psutil.cpu_percent(interval=1)
            self.set_gauge("cpu_usage_percent", cpu_percent)
            
            # Log de métricas del sistema
            log_metric("system_memory_usage", memory.used / 1024 / 1024, {"unit": "MB"})
            log_metric("system_cpu_usage", cpu_percent, {"unit": "percent"})
            
        except ImportError:
            # psutil no está instalado, saltar métricas del sistema
            pass
        except Exception as e:
            # Log error pero no fallar
            pass

# Instancia global del colector de métricas
metrics_collector = MetricsCollector()

class MetricsMiddleware:
    """
    Middleware para capturar métricas automáticamente
    """
    
    def __init__(self, app):
        self.app = app
    
    async def __call__(self, scope, receive, send):
        if scope["type"] == "http":
            request = Request(scope, receive)
            start_time = time.time()
            
            # Capturar métricas de request
            method = request.method
            endpoint = request.url.path
            
            # Procesar request
            try:
                await self.app(scope, receive, send)
                
                # Métricas de éxito
                duration = time.time() - start_time
                metrics_collector.increment_counter("http_requests_total", {
                    "method": method,
                    "endpoint": endpoint,
                    "status": "200"
                })
                metrics_collector.record_histogram("http_request_duration_seconds", duration, {
                    "method": method,
                    "endpoint": endpoint
                })
                
            except Exception as e:
                # Métricas de error
                duration = time.time() - start_time
                metrics_collector.increment_counter("http_requests_total", {
                    "method": method,
                    "endpoint": endpoint,
                    "status": "500"
                })
                metrics_collector.increment_counter("errors_total", {
                    "type": "http_error",
                    "endpoint": endpoint
                })
                metrics_collector.record_histogram("http_request_duration_seconds", duration, {
                    "method": method,
                    "endpoint": endpoint
                })
                raise
        else:
            await self.app(scope, receive, send)

async def get_metrics():
    """
    Endpoint para obtener métricas en formato Prometheus
    """
    # Recolectar métricas del sistema
    await metrics_collector.collect_system_metrics()
    
    # Generar métricas en formato Prometheus
    return Response(
        content=generate_latest(),
        media_type=CONTENT_TYPE_LATEST
    )

async def get_dashboard_metrics():
    """
    Endpoint para obtener métricas para dashboard
    """
    try:
        # TODO: Implementar consultas a base de datos para métricas agregadas
        # Por ahora retornamos métricas básicas
        
        dashboard_data = {
            "system": {
                "memory_usage_mb": 0,
                "cpu_usage_percent": 0,
                "uptime_seconds": 0
            },
            "requests": {
                "total_requests": 0,
                "requests_per_minute": 0,
                "average_response_time_ms": 0,
                "error_rate_percent": 0
            },
            "users": {
                "total_users": 0,
                "active_users_today": 0,
                "new_users_today": 0
            },
            "blog": {
                "total_posts": 0,
                "total_likes": 0,
                "likes_today": 0,
                "most_popular_post": None
            },
            "payments": {
                "total_payments": 0,
                "total_amount": 0,
                "payments_today": 0
            },
            "emails": {
                "total_sent": 0,
                "delivery_rate_percent": 0,
                "emails_today": 0
            }
        }
        
        return dashboard_data
        
    except Exception as e:
        return {"error": str(e)}

# Función helper para registrar métricas de negocio
def record_business_metric(operation: str, status: str = "success", **kwargs):
    """
    Registrar métrica de operación de negocio
    """
    metrics_collector.increment_counter("business_operations_total", {
        "operation": operation,
        "status": status
    })
    
    # Log de métrica
    log_metric(f"business_{operation}", 1, {"status": status, **kwargs})

# Función helper para registrar métricas de cache
def record_cache_metric(hit: bool, cache_type: str = "redis"):
    """
    Registrar métrica de cache
    """
    if hit:
        metrics_collector.increment_counter("cache_hits_total", {"cache_type": cache_type})
    else:
        metrics_collector.increment_counter("cache_misses_total", {"cache_type": cache_type})

# Función helper para registrar métricas de email
def record_email_metric(template: str, status: str = "sent", duration: float = None):
    """
    Registrar métrica de email
    """
    metrics_collector.increment_counter("email_sent_total", {
        "template": template,
        "status": status
    })
    
    if duration is not None:
        metrics_collector.record_histogram("email_delivery_duration_seconds", duration, {
            "template": template
        }) 