import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { CreateCommentDto, PaginationDto } from '@jungle/types';

@Injectable()
export class CommentsService {
  private readonly tasksServiceUrl = process.env.TASKS_SERVICE_URL || 'http://tasks-service:3003';

  constructor() {}

  async create(taskId: string, createCommentDto: CreateCommentDto, userId: string) {
    try {
      const response = await axios.post(`${this.tasksServiceUrl}/tasks/${taskId}/comments`, {
        ...createCommentDto,
        userId,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async findByTask(taskId: string, paginationDto: PaginationDto) {
    try {
      const params = new URLSearchParams();
      if (paginationDto.page) params.append('page', paginationDto.page.toString());
      if (paginationDto.size) params.append('size', paginationDto.size.toString());
      
      const response = await axios.get(`${this.tasksServiceUrl}/tasks/${taskId}/comments?${params.toString()}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}