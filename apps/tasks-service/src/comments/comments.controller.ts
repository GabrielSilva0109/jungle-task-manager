import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';

import { CommentsService } from './comments.service';
import {
  CreateCommentDto,
  PaginationDto,
} from '@jungle/types';

@Controller()
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @MessagePattern('comments.create')
  async createComment(data: {
    taskId: string;
    createCommentDto: CreateCommentDto;
    userId: string;
  }) {
    return this.commentsService.create(
      data.taskId,
      data.createCommentDto,
      data.userId,
    );
  }

  @MessagePattern('comments.findByTask')
  async findCommentsByTask(data: {
    taskId: string;
    paginationDto: PaginationDto;
  }) {
    return this.commentsService.findAllByTask(
      data.taskId,
      data.paginationDto,
    );
  }

  @MessagePattern('comments.findOne')
  async findOneComment(data: { id: string }) {
    return this.commentsService.findOne(data.id);
  }
}