import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Req,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';

import { TasksService } from './tasks.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateTaskDto, UpdateTaskDto, PaginationDto, TaskStatus } from '@jungle/types';

@ApiTags('Tasks')
@Controller('tasks')
// Temporarily remove auth guard for testing
// @UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new task' })
  create(@Body() createTaskDto: CreateTaskDto, @Req() req: Request) {
    // Temporary fix: use hardcoded userId when auth is disabled
    const userId = req.user && (req.user as any).userId ? (req.user as any).userId : '8f366c55-7522-4142-956f-21c348dda0ee';
    return this.tasksService.create(createTaskDto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all tasks with pagination and filters' })
  findAll(
    @Query('page') page?: string,
    @Query('size') size?: string,
    @Query('search') search?: string,
    @Query('status') status?: TaskStatus,
    @Query('assigned') assigned?: boolean,
    @Req() req?: Request,
  ) {
    const paginationDto = {
      page: page ? parseInt(page, 10) : 1,
      size: size ? parseInt(size, 10) : 10,
    };
    
    // Temporary fix: use hardcoded userId when auth is disabled
    const userId = assigned && req?.user && (req.user as any).userId ? (req.user as any).userId : 
                   assigned ? '8f366c55-7522-4142-956f-21c348dda0ee' : undefined;
    return this.tasksService.findAll(paginationDto, search, status, userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a task by ID' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.tasksService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a task' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTaskDto: UpdateTaskDto,
    @Req() req: Request,
  ) {
    // Temporary fix: use hardcoded userId when auth is disabled
    const userId = req.user && (req.user as any).userId ? (req.user as any).userId : '8f366c55-7522-4142-956f-21c348dda0ee';
    return this.tasksService.update(id, updateTaskDto, userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a task' })
  remove(@Param('id', ParseUUIDPipe) id: string, @Req() req: Request) {
    // Temporary fix: use hardcoded userId when auth is disabled
    const userId = req.user && (req.user as any).userId ? (req.user as any).userId : '8f366c55-7522-4142-956f-21c348dda0ee';
    return this.tasksService.remove(id, userId);
  }
}