FROM node:18-alpine

WORKDIR /app

# Copy package files for dependency resolution
COPY package*.json ./
COPY packages/types/package*.json ./packages/types/
COPY apps/web/package*.json ./apps/web/

# Install root dependencies
RUN npm ci --only=production --ignore-scripts

# Copy source files (node_modules excluded by .dockerignore)
COPY . .

# Install and build packages/types first
WORKDIR /app/packages/types
RUN npm ci && npm run build

# Move to web app and install all dependencies (including dev)
WORKDIR /app/apps/web
RUN npm ci

# Expose port
EXPOSE 3000

# Development mode  
CMD ["npm", "run", "dev"]