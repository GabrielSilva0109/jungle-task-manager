import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: ['http://localhost:3000', 'http://web:3000'],
    credentials: true,
  },
})
export class WebsocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private connectedUsers = new Map<string, string>(); // userId -> socketId

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
    
    // Remove user from connected users map
    for (const [userId, socketId] of this.connectedUsers.entries()) {
      if (socketId === client.id) {
        this.connectedUsers.delete(userId);
        break;
      }
    }
  }

  @SubscribeMessage('join')
  handleJoin(client: Socket, data: { userId: string }) {
    const { userId } = data;
    this.connectedUsers.set(userId, client.id);
    client.join(`user_${userId}`);
    console.log(`User ${userId} joined with socket ${client.id}`);
  }

  @SubscribeMessage('leave')
  handleLeave(client: Socket, data: { userId: string }) {
    const { userId } = data;
    this.connectedUsers.delete(userId);
    client.leave(`user_${userId}`);
    console.log(`User ${userId} left`);
  }

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