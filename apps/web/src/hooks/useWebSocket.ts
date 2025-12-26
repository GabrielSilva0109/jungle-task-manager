import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../stores/auth';
import { useNotifications } from '../components/NotificationSystem';

interface WebSocketEvent {
  type: string;
  payload: any;
}

interface TaskCreatedEvent {
  type: 'task:created';
  payload: any;
}

interface TaskUpdatedEvent {
  type: 'task:updated';
  payload: {
    taskId: string;
    changes: any;
  };
}

interface CommentCreatedEvent {
  type: 'comment:new';
  payload: {
    taskId: string;
    comment: any;
  };
}

interface NotificationEvent {
  type: 'notification';
  payload: any;
}

export function useWebSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const { user, token } = useAuthStore();
  const { success, info, error } = useNotifications();
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();

  const connectSocket = () => {
    if (!user || !token) return;

    console.log('🔌 Connecting to WebSocket...');

    const newSocket = io('http://localhost:3004', {
      transports: ['websocket'],
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      timeout: 20000,
    });

    newSocket.on('connect', () => {
      console.log('✅ WebSocket connected');
      setIsConnected(true);
      
      // Authenticate with JWT token
      newSocket.emit('authenticate', { token });
      
      // Join user's room for personalized notifications
      newSocket.emit('join', { userId: user.id });
      
      success('Conectado', 'WebSocket conectado com sucesso!');
    });

    newSocket.on('disconnect', () => {
      console.log('❌ WebSocket disconnected');
      setIsConnected(false);
    });

    newSocket.on('connect_error', (err) => {
      console.error('WebSocket connection error:', err);
      setIsConnected(false);
      
      // Try to reconnect after delay
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      reconnectTimeoutRef.current = setTimeout(() => {
        if (user && token) {
          connectSocket();
        }
      }, 3000);
    });

    // Listen for real-time events
    newSocket.on('task:created', (data: any) => {
      console.log('📝 New task created:', data);
      info('Nova Tarefa', `Tarefa criada: ${data.title || 'Nova tarefa'}`);
    });

    newSocket.on('task:updated', (data: { taskId: string; changes: any }) => {
      console.log('🔄 Task updated:', data);
      const { taskId, changes } = data;
      
      let message = 'Tarefa atualizada';
      if (changes.status) {
        message = `Status alterado para: ${changes.status}`;
      }
      
      info('Tarefa Atualizada', message);
    });

    newSocket.on('comment:new', (data: { taskId: string; comment: any }) => {
      console.log('💬 New comment:', data);
      info('Novo Comentário', `Novo comentário adicionado na tarefa`);
    });

    newSocket.on('notification', (notification: any) => {
      console.log('🔔 New notification:', notification);
      const { title, message, type } = notification;
      
      switch (type) {
        case 'TASK_ASSIGNED':
          info(title || 'Tarefa Atribuída', message);
          break;
        case 'TASK_UPDATED':
          info(title || 'Tarefa Atualizada', message);
          break;
        case 'COMMENT_ADDED':
          info(title || 'Novo Comentário', message);
          break;
        default:
          info(title || 'Notificação', message);
      }
    });

    setSocket(newSocket);

    return newSocket;
  };

  const disconnect = () => {
    if (socket) {
      socket.disconnect();
      setSocket(null);
      setIsConnected(false);
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
  };

  useEffect(() => {
    if (user && token) {
      connectSocket();
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [user, token]);

  return {
    socket,
    isConnected,
    connect: connectSocket,
    disconnect,
  };
}