FROM node:18-alpine

WORKDIR /app

# Copy all files
COPY . .

# Install dependencies
RUN cd apps/tasks-service && npm install
RUN cd packages/types && npm install

# Expose port
EXPOSE 3003

# Development mode  
CMD ["sh", "-c", "cd apps/tasks-service && npm run start:dev"]