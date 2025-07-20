from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, Numeric, ForeignKey, CheckConstraint, Index
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from enum import Enum

from ..core.database import Base

class Gender(str, Enum):
    MASCULINO = "Masculino"
    FEMENINO = "Femenino"
    OTRO = "Otro"

class Location(str, Enum):
    COLOMBIA = "Colombia"
    ESPANA = "España"
    OTRO = "Otro"

class AvatarType(str, Enum):
    ICON = "icon"
    UPLOADED = "uploaded"

class PurchaseType(str, Enum):
    CREDITS = "credits"
    PRODUCT = "product"

class PurchaseStatus(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    CANCELLED = "cancelled"

class UserProfile(Base):
    __tablename__ = "users_profiles"

    id = Column(Integer, primary_key=True, index=True)
    uid = Column(String(128), unique=True, nullable=False, index=True)
    alias = Column(String(30), unique=True, nullable=False, index=True)
    name = Column(String(100), nullable=False)
    age = Column(Integer, nullable=True)
    gender = Column(String(20), nullable=True)
    location = Column(String(20), nullable=True)
    phrase = Column(String(200), nullable=True)
    about_me = Column(Text, nullable=True)
    interests = Column(Text, nullable=True)
    avatar_url = Column(String(500), nullable=True)
    avatar_type = Column(String(10), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relaciones
    privacy_settings = relationship("UserPrivacySettings", back_populates="profile", uselist=False)
    purchases = relationship("UserPurchase", back_populates="profile")

    # Constraints
    __table_args__ = (
        CheckConstraint("age >= 13 AND age <= 120", name="check_age_range"),
        CheckConstraint("gender IN ('Masculino', 'Femenino', 'Otro')", name="check_gender_values"),
        CheckConstraint("location IN ('Colombia', 'España', 'Otro')", name="check_location_values"),
        CheckConstraint("avatar_type IN ('icon', 'uploaded')", name="check_avatar_type"),
        CheckConstraint("LENGTH(name) >= 2", name="check_name_length"),
        CheckConstraint("LENGTH(alias) >= 3", name="check_alias_length"),
    )

    # Índices para optimización
    __table_args__ += (
        Index("idx_users_profiles_location", "location"),
        Index("idx_users_profiles_gender", "gender"),
        Index("idx_users_profiles_created_at", "created_at"),
        Index("idx_users_profiles_location_gender", "location", "gender"),
    )

class UserPrivacySettings(Base):
    __tablename__ = "user_privacy_settings"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users_profiles.id"), nullable=False, unique=True)
    name_public = Column(Boolean, default=False, nullable=False)
    age_public = Column(Boolean, default=False, nullable=False)
    gender_public = Column(Boolean, default=False, nullable=False)
    location_public = Column(Boolean, default=False, nullable=False)
    phrase_public = Column(Boolean, default=False, nullable=False)
    about_me_public = Column(Boolean, default=False, nullable=False)
    interests_public = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relaciones
    profile = relationship("UserProfile", back_populates="privacy_settings")

class UserPurchase(Base):
    __tablename__ = "user_purchases"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users_profiles.id"), nullable=False)
    purchase_type = Column(String(20), nullable=False)
    amount = Column(Numeric(10, 2), nullable=False)
    currency = Column(String(3), default="ARS", nullable=False)
    status = Column(String(20), nullable=False)
    payment_method = Column(String(50), nullable=True)
    mercadopago_payment_id = Column(String(100), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relaciones
    profile = relationship("UserProfile", back_populates="purchases")

    # Constraints
    __table_args__ = (
        CheckConstraint("purchase_type IN ('credits', 'product')", name="check_purchase_type"),
        CheckConstraint("status IN ('pending', 'approved', 'rejected', 'cancelled')", name="check_purchase_status"),
        CheckConstraint("amount > 0", name="check_amount_positive"),
    )

    # Índices para optimización
    __table_args__ += (
        Index("idx_user_purchases_user_id", "user_id"),
        Index("idx_user_purchases_status", "status"),
        Index("idx_user_purchases_created_at", "created_at"),
        Index("idx_user_purchases_user_status", "user_id", "status"),
    ) 