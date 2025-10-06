FROM nginx:alpine

COPY default.conf /etc/nginx/conf.d/default.conf

# Copy only the assets (static files)
COPY --from=frontend-ssr-build /app/dist/frontend/browser /usr/share/nginx/html/browser
