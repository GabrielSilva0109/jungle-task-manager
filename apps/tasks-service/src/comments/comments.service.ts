import {
  Injectable,
  NotFoundException,
  Inject,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClientProxy } from '@nestjs/microservices';
import axios from 'axios';

import { Comment } from '../entities/comment.entity';
import { Task } from '../entities/task.entity';
import {
  CreateCommentDto,
  PaginationDto,
  PaginatedResponse,
} from '@jungle/types';

@Injectable()
export class CommentsService {
  private readonly authServiceUrl = process.env.AUTH_SERVICE_URL || 'http://auth-service:3002';

  constructor(
    @InjectRepository(Comment)
    private commentRepository: Repository<Comment>,
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
    @Inject('NOTIFICATIONS_SERVICE')
    private notificationsClient: ClientProxy,
  ) {}

  private async getUserInfo(userId: string): Promise<{ username: string; email: string } | null> {
    try {
      const response = await axios.get(`${this.authServiceUrl}/user/${userId}`);
      return {
        username: response.data.username,
        email: response.data.email,
      };
    } catch (error) {
      console.log(`Failed to fetch user info for ${userId}:`, error instanceof Error ? error.message : error);
      return null;
    }
  }

  async create(
    taskId: string,
    createCommentDto: CreateCommentDto,
    userId: string,
  ): Promise<any> {

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

    const userInfo = await this.getUserInfo(userId);

    return {
      ...savedComment,
      author: {
        id: userId,
        username: userInfo?.username ?? 'Usuário desconhecido',
        email: userInfo?.email ?? 'unknown@example.com',
      },
    };
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

    // Fetch user info for all unique author IDs
    const uniqueAuthorIds = [...new Set(comments.map(c => c.authorId))];
    const userInfoPromises = uniqueAuthorIds.map(id => this.getUserInfo(id));
    const userInfoResults = await Promise.all(userInfoPromises);
    
    // Create user info map
    const userInfoMap = new Map();
    uniqueAuthorIds.forEach((id, index) => {
      const userInfo = userInfoResults[index];
      userInfoMap.set(id, userInfo || {
        username: `User ${id.slice(0, 8)}`,
        email: 'unknown@example.com'
      });
    });

    // Add author info to each comment
    const commentsWithAuthors = comments.map(comment => ({
      ...comment,
      author: {
        id: comment.authorId,
        ...userInfoMap.get(comment.authorId),
      }
    }));

    return {
      data: commentsWithAuthors as any,
      meta: {
        page,
        size,
        total,
        totalPages: Math.ceil(total / size),
      },
    };
  }

  async findOne(id: string): Promise<any> {
    const comment = await this.commentRepository.findOne({ where: { id } });

    if (!comment) {
      throw new NotFoundException(`Comment with ID ${id} not found`);
    }

    const userInfo = await this.getUserInfo(comment.authorId);

    return {
      ...comment,
      author: {
        id: comment.authorId,
        username: userInfo?.username ?? 'Usuário desconhecido',
        email: userInfo?.email ?? 'unknown@example.com',
      },
    };
  }

  async remove(commentId: string, userId: string): Promise<void> {
    const comment = await this.commentRepository.findOne({ where: { id: commentId } });
    if (!comment) {
      throw new NotFoundException(`Comment with ID ${commentId} not found`);
    }

    // Only allow the author to delete their comment
    if (comment.authorId !== userId) {
      throw new NotFoundException('You can only delete your own comments');
    }

    await this.commentRepository.remove(comment);
  }
}