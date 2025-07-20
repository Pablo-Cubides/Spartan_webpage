#!/usr/bin/env python3
"""
Script to start the FastAPI server with MercadoPago integration
"""
import uvicorn
import sys
import os

def main():
    """Start the FastAPI server"""
    try:
        print("🚀 Starting Spartan Market API with MercadoPago integration...")
        print("📍 Server will be available at: http://localhost:8000")
        print("📚 API Documentation: http://localhost:8000/docs")
        print("🔧 MercadoPago endpoints:")
        print("   - GET  /payments/test-preference")
        print("   - POST /payments/create-preference")
        print("   - GET  /payments/payment/{payment_id}")
        print("   - POST /payments/webhook")
        print("\n" + "=" * 50)
        
        # Start the server
        uvicorn.run(
            "main:app",
            host="0.0.0.0",
            port=8000,
            reload=True,
            log_level="info"
        )
        
    except KeyboardInterrupt:
        print("\n🛑 Server stopped by user")
    except Exception as e:
        print(f"❌ Error starting server: {e}")
        print("\n🔧 Troubleshooting:")
        print("1. Make sure you're in the backend directory")
        print("2. Check if all dependencies are installed: pip install -r requirements.txt")
        print("3. Verify that main.py exists and is valid")
        sys.exit(1)

if __name__ == "__main__":
    main() 