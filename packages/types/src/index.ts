import { IsEmail, IsString, MinLength, IsEnum, IsOptional, IsUUID, IsInt, Min, IsArray, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// Auth Types
export interface AuthUser {
  id: string;
  email: string;
  username: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AuthResponse {
  user: AuthUser;
  tokens: AuthTokens;
}

// Task Types
export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  REVIEW = 'REVIEW',
  DONE = 'DONE'
}

export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT'
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  deadline: Date;
  assignedUsers: AuthUser[];
  createdBy: AuthUser;
  createdAt: Date;
  updatedAt: Date;
  comments: Comment[];
}

export interface Comment {
  id: string;
  content: string;
  taskId: string;
  author: AuthUser;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuditLog {
  id: string;
  taskId: string;
  action: string;
  oldValue: any;
  newValue: any;
  userId: string;
  createdAt: Date;
}

// Notification Types
export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  taskId?: string;
  createdAt: Date;
}

export enum NotificationType {
  TASK_ASSIGNED = 'TASK_ASSIGNED',
  TASK_UPDATED = 'TASK_UPDATED',
  COMMENT_ADDED = 'COMMENT_ADDED'
}

// DTOs
export class RegisterDto {
  @ApiProperty({ example: 'user@example.com', description: 'User email address' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'johndoe', description: 'Username (minimum 3 characters)' })
  @IsString()
  @MinLength(3)
  username: string;

  @ApiProperty({ example: 'password123', description: 'Password (minimum 6 characters)' })
  @IsString()
  @MinLength(6)
  password: string;
}

export class LoginDto {
  @ApiProperty({ example: 'user@example.com', description: 'User email address' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123', description: 'User password' })
  @IsString()
  password: string;
}

export class CreateTaskDto {
  @ApiProperty({ example: 'Implementar funcionalidade X', description: 'Task title' })
  @IsString()
  @MinLength(1)
  title: string;

  @ApiProperty({ example: 'Detalhes da implementação...', description: 'Task description' })
  @IsString()
  description: string;

  @ApiProperty({ enum: TaskPriority, example: TaskPriority.MEDIUM, description: 'Task priority level' })
  @IsEnum(TaskPriority)
  priority: TaskPriority;

  @ApiProperty({ example: '2024-12-31T23:59:59.000Z', description: 'Task deadline' })
  @IsDateString()
  deadline: string;

  @ApiPropertyOptional({ type: [String], example: ['uuid1', 'uuid2'], description: 'Array of user IDs to assign to this task' })
  @IsArray()
  @IsUUID(4, { each: true })
  @IsOptional()
  assignedUserIds?: string[];
}

export class UpdateTaskDto {
  @ApiPropertyOptional({ example: 'Updated task title', description: 'Task title' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({ example: 'Updated description...', description: 'Task description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ enum: TaskStatus, example: TaskStatus.IN_PROGRESS, description: 'Task status' })
  @IsEnum(TaskStatus)
  @IsOptional()
  status?: TaskStatus;

  @ApiPropertyOptional({ enum: TaskPriority, example: TaskPriority.HIGH, description: 'Task priority level' })
  @IsEnum(TaskPriority)
  @IsOptional()
  priority?: TaskPriority;

  @ApiPropertyOptional({ example: '2024-12-31T23:59:59.000Z', description: 'Task deadline' })
  @IsDateString()
  @IsOptional()
  deadline?: string;

  @ApiPropertyOptional({ type: [String], example: ['uuid1', 'uuid2'], description: 'Array of user IDs assigned to this task' })
  @IsArray()
  @IsUUID(4, { each: true })
  @IsOptional()
  assignedUserIds?: string[];
}

export class CreateCommentDto {
  @ApiProperty({ example: 'Este é um comentário sobre a tarefa...', description: 'Comment content' })
  @IsString()
  @MinLength(1)
  content: string;
}

export class PaginationDto {
  @ApiPropertyOptional({ example: 1, description: 'Page number (starts from 1)', default: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({ example: 10, description: 'Number of items per page', default: 10 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  size?: number = 10;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    size: number;
    total: number;
    totalPages: number;
  };
}

// WebSocket Events
export interface WebSocketEvent {
  type: string;
  payload: any;
  userId?: string;
}

export interface TaskCreatedEvent {
  type: 'task:created';
  payload: Task;
}

export interface TaskUpdatedEvent {
  type: 'task:updated';
  payload: Task;
}

export interface CommentCreatedEvent {
  type: 'comment:new';
  payload: {
    taskId: string;
    comment: Comment;
  };
}

// RabbitMQ Message Types
export interface RabbitMQMessage {
  pattern: string;
  data: any;
}

export interface TaskMessage {
  taskId: string;
  userId: string;
  action: 'created' | 'updated' | 'assigned' | 'comment_added';
  payload: any;
}