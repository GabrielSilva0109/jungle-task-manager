FROM node:18-alpine

WORKDIR /app

# Copia todos os arquivos do projeto
COPY . .

# Instala todas as dependências do monorepo
RUN npm install

# Expõe a porta do serviço
EXPOSE 3004

# Inicia o serviço em modo desenvolvimento
WORKDIR /app/apps/notifications-service
CMD ["npm", "run", "start:dev"]