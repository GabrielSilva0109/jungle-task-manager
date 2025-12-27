import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
  Request,
} from '@nestjs/common';

import { CommentsService } from './comments.service';
import {
  CreateCommentDto,
  PaginationDto,
} from '@jungle/types';

@Controller('tasks/:taskId/comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  async create(
    @Param('taskId', ParseUUIDPipe) taskId: string,
    @Body() createCommentDto: CreateCommentDto,
    @Request() req: any,
  ) {
    // Get userId from header (sent by API Gateway)
    const userId = req.headers['x-user-id'] || '8f366c55-7522-4142-956f-21c348dda0ee';
    return this.commentsService.create(taskId, createCommentDto, userId);
  }

  @Get()
  async findByTask(
    @Param('taskId', ParseUUIDPipe) taskId: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.commentsService.findAllByTask(taskId, paginationDto);
  }
}

// Also create a separate controller for accessing comments by ID
@Controller('comments')
export class CommentsStandaloneController {
  constructor(private readonly commentsService: CommentsService) {}

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.commentsService.findOne(id);
  }

  @Delete(':id')
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: any,
  ) {
    // Get userId from header (sent by API Gateway)
    const userId = req.headers['x-user-id'] || '8f366c55-7522-4142-956f-21c348dda0ee';
    await this.commentsService.remove(id, userId);
    return { message: 'Comment deleted successfully' };
  }
}