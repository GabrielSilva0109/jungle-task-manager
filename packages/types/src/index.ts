import { IsEmail, IsString, MinLength, IsEnum, IsOptional, IsUUID, IsInt, Min, IsArray, IsDateString } from 'class-validator';

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
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(3)
  username: string;

  @IsString()
  @MinLength(6)
  password: string;
}

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}

export class CreateTaskDto {
  @IsString()
  @MinLength(1)
  title: string;

  @IsString()
  description: string;

  @IsEnum(TaskPriority)
  priority: TaskPriority;

  @IsDateString()
  deadline: string;

  @IsArray()
  @IsUUID(4, { each: true })
  @IsOptional()
  assignedUserIds?: string[];
}

export class UpdateTaskDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(TaskStatus)
  @IsOptional()
  status?: TaskStatus;

  @IsEnum(TaskPriority)
  @IsOptional()
  priority?: TaskPriority;

  @IsDateString()
  @IsOptional()
  deadline?: string;

  @IsArray()
  @IsUUID(4, { each: true })
  @IsOptional()
  assignedUserIds?: string[];
}

export class CreateCommentDto {
  @IsString()
  @MinLength(1)
  content: string;
}

export class PaginationDto {
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

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