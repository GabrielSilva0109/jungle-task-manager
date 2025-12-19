import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { PaginationDto } from '@jungle/types';

@Injectable()
export class NotificationsService {
  constructor(
    @Inject('NOTIFICATIONS_SERVICE')
    private notificationsClient: ClientProxy,
  ) {}

  async findByUser(userId: string, paginationDto: PaginationDto) {
    return firstValueFrom(
      this.notificationsClient.send('notifications.findByUser', { userId, paginationDto }),
    );
  }

  async markAsRead(id: string) {
    return firstValueFrom(
      this.notificationsClient.send('notifications.markAsRead', { id }),
    );
  }

  async markAllAsRead(userId: string) {
    return firstValueFrom(
      this.notificationsClient.send('notifications.markAllAsRead', { userId }),
    );
  }
}