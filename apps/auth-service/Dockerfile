FROM node:18-alpine

WORKDIR /app

COPY . .

RUN npm install

WORKDIR /app/apps/auth-service

CMD ["npm", "run", "start:dev"]