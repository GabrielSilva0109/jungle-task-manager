import {
  Controller,
  Get,
  Post,
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
    // For now, we'll use a hardcoded userId. In production, this would come from JWT
    const userId = req.user?.userId || '8f366c55-7522-4142-956f-21c348dda0ee';
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
}