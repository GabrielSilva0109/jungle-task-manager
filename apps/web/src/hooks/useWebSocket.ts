import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../stores/auth';
import { useNotifications } from '../components/NotificationSystem';

export function useWebSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const { user, tokens } = useAuthStore();
  const { success, info, error } = useNotifications();
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const hasConnectedRef = useRef(false);

  const connectSocket = useCallback(() => {
    // Prevent multiple connections
    if (socket?.connected || hasConnectedRef.current) {
      return;
    }

    if (!user || !tokens) {
      console.log('❌ Missing user or tokens for WebSocket connection');
      return;
    }

    hasConnectedRef.current = true;

    const newSocket = io('http://localhost:3001', {
      transports: ['websocket'],
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      timeout: 20000,
      forceNew: true, 
    });

    newSocket.on('connect', () => {
      setIsConnected(true);
      
      // Authenticate with JWT token
      newSocket.emit('authenticate', { token: tokens.accessToken });
      
      // Join user's room for personalized notifications
      newSocket.emit('join', { userId: user.id });
      
      // Only show success toast once
      if (!hasConnectedRef.current) {
        success('Conectado', 'WebSocket conectado com sucesso!');
      }
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
      hasConnectedRef.current = false;
    });

    newSocket.on('connect_error', (err) => {
      setIsConnected(false);
      hasConnectedRef.current = false;
      
      // Try to reconnect after delay
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      reconnectTimeoutRef.current = setTimeout(() => {
        if (user && tokens) {
          connectSocket();
        }
      }, 3000);
    });

    // Listen for real-time events (remove duplicates by using once)
    newSocket.off('task:created');
    newSocket.on('task:created', (data: any) => {
      info('Nova Tarefa', `Tarefa criada: ${data.title || 'Nova tarefa'}`);
    });

    newSocket.off('task:updated');
    newSocket.on('task:updated', (data: { taskId: string; changes: any }) => {
      const { taskId, changes } = data;
      
      let message = 'Tarefa atualizada';
      if (changes.status) {
        message = `Status alterado para: ${changes.status}`;
      }
      
      info('Tarefa Atualizada', message);
    });

    newSocket.off('comment:new');
    newSocket.on('comment:new', (data: { taskId: string; comment: any }) => {
      info('Novo Comentário', `Novo comentário adicionado na tarefa`);
    });

    newSocket.off('notification');
    newSocket.on('notification', (notification: any) => {
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
  }, [user, tokens, socket]);

  const disconnect = useCallback(() => {
    if (socket) {
      socket.off(); 
      socket.disconnect();
      setSocket(null);
      setIsConnected(false);
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    hasConnectedRef.current = false;
  }, [socket]);

  useEffect(() => {
    if (user && tokens && !socket?.connected) {
      connectSocket();
    } else if (!user || !tokens) {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [user, tokens]);

  return {
    socket,
    isConnected,
    connect: connectSocket,
    disconnect,
  };
}