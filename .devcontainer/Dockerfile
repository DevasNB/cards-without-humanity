# Base image: Node.js (latest LTS + Angular 20 support)
FROM node:20

# Install additional tools
RUN apt-get update && apt-get install -y \
    git \
    curl \
    vim \
    default-mysql-client \
    && rm -rf /var/lib/apt/lists/*

# Install Angular CLI globally
RUN npm install -g @angular/cli@20

# Set default working directory (will be overridden by devcontainer.json)
WORKDIR /workspace

