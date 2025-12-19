FROM node:18-alpine

WORKDIR /app

# Copy all files
COPY . .

# Install dependencies
RUN cd apps/api-gateway && npm install
RUN cd packages/types && npm install

# Expose port
EXPOSE 3001

# Development mode  
CMD ["sh", "-c", "cd apps/api-gateway && npm run start:dev"]