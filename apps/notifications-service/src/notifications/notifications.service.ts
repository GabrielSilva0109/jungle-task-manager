import {
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import axios from 'axios';

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
    task?: any;
  }) {
    const { taskId, userId, assignedUserIds, task } = data;

    console.log('📬 Handling task created event:', { taskId, userId, assignedUserIds });

    try {
      // Get creator info from auth service via HTTP
      let creator = { username: 'Usuário' };
      try {
        const response = await axios.get(`http://auth-service:3002/user/${userId}`);
        creator = response.data;
      } catch (error) {
        console.warn('Could not fetch creator info:', error);
      }

      // Notify assigned users
      for (const assignedUserId of assignedUserIds) {
        if (assignedUserId !== userId) {
          await this.createNotification(
            assignedUserId,
            'Nova Tarefa Atribuída',
            `${creator?.username || 'Alguém'} atribuiu uma nova tarefa para você: ${task?.title || 'Tarefa'}`,
            NotificationType.TASK_ASSIGNED,
            taskId,
          );
        }
      }

      console.log('✅ Task created notifications sent successfully');
    } catch (error) {
      console.error('Error handling task created:', error);
    }
  }

  async handleTaskUpdated(data: {
    taskId: string;
    userId: string;
    changes: any;
    assignedUserIds: string[];
    task?: any;
  }) {
    const { taskId, userId, changes, assignedUserIds, task } = data;

    console.log('📬 Handling task updated event:', { taskId, userId, changes });

    try {
      // Get updater info from auth service via HTTP
      let updater = { username: 'Usuário' };
      try {
        const response = await axios.get(`http://auth-service:3002/user/${userId}`);
        updater = response.data;
      } catch (error) {
        console.warn('Could not fetch updater info:', error);
      }

      // Notify assigned users about updates
      for (const assignedUserId of assignedUserIds) {
        if (assignedUserId !== userId) {
          let message = `${updater?.username || 'Alguém'} atualizou a tarefa: ${task?.title || 'Tarefa'}`;
          
          if (changes.status) {
            message = `${updater?.username || 'Alguém'} alterou o status da tarefa "${task?.title || 'Tarefa'}" para ${changes.status}.`;
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

      console.log('✅ Task updated notifications sent successfully');
    } catch (error) {
      console.error('Error handling task updated:', error);
    }
  }

  async handleCommentCreated(data: {
    taskId: string;
    commentId: string;
    authorId: string;
    comment: any;
  }) {
    const { taskId, authorId } = data;
    console.log('📝 Handling comment created event:', { taskId, authorId });

    try {
      // Create a simple notification without complex user fetching for now
      await this.createNotification(
        authorId, // For now, notify the author
        'Novo Comentário',
        `Comentário adicionado na tarefa`,
        NotificationType.COMMENT_ADDED,
        taskId,
      );
      
      console.log('✅ Comment notification created successfully');
    } catch (error) {
      console.error('❌ Error handling comment created:', error);
    }
  }
}