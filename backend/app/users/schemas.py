from pydantic import BaseModel, Field, validator, EmailStr
from typing import Optional, List
from datetime import datetime
from enum import Enum
import re

# Enums
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

# Request Schemas
class CompleteProfileRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=100, description="Nombre completo del usuario")
    age: int = Field(..., ge=13, le=120, description="Edad del usuario")
    gender: Gender = Field(..., description="Género del usuario")
    location: Location = Field(..., description="Ubicación del usuario")
    alias: str = Field(..., min_length=3, max_length=30, description="Alias único del usuario")
    phrase: Optional[str] = Field(None, max_length=200, description="Frase o lema personal")
    about_me: Optional[str] = Field(None, max_length=1000, description="Descripción personal")
    interests: Optional[str] = Field(None, max_length=500, description="Intereses y objetivos")

    @validator('alias')
    def validate_alias(cls, v):
        """Valida que el alias solo contenga caracteres permitidos"""
        if not re.match(r'^[a-zA-Z0-9_-]+$', v):
            raise ValueError('Alias solo puede contener letras, números, guiones y guiones bajos')
        return v.lower()

    @validator('name')
    def validate_name(cls, v):
        """Valida que el nombre no contenga caracteres especiales peligrosos"""
        if re.search(r'[<>"\']', v):
            raise ValueError('Nombre no puede contener caracteres especiales')
        return v.strip()

class UpdateProfileRequest(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=100)
    age: Optional[int] = Field(None, ge=13, le=120)
    gender: Optional[Gender] = None
    location: Optional[Location] = None
    alias: Optional[str] = Field(None, min_length=3, max_length=30)
    phrase: Optional[str] = Field(None, max_length=200)
    about_me: Optional[str] = Field(None, max_length=1000)
    interests: Optional[str] = Field(None, max_length=500)

    @validator('alias')
    def validate_alias(cls, v):
        if v and not re.match(r'^[a-zA-Z0-9_-]+$', v):
            raise ValueError('Alias solo puede contener letras, números, guiones y guiones bajos')
        return v.lower() if v else v

    @validator('name')
    def validate_name(cls, v):
        if v and re.search(r'[<>"\']', v):
            raise ValueError('Nombre no puede contener caracteres especiales')
        return v.strip() if v else v

class AvatarRequest(BaseModel):
    avatar_type: AvatarType = Field(..., description="Tipo de avatar")
    icon_name: Optional[str] = Field(None, description="Nombre del ícono (si avatar_type es icon)")
    image: Optional[str] = Field(None, description="Imagen en base64 (si avatar_type es uploaded)")

class UpdatePrivacyRequest(BaseModel):
    name_public: Optional[bool] = Field(None, description="Si el nombre es público")
    age_public: Optional[bool] = Field(None, description="Si la edad es pública")
    gender_public: Optional[bool] = Field(None, description="Si el género es público")
    location_public: Optional[bool] = Field(None, description="Si la ubicación es pública")
    phrase_public: Optional[bool] = Field(None, description="Si la frase es pública")
    about_me_public: Optional[bool] = Field(None, description="Si 'sobre mí' es público")
    interests_public: Optional[bool] = Field(None, description="Si los intereses son públicos")

class BuyCreditsRequest(BaseModel):
    amount: int = Field(..., ge=1, le=10000, description="Cantidad de créditos a comprar")

# Response Schemas
class UserProfileResponse(BaseModel):
    id: int
    uid: str
    name: str
    email: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[Gender] = None
    location: Optional[Location] = None
    alias: str
    phrase: Optional[str] = None
    about_me: Optional[str] = None
    interests: Optional[str] = None
    avatar_url: Optional[str] = None
    avatar_type: Optional[AvatarType] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class PublicProfileResponse(BaseModel):
    alias: str
    name: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[Gender] = None
    location: Optional[Location] = None
    phrase: Optional[str] = None
    about_me: Optional[str] = None
    interests: Optional[str] = None
    avatar_url: Optional[str] = None
    avatar_type: Optional[AvatarType] = None

    class Config:
        from_attributes = True

class AvatarResponse(BaseModel):
    avatar_url: str
    avatar_type: AvatarType
    message: str

class AvatarOptionsResponse(BaseModel):
    icons: List[dict] = Field(..., description="Lista de íconos disponibles")

class PrivacySettingsResponse(BaseModel):
    name_public: bool
    age_public: bool
    gender_public: bool
    location_public: bool
    phrase_public: bool
    about_me_public: bool
    interests_public: bool

    class Config:
        from_attributes = True

class CreditsResponse(BaseModel):
    credits: int = Field(..., description="Créditos disponibles")
    total_earned: int = Field(..., description="Total de créditos ganados")
    total_spent: int = Field(..., description="Total de créditos gastados")

class PurchaseResponse(BaseModel):
    id: int
    purchase_type: PurchaseType
    amount: float
    currency: str
    status: PurchaseStatus
    payment_method: Optional[str] = None
    mercadopago_payment_id: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class PurchasesResponse(BaseModel):
    purchases: List[PurchaseResponse]
    total: int
    page: int
    limit: int
    pages: int

class MercadoPagoPreferenceResponse(BaseModel):
    preference_id: str
    init_point: str
    sandbox_init_point: str

class ErrorResponse(BaseModel):
    error: str
    message: str
    details: Optional[dict] = None

# Utility Schemas
class ProfileStats(BaseModel):
    total_users: int
    users_by_location: dict
    users_by_gender: dict
    profiles_completed: int
    profiles_with_avatar: int

class AliasValidationResponse(BaseModel):
    available: bool
    message: str

# Avatar Icons Configuration
AVATAR_ICONS = [
    {
        "name": "user",
        "display_name": "Usuario Básico",
        "url": "/avatars/icons/user.svg",
        "category": "general"
    },
    {
        "name": "user-check",
        "display_name": "Usuario Verificado",
        "url": "/avatars/icons/user-check.svg",
        "category": "status"
    },
    {
        "name": "user-plus",
        "display_name": "Usuario Premium",
        "url": "/avatars/icons/user-plus.svg",
        "category": "premium"
    },
    {
        "name": "user-x",
        "display_name": "Usuario Experto",
        "url": "/avatars/icons/user-x.svg",
        "category": "expert"
    },
    {
        "name": "user-minus",
        "display_name": "Usuario Casual",
        "url": "/avatars/icons/user-minus.svg",
        "category": "casual"
    },
    {
        "name": "user-cog",
        "display_name": "Usuario Técnico",
        "url": "/avatars/icons/user-cog.svg",
        "category": "technical"
    },
    {
        "name": "user-edit",
        "display_name": "Usuario Creativo",
        "url": "/avatars/icons/user-edit.svg",
        "category": "creative"
    },
    {
        "name": "user-search",
        "display_name": "Usuario Explorador",
        "url": "/avatars/icons/user-search.svg",
        "category": "explorer"
    },
    {
        "name": "user-star",
        "display_name": "Usuario Destacado",
        "url": "/avatars/icons/user-star.svg",
        "category": "featured"
    },
    {
        "name": "user-heart",
        "display_name": "Usuario Amigable",
        "url": "/avatars/icons/user-heart.svg",
        "category": "friendly"
    }
] 