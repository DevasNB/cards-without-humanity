#!/bin/sh
set -e

EMAIL="joaodevesa2019@gmail.com"
WEBROOT="/var/lib/letsencrypt"

echo "Verifying SSL certificates..."

# FRONTEND
if [ ! -d "/etc/letsencrypt/live/cards.devas.pt" ]; then
  echo "Certificate for FRONTEND not found. Creating..."
  certbot certonly --webroot --webroot-path="$WEBROOT" -d cards.devas.pt --email "$EMAIL" --agree-tos --no-eff-email
fi

# BACKEND
if [ ! -d "/etc/letsencrypt/live/cardsapi.devas.pt" ]; then
  echo "Certificate for BACKEND not found. Creating..."
  certbot certonly --webroot --webroot-path="$WEBROOT" -d cardsapi.devas.pt --email "$EMAIL" --agree-tos --no-eff-email
fi

echo "Certificates are in place. Reloading Nginx..."
nginx -s reload || true

echo "Starting certificate renewal loop..."
while true; do
  certbot renew --webroot --webroot-path="$WEBROOT" --quiet
  nginx -s reload || true
  sleep 12h
done
