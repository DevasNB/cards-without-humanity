#!/bin/sh
set -e

EMAIL="joaodevesa2019@gmail.com"
WEBROOT="/var/lib/letsencrypt"

echo "Waiting for Nginx to be ready..."
sleep 10

echo "Verifying SSL certificates..."

DOMAINS="cards.devas.pt cardsapi.devas.pt"

for DOMAIN in $DOMAINS; do
  if [ ! -d "/etc/letsencrypt/live/$DOMAIN" ]; then
    echo "Certificate for $DOMAIN not found. Creating..."
    certbot certonly --webroot -w "$WEBROOT" -d "$DOMAIN" \
      --email "$EMAIL" --agree-tos --no-eff-email --verbose
  else
    echo "Certificate for $DOMAIN already exists."
  fi
done

echo "Certificates ready. Reloading Nginx..."
nginx -s reload || true

echo "Starting auto-renewal..."
while true; do
  certbot renew --webroot -w "$WEBROOT" --quiet
  nginx -s reload || true
  sleep 12h
done
