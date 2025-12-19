import { Controller } from '@nestjs/common';
import { MessagePattern, EventPattern } from '@nestjs/microservices';

import { NotificationsService } from './notifications.service';
import { PaginationDto } from '@jungle/types';

@Controller()
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @MessagePattern('notifications.findByUser')
  async findUserNotifications(data: {
    userId: string;
    paginationDto: PaginationDto;
  }) {
    return this.notificationsService.findUserNotifications(
      data.userId,
      data.paginationDto,
    );
  }

  @MessagePattern('notifications.markAsRead')
  async markAsRead(data: { id: string }) {
    return this.notificationsService.markAsRead(data.id);
  }

  @MessagePattern('notifications.markAllAsRead')
  async markAllAsRead(data: { userId: string }) {
    return this.notificationsService.markAllAsRead(data.userId);
  }

  // Event patterns for RabbitMQ events
  @EventPattern('task.created')
  async handleTaskCreated(data: any) {
    return this.notificationsService.handleTaskCreated(data);
  }

  @EventPattern('task.updated')
  async handleTaskUpdated(data: any) {
    return this.notificationsService.handleTaskUpdated(data);
  }

  @EventPattern('comment.created')
  async handleCommentCreated(data: any) {
    return this.notificationsService.handleCommentCreated(data);
  }
}