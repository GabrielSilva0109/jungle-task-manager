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
  Headers,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';

import { TasksService } from './tasks.service';
import { CreateTaskDto, UpdateTaskDto, TaskStatus } from '@jungle/types';

@ApiTags('Tasks')
@Controller('tasks')
// Temporarily remove auth guard for testing
// @UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new task' })
  create(
    @Body() createTaskDto: CreateTaskDto, 
    @Headers('x-user-id') userId?: string,
    @Req() req?: Request
  ) {
    // Use header user ID or fallback to hardcoded, but ONLY if header is truly empty
    let currentUserId: string;
    
    if (userId && userId.trim() && userId.trim().length > 0) {
      currentUserId = userId.trim();
    } else if (req?.user && (req.user as any).userId) {
      currentUserId = (req.user as any).userId;
    } else {
      currentUserId = '8f366c55-7522-4142-956f-21c348dda0ee';
    }
    
    console.log('🔧 Creating task - x-user-id header received:', userId);
    console.log('🔧 x-user-id after trim check:', userId && userId.trim());
    console.log('🔧 Final user ID being used:', currentUserId);
    console.log('🔧 Task data:', createTaskDto);
    return this.tasksService.create(createTaskDto, currentUserId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all tasks with pagination and filters' })
  findAll(
    @Query('page') page?: string,
    @Query('size') size?: string,
    @Query('search') search?: string,
    @Query('status') status?: TaskStatus,
    @Query('assigned') assigned?: boolean,
    @Headers('x-user-id') userId?: string,
    @Req() req?: Request,
  ) {
    const paginationDto = {
      page: page ? parseInt(page, 10) : 1,
      size: size ? parseInt(size, 10) : 10,
    };
    
    // Use header user ID or fallback to hardcoded
    const currentUserId = userId || (req?.user && (req.user as any).userId) || '8f366c55-7522-4142-956f-21c348dda0ee';
    return this.tasksService.findAll(paginationDto, search, status, currentUserId);
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
    @Headers('x-user-id') userId?: string,
    @Req() req?: Request,
  ) {
    // Use header user ID or fallback to hardcoded
    const currentUserId = userId || (req?.user && (req.user as any).userId) || '8f366c55-7522-4142-956f-21c348dda0ee';
    return this.tasksService.update(id, updateTaskDto, currentUserId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a task' })
  remove(
    @Param('id', ParseUUIDPipe) id: string, 
    @Headers('x-user-id') userId?: string,
    @Req() req?: Request
  ) {
    // Use header user ID or fallback to hardcoded
    const currentUserId = userId || (req?.user && (req.user as any).userId) || '8f366c55-7522-4142-956f-21c348dda0ee';
    return this.tasksService.remove(id, currentUserId);
  }

  @Get(':id/audit-log')
  @ApiOperation({ summary: 'Get audit log for a task' })
  getAuditLog(@Param('id', ParseUUIDPipe) id: string) {
    return this.tasksService.getAuditLog(id);
  }
}