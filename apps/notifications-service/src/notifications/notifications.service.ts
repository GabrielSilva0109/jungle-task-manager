import {
  Injectable,
  Inject,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

import { Notification } from '../entities/notification.entity';
import { WebsocketGateway } from '../websocket/websocket.gateway';
import {
  NotificationType,
  PaginationDto,
  PaginatedResponse,
} from '@jungle/types';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
    @Inject('AUTH_SERVICE')
    private authClient: ClientProxy,
    private websocketGateway: WebsocketGateway,
  ) {}

  async createNotification(
    userId: string,
    title: string,
    message: string,
    type: NotificationType,
    taskId?: string,
  ): Promise<Notification> {
    const notification = this.notificationRepository.create({
      userId,
      title,
      message,
      type,
      taskId,
    });

    const savedNotification = await this.notificationRepository.save(notification);

    // Send via WebSocket
    this.websocketGateway.sendNotificationToUser(userId, {
      type: 'notification',
      payload: savedNotification,
    });

    return savedNotification;
  }

  async findUserNotifications(
    userId: string,
    paginationDto: PaginationDto,
  ): Promise<PaginatedResponse<Notification>> {
    const { page = 1, size = 10 } = paginationDto;
    const skip = (page - 1) * size;

    const [notifications, total] = await this.notificationRepository.findAndCount({
      where: { userId },
      order: { createdAt: 'DESC' },
      skip,
      take: size,
    });

    return {
      data: notifications,
      meta: {
        page,
        size,
        total,
        totalPages: Math.ceil(total / size),
      },
    };
  }

  async markAsRead(id: string): Promise<Notification> {
    await this.notificationRepository.update(id, { read: true });
    return this.notificationRepository.findOne({ where: { id } });
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationRepository.update(
      { userId, read: false },
      { read: true },
    );
  }

  async handleTaskCreated(data: {
    taskId: string;
    userId: string;
    assignedUserIds: string[];
  }) {
    const { taskId, userId, assignedUserIds } = data;

    // Get creator info
    try {
      const creator = await firstValueFrom(
        this.authClient.send('auth.user', { userId }),
      );

      // Notify assigned users
      for (const assignedUserId of assignedUserIds) {
        if (assignedUserId !== userId) {
          await this.createNotification(
            assignedUserId,
            'Nova Tarefa Atribuída',
            `${creator?.username || 'Alguém'} atribuiu uma nova tarefa para você.`,
            NotificationType.TASK_ASSIGNED,
            taskId,
          );
        }
      }
    } catch (error) {
      console.error('Error handling task created:', error);
    }
  }

  async handleTaskUpdated(data: {
    taskId: string;
    userId: string;
    changes: any;
    assignedUserIds: string[];
  }) {
    const { taskId, userId, changes, assignedUserIds } = data;

    try {
      const updater = await firstValueFrom(
        this.authClient.send('auth.user', { userId }),
      );

      // Notify assigned users about updates
      for (const assignedUserId of assignedUserIds) {
        if (assignedUserId !== userId) {
          let message = `${updater?.username || 'Alguém'} atualizou uma tarefa.`;
          
          if (changes.status) {
            message = `${updater?.username || 'Alguém'} alterou o status da tarefa para ${changes.status}.`;
          }

          await this.createNotification(
            assignedUserId,
            'Tarefa Atualizada',
            message,
            NotificationType.TASK_UPDATED,
            taskId,
          );
        }
      }
    } catch (error) {
      console.error('Error handling task updated:', error);
    }
  }

  async handleCommentCreated(data: {
    taskId: string;
    commentId: string;
    authorId: string;
  }) {
    const { taskId, authorId } = data;

    try {
      const author = await firstValueFrom(
        this.authClient.send('auth.user', { userId: authorId }),
      );

      // For now, we'll need to get task assignments from the tasks service
      // In a real implementation, you might want to cache this or have a different approach
      // For simplicity, we'll skip this for now and focus on the WebSocket functionality
      
      console.log(`New comment on task ${taskId} by ${author?.username}`);
    } catch (error) {
      console.error('Error handling comment created:', error);
    }
  }
}