import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';

import { TasksService } from './tasks.service';
import {
  CreateTaskDto,
  UpdateTaskDto,
  PaginationDto,
  TaskStatus,
} from '@jungle/types';

@Controller()
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  // Microservice patterns
  @MessagePattern('tasks.create')
  async createTask(data: { createTaskDto: CreateTaskDto; userId: string }) {
    return this.tasksService.create(data.createTaskDto, data.userId);
  }

  @MessagePattern('tasks.findAll')
  async findAllTasks(data: {
    paginationDto: PaginationDto;
    search?: string;
    status?: TaskStatus;
    userId?: string;
  }) {
    return this.tasksService.findAll(
      data.paginationDto,
      data.search,
      data.status,
      data.userId,
    );
  }

  @MessagePattern('tasks.findOne')
  async findOneTask(data: { id: string }) {
    return this.tasksService.findOne(data.id);
  }

  @MessagePattern('tasks.update')
  async updateTask(data: {
    id: string;
    updateTaskDto: UpdateTaskDto;
    userId: string;
  }) {
    return this.tasksService.update(data.id, data.updateTaskDto, data.userId);
  }

  @MessagePattern('tasks.remove')
  async removeTask(data: { id: string; userId: string }) {
    return this.tasksService.remove(data.id, data.userId);
  }
}