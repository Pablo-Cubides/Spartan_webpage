import mercadopago
from typing import Dict, List, Optional
import os

class MercadoPagoClient:
    def __init__(self):
        # Use the provided access token
        self.access_token = "APP_USR-663505429919307-071920-990d4c44c11d5465eeb7d7e11f9997d1-2553283846"
        self.sdk = mercadopago.SDK(self.access_token)
    
    def create_preference(self, items: List[Dict], back_urls: Optional[Dict] = None) -> Dict:
        """
        Create a payment preference
        
        Args:
            items: List of items to pay for
            back_urls: URLs for success, failure, and pending pages
        
        Returns:
            Dictionary with preference data
        """
        preference_data = {
            "items": items
        }
        
        if back_urls:
            preference_data["back_urls"] = back_urls
        
        try:
            preference_response = self.sdk.preference().create(preference_data)
            return preference_response["response"]
        except Exception as e:
            raise Exception(f"Error creating preference: {str(e)}")
    
    def get_payment_info(self, payment_id: int) -> Dict:
        """
        Get payment information by ID
        
        Args:
            payment_id: MercadoPago payment ID
        
        Returns:
            Dictionary with payment information
        """
        try:
            payment_response = self.sdk.payment().get(payment_id)
            return payment_response["response"]
        except Exception as e:
            raise Exception(f"Error getting payment info: {str(e)}")
    
    def process_webhook(self, data: Dict) -> Dict:
        """
        Process webhook data from MercadoPago
        
        Args:
            data: Webhook data from MercadoPago
        
        Returns:
            Processed webhook data
        """
        try:
            if data.get("type") == "payment":
                payment_id = data.get("data", {}).get("id")
                if payment_id:
                    payment_info = self.get_payment_info(payment_id)
                    return {
                        "payment_id": payment_id,
                        "status": payment_info.get("status"),
                        "status_detail": payment_info.get("status_detail"),
                        "external_reference": payment_info.get("external_reference"),
                        "amount": payment_info.get("transaction_amount"),
                        "currency": payment_info.get("currency_id")
                    }
            return data
        except Exception as e:
            raise Exception(f"Error processing webhook: {str(e)}")

# Global instance
mp_client = MercadoPagoClient() 