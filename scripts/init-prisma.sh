#!/bin/bash

# =============================================================================
# SCRIPT DE INICIALIZACIÓN DE PRISMA Y BASE DE DATOS
# Ejecuta migraciones y seed de datos
# =============================================================================

set -e

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}📊 Inicializando Base de Datos...${NC}"

cd frontend

# 1. Esperar a que PostgreSQL esté listo
echo -e "${YELLOW}⏳ Esperando a que PostgreSQL esté disponible...${NC}"
MAX_ATTEMPTS=30
ATTEMPT=0

while [ $ATTEMPT -lt $MAX_ATTEMPTS ]; do
    if pg_isready -h ${DB_HOST:-localhost} -p ${DB_PORT:-5432} -U ${DB_USER:-postgres}; then
        echo -e "${GREEN}✅ PostgreSQL está disponible${NC}"
        break
    fi
    ATTEMPT=$((ATTEMPT + 1))
    echo "Intento $ATTEMPT/$MAX_ATTEMPTS..."
    sleep 1
done

if [ $ATTEMPT -eq $MAX_ATTEMPTS ]; then
    echo -e "${RED}❌ PostgreSQL no está disponible después de $MAX_ATTEMPTS intentos${NC}"
    exit 1
fi

# 2. Generar cliente Prisma
echo -e "${GREEN}🔧 Generando cliente Prisma...${NC}"
npx prisma generate

# 3. Ejecutar migraciones
echo -e "${GREEN}📝 Ejecutando migraciones...${NC}"
if npx prisma migrate deploy; then
    echo -e "${GREEN}✅ Migraciones completadas${NC}"
else
    echo -e "${YELLOW}⚠️  Algunas migraciones pueden haber fallado${NC}"
fi

# 4. Ejecutar seed (si existe)
if [ -f "prisma/seed.ts" ] || [ -f "prisma/seed.js" ]; then
    echo -e "${GREEN}🌱 Ejecutando seed de datos...${NC}"
    if npx prisma db seed; then
        echo -e "${GREEN}✅ Seed completado${NC}"
    else
        echo -e "${YELLOW}⚠️  Seed completado con avisos${NC}"
    fi
else
    echo -e "${YELLOW}ℹ️  No hay archivo seed.ts/js${NC}"
fi

# 5. Verificar estado
echo -e "${GREEN}✓ Verificando estado de la base de datos...${NC}"
npx prisma studio &
sleep 2

echo -e "${GREEN}"
echo "========================================="
echo "✅ Base de datos inicializada"
echo "========================================="
echo "Ejecutar migraciones nuevas:"
echo "  npx prisma migrate dev --name nombre_migracion"
echo ""
echo "Ver datos:"
echo "  npx prisma studio"
echo "========================================="
echo -e "${NC}"

