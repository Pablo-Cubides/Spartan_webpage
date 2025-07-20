from sqlalchemy import Column, Integer, String, Float, DateTime, Text, Boolean
from sqlalchemy.orm import declarative_base
from sqlalchemy.sql import func
import uuid

Base = declarative_base()

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    uid = Column(String(128), unique=True, nullable=False)   # Firebase UID
    email = Column(String(128), unique=True, nullable=False)
    name = Column(String(128))
    alias = Column(String(64), unique=True)  # Alias único del usuario
    avatar_id = Column(String(255))  # ID del avatar en R2
    role = Column(String(32), default="user")
    credits = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class CreditPackage(Base):
    __tablename__ = "credit_packages"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(128), nullable=False)  # "Paquete básico", "Paquete premium", etc.
    credits = Column(Integer, nullable=False)  # Número de créditos incluidos
    price = Column(Float, nullable=False)  # Precio en moneda local
    is_active = Column(Boolean, default=True)  # Si el paquete está disponible
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class Purchase(Base):
    __tablename__ = "purchases"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False)  # Referencia a users.id
    package_id = Column(Integer, nullable=False)  # Referencia a credit_packages.id
    amount_paid = Column(Float, nullable=False)  # Monto pagado
    credits_received = Column(Integer, nullable=False)  # Créditos recibidos
    payment_method = Column(String(64))  # "mercadopago", "stripe", etc.
    payment_id = Column(String(255))  # ID del pago en el proveedor
    status = Column(String(32), default="pending")  # "pending", "completed", "failed"
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True))  # Cuando se completó el pago
