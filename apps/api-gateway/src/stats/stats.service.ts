import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class StatsService {
  private readonly tasksServiceUrl = process.env.TASKS_SERVICE_URL || 'http://tasks-service:3003';
  private readonly authServiceUrl = process.env.AUTH_SERVICE_URL || 'http://auth-service:3010';
  async getDashboardStats(userId: string) {
    try {
      // Fetch tasks for the specific user
      const allTasksResponse = await axios.get<any>(`${this.tasksServiceUrl}/tasks`, {
        params: { 
          page: 1, 
          size: 1000, // Get all tasks
        },
        headers: {
          'x-user-id': userId // Pass user ID in header
        }
      });
      
      const tasks = allTasksResponse.data.data;
      const totalTasks = allTasksResponse.data.meta.total;
      
      // Calculate task statistics
      const todoTasks = tasks.filter(task => task.status === 'TODO').length;
      const inProgressTasks = tasks.filter(task => task.status === 'IN_PROGRESS').length;
      const completedTasks = tasks.filter(task => task.status === 'DONE').length;
      const activeTasks = todoTasks + inProgressTasks;
      
      // Get recent tasks (last 5)
      const recentTasks = tasks
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5);
      
      return {
        totalTasks,
        activeTasks,
        completedTasks,
        todoTasks,
        inProgressTasks,
        recentTasks,
        lastSync: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      // Return fallback data
      return {
        totalTasks: 0,
        activeTasks: 0,
        completedTasks: 0,
        todoTasks: 0,
        inProgressTasks: 0,
        recentTasks: [],
        lastSync: new Date().toISOString()
      };
    }
  }

  async getUserStats(userId: string) {
    try {
      // Fetch user statistics from auth service
      const usersResponse = await axios.get<any[]>(`${this.authServiceUrl}/users`);
      const users = usersResponse.data;
      
      // Calculate user statistics
      const totalUsers = users.length;
      const activeUsers = users.filter(user => user.isActive !== false).length;
      const adminUsers = users.filter(user => user.role === 'admin' || user.isAdmin).length;
      
      // Calculate new users in last 7 days
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const newUsersLast7Days = users.filter(user => 
        new Date(user.createdAt) > sevenDaysAgo
      ).length;
      
      return {
        totalUsers,
        activeUsers,
        adminUsers,
        newUsersLast7Days,
      };
    } catch (error) {
      console.error('Error fetching user stats:', error);
      // Return fallback data
      return {
        totalUsers: 1,
        activeUsers: 1,
        adminUsers: 1,
        newUsersLast7Days: 0,
      };
    }
  }

  async getUsersRanking(userId: string) {
    try {
      // Get all users from auth service
      const usersResponse = await axios.get<any[]>(`${this.authServiceUrl}/users`);
      const users = usersResponse.data;

      // Get completed tasks count for each user
      const userRankings = await Promise.all(
        users.map(async (user) => {
          try {
            const tasksResponse = await axios.get<any>(`${this.tasksServiceUrl}/tasks`, {
              params: { 
                page: 1, 
                size: 1000,
                status: 'DONE' // Only completed tasks
              },
              headers: {
                'x-user-id': user.id // Get tasks for this specific user
              }
            });
            
            const completedTasksCount = tasksResponse.data.meta?.total || 0;
            
            return {
              id: user.id,
              username: user.username,
              email: user.email,
              completedTasks: completedTasksCount,
              isActive: user.isActive
            };
          } catch (error) {
            console.error(`Error fetching tasks for user ${user.username}:`, error);
            return {
              id: user.id,
              username: user.username,
              email: user.email,
              completedTasks: 0,
              isActive: user.isActive
            };
          }
        })
      );

      // Filter active users and sort by completed tasks
      const ranking = userRankings
        .filter(user => user.isActive && user.completedTasks > 0)
        .sort((a, b) => b.completedTasks - a.completedTasks)
        .slice(0, 5); // Top 5 users

      return ranking;
    } catch (error) {
      console.error('Error fetching users ranking:', error);
      return [];
    }
  }
}