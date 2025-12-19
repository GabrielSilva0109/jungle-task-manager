import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';

@WebSocketGateway({
  cors: {
    origin: ['http://localhost:3000', 'http://web:3000'],
    credentials: true,
  },
})
export class WebsocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private jwtService: JwtService) {}

  private connectedUsers = new Map<string, string>(); // userId -> socketId

  handleConnection(client: Socket) {
    console.log(`Client connected to API Gateway: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected from API Gateway: ${client.id}`);
    
    // Remove user from connected users map
    for (const [userId, socketId] of this.connectedUsers.entries()) {
      if (socketId === client.id) {
        this.connectedUsers.delete(userId);
        break;
      }
    }
  }

  @SubscribeMessage('authenticate')
  async handleAuthenticate(client: Socket, data: { token: string }) {
    try {
      const decoded = this.jwtService.verify(data.token);
      const userId = decoded.sub;
      
      this.connectedUsers.set(userId, client.id);
      client.join(`user_${userId}`);
      
      client.emit('authenticated', { success: true });
      console.log(`User ${userId} authenticated and joined room`);
    } catch (error) {
      client.emit('authenticated', { success: false, error: 'Invalid token' });
    }
  }

  // Proxy methods for notifications service
  sendNotificationToUser(userId: string, notification: any) {
    this.server.to(`user_${userId}`).emit('notification', notification);
  }

  sendTaskUpdate(taskId: string, update: any) {
    this.server.emit('task:updated', { taskId, ...update });
  }

  sendCommentUpdate(taskId: string, comment: any) {
    this.server.emit('comment:new', { taskId, comment });
  }

  sendTaskCreated(task: any) {
    this.server.emit('task:created', task);
  }
}