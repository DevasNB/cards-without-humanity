#!/bin/bash

domains=("cards.devas.pt" "cardsapi.devas.pt")
email="joaodevesa212@gmail.com"
data_path="./data/certbot"
staging=0

if [ ! -e "$data_path/conf/options-ssl-nginx.conf" ]; then
  mkdir -p "$data_path"
fi

docker compose up -d nginx

for domain in "${domains[@]}"; do
  docker compose run --rm certbot certonly --webroot \
      -w /var/www/certbot \
      -d "$domain" \
      --email "$email" --agree-tos --no-eff-email \
      $( [ $staging != "0" ] && echo "--staging" )
done

docker compose restart nginx
