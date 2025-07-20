#!/usr/bin/env python3
"""
Test script for MercadoPago integration
"""
import sys
import os
import json
from typing import Dict, Any

# Add the current directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

def test_mercadopago_import():
    """Test if MercadoPago can be imported"""
    try:
        import mercadopago
        print("✅ MercadoPago import successful")
        return True
    except ImportError as e:
        print(f"❌ MercadoPago import failed: {e}")
        return False

def test_mercadopago_client():
    """Test MercadoPago client initialization"""
    try:
        from app.payments.mercadopago_client import mp_client
        print("✅ MercadoPago client initialization successful")
        print(f"   Access Token: {mp_client.access_token[:20]}...")
        return True
    except Exception as e:
        print(f"❌ MercadoPago client initialization failed: {e}")
        return False

def test_create_test_preference():
    """Test creating a test preference"""
    try:
        from app.payments.mercadopago_client import mp_client
        
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
        
        print("✅ Test preference creation successful")
        print(f"   Preference ID: {preference.get('id')}")
        print(f"   Init Point: {preference.get('init_point')}")
        print(f"   Sandbox Init Point: {preference.get('sandbox_init_point')}")
        
        return preference
    except Exception as e:
        print(f"❌ Test preference creation failed: {e}")
        return None

def test_api_endpoints():
    """Test if FastAPI endpoints can be imported"""
    try:
        from app.payments.routes import router
        print("✅ FastAPI routes import successful")
        return True
    except Exception as e:
        print(f"❌ FastAPI routes import failed: {e}")
        return False

def test_schemas():
    """Test if Pydantic schemas can be imported"""
    try:
        from app.payments.schemas import CreatePreferenceRequest, Item, BackUrls
        print("✅ Pydantic schemas import successful")
        return True
    except Exception as e:
        print(f"❌ Pydantic schemas import failed: {e}")
        return False

def main():
    """Run all tests"""
    print("🧪 Testing MercadoPago Integration")
    print("=" * 50)
    
    tests = [
        ("MercadoPago Import", test_mercadopago_import),
        ("MercadoPago Client", test_mercadopago_client),
        ("Test Preference Creation", test_create_test_preference),
        ("FastAPI Routes", test_api_endpoints),
        ("Pydantic Schemas", test_schemas),
    ]
    
    results = {}
    
    for test_name, test_func in tests:
        print(f"\n🔍 Running: {test_name}")
        try:
            result = test_func()
            results[test_name] = result
        except Exception as e:
            print(f"❌ Test failed with exception: {e}")
            results[test_name] = False
    
    print("\n" + "=" * 50)
    print("📊 Test Results Summary:")
    print("=" * 50)
    
    all_passed = True
    for test_name, result in results.items():
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status}: {test_name}")
        if not result:
            all_passed = False
    
    print("\n" + "=" * 50)
    if all_passed:
        print("🎉 All tests passed! MercadoPago integration is working correctly.")
        print("\n📝 Next steps:")
        print("1. Start your FastAPI server: python -m uvicorn main:app --reload")
        print("2. Test the API endpoints:")
        print("   - GET http://localhost:8000/payments/test-preference")
        print("   - POST http://localhost:8000/payments/create-preference")
        print("3. Check the API documentation at: http://localhost:8000/docs")
    else:
        print("⚠️  Some tests failed. Please check the errors above.")
        print("\n🔧 Troubleshooting steps:")
        print("1. Make sure all dependencies are installed: pip install -r requirements.txt")
        print("2. Check your MercadoPago access token")
        print("3. Verify your internet connection")
        print("4. Check if MercadoPago API is accessible")

if __name__ == "__main__":
    main() 