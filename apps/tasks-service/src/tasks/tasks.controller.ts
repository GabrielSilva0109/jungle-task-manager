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
  UseGuards,
  Request,
  Headers,
} from '@nestjs/common';

import { TasksService } from './tasks.service';
import {
  CreateTaskDto,
  UpdateTaskDto,
  PaginationDto,
  TaskStatus,
} from '@jungle/types';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  async create(
    @Body() createTaskDto: CreateTaskDto, 
    @Headers('x-user-id') userId?: string,
    @Request() req?: any
  ) {
    // Use x-user-id header from API Gateway
    const currentUserId = userId || req.user?.userId || '8f366c55-7522-4142-956f-21c348dda0ee';
    console.log('🔧 [TASKS-SERVICE] Creating task with userId:', currentUserId, 'from header:', userId);
    return this.tasksService.create(createTaskDto, currentUserId);
  }

  @Get()
  async findAll(
    @Query('page') page?: string,
    @Query('size') size?: string,
    @Query('search') search?: string,
    @Query('status') status?: TaskStatus,
    @Headers('x-user-id') userId?: string,
    @Request() req?: any,
  ) {
    const paginationDto = {
      page: page ? parseInt(page, 10) : 1,
      size: size ? parseInt(size, 10) : 10,
    };
    
    // Get userId from x-user-id header from API Gateway
    const currentUserId = userId || req.user?.userId || '8f366c55-7522-4142-956f-21c348dda0ee';
    console.log('🔧 [TASKS-SERVICE] Finding tasks with userId:', currentUserId, 'from header:', userId);
    
    return this.tasksService.findAll(paginationDto, search, status, currentUserId);
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.tasksService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTaskDto: UpdateTaskDto,
    @Request() req: any,
  ) {
    // For now, we'll use a hardcoded userId. In production, this would come from JWT
    const userId = req.user?.userId || '8f366c55-7522-4142-956f-21c348dda0ee';
    return this.tasksService.update(id, updateTaskDto, userId);
  }

  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string, @Request() req: any) {
    // For now, we'll use a hardcoded userId. In production, this would come from JWT
    const userId = req.user?.userId || '8f366c55-7522-4142-956f-21c348dda0ee';
    return this.tasksService.remove(id, userId);
  }

  @Get(':id/audit-log')
  async getAuditLog(@Param('id', ParseUUIDPipe) id: string) {
    return this.tasksService.getAuditLog(id);
  }
}