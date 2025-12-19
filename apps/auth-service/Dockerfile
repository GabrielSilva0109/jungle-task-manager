FROM node:18-alpine

WORKDIR /app

# Copy all files
COPY . .

# Install dependencies
RUN cd apps/auth-service && npm install
RUN cd packages/types && npm install

# Expose port
EXPOSE 3002

# Development mode  
CMD ["sh", "-c", "cd apps/auth-service && npm run start:dev"]