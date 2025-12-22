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
  async create(@Body() createTaskDto: CreateTaskDto, @Request() req: any) {
    // For now, we'll use a hardcoded userId. In production, this would come from JWT
    const userId = req.user?.userId || '8f366c55-7522-4142-956f-21c348dda0ee';
    return this.tasksService.create(createTaskDto, userId);
  }

  @Get()
  async findAll(
    @Query('page') page?: string,
    @Query('size') size?: string,
    @Query('search') search?: string,
    @Query('status') status?: TaskStatus,
    @Query('userId') userId?: string,
  ) {
    const paginationDto = {
      page: page ? parseInt(page, 10) : 1,
      size: size ? parseInt(size, 10) : 10,
    };
    
    return this.tasksService.findAll(paginationDto, search, status, userId);
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
}