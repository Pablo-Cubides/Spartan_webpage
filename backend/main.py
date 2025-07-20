from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.payments import router as payments_router
from app.users.routes import router as users_router
from app.users.routes_advanced import router as advanced_router
from app.users.avatar_routes import router as avatar_router
from app.credits.routes import router as credits_router
from app.admin.routes import router as admin_router
from app.core.firebase_auth import auth_logging_middleware
from app.core.cache import cache_manager
from app.core.background_tasks import background_task_manager
from app.notifications.notification_service import notification_service

app = FastAPI(
    title="Spartan Market API",
    description="API for Spartan Market with MercadoPago integration",
    version="1.0.0",
    docs_url="/api/v1/docs",
    redoc_url="/api/v1/redoc",
    openapi_url="/api/v1/openapi.json"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers with /api/v1 prefix
app.include_router(payments_router, prefix="/api/v1")
app.include_router(users_router, prefix="/api/v1")
app.include_router(advanced_router, prefix="/api/v1")
app.include_router(avatar_router, prefix="/api/v1")
app.include_router(credits_router, prefix="/api/v1")
app.include_router(admin_router, prefix="/api/v1")

# Add middleware for authentication logging
app.middleware("http")(auth_logging_middleware)

@app.on_event("startup")
async def startup_event():
    """Inicializar servicios al arrancar"""
    try:
        # Conectar caché
        await cache_manager.cache.connect()
        
        # Iniciar gestor de tareas
        await background_task_manager.start()
        
        # Iniciar servicio de notificaciones
        await notification_service.start()
        
        print("✅ Servicios inicializados correctamente")
        
    except Exception as e:
        print(f"❌ Error inicializando servicios: {e}")

@app.on_event("shutdown")
async def shutdown_event():
    """Limpiar servicios al cerrar"""
    try:
        # Detener gestor de tareas
        await background_task_manager.stop()
        
        # Detener servicio de notificaciones
        await notification_service.stop()
        
        # Desconectar caché
        await cache_manager.cache.disconnect()
        
        print("✅ Servicios detenidos correctamente")
        
    except Exception as e:
        print(f"❌ Error deteniendo servicios: {e}")

@app.get("/")
def read_root():
    return {"mensaje": "Bienvenido a Spartan Market API"}

@app.get("/api/v1/healthz")
def health_check():
    """Health check endpoint - returns 200 if application is running"""
    return {"status": "healthy", "service": "Spartan Market API"}

@app.get("/api/v1/readyz")
async def readiness_check():
    """Readiness check endpoint - verifies all services are available"""
    from app.core.database import get_db
    from app.core.cache import cache_manager
    from app.core.storage import r2_client
    
    status = {
        "status": "ready",
        "services": {
            "postgres": "unknown",
            "redis": "unknown", 
            "r2": "unknown"
        }
    }
    
    # Check PostgreSQL
    try:
        db = get_db()
        db.execute("SELECT 1")
        status["services"]["postgres"] = "ok"
    except Exception as e:
        status["services"]["postgres"] = f"error: {str(e)}"
        status["status"] = "not_ready"
    
    # Check Redis
    try:
        await cache_manager.cache.ping()
        status["services"]["redis"] = "ok"
    except Exception as e:
        status["services"]["redis"] = f"error: {str(e)}"
        status["status"] = "not_ready"
    
    # Check R2
    try:
        # Try to list buckets to verify connection
        response = r2_client.list_buckets()
        status["services"]["r2"] = "ok"
    except Exception as e:
        status["services"]["r2"] = f"error: {str(e)}"
        status["status"] = "not_ready"
    
    # Return 503 if any service is down
    if status["status"] == "not_ready":
        from fastapi import HTTPException
        raise HTTPException(status_code=503, detail=status)
    
    return status
