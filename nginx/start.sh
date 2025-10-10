#!/bin/sh
set -e

DUMMY_DIR=/etc/letsencrypt/live/cards.devas.pt
DUMMY_DIR_API=/etc/letsencrypt/live/cardsapi.devas.pt

# ========== FRONTEND ==========
if [ ! -f "$DUMMY_DIR/fullchain.pem" ]; then
  echo "Generating dummy SSL for cards.devas.pt..."
  mkdir -p "$DUMMY_DIR"
  openssl req -x509 -nodes -newkey rsa:2048 \
    -days 1 \
    -keyout "$DUMMY_DIR/privkey.pem" \
    -out "$DUMMY_DIR/fullchain.pem" \
    -subj "/CN=localhost"
fi

# ========== BACKEND ==========
if [ ! -f "$DUMMY_DIR_API/fullchain.pem" ]; then
  echo "Generating dummy SSL for cardsapi.devas.pt..."
  mkdir -p "$DUMMY_DIR_API"
  openssl req -x509 -nodes -newkey rsa:2048 \
    -days 1 \
    -keyout "$DUMMY_DIR_API/privkey.pem" \
    -out "$DUMMY_DIR_API/fullchain.pem" \
    -subj "/CN=localhost"
fi

echo "Starting Nginx..."
nginx -g 'daemon off;'
