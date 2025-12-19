FROM node:18-alpine

WORKDIR /app

# Copy all files
COPY . .

# Install dependencies
RUN cd apps/notifications-service && npm install
RUN cd packages/types && npm install

# Expose port
EXPOSE 3004

# Development mode  
CMD ["sh", "-c", "cd apps/notifications-service && npm run start:dev"]