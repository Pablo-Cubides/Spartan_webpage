#!/bin/bash

# =============================================================================
# SCRIPT DE INICIALIZACIÓN SSL PARA PRODUCCIÓN
# Genera certificados Let's Encrypt usando Certbot
# =============================================================================

set -e

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🔐 Iniciando proceso de generación de certificados SSL...${NC}"

# Configuración
DOMAIN="${1:-spartan-edge.com}"
DOMAIN_WWW="www.${DOMAIN}"
EMAIL="${2:-admin@spartan-edge.com}"
CERTBOT_DIR="nginx/ssl"
CERTBOT_CONF="${CERTBOT_DIR}/certbot/conf"
CERTBOT_WWW="${CERTBOT_DIR}/certbot/www"

# Validar dominio
if [ "$DOMAIN" == "spartan-edge.com" ]; then
    echo -e "${RED}⚠️  Por favor, proporciona tu dominio real como argumento${NC}"
    echo "Uso: ./init-ssl.sh tu-dominio.com tu-email@ejemplo.com"
    exit 1
fi

# 1. Crear estructura de directorios
echo -e "${GREEN}📁 Creando directorios...${NC}"
mkdir -p "$CERTBOT_CONF"
mkdir -p "$CERTBOT_WWW"
mkdir -p "${CERTBOT_DIR}"

# 2. Generar certificados
echo -e "${GREEN}🔑 Generando certificados para ${DOMAIN}...${NC}"

docker run -it --rm --name certbot \
  -v "$(pwd)/${CERTBOT_CONF}:/etc/letsencrypt" \
  -v "$(pwd)/${CERTBOT_WWW}:/var/www/certbot" \
  -p 80:80 \
  certbot/certbot certonly --standalone \
  --email "$EMAIL" \
  -d "$DOMAIN" \
  -d "$DOMAIN_WWW" \
  --agree-tos \
  --non-interactive \
  --preferred-challenges http

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Certificados generados exitosamente${NC}"
else
    echo -e "${RED}❌ Error al generar certificados${NC}"
    exit 1
fi

# 3. Configurar permisos
echo -e "${GREEN}🔒 Configurando permisos...${NC}"
chmod -R 755 "${CERTBOT_DIR}"
chmod -R 644 "${CERTBOT_CONF}/live"
chmod -R 644 "${CERTBOT_CONF}/archive"

# 4. Verificar certificados
echo -e "${GREEN}✓ Verificando certificados...${NC}"
if [ -f "${CERTBOT_CONF}/live/${DOMAIN}/fullchain.pem" ]; then
    echo -e "${GREEN}✅ Certificados verificados${NC}"
    ls -la "${CERTBOT_CONF}/live/${DOMAIN}/"
else
    echo -e "${RED}❌ Error: Certificados no encontrados${NC}"
    exit 1
fi

# 5. Crear renovación automática cron
echo -e "${GREEN}🔄 Configurando renovación automática...${NC}"

# Crear script de renovación
cat > "scripts/renew-ssl.sh" << 'EOF'
#!/bin/bash
# Renovar certificados Let's Encrypt
docker run -it --rm --name certbot \
  -v "/nginx/ssl/certbot/conf:/etc/letsencrypt" \
  -v "/nginx/ssl/certbot/www:/var/www/certbot" \
  -p 80:80 \
  certbot/certbot renew --webroot -w /var/www/certbot

# Recargar nginx si fue renovado
docker-compose exec nginx nginx -s reload
EOF

chmod +x "scripts/renew-ssl.sh"

# Agregar a crontab (si no existe)
if ! crontab -l 2>/dev/null | grep -q "renew-ssl.sh"; then
    (crontab -l 2>/dev/null; echo "0 3 * * * cd $(pwd) && ./scripts/renew-ssl.sh") | crontab -
    echo -e "${GREEN}✅ Cron job agregado${NC}"
fi

echo -e "${GREEN}"
echo "========================================="
echo "✅ SSL Certificates inicializados"
echo "========================================="
echo "Dominio: $DOMAIN"
echo "Email: $EMAIL"
echo "Ubicación: $CERTBOT_CONF/live/$DOMAIN"
echo ""
echo "Próximos pasos:"
echo "1. Verificar nginx.conf está correctamente configurado"
echo "2. Ejecutar: docker-compose up -d"
echo "3. Probar: curl -I https://$DOMAIN"
echo "========================================="
echo -e "${NC}"

