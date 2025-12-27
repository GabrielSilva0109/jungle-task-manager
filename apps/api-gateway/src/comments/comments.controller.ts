import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  ParseUUIDPipe,
  Delete,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';

import { CommentsService } from './comments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateCommentDto, PaginationDto } from '@jungle/types';

@ApiTags('Comments')
@Controller('tasks/:taskId/comments')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  @ApiOperation({ summary: 'Add a comment to a task' })
  create(
    @Param('taskId', ParseUUIDPipe) taskId: string,
    @Body() createCommentDto: CreateCommentDto,
    @Req() req: Request,
  ) {
    const user = req.user as any;
    return this.commentsService.create(taskId, createCommentDto, user.userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get comments for a task' })
  findByTask(
    @Param('taskId', ParseUUIDPipe) taskId: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.commentsService.findByTask(taskId, paginationDto);
  }
}

// Separate controller for comment operations by ID
@Controller('comments')
@UseGuards(JwtAuthGuard)
export class CommentsStandaloneController {
  constructor(private readonly commentsService: CommentsService) {}

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a comment' })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: Request,
  ) {
    const user = req.user as any;
    return this.commentsService.remove(id, user.userId);
  }
}