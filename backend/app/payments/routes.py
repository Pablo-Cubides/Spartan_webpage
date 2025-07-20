from fastapi import APIRouter, HTTPException, Request
from .mercadopago_client import mp_client
from .schemas import (
    CreatePreferenceRequest, 
    PreferenceResponse, 
    PaymentInfo, 
    WebhookData, 
    WebhookResponse
)
from typing import Dict, Any
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/payments", tags=["payments"])

@router.post("/create-preference", response_model=PreferenceResponse)
async def create_preference(request: CreatePreferenceRequest):
    """
    Create a MercadoPago payment preference
    """
    try:
        # Convert Pydantic models to dictionaries for MercadoPago SDK
        items = [item.dict() for item in request.items]
        
        back_urls = None
        if request.back_urls:
            back_urls = request.back_urls.dict()
        
        # Create preference data
        preference_data = {
            "items": items
        }
        
        if back_urls:
            preference_data["back_urls"] = back_urls
        
        if request.external_reference:
            preference_data["external_reference"] = request.external_reference
        
        if request.notification_url:
            preference_data["notification_url"] = request.notification_url
        
        # Create preference using MercadoPago client
        preference = mp_client.create_preference(items, back_urls)
        
        logger.info(f"Created preference with ID: {preference.get('id')}")
        
        return PreferenceResponse(
            id=preference.get("id"),
            init_point=preference.get("init_point"),
            sandbox_init_point=preference.get("sandbox_init_point"),
            items=request.items,
            external_reference=request.external_reference,
            notification_url=request.notification_url
        )
        
    except Exception as e:
        logger.error(f"Error creating preference: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error creating payment preference: {str(e)}")

@router.get("/payment/{payment_id}", response_model=PaymentInfo)
async def get_payment_info(payment_id: int):
    """
    Get payment information by ID
    """
    try:
        payment_info = mp_client.get_payment_info(payment_id)
        
        logger.info(f"Retrieved payment info for ID: {payment_id}")
        
        return PaymentInfo(
            id=payment_info.get("id"),
            status=payment_info.get("status"),
            status_detail=payment_info.get("status_detail"),
            external_reference=payment_info.get("external_reference"),
            transaction_amount=payment_info.get("transaction_amount"),
            currency_id=payment_info.get("currency_id"),
            payment_method_id=payment_info.get("payment_method_id"),
            payment_type_id=payment_info.get("payment_type_id"),
            date_created=payment_info.get("date_created"),
            date_last_updated=payment_info.get("date_last_updated")
        )
        
    except Exception as e:
        logger.error(f"Error getting payment info for ID {payment_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error getting payment information: {str(e)}")

@router.post("/webhook", response_model=WebhookResponse)
async def process_webhook(request: Request):
    """
    Process MercadoPago webhook notifications
    """
    try:
        # Get raw data from request
        data = await request.json()
        
        logger.info(f"Received webhook: {data}")
        
        # Process webhook using MercadoPago client
        processed_data = mp_client.process_webhook(data)
        
        if processed_data.get("payment_id"):
            return WebhookResponse(
                payment_id=processed_data["payment_id"],
                status=processed_data["status"],
                status_detail=processed_data["status_detail"],
                external_reference=processed_data.get("external_reference"),
                amount=processed_data["amount"],
                currency=processed_data["currency"]
            )
        else:
            raise HTTPException(status_code=400, detail="Invalid webhook data")
            
    except Exception as e:
        logger.error(f"Error processing webhook: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error processing webhook: {str(e)}")

@router.get("/test-preference")
async def create_test_preference():
    """
    Create a test payment preference for development
    """
    try:
        test_items = [
            {
                "title": "Test Product",
                "quantity": 1,
                "unit_price": 100.0,
                "currency_id": "ARS"
            }
        ]
        
        test_back_urls = {
            "success": "http://localhost:3000/payment/success",
            "failure": "http://localhost:3000/payment/failure",
            "pending": "http://localhost:3000/payment/pending"
        }
        
        preference = mp_client.create_preference(test_items, test_back_urls)
        
        logger.info(f"Created test preference with ID: {preference.get('id')}")
        
        return {
            "message": "Test preference created successfully",
            "preference_id": preference.get("id"),
            "init_point": preference.get("init_point"),
            "sandbox_init_point": preference.get("sandbox_init_point")
        }
        
    except Exception as e:
        logger.error(f"Error creating test preference: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error creating test preference: {str(e)}") 