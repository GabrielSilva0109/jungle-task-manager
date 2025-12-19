import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { CreateCommentDto, PaginationDto } from '@jungle/types';

@Injectable()
export class CommentsService {
  constructor(
    @Inject('TASKS_SERVICE')
    private tasksClient: ClientProxy,
  ) {}

  async create(taskId: string, createCommentDto: CreateCommentDto, userId: string) {
    return firstValueFrom(
      this.tasksClient.send('comments.create', { taskId, createCommentDto, userId }),
    );
  }

  async findByTask(taskId: string, paginationDto: PaginationDto) {
    return firstValueFrom(
      this.tasksClient.send('comments.findByTask', { taskId, paginationDto }),
    );
  }
}