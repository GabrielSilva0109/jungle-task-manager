import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { CreateTaskDto, UpdateTaskDto, PaginationDto } from '@jungle/types';

@Injectable()
export class TasksService {
  private readonly tasksServiceUrl = process.env.TASKS_SERVICE_URL || 'http://tasks-service:3003';

  constructor() {}

  async create(createTaskDto: CreateTaskDto, userId: string) {
    try {
      // Send userId in x-user-id header to tasks-service
      const response = await axios.post(
        `${this.tasksServiceUrl}/tasks`, 
        createTaskDto,
        {
          headers: {
            'x-user-id': userId
          }
        }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async findAll(paginationDto: PaginationDto, search?: string, status?: string, userId?: string) {
    try {
      const params: any = {};
      if (search) params.search = search;
      if (status) params.status = status;
      if (paginationDto.page) params.page = Number(paginationDto.page);
      if (paginationDto.size) params.size = Number(paginationDto.size);
      
      const headers: any = {};
      if (userId) {
        headers['x-user-id'] = userId;
      }
      
      const response = await axios.get(`${this.tasksServiceUrl}/tasks`, { 
        params,
        headers 
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async findOne(id: string) {
    try {
      const response = await axios.get(`${this.tasksServiceUrl}/tasks/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async update(id: string, updateTaskDto: UpdateTaskDto, userId: string) {
    try {
      // Send userId in x-user-id header to tasks-service
      const response = await axios.patch(
        `${this.tasksServiceUrl}/tasks/${id}`, 
        updateTaskDto,
        {
          headers: {
            'x-user-id': userId
          }
        }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async remove(id: string, userId: string) {
    try {
      // Don't send userId in body, let tasks-service handle user context
      const response = await axios.delete(`${this.tasksServiceUrl}/tasks/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}