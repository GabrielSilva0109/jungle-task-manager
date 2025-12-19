import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { CreateTaskDto, UpdateTaskDto, PaginationDto } from '@jungle/types';

@Injectable()
export class TasksService {
  constructor(
    @Inject('TASKS_SERVICE')
    private tasksClient: ClientProxy,
  ) {}

  async create(createTaskDto: CreateTaskDto, userId: string) {
    return firstValueFrom(
      this.tasksClient.send('tasks.create', { createTaskDto, userId }),
    );
  }

  async findAll(paginationDto: PaginationDto, search?: string, status?: string, userId?: string) {
    return firstValueFrom(
      this.tasksClient.send('tasks.findAll', { paginationDto, search, status, userId }),
    );
  }

  async findOne(id: string) {
    return firstValueFrom(
      this.tasksClient.send('tasks.findOne', { id }),
    );
  }

  async update(id: string, updateTaskDto: UpdateTaskDto, userId: string) {
    return firstValueFrom(
      this.tasksClient.send('tasks.update', { id, updateTaskDto, userId }),
    );
  }

  async remove(id: string, userId: string) {
    return firstValueFrom(
      this.tasksClient.send('tasks.remove', { id, userId }),
    );
  }
}