#!/usr/bin/env python3

# =============================================================================
# SCRIPT DE VALIDACIÓN PRE-DEPLOYMENT
# Verifica que todo está correctamente configurado antes de desplegar
# =============================================================================

import sys
import subprocess
from pathlib import Path

class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    BOLD = '\033[1m'
    END = '\033[0m'

class DeploymentValidator:
    def __init__(self):
        self.checks_passed = 0
        self.checks_failed = 0
        self.checks_warning = 0
        self.issues = []
        self.workspace_root = Path(__file__).parent.parent

    def print_header(self, text: str):
        print(f"\n{Colors.BOLD}{Colors.BLUE}{'='*60}{Colors.END}")
        print(f"{Colors.BOLD}{Colors.BLUE}{text:^60}{Colors.END}")
        print(f"{Colors.BOLD}{Colors.BLUE}{'='*60}{Colors.END}\n")

    def success(self, message: str):
        print(f"{Colors.GREEN}✅ {message}{Colors.END}")
        self.checks_passed += 1

    def error(self, message: str, details: str = ""):
        print(f"{Colors.RED}❌ {message}{Colors.END}")
        if details:
            print(f"   {Colors.RED}{details}{Colors.END}")
        self.checks_failed += 1
        self.issues.append(("ERROR", message))

    def warning(self, message: str, details: str = ""):
        print(f"{Colors.YELLOW}⚠️  {message}{Colors.END}")
        if details:
            print(f"   {Colors.YELLOW}{details}{Colors.END}")
        self.checks_warning += 1
        self.issues.append(("WARNING", message))

    def check_file_exists(self, path: str, required: bool = True) -> bool:
        full_path = self.workspace_root / path
        if full_path.exists():
            self.success(f"Archivo encontrado: {path}")
            return True
        else:
            if required:
                self.error(f"Archivo faltante (REQUERIDO): {path}")
            else:
                self.warning(f"Archivo faltante (opcional): {path}")
            return False

    def check_env_file(self, env_file: str):
        """Verificar que .env existe y tiene variables necesarias"""
        full_path = self.workspace_root / env_file
        
        if not full_path.exists():
            self.error(f"Archivo .env faltante: {env_file}")
            return False

        with open(full_path, 'r') as f:
            content = f.read()

        # Variables críticas
        critical_vars = [
            'DATABASE_URL', 'REDIS_URL', 'SECRET_KEY',
            'FIREBASE_PROJECT_ID', 'FIREBASE_PRIVATE_KEY'
        ]

        missing = []
        dummy_values = []

        for var in critical_vars:
            if f"{var}=" not in content:
                missing.append(var)
            elif f"{var}=your" in content or f"{var}=YOUR" in content:
                dummy_values.append(var)

        if missing:
            self.error(
                f"Variables faltantes en {env_file}",
                f"Faltando: {', '.join(missing)}"
            )
            return False

        if dummy_values:
            self.warning(
                f"Variables con valores dummy en {env_file}",
                f"Valores placeholder: {', '.join(dummy_values)}"
            )

        self.success(f"Archivo .env válido: {env_file}")
        return True

    def check_no_credentials_in_repo(self):
        """Verificar que no hay credenciales en el repo"""
        dangerous_files = [
            'credenciales_firebase.json',
            'credenciales_firebase.json.json',
            '.env',
            '*.pem',
            '*.key',
        ]

        backend_path = self.workspace_root / 'backend_legacy'
        found_dangerous = False

        for file_pattern in dangerous_files:
            if file_pattern.endswith('.json'):
                path = backend_path / file_pattern
                if path.exists():
                    self.error(f"Archivo de credenciales en repo (CRÍTICO): {path}")
                    found_dangerous = True

        if not found_dangerous:
            self.success("No hay archivos de credenciales en repo")
            return True
        return False

    def check_docker_installed(self) -> bool:
        """Verificar que Docker está instalado"""
        try:
            subprocess.run(['docker', '--version'], capture_output=True, check=True)
            self.success("Docker está instalado")
            return True
        except (subprocess.CalledProcessError, FileNotFoundError):
            self.error("Docker no está instalado o no está en PATH")
            return False

    def check_node_installed(self) -> bool:
        """Verificar que Node.js está instalado"""
        try:
            subprocess.run(['node', '--version'], capture_output=True, check=True)
            self.success("Node.js está instalado")
            return True
        except (subprocess.CalledProcessError, FileNotFoundError):
            self.error("Node.js no está instalado")
            return False

    def check_python_installed(self) -> bool:
        """Verificar que Python 3.13+ está instalado"""
        try:
            result = subprocess.run(
                ['python', '--version'],
                capture_output=True,
                text=True,
                check=True
            )
            version = result.stdout.strip()
            self.success(f"Python instalado: {version}")
            return True
        except (subprocess.CalledProcessError, FileNotFoundError):
            self.error("Python 3.13+ no está instalado")
            return False

    def check_dependencies(self):
        """Verificar que las dependencias están instaladas"""
        # Frontend
        frontend_path = self.workspace_root / 'frontend' / 'node_modules'
        if frontend_path.exists():
            self.success("Frontend dependencies instaladas")
        else:
            self.warning("Frontend node_modules no encontrado", "Ejecutar: cd frontend && npm install")

        # Backend
        backend_path = self.workspace_root / 'backend_legacy'
        venv_path = backend_path / 'venv'
        if venv_path.exists():
            self.success("Backend virtualenv existe")
        else:
            self.warning("Backend virtualenv no encontrado", "Ejecutar: cd backend_legacy && python -m venv venv")

    def check_ports_available(self) -> bool:
        """Verificar que los puertos necesarios estén disponibles"""
        try:
            import socket
            
            ports = {
                3000: "Frontend (Next.js)",
                8000: "Backend (FastAPI)",
                5432: "PostgreSQL",
                6379: "Redis",
            }

            available = True
            for port, service in ports.items():
                sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
                result = sock.connect_ex(('127.0.0.1', port))
                sock.close()
                
                if result == 0:
                    self.warning(f"Puerto {port} ({service}) está en uso")
                    available = False
                else:
                    self.success(f"Puerto {port} ({service}) está disponible")

            return available
        except Exception as e:
            self.warning(f"No se pudieron verificar puertos: {e}")
            return False

    def check_cors_config(self):
        """Verificar CORS está configurado para producción"""
        main_py = self.workspace_root / 'backend_legacy' / 'main.py'
        
        if not main_py.exists():
            self.warning("main.py no encontrado")
            return

        with open(main_py, 'r') as f:
            content = f.read()

        if "CORS_ORIGINS" in content:
            self.success("CORS está configurado como variable")
        else:
            self.warning("CORS podría no estar configurado dinámicamente")

    def check_ssl_certificates(self):
        """Verificar que los certificados SSL existen"""
        ssl_path = self.workspace_root / 'nginx' / 'ssl'
        
        if ssl_path.exists():
            self.success("Directorio SSL existe")
            
            certs = list(ssl_path.glob('**/fullchain.pem'))
            if certs:
                self.success(f"Certificados SSL encontrados: {len(certs)} dominio(s)")
            else:
                self.warning("No hay certificados SSL generados", "Ejecutar: ./scripts/init-ssl.sh")
        else:
            self.warning("Directorio SSL no existe", "Ejecutar: mkdir -p nginx/ssl")

    def check_database_config(self):
        """Verificar configuración de base de datos"""
        env_file = self.workspace_root / 'backend_legacy' / '.env.production'
        
        if not env_file.exists():
            self.error(
                ".env.production no existe",
                "Necesario para configuración de BD en producción"
            )
            return

        with open(env_file, 'r') as f:
            content = f.read()

        if "DATABASE_URL" in content and "postgresql://" in content:
            self.success("DATABASE_URL configurado para PostgreSQL")
        else:
            self.error("DATABASE_URL no está configurado correctamente")

    def run_all_checks(self):
        """Ejecutar todas las verificaciones"""
        self.print_header("VALIDACIÓN PRE-DEPLOYMENT")

        # Archivos críticos
        print(f"\n{Colors.BOLD}1. Verificando archivos críticos...{Colors.END}")
        self.check_file_exists('backend_legacy/main.py')
        self.check_file_exists('frontend/package.json')
        self.check_file_exists('backend_legacy/docker-compose.yml')
        self.check_file_exists('backend_legacy/Dockerfile')

        # Configuración
        print(f"\n{Colors.BOLD}2. Verificando configuración...{Colors.END}")
        self.check_env_file('backend_legacy/.env.production')
        self.check_file_exists('backend_legacy/.env.example')
        self.check_file_exists('frontend/.env.example', required=False)

        # Seguridad
        print(f"\n{Colors.BOLD}3. Verificando seguridad...{Colors.END}")
        self.check_no_credentials_in_repo()
        self.check_cors_config()

        # Herramientas
        print(f"\n{Colors.BOLD}4. Verificando herramientas instaladas...{Colors.END}")
        self.check_docker_installed()
        self.check_node_installed()
        self.check_python_installed()

        # Dependencias
        print(f"\n{Colors.BOLD}5. Verificando dependencias...{Colors.END}")
        self.check_dependencies()

        # Puertos
        print(f"\n{Colors.BOLD}6. Verificando puertos...{Colors.END}")
        self.check_ports_available()

        # Infraestructura
        print(f"\n{Colors.BOLD}7. Verificando infraestructura...{Colors.END}")
        self.check_ssl_certificates()
        self.check_database_config()

        # Resumen
        self.print_summary()

    def print_summary(self):
        """Imprimir resumen de verificaciones"""
        self.print_header("RESUMEN")

        total = self.checks_passed + self.checks_failed + self.checks_warning
        print(f"Total de verificaciones: {total}")
        print(f"{Colors.GREEN}✅ Pasadas: {self.checks_passed}{Colors.END}")
        print(f"{Colors.YELLOW}⚠️  Advertencias: {self.checks_warning}{Colors.END}")
        print(f"{Colors.RED}❌ Fallos: {self.checks_failed}{Colors.END}\n")

        if self.checks_failed > 0:
            print(f"{Colors.RED}❌ DEPLOYMENT BLOQUEADO - Resolver errores antes de desplegar{Colors.END}")
            print("\nProblemas críticos:")
            for issue_type, message in self.issues:
                if issue_type == "ERROR":
                    print(f"  {Colors.RED}• {message}{Colors.END}")
            return False
        elif self.checks_warning > 0:
            print(f"{Colors.YELLOW}⚠️  Advertencias encontradas - Revisar antes de desplegar{Colors.END}")
            return True
        else:
            print(f"{Colors.GREEN}✅ Listo para deployment{Colors.END}")
            return True

if __name__ == '__main__':
    validator = DeploymentValidator()
    success = validator.run_all_checks()
    sys.exit(0 if success else 1)

