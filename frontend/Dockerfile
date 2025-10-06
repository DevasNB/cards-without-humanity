# Build of Angular App
FROM node:22 AS build

WORKDIR /app

COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build --prod


# Serve with Nginx
FROM nginx:alpine

RUN rm -rf /usr/share/nginx/html/*

COPY --from=build /app/dist/frontend/browser /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
