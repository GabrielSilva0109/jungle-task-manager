FROM node:18-alpine

WORKDIR /app

# Copia package.json e package-lock.json da raiz e dos pacotes
COPY package*.json ./
COPY packages/types/package*.json ./packages/types/
COPY apps/tasks-service/package*.json ./apps/tasks-service/

# Instala dependências e links de workspaces na raiz
RUN npm install

# Copia o restante dos arquivos
COPY . .

# Garante build do pacote types antes de rodar o serviço
RUN cd packages/types && npm run build

# Expose port
EXPOSE 3003

# Development mode
CMD ["sh", "-c", "cd apps/tasks-service && npm run start:dev"]