import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { PaginationDto } from '@jungle/types';

@Injectable()
export class NotificationsService {
  private readonly notificationsServiceUrl = process.env.NOTIFICATIONS_SERVICE_URL || 'http://notifications-service:3004';

  constructor() {}

  async findByUser(userId: string, paginationDto: PaginationDto) {
    try {
      const params = new URLSearchParams();
      if (paginationDto.page) params.append('page', paginationDto.page.toString());
      if (paginationDto.size) params.append('size', paginationDto.size.toString());
      
      const response = await axios.get(`${this.notificationsServiceUrl}/notifications/${userId}?${params.toString()}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async markAsRead(id: string) {
    try {
      const response = await axios.patch(`${this.notificationsServiceUrl}/notifications/${id}/read`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async markAllAsRead(userId: string) {
    try {
      const response = await axios.patch(`${this.notificationsServiceUrl}/notifications/read-all`, {
        userId,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}