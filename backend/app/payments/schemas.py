from pydantic import BaseModel, Field
from typing import List, Optional, Dict
from enum import Enum

class PaymentStatus(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    AUTHORIZED = "authorized"
    IN_PROCESS = "in_process"
    IN_MEDIATION = "in_mediation"
    REJECTED = "rejected"
    CANCELLED = "cancelled"
    REFUNDED = "refunded"
    CHARGED_BACK = "charged_back"

class Item(BaseModel):
    title: str = Field(..., description="Product title")
    quantity: int = Field(..., ge=1, description="Quantity of items")
    unit_price: float = Field(..., gt=0, description="Price per unit")
    currency_id: str = Field(default="ARS", description="Currency code")
    description: Optional[str] = Field(None, description="Product description")
    picture_url: Optional[str] = Field(None, description="Product image URL")

class BackUrls(BaseModel):
    success: str = Field(..., description="URL for successful payment")
    failure: str = Field(..., description="URL for failed payment")
    pending: str = Field(..., description="URL for pending payment")

class CreatePreferenceRequest(BaseModel):
    items: List[Item] = Field(..., description="List of items to pay for")
    back_urls: Optional[BackUrls] = Field(None, description="URLs for payment result pages")
    external_reference: Optional[str] = Field(None, description="External reference for the payment")
    notification_url: Optional[str] = Field(None, description="Webhook URL for payment notifications")

class PreferenceResponse(BaseModel):
    id: str = Field(..., description="Preference ID")
    init_point: str = Field(..., description="Payment initiation URL")
    sandbox_init_point: str = Field(..., description="Sandbox payment initiation URL")
    items: List[Item] = Field(..., description="Items in the preference")
    external_reference: Optional[str] = Field(None, description="External reference")
    notification_url: Optional[str] = Field(None, description="Webhook URL")

class PaymentInfo(BaseModel):
    id: int = Field(..., description="Payment ID")
    status: PaymentStatus = Field(..., description="Payment status")
    status_detail: str = Field(..., description="Detailed status information")
    external_reference: Optional[str] = Field(None, description="External reference")
    transaction_amount: float = Field(..., description="Transaction amount")
    currency_id: str = Field(..., description="Currency code")
    payment_method_id: str = Field(..., description="Payment method ID")
    payment_type_id: str = Field(..., description="Payment type ID")
    date_created: str = Field(..., description="Payment creation date")
    date_last_updated: str = Field(..., description="Last update date")

class WebhookData(BaseModel):
    type: str = Field(..., description="Webhook type")
    data: Dict = Field(..., description="Webhook data")

class WebhookResponse(BaseModel):
    payment_id: int = Field(..., description="Payment ID")
    status: PaymentStatus = Field(..., description="Payment status")
    status_detail: str = Field(..., description="Detailed status information")
    external_reference: Optional[str] = Field(None, description="External reference")
    amount: float = Field(..., description="Transaction amount")
    currency: str = Field(..., description="Currency code") 