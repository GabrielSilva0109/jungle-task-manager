import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { CreateTaskDto, UpdateTaskDto, PaginationDto } from '@jungle/types';

@Injectable()
export class TasksService {
  private readonly tasksServiceUrl = process.env.TASKS_SERVICE_URL || 'http://tasks-service:3003';

  constructor() {}

  async create(createTaskDto: CreateTaskDto, userId: string) {
    try {
      // Don't send userId in body, let tasks-service use its hardcoded value
      const response = await axios.post(`${this.tasksServiceUrl}/tasks`, createTaskDto);
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
      if (userId) params.userId = userId;
      if (paginationDto.page) params.page = Number(paginationDto.page);
      if (paginationDto.size) params.size = Number(paginationDto.size);
      
      const response = await axios.get(`${this.tasksServiceUrl}/tasks`, { params });
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