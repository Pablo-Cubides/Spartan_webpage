#!/usr/bin/env python3
"""
Test script for FastAPI endpoints with MercadoPago
"""
import requests
import json
import time

def test_health_endpoint():
    """Test the health endpoint"""
    try:
        response = requests.get("http://localhost:8000/health", timeout=5)
        if response.status_code == 200:
            print("✅ Health endpoint working")
            return True
        else:
            print(f"❌ Health endpoint failed: {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to server. Make sure it's running on port 8000")
        return False
    except Exception as e:
        print(f"❌ Health endpoint error: {e}")
        return False

def test_root_endpoint():
    """Test the root endpoint"""
    try:
        response = requests.get("http://localhost:8000/", timeout=5)
        if response.status_code == 200:
            print("✅ Root endpoint working")
            return True
        else:
            print(f"❌ Root endpoint failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Root endpoint error: {e}")
        return False

def test_mercadopago_test_preference():
    """Test the MercadoPago test preference endpoint"""
    try:
        response = requests.get("http://localhost:8000/payments/test-preference", timeout=10)
        if response.status_code == 200:
            data = response.json()
            print("✅ Test preference endpoint working")
            print(f"   Preference ID: {data.get('preference_id')}")
            print(f"   Init Point: {data.get('init_point')[:50]}...")
            return True
        else:
            print(f"❌ Test preference endpoint failed: {response.status_code}")
            print(f"   Response: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Test preference endpoint error: {e}")
        return False

def test_create_preference():
    """Test creating a custom preference"""
    try:
        preference_data = {
            "items": [
                {
                    "title": "Custom Test Product",
                    "quantity": 2,
                    "unit_price": 150.0,
                    "currency_id": "ARS",
                    "description": "A test product for API testing"
                }
            ],
            "back_urls": {
                "success": "http://localhost:3000/payment/success",
                "failure": "http://localhost:3000/payment/failure",
                "pending": "http://localhost:3000/payment/pending"
            },
            "external_reference": "test_order_123"
        }
        
        response = requests.post(
            "http://localhost:8000/payments/create-preference",
            json=preference_data,
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Create preference endpoint working")
            print(f"   Preference ID: {data.get('id')}")
            print(f"   Init Point: {data.get('init_point')[:50]}...")
            return True
        else:
            print(f"❌ Create preference endpoint failed: {response.status_code}")
            print(f"   Response: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Create preference endpoint error: {e}")
        return False

def main():
    """Run all API tests"""
    print("🧪 Testing FastAPI Endpoints with MercadoPago")
    print("=" * 60)
    
    # Wait a moment for server to start
    print("⏳ Waiting for server to be ready...")
    time.sleep(2)
    
    tests = [
        ("Health Endpoint", test_health_endpoint),
        ("Root Endpoint", test_root_endpoint),
        ("MercadoPago Test Preference", test_mercadopago_test_preference),
        ("Create Custom Preference", test_create_preference),
    ]
    
    results = {}
    
    for test_name, test_func in tests:
        print(f"\n🔍 Testing: {test_name}")
        try:
            result = test_func()
            results[test_name] = result
        except Exception as e:
            print(f"❌ Test failed with exception: {e}")
            results[test_name] = False
    
    print("\n" + "=" * 60)
    print("📊 API Test Results Summary:")
    print("=" * 60)
    
    all_passed = True
    for test_name, result in results.items():
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status}: {test_name}")
        if not result:
            all_passed = False
    
    print("\n" + "=" * 60)
    if all_passed:
        print("🎉 All API tests passed! Your MercadoPago integration is working perfectly.")
        print("\n📝 Next steps:")
        print("1. Your API is ready for production use")
        print("2. You can integrate the frontend with these endpoints")
        print("3. Set up webhooks for payment notifications")
        print("4. Test with real payments in sandbox mode")
    else:
        print("⚠️  Some API tests failed. Please check the errors above.")
        print("\n🔧 Troubleshooting steps:")
        print("1. Make sure the server is running: python start_server.py")
        print("2. Check if port 8000 is available")
        print("3. Verify your MercadoPago access token")
        print("4. Check the server logs for detailed error messages")

if __name__ == "__main__":
    main() 