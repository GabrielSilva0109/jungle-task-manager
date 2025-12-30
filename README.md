# 🎯 Jungle Task Manager - Sistema de Gestão de Tarefas Colaborativo

## 📋 Visão Geral

O Jungle Task Manager é uma aplicação web colaborativa que permite gerenciar tarefas em equipe, com autenticação, comentários, notificações em tempo real via WebSocket e arquitetura de microserviços.

## 🏗️ Arquitetura

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────────┐
│   React App     │───▶│   API Gateway    │───▶│   Microservices     │
│  (TanStack)     │    │   (NestJS)       │    │                     │
│                 │    │   - Auth Guard   │    │  ┌─ Auth Service   │
│                 │    │   - Rate Limit   │    │  ├─ Tasks Service  │
│                 │    │   - Swagger      │    │  └─ Notifications  │
└─────────────────┘    │   - WebSocket    │    └─────────────────────┘
                       └──────────────────┘
                              │
                    ┌─────────┼─────────┐
                    │         │         │
            ┌───────▼──┐  ┌───▼───┐  ┌──▼────────┐
            │PostgreSQL│  │RabbitMQ│  │ WebSocket │
            │ Database │  │ Broker │  │ Gateway   │
            └──────────┘  └────────┘  └───────────┘
```

## 🛠️ Stack Tecnológica

### Frontend

- **React.js** com **TanStack Router**
- **TanStack Query** para gerenciamento de estado
- **shadcn/ui** + **Tailwind CSS** para interface
- **Zod** + **React Hook Form** para validação
- **Zustand** para estado de autenticação
- **Socket.io Client** para WebSocket
- **Vite** como bundler

### Backend

- **NestJS** (API Gateway + Microserviços)
- **TypeORM** com **PostgreSQL**
- **RabbitMQ** para mensageria entre serviços
- **JWT** para autenticação
- **Socket.io** para WebSocket
- **Swagger/OpenAPI** para documentação
- **bcryptjs** para hash de senhas
- **Rate Limiting** (10 req/seg)

### DevOps/Infra

- **Docker** + **Docker Compose**
- **Turborepo** para monorepo
- **TypeScript** em todo o projeto

## 🚀 Funcionalidades

### ✅ Autenticação

- [x] Registro e login com email/username
- [x] JWT com access token (15min) e refresh token (7 dias)
- [x] Hash seguro de senhas com bcrypt
- [x] Guards de proteção de rotas
- [x] Logout com invalidação de tokens

### ✅ Gestão de Tarefas

- [x] CRUD completo de tarefas
- [x] Status: TODO, IN_PROGRESS, REVIEW, DONE
- [x] Prioridades: LOW, MEDIUM, HIGH, URGENT
- [x] Atribuição a múltiplos usuários
- [x] Prazos e datas
- [x] Busca e filtros
- [x] Paginação

### ✅ Sistema de Comentários

- [x] Adicionar comentários em tarefas
- [x] Listagem paginada de comentários
- [x] Associação com autor

### ✅ Histórico e Auditoria

- [x] Log de todas as alterações
- [x] Rastreamento de criação, edição e exclusão
- [x] Armazenamento de valores antigos e novos

### ✅ Notificações em Tempo Real

- [x] WebSocket para notificações instantâneas
- [x] Eventos: tarefa criada, atualizada, comentário adicionado
- [x] Persistência de notificações no banco
- [x] Marcar como lido individual/em massa

### ✅ Interface de Usuário

- [x] Dashboard com lista de tarefas
- [x] Filtros por status, prioridade e busca
- [x] Página de detalhes da tarefa
- [x] Modal de login/registro
- [x] Loading states e tratamento de erro
- [x] Design responsivo

## 📁 Estrutura do Projeto

```
jungle-task-manager/
├── apps/
│   ├── web/                     # Frontend React + Vite
│   │   ├── src/
│   │   │   ├── pages/          # Login, Dashboard, TaskDetail
│   │   │   ├── stores/         # Zustand stores
│   │   │   ├── services/       # API client
│   │   │   └── components/     # Componentes reutilizáveis
│   │   ├── Dockerfile
│   │   └── package.json
│   │
│   ├── api-gateway/            # API Gateway HTTP + WebSocket
│   │   ├── src/
│   │   │   ├── auth/           # Autenticação e guards
│   │   │   ├── tasks/          # Proxy para tasks-service
│   │   │   ├── comments/       # Proxy para comments
│   │   │   ├── notifications/  # Proxy para notifications
│   │   │   └── websocket/      # WebSocket gateway
│   │   ├── Dockerfile
│   │   └── package.json
│   │
│   ├── auth-service/           # Microserviço de autenticação
│   │   ├── src/
│   │   │   ├── auth/           # Controllers, services, strategies
│   │   │   └── entities/       # User entity
│   │   ├── Dockerfile
│   │   └── package.json
│   │
│   ├── tasks-service/          # Microserviço de tarefas
│   │   ├── src/
│   │   │   ├── tasks/          # CRUD de tarefas
│   │   │   ├── comments/       # Sistema de comentários
│   │   │   ├── audit/          # Sistema de auditoria
│   │   │   └── entities/       # Task, Comment, AuditLog entities
│   │   ├── Dockerfile
│   │   └── package.json
│   │
│   └── notifications-service/  # Microserviço de notificações
│       ├── src/
│       │   ├── notifications/  # Gestão de notificações
│       │   └── websocket/      # WebSocket server
│       ├── Dockerfile
│       └── package.json
│
├── packages/
│   ├── types/                  # Types TypeScript compartilhados
│   ├── eslint-config/          # Configuração ESLint
│   └── tsconfig/               # Configurações TypeScript
│
├── docker-compose.yml          # Orquestração dos serviços
├── turbo.json                  # Configuração Turborepo
└── README.md
```

## 🐳 Executando o Projeto

### Pré-requisitos

- Docker & Docker Compose
- Node.js 18+ (opcional, para desenvolvimento local)

### 1. Clone o repositório

```bash
git clone <repository-url>
cd jungle-task-manager
```

### 2. Execute com Docker

```bash
# Subir todos os serviços
docker-compose up --build

# Ou em modo detached
docker-compose up -d --build
```

### 3. Acessar a aplicação

- **Frontend**: http://localhost:3000
- **API Gateway**: http://localhost:3001
- **Swagger Docs**: http://localhost:3001/api/docs
- **RabbitMQ Management**: http://localhost:15672 (admin/admin)
- **PostgreSQL**: localhost:5432 (postgres/password)

### 4. Parar os serviços

```bash
docker-compose down

# Para remover volumes também
docker-compose down -v
```

## 🔧 Desenvolvimento Local

### Instalar dependências

```bash
npm install
```

### Comandos disponíveis

```bash
# Desenvolvimento (todos os serviços)
npm run dev

# Build (todos os projetos)
npm run build

# Linting
npm run lint

# Testes
npm run test

# Limpar builds
npm run clean
```

### Executar serviços individuais

```bash
# Frontend
npm run dev --workspace=web

# API Gateway
npm run dev --workspace=api-gateway

# Microserviços
npm run dev --workspace=auth-service
npm run dev --workspace=tasks-service
npm run dev --workspace=notifications-service
```

## 📡 Endpoints da API

### Autenticação

```
POST   /api/auth/register       # Registrar usuário
POST   /api/auth/login          # Login
POST   /api/auth/refresh        # Renovar tokens
POST   /api/auth/logout         # Logout
```

### Tarefas

```
GET    /api/tasks               # Listar tarefas (paginado)
POST   /api/tasks               # Criar tarefa
GET    /api/tasks/:id           # Buscar tarefa
PATCH  /api/tasks/:id           # Atualizar tarefa
DELETE /api/tasks/:id           # Deletar tarefa
```

### Comentários

```
GET    /api/tasks/:id/comments  # Listar comentários
POST   /api/tasks/:id/comments  # Adicionar comentário
```

### Notificações

```
GET    /api/notifications       # Listar notificações do usuário
PATCH  /api/notifications/:id/read      # Marcar como lida
PATCH  /api/notifications/read-all      # Marcar todas como lidas
```

## 🔌 Eventos WebSocket

### Cliente → Servidor

```javascript
// Autenticação
socket.emit("authenticate", { token: "jwt_token" });

// Entrar em sala de usuário
socket.emit("join", { userId: "user_id" });
```

### Servidor → Cliente

```javascript
// Tarefa criada
socket.on('task:created', (task) => { ... });

// Tarefa atualizada
socket.on('task:updated', ({ taskId, changes }) => { ... });

// Novo comentário
socket.on('comment:new', ({ taskId, comment }) => { ... });

// Nova notificação
socket.on('notification', (notification) => { ... });
```

## 🧪 Testando a API

### Usando a documentação Swagger

Acesse http://localhost:3001/api/docs para uma interface interativa da API.

### Exemplo com curl

```bash
# Registrar usuário
curl -X POST http://localhost:3001/api/auth/register \\
  -H \"Content-Type: application/json\" \\
  -d '{\"email\":\"user@example.com\",\"username\":\"user\",\"password\":\"123456\"}'

# Login
curl -X POST http://localhost:3001/api/auth/login \\
  -H \"Content-Type: application/json\" \\
  -d '{\"email\":\"user@example.com\",\"password\":\"123456\"}'

# Criar tarefa (com token)
curl -X POST http://localhost:3001/api/tasks \\
  -H \"Content-Type: application/json\" \\
  -H \"Authorization: Bearer <access_token>\" \\
  -d '{\"title\":\"Minha Tarefa\",\"description\":\"Descrição\",\"priority\":\"HIGH\",\"deadline\":\"2024-12-31T23:59:59Z\"}'
```

## 🎯 Decisões Técnicas e Trade-offs

### ✅ Decisões Implementadas

1. **Arquitetura de Microserviços**

   - ✅ Separação clara de responsabilidades
   - ✅ Escalabilidade independente
   - ✅ RabbitMQ para comunicação assíncrona
   - ⚠️ Trade-off: Complexidade adicional vs benefícios

2. **Autenticação JWT**

   - ✅ Stateless e escalável
   - ✅ Access + Refresh token pattern
   - ✅ Renovação automática no frontend
   - ✅ Hash seguro com bcrypt (salt 12)

3. **TypeScript em Todo Projeto**

   - ✅ Type safety entre frontend e backend
   - ✅ Package compartilhado de tipos
   - ✅ Melhor DX e menos bugs

4. **WebSocket para Tempo Real**

   - ✅ Notificações instantâneas
   - ✅ Experiência reativa
   - ⚠️ Trade-off: Complexidade de conexão vs UX

5. **Docker Compose para Desenvolvimento**
   - ✅ Environment consistente
   - ✅ Fácil setup
   - ✅ Isolamento de serviços
