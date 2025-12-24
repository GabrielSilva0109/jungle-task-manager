import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Inject,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions, Like } from 'typeorm';
import { ClientProxy } from '@nestjs/microservices';
import axios from 'axios';

import { Task } from '../entities/task.entity';
import { TaskAssignment } from '../entities/task-assignment.entity';
import { AuditService } from '../audit/audit.service';
import {
  CreateTaskDto,
  UpdateTaskDto,
  PaginationDto,
  PaginatedResponse,
  TaskStatus,
} from '@jungle/types';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
    @InjectRepository(TaskAssignment)
    private assignmentRepository: Repository<TaskAssignment>,
    private auditService: AuditService,
    @Inject('NOTIFICATIONS_SERVICE')
    private notificationsClient: ClientProxy,
  ) {}

  async create(createTaskDto: CreateTaskDto, userId: string): Promise<Task> {
    console.log('🔧 Tasks Service - Creating task');
    console.log('🔧 User ID:', userId);
    console.log('🔧 Task data:', createTaskDto);
    
    const { assignedUserIds, ...taskData } = createTaskDto;
    
    const task = this.taskRepository.create({
      ...taskData,
      createdBy: userId,
      deadline: new Date(createTaskDto.deadline),
    });
    
    console.log('🔧 Task entity before save:', task);

    const savedTask = await this.taskRepository.save(task);
    
    console.log('🔧 Task saved successfully:', savedTask);

    // Assign users to task
    if (assignedUserIds && assignedUserIds.length > 0) {
      await this.assignUsers(savedTask.id, assignedUserIds);
    }

    // Log audit
    await this.auditService.log({
      taskId: savedTask.id,
      action: 'CREATED',
      newValue: savedTask,
      userId,
    });

    // Emit task.created event via RabbitMQ
    try {
      this.notificationsClient.emit('task.created', {
        taskId: savedTask.id,
        userId,
        assignedUserIds: assignedUserIds || [],
        task: savedTask,
      });
      console.log('✅ Task created event emitted via RabbitMQ');
    } catch (error: any) {
      console.warn('⚠️ Failed to emit task creation event:', error.message || error);
    }

    return this.findOne(savedTask.id);
  }

  async findAll(
    paginationDto: PaginationDto,
    search?: string,
    status?: TaskStatus,
    userId?: string,
  ): Promise<PaginatedResponse<Task>> {
    const { page = 1, size = 10 } = paginationDto;
    const skip = (page - 1) * size;

    const queryBuilder = this.taskRepository
      .createQueryBuilder('task')
      .leftJoinAndSelect('task.assignments', 'assignment')
      .leftJoinAndSelect('task.comments', 'comment')
      .orderBy('task.createdAt', 'DESC');

    if (search) {
      queryBuilder.andWhere(
        '(task.title ILIKE :search OR task.description ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (status) {
      queryBuilder.andWhere('task.status = :status', { status });
    }

    // Always filter by user - either created by user OR assigned to user
    if (userId) {
      queryBuilder.andWhere(
        '(task.createdBy = :userId OR assignment.userId = :userId)',
        { userId }
      );
    }

    const [tasks, total] = await queryBuilder
      .skip(skip)
      .take(size)
      .getManyAndCount();

    return {
      data: tasks,
      meta: {
        page,
        size,
        total,
        totalPages: Math.ceil(total / size),
      },
    };
  }

  async findOne(id: string): Promise<Task> {
    const task = await this.taskRepository.findOne({
      where: { id },
      relations: ['assignments', 'comments', 'auditLogs'],
      order: {
        comments: { createdAt: 'DESC' },
        auditLogs: { createdAt: 'DESC' },
      },
    });

    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    return task;
  }

  async update(
    id: string,
    updateTaskDto: UpdateTaskDto,
    userId: string,
  ): Promise<Task> {
    const task = await this.findOne(id);
    const oldValue = { ...task };

    const { assignedUserIds, ...updateData } = updateTaskDto;
    
    if (updateTaskDto.deadline) {
      (updateData as any).deadline = new Date(updateTaskDto.deadline);
    }

    Object.assign(task, updateData);
    const updatedTask = await this.taskRepository.save(task);

    // Update assignments if provided
    if (assignedUserIds !== undefined) {
      await this.updateAssignments(id, assignedUserIds);
    }

    // Log audit
    await this.auditService.log({
      taskId: id,
      action: 'UPDATED',
      oldValue,
      newValue: updatedTask,
      userId,
    });

    // Emit task.updated event via RabbitMQ
    try {
      this.notificationsClient.emit('task.updated', {
        taskId: id,
        userId,
        changes: updateTaskDto,
        assignedUserIds: assignedUserIds || [],
        task: updatedTask,
      });
      console.log('✅ Task updated event emitted via RabbitMQ');
    } catch (error: any) {
      console.warn('⚠️ Failed to emit task update event:', error.message || error);
    }

    return this.findOne(id);
  }

  async remove(id: string, userId: string): Promise<void> {
    const task = await this.findOne(id);

    // Log audit
    await this.auditService.log({
      taskId: id,
      action: 'DELETED',
      oldValue: task,
      userId,
    });

    await this.taskRepository.remove(task);
  }

  private async assignUsers(taskId: string, userIds: string[]): Promise<void> {
    const assignments = userIds.map((userId) =>
      this.assignmentRepository.create({ taskId, userId }),
    );
    
    await this.assignmentRepository.save(assignments);
  }

  private async updateAssignments(
    taskId: string,
    userIds: string[],
  ): Promise<void> {
    // Remove existing assignments
    await this.assignmentRepository.delete({ taskId });
    
    // Add new assignments
    if (userIds.length > 0) {
      await this.assignUsers(taskId, userIds);
    }
  }
}