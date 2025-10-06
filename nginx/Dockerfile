FROM nginx:alpine

# Clean default directory
RUN rm -rf /usr/share/nginx/html/*

# Copy static assests from build
COPY frontend/dist/frontend/browser /usr/share/nginx/html

# Copy costumized nginx config
COPY nginx/default.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
