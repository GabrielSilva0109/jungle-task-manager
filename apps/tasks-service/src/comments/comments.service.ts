import {
  Injectable,
  NotFoundException,
  Inject,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClientProxy } from '@nestjs/microservices';

import { Comment } from '../entities/comment.entity';
import { Task } from '../entities/task.entity';
import {
  CreateCommentDto,
  PaginationDto,
  PaginatedResponse,
} from '@jungle/types';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private commentRepository: Repository<Comment>,
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
    @Inject('NOTIFICATIONS_SERVICE')
    private notificationsClient: ClientProxy,
  ) {}

  async create(
    taskId: string,
    createCommentDto: CreateCommentDto,
    userId: string,
  ): Promise<Comment> {
    // Check if task exists
    const task = await this.taskRepository.findOne({ where: { id: taskId } });
    if (!task) {
      throw new NotFoundException(`Task with ID ${taskId} not found`);
    }

    const comment = this.commentRepository.create({
      ...createCommentDto,
      taskId,
      authorId: userId,
    });

    const savedComment = await this.commentRepository.save(comment);

    // Publish event
    this.notificationsClient.emit('comment.created', {
      taskId,
      commentId: savedComment.id,
      authorId: userId,
    });

    return savedComment;
  }

  async findAllByTask(
    taskId: string,
    paginationDto: PaginationDto,
  ): Promise<PaginatedResponse<Comment>> {
    const { page = 1, size = 10 } = paginationDto;
    const skip = (page - 1) * size;

    const [comments, total] = await this.commentRepository.findAndCount({
      where: { taskId },
      order: { createdAt: 'DESC' },
      skip,
      take: size,
    });

    return {
      data: comments,
      meta: {
        page,
        size,
        total,
        totalPages: Math.ceil(total / size),
      },
    };
  }

  async findOne(id: string): Promise<Comment> {
    const comment = await this.commentRepository.findOne({ where: { id } });
    
    if (!comment) {
      throw new NotFoundException(`Comment with ID ${id} not found`);
    }
    
    return comment;
  }
}