#!/usr/bin/env python3
"""
Script de verificación de soluciones implementadas
"""
import os
import sys
from pathlib import Path

class ColorText:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    END = '\033[0m'

def check_file_exists(path: str, name: str) -> bool:
    """Verificar si un archivo existe"""
    exists = Path(path).exists()
    status = f"{ColorText.GREEN}✓{ColorText.END}" if exists else f"{ColorText.RED}✗{ColorText.END}"
    print(f"  {status} {name}")
    return exists

def check_content_in_file(file_path: str, content: str, name: str) -> bool:
    """Verificar si un contenido está en un archivo"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            file_content = f.read()
            found = content in file_content
            status = f"{ColorText.GREEN}✓{ColorText.END}" if found else f"{ColorText.RED}✗{ColorText.END}"
            print(f"  {status} {name}")
            return found
    except Exception:
        print(f"  {ColorText.RED}✗{ColorText.END} {name} (archivo no accesible)")
        return False

def main():
    print(f"\n{ColorText.BLUE}════════════════════════════════════════════════{ColorText.END}")
    print(f"{ColorText.BLUE}VERIFICACIÓN DE SOLUCIONES IMPLEMENTADAS{ColorText.END}")
    print(f"{ColorText.BLUE}════════════════════════════════════════════════{ColorText.END}\n")
    
    base_path = Path(__file__).parent
    os.chdir(base_path)
    
    checks = {
        "Archivos de Configuración": [
            ("frontend/.env.example", "Frontend .env.example"),
            ("backend/.env.example", "Backend .env.example"),
            ("backend/.env.production", "Backend .env.production"),
            ("DEPLOYMENT.md", "Documentación de deployment"),
            ("SOLUCIONES_IMPLEMENTADAS.md", "Resumen de soluciones"),
            ("setup.sh", "Script de setup"),
        ],
        "Archivos de Seguridad": [
            (".gitignore", ".gitignore en raíz"),
            ("backend/.gitignore", ".gitignore en backend"),
            ("frontend/.gitignore", ".gitignore en frontend"),
        ],
        "Frontend - API y Validación": [
            ("frontend/src/lib/api.ts", "Frontend API client"),
            ("frontend/src/lib/validation.ts", "Frontend Validation"),
            ("frontend/Dockerfile", "Frontend Dockerfile"),
        ],
        "Backend - Security": [
            ("backend/app/core/rate_limit.py", "Rate limiting middleware"),
            ("backend/app/core/input_validation.py", "Input validation"),
        ],
        "Backend - Nginx": [
            ("backend/nginx/nginx.conf", "Nginx configuration"),
        ],
        "Backend - Scripts": [
            ("backend/scripts/backup_automated.py", "Backup script"),
        ],
        "CI/CD": [
            (".github/workflows/ci-cd.yml", "GitHub Actions workflow"),
        ],
    }
    
    total_checks = 0
    passed_checks = 0
    
    for category, items in checks.items():
        print(f"{ColorText.YELLOW}{category}{ColorText.END}")
        for path, name in items:
            total_checks += 1
            if check_file_exists(path, name):
                passed_checks += 1
        print()
    
    # Verificar contenido específico
    print(f"{ColorText.YELLOW}Verificación de Contenido{ColorText.END}")
    
    content_checks = [
        ("backend/main.py", "RedisRateLimitMiddleware", "Rate limiting en main.py"),
        ("backend/main.py", "GZIPMiddleware", "Compresión GZIP en main.py"),
        ("frontend/src/app/page.tsx", "apiCall", "Uso de apiCall en page.tsx"),
        ("frontend/src/components/AvatarSelector.tsx", "getTokenCookie", "Seguridad de tokens en AvatarSelector"),
        ("backend/.gitignore", "credenciales_firebase", "Credenciales en gitignore"),
    ]
    
    for file_path, content, name in content_checks:
        total_checks += 1
        if check_content_in_file(file_path, content, name):
            passed_checks += 1
    
    print()
    print(f"{ColorText.BLUE}════════════════════════════════════════════════{ColorText.END}")
    print(f"Resultados: {ColorText.GREEN}{passed_checks}/{total_checks} verificaciones pasadas{ColorText.END}")
    print(f"{ColorText.BLUE}════════════════════════════════════════════════{ColorText.END}\n")
    
    if passed_checks == total_checks:
        print(f"{ColorText.GREEN}✓ Todas las soluciones han sido implementadas{ColorText.END}\n")
        return 0
    else:
        missing = total_checks - passed_checks
        print(f"{ColorText.RED}✗ {missing} verificaciones fallaron{ColorText.END}\n")
        return 1

if __name__ == "__main__":
    sys.exit(main())
