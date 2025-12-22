import { Injectable } from '@nestjs/common';

@Injectable()
export class StatsService {
  async getDashboardStats(userId: string) {
    // Temporarily return mock data until we resolve the inter-service communication
    // This ensures the frontend works while we debug the network issues
    return {
      totalTasks: 12,
      activeTasks: 8,
      completedTasks: 4,
      todoTasks: 5,
      inProgressTasks: 3,
      recentTasks: [
        {
          id: 'mock-task-1',
          title: 'Implementar autenticação JWT',
          description: 'Configurar sistema de autenticação com tokens JWT',
          status: 'IN_PROGRESS',
          priority: 'HIGH',
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() // 1 day ago
        },
        {
          id: 'mock-task-2',
          title: 'Criar dashboard de estatísticas',
          description: 'Desenvolver interface para visualização de métricas',
          status: 'TODO',
          priority: 'MEDIUM',
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() // 2 days ago
        },
        {
          id: 'mock-task-3',
          title: 'Setup do ambiente Docker',
          description: 'Configurar containers para desenvolvimento',
          status: 'DONE',
          priority: 'HIGH',
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() // 3 days ago
        },
        {
          id: 'mock-task-4',
          title: 'Implementar CRUD de tarefas',
          description: 'Criar endpoints para gerenciar tarefas',
          status: 'IN_PROGRESS',
          priority: 'HIGH',
          createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString() // 4 days ago
        },
        {
          id: 'mock-task-5',
          title: 'Configurar banco de dados',
          description: 'Setup PostgreSQL e migrações',
          status: 'DONE',
          priority: 'HIGH',
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() // 5 days ago
        }
      ],
      recentActivity: [
        {
          id: 'activity-1',
          type: 'task_created',
          description: 'Tarefa "Implementar autenticação JWT" foi criada',
          createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
          user: 'Admin'
        },
        {
          id: 'activity-2',
          type: 'task_completed',
          description: 'Tarefa "Setup do ambiente Docker" foi concluída',
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
          user: 'Admin'
        },
        {
          id: 'activity-3',
          type: 'task_updated',
          description: 'Tarefa "Implementar CRUD de tarefas" teve prioridade alterada',
          createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
          user: 'Admin'
        },
        {
          id: 'activity-4',
          type: 'task_assigned',
          description: 'Tarefa "Criar dashboard de estatísticas" foi atribuída',
          createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
          user: 'Admin'
        },
        {
          id: 'activity-5',
          type: 'task_created',
          description: 'Tarefa "Configurar banco de dados" foi criada',
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
          user: 'Admin'
        }
      ],
      lastSync: new Date().toISOString()
    };
  }

  async getUserStats(userId: string) {
    // Return mock user statistics
    return {
      totalUsers: 3,
      activeUsers: 2,
      adminUsers: 1,
      newUsersLast7Days: 1,
    };
  }
}