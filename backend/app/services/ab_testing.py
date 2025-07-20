import os
import random
import hashlib
from typing import Dict, Any, List, Optional, Tuple
from datetime import datetime, timedelta
from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text, JSON, func, and_, or_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import select
from ..db.base_class import Base
from ..core.logging_config import log_business_operation, log_error
from ..core.sentry_config import capture_exception
from ..core.metrics import record_business_metric
from sqlalchemy.orm import relationship, backref
from sqlalchemy import ForeignKey

class ABTest(Base):
    """
    Modelo para tests A/B
    """
    __tablename__ = "ab_tests"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, unique=True, index=True)
    description = Column(Text)
    test_type = Column(String(50), nullable=False)  # email, content, feature
    status = Column(String(20), default="active")  # active, paused, completed
    traffic_split = Column(JSON, default={"A": 50, "B": 50})  # Porcentajes por variante
    start_date = Column(DateTime(timezone=True), nullable=False)
    end_date = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class ABTestVariant(Base):
    """
    Modelo para variantes de tests A/B
    """
    __tablename__ = "ab_test_variants"
    
    id = Column(Integer, primary_key=True, index=True)
    test_id = Column(Integer, ForeignKey("ab_tests.id"), nullable=False, index=True)
    variant_name = Column(String(10), nullable=False)  # A, B, C, etc.
    content = Column(JSON, nullable=False)  # Contenido de la variante
    is_control = Column(Boolean, default=False)  # Si es la variante de control
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class ABTestResult(Base):
    """
    Modelo para resultados de tests A/B
    """
    __tablename__ = "ab_test_results"
    
    id = Column(Integer, primary_key=True, index=True)
    test_id = Column(Integer, ForeignKey("ab_tests.id"), nullable=False, index=True)
    user_id = Column(String(255), nullable=False, index=True)
    variant_name = Column(String(10), nullable=False)
    action = Column(String(50), nullable=False)  # view, click, conversion
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    metadata = Column(JSON, default={})

class ABTestingService:
    """
    Servicio de A/B testing para emails y contenido
    """
    
    def __init__(self):
        self.cache = {}
        self.cache_ttl = 300  # 5 minutos
    
    def _get_user_hash(self, user_id: str, test_name: str) -> int:
        """
        Generar hash determinístico para asignar usuario a variante
        """
        hash_input = f"{user_id}:{test_name}"
        hash_object = hashlib.md5(hash_input.encode())
        return int(hash_object.hexdigest(), 16)
    
    def _assign_variant(
        self,
        user_id: str,
        test_name: str,
        traffic_split: Dict[str, int]
    ) -> str:
        """
        Asignar usuario a una variante basado en hash
        """
        try:
            user_hash = self._get_user_hash(user_id, test_name)
            random.seed(user_hash)
            
            # Generar número entre 0 y 100
            user_percentage = user_hash % 100
            
            # Asignar variante basado en porcentajes
            cumulative = 0
            for variant, percentage in traffic_split.items():
                cumulative += percentage
                if user_percentage < cumulative:
                    return variant
            
            # Fallback a la primera variante
            return list(traffic_split.keys())[0]
            
        except Exception as e:
            log_error(e, "_assign_variant", user_id=user_id, test_name=test_name)
            return "A"  # Fallback
    
    async def get_variant(
        self,
        user_id: str,
        test_name: str,
        db: AsyncSession
    ) -> Optional[Dict[str, Any]]:
        """
        Obtener variante para un usuario en un test específico
        
        Args:
            user_id: ID del usuario
            test_name: Nombre del test
            db: Sesión de base de datos
        
        Returns:
            Dict con información de la variante o None si no hay test activo
        """
        try:
            # Verificar cache
            cache_key = f"ab_test:{test_name}:{user_id}"
            if cache_key in self.cache:
                cache_data = self.cache[cache_key]
                if datetime.now() < cache_data["expires"]:
                    return cache_data["variant"]
            
            # Buscar test activo
            test_query = select(ABTest).where(
                and_(
                    ABTest.name == test_name,
                    ABTest.status == "active",
                    ABTest.start_date <= datetime.now(),
                    or_(
                        ABTest.end_date.is_(None),
                        ABTest.end_date > datetime.now()
                    )
                )
            )
            
            test_result = await db.execute(test_query)
            test = test_result.scalar_one_or_none()
            
            if not test:
                return None
            
            # Asignar variante
            variant_name = self._assign_variant(user_id, test_name, test.traffic_split)
            
            # Obtener contenido de la variante
            variant_query = select(ABTestVariant).where(
                and_(
                    ABTestVariant.test_id == test.id,
                    ABTestVariant.variant_name == variant_name
                )
            )
            
            variant_result = await db.execute(variant_query)
            variant = variant_result.scalar_one_or_none()
            
            if not variant:
                return None
            
            # Preparar respuesta
            variant_data = {
                "test_id": test.id,
                "test_name": test.name,
                "variant_name": variant.variant_name,
                "content": variant.content,
                "is_control": variant.is_control
            }
            
            # Cache por 5 minutos
            self.cache[cache_key] = {
                "variant": variant_data,
                "expires": datetime.now() + timedelta(seconds=self.cache_ttl)
            }
            
            # Registrar métrica
            record_business_metric("ab_test_variant_assigned", "success", 
                                 test_name=test_name, variant=variant_name)
            
            return variant_data
            
        except Exception as e:
            log_error(e, "get_variant", user_id=user_id, test_name=test_name)
            capture_exception(e, user_id=user_id, test_name=test_name)
            return None
    
    async def record_result(
        self,
        test_id: int,
        user_id: str,
        variant_name: str,
        action: str,
        metadata: Dict[str, Any] = None,
        db: AsyncSession = None
    ) -> bool:
        """
        Registrar resultado de una acción en un test A/B
        
        Args:
            test_id: ID del test
            user_id: ID del usuario
            variant_name: Nombre de la variante
            action: Acción realizada (view, click, conversion)
            metadata: Metadatos adicionales
            db: Sesión de base de datos
        
        Returns:
            bool: True si se registró correctamente
        """
        try:
            if not db:
                return False
            
            # Crear resultado
            result = ABTestResult(
                test_id=test_id,
                user_id=user_id,
                variant_name=variant_name,
                action=action,
                metadata=metadata or {}
            )
            
            db.add(result)
            await db.commit()
            
            # Registrar métrica
            record_business_metric("ab_test_action_recorded", "success", 
                                 action=action, variant=variant_name)
            
            log_business_operation(
                operation="ab_test_result_recorded",
                test_id=test_id,
                user_id=user_id,
                variant=variant_name,
                action=action
            )
            
            return True
            
        except Exception as e:
            log_error(e, "record_result", test_id=test_id, user_id=user_id, action=action)
            capture_exception(e, test_id=test_id, user_id=user_id, action=action)
            return False
    
    async def get_test_results(
        self,
        test_id: int,
        db: AsyncSession
    ) -> Dict[str, Any]:
        """
        Obtener resultados de un test A/B
        
        Args:
            test_id: ID del test
            db: Sesión de base de datos
        
        Returns:
            Dict con estadísticas del test
        """
        try:
            # Obtener test
            test_query = select(ABTest).where(ABTest.id == test_id)
            test_result = await db.execute(test_query)
            test = test_result.scalar_one_or_none()
            
            if not test:
                return {}
            
            # Obtener variantes
            variants_query = select(ABTestVariant).where(ABTestVariant.test_id == test_id)
            variants_result = await db.execute(variants_query)
            variants = variants_result.scalars().all()
            
            # Obtener resultados por variante
            results = {}
            for variant in variants:
                variant_name = variant.variant_name
                
                # Contar acciones por variante
                actions_query = select(
                    ABTestResult.action,
                    func.count(ABTestResult.id).label('count')
                ).where(
                    and_(
                        ABTestResult.test_id == test_id,
                        ABTestResult.variant_name == variant_name
                    )
                ).group_by(ABTestResult.action)
                
                actions_result = await db.execute(actions_query)
                actions = actions_result.all()
                
                results[variant_name] = {
                    "content": variant.content,
                    "is_control": variant.is_control,
                    "actions": {action: count for action, count in actions},
                    "total_users": len(set([r.user_id for r in actions_result]))
                }
            
            return {
                "test_id": test.id,
                "test_name": test.name,
                "test_type": test.test_type,
                "status": test.status,
                "traffic_split": test.traffic_split,
                "start_date": test.start_date.isoformat(),
                "end_date": test.end_date.isoformat() if test.end_date else None,
                "variants": results
            }
            
        except Exception as e:
            log_error(e, "get_test_results", test_id=test_id)
            capture_exception(e, test_id=test_id)
            return {}
    
    async def create_email_ab_test(
        self,
        name: str,
        description: str,
        variants: List[Dict[str, Any]],
        traffic_split: Dict[str, int] = None,
        duration_days: int = 7,
        db: AsyncSession = None
    ) -> Optional[int]:
        """
        Crear test A/B para emails
        
        Args:
            name: Nombre del test
            description: Descripción
            variants: Lista de variantes con contenido
            traffic_split: División de tráfico (default: 50/50)
            duration_days: Duración en días
            db: Sesión de base de datos
        
        Returns:
            int: ID del test creado
        """
        try:
            if not db:
                return None
            
            # Validar variantes
            if len(variants) < 2:
                raise ValueError("Se necesitan al menos 2 variantes")
            
            # Configurar división de tráfico
            if not traffic_split:
                traffic_split = {}
                percentage = 100 // len(variants)
                for i, variant in enumerate(variants):
                    variant_name = chr(65 + i)  # A, B, C, etc.
                    traffic_split[variant_name] = percentage
            
            # Crear test
            test = ABTest(
                name=name,
                description=description,
                test_type="email",
                traffic_split=traffic_split,
                start_date=datetime.now(),
                end_date=datetime.now() + timedelta(days=duration_days)
            )
            
            db.add(test)
            await db.commit()
            await db.refresh(test)
            
            # Crear variantes
            for i, variant_data in enumerate(variants):
                variant_name = chr(65 + i)
                variant = ABTestVariant(
                    test_id=test.id,
                    variant_name=variant_name,
                    content=variant_data,
                    is_control=(i == 0)  # Primera variante es control
                )
                db.add(variant)
            
            await db.commit()
            
            log_business_operation(
                operation="ab_test_created",
                test_id=test.id,
                test_name=name,
                test_type="email",
                variants_count=len(variants)
            )
            
            return test.id
            
        except Exception as e:
            log_error(e, "create_email_ab_test", name=name)
            capture_exception(e, test_name=name)
            return None
    
    async def get_email_variant(
        self,
        user_id: str,
        test_name: str,
        db: AsyncSession
    ) -> Optional[Dict[str, Any]]:
        """
        Obtener variante de email para un usuario
        """
        try:
            variant_data = await self.get_variant(user_id, test_name, db)
            
            if not variant_data:
                return None
            
            # Registrar vista
            await self.record_result(
                test_id=variant_data["test_id"],
                user_id=user_id,
                variant_name=variant_data["variant_name"],
                action="view",
                db=db
            )
            
            return variant_data["content"]
            
        except Exception as e:
            log_error(e, "get_email_variant", user_id=user_id, test_name=test_name)
            capture_exception(e, user_id=user_id, test_name=test_name)
            return None

# Instancia global del servicio de A/B testing
ab_testing_service = ABTestingService()

# Funciones helper para A/B testing
async def get_email_ab_test_variant(user_id: str, test_name: str, db: AsyncSession):
    """
    Función helper para obtener variante de email en A/B test
    """
    try:
        return await ab_testing_service.get_email_variant(user_id, test_name, db)
    except Exception as e:
        log_error(e, "get_email_ab_test_variant_helper")
        capture_exception(e)
        return None

async def record_ab_test_action(test_id: int, user_id: str, variant_name: str, action: str, db: AsyncSession):
    """
    Función helper para registrar acción en A/B test
    """
    try:
        return await ab_testing_service.record_result(test_id, user_id, variant_name, action, db=db)
    except Exception as e:
        log_error(e, "record_ab_test_action_helper")
        capture_exception(e)
        return False 