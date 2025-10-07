#!/bin/sh
set -e

DOMAINS="-d cards.devas.pt -d cardsapi.devas.pt"
WEBROOT="/var/lib/letsencrypt"

# If the certificates do not exist, create them
if [ ! -d "/etc/letsencrypt/live/cards.devas.pt" ] || [ ! -d "/etc/letsencrypt/live/cardsapi.devas.pt" ]; then
  echo "Certificados não encontrados. Criando..."
  certbot certonly --webroot --webroot-path="$WEBROOT" $DOMAINS --email joaodevesa2019@gmail.com --agree-tos --no-eff-email
fi

# Loop to renew the certificates every 12 hours
echo "Entrando no loop de renovação automática..."
while true; do
  certbot renew --webroot --webroot-path="$WEBROOT" --quiet
  nginx -s reload
  sleep 12h
done
