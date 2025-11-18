#!/bin/bash
# Setup script para Spartan Market

set -e

echo "🚀 Iniciando setup de Spartan Market..."

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Verificar requisitos
echo -e "${YELLOW}Verificando requisitos...${NC}"

if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker no está instalado${NC}"
    exit 1
fi

if ! command -v git &> /dev/null; then
    echo -e "${RED}❌ Git no está instalado${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Requisitos verificados${NC}"

# Crear directorios
echo -e "${YELLOW}Creando directorios...${NC}"
mkdir -p backend/logs
mkdir -p backend/uploads
mkdir -p backend/cache
mkdir -p backend/nginx/ssl
mkdir -p certbot/www

echo -e "${GREEN}✅ Directorios creados${NC}"

# Setup Backend
echo -e "${YELLOW}Configurando backend...${NC}"

cd backend

# Copiar .env
if [ ! -f .env ]; then
    cp .env.example .env
    echo -e "${YELLOW}⚠️  Archivo .env creado. Por favor, edítalo con tus variables.${NC}"
else
    echo -e "${GREEN}✅ Archivo .env existe${NC}"
fi

# Build Docker images
echo -e "${YELLOW}Compilando imágenes Docker...${NC}"
docker-compose build

# Iniciar servicios
echo -e "${YELLOW}Iniciando servicios...${NC}"
docker-compose up -d db redis api

# Esperar a que DB esté lista
echo -e "${YELLOW}Esperando a que la BD esté lista...${NC}"
sleep 10

# Migraciones
echo -e "${YELLOW}Ejecutando migraciones...${NC}"
docker-compose exec -T api alembic upgrade head

# Seed data
echo -e "${YELLOW}Cargando datos iniciales...${NC}"
docker-compose exec -T api python scripts/init_credit_packages.py

echo -e "${GREEN}✅ Backend configurado${NC}"

# Setup Frontend
echo -e "${YELLOW}Configurando frontend...${NC}"

cd ../frontend

if [ ! -f .env.local ]; then
    cat > .env.local << EOF
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_FIREBASE_API_KEY=your-firebase-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY=APP_USR-xxxxx
EOF
    echo -e "${YELLOW}⚠️  Archivo .env.local creado. Por favor, edítalo con tus variables.${NC}"
fi

npm install
npm run build

echo -e "${GREEN}✅ Frontend configurado${NC}"

cd ..

# Resumen
echo ""
echo -e "${GREEN}════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ Setup completado exitosamente${NC}"
echo -e "${GREEN}════════════════════════════════════════════════${NC}"
echo ""
echo "📋 Próximos pasos:"
echo ""
echo "1. Editar variables de entorno:"
echo "   - backend/.env"
echo "   - frontend/.env.local"
echo ""
echo "2. Iniciar desarrollo:"
echo "   - Backend:  cd backend && docker-compose up"
echo "   - Frontend: cd frontend && npm run dev"
echo ""
echo "3. Acceder a:"
echo "   - Frontend: http://localhost:3000"
echo "   - API:      http://localhost:8000"
echo "   - Docs:     http://localhost:8000/api/v1/docs"
echo ""
echo "4. Para producción, revisar: DEPLOYMENT.md"
echo ""
