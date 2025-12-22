import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class StatsService {
  private readonly tasksServiceUrl = process.env.TASKS_SERVICE_URL || 'http://tasks-service:3003';

  constructor() {}

  async getDashboardStats(userId: string) {
    try {
      // Get all tasks for the user via HTTP
      const response = await axios.get(`${this.tasksServiceUrl}/tasks`, {
        params: { page: 1, size: 1000, assigned: true },
        headers: { 'x-user-id': userId }
      });

      const tasks = response.data.items || [];

      const activeTasks = tasks.filter((task: any) => 
        task.status === 'TODO' || task.status === 'IN_PROGRESS'
      ).length;

      const completedTasks = tasks.filter((task: any) => 
        task.status === 'DONE'
      ).length;

      const todoTasks = tasks.filter((task: any) => 
        task.status === 'TODO'
      ).length;

      const inProgressTasks = tasks.filter((task: any) => 
        task.status === 'IN_PROGRESS'
      ).length;

      // Recent tasks (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const recentTasks = tasks
        .filter((task: any) => new Date(task.createdAt) >= sevenDaysAgo)
        .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5);

      // Recent activity (simplified)
      const recentActivity = recentTasks.map((task: any) => ({
        id: task.id,
        type: 'task_created',
        description: `Tarefa "${task.title}" foi criada`,
        createdAt: task.createdAt,
        user: task.createdBy || 'Sistema'
      }));

      return {
        totalTasks: tasks.length,
        activeTasks,
        completedTasks,
        todoTasks,
        inProgressTasks,
        recentTasks,
        recentActivity,
        lastSync: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error fetching tasks:', error);
      // Return default values if service is down
      return {
        totalTasks: 0,
        activeTasks: 0,
        completedTasks: 0,
        todoTasks: 0,
        inProgressTasks: 0,
        recentTasks: [],
        recentActivity: [],
        lastSync: new Date().toISOString()
      };
    }
  }

  async getUserStats(userId: string) {
    // For now, return basic user stats
    // In a real scenario, you'd have a users table/service
    return {
      totalUsers: 1, // Would come from users service
      activeUsers: 1,
      adminUsers: 1,
      newUsersLast7Days: 0,
    };
  }
}