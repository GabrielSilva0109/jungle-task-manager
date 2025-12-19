import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { CreateTaskDto, UpdateTaskDto, PaginationDto } from '@jungle/types';

@Injectable()
export class TasksService {
  private readonly tasksServiceUrl = process.env.TASKS_SERVICE_URL || 'http://tasks-service:3003';

  constructor() {}

  async create(createTaskDto: CreateTaskDto, userId: string) {
    try {
      const response = await axios.post(`${this.tasksServiceUrl}/tasks`, {
        ...createTaskDto,
        userId,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async findAll(paginationDto: PaginationDto, search?: string, status?: string, userId?: string) {
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (status) params.append('status', status);
      if (userId) params.append('userId', userId);
      if (paginationDto.page) params.append('page', paginationDto.page.toString());
      if (paginationDto.size) params.append('size', paginationDto.size.toString());
      
      const response = await axios.get(`${this.tasksServiceUrl}/tasks?${params.toString()}`);
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
      const response = await axios.patch(`${this.tasksServiceUrl}/tasks/${id}`, {
        ...updateTaskDto,
        userId,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async remove(id: string, userId: string) {
    try {
      const response = await axios.delete(`${this.tasksServiceUrl}/tasks/${id}`, {
        data: { userId },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}