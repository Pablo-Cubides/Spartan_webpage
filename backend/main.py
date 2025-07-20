from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.payments import router as payments_router
from app.users.routes import router as users_router
from app.users.routes_advanced import router as advanced_router
from app.core.firebase_auth import auth_logging_middleware
from app.core.cache import cache_manager
from app.core.background_tasks import background_task_manager
from app.notifications.notification_service import notification_service

app = FastAPI(
    title="Spartan Market API",
    description="API for Spartan Market with MercadoPago integration",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(payments_router)
app.include_router(users_router)
app.include_router(advanced_router)

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

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "Spartan Market API"}
