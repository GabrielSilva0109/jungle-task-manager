import React from 'react';
import { Button } from './ui/button';
import { useWebSocket } from '../hooks/useWebSocket';
import { useNotifications } from './NotificationSystem';
import { useAuthStore } from '../stores/auth';

export function WebSocketTester() {
  const { socket, isConnected } = useWebSocket();
  const { info, success, error } = useNotifications();
  const { user, token } = useAuthStore();

  const testTaskCreated = () => {
    if (!socket || !isConnected) {
      error('WebSocket', 'Não conectado ao WebSocket');
      return;
    }

    // Simulate a task created event
    const testEvent = {
      type: 'task:created',
      payload: {
        id: 'test-' + Date.now(),
        title: 'Tarefa de Teste WebSocket',
        description: 'Esta é uma tarefa criada para testar o WebSocket',
        createdBy: user?.name || 'Usuário Teste',
        createdAt: new Date().toISOString(),
      }
    };

    // Emit test event
    socket.emit('test-event', testEvent);
    success('Teste WebSocket', 'Evento de teste enviado!');
  };

  const testTaskUpdated = () => {
    if (!socket || !isConnected) {
      error('WebSocket', 'Não conectado ao WebSocket');
      return;
    }

    const testEvent = {
      type: 'task:updated',
      payload: {
        taskId: 'test-task-123',
        changes: {
          status: 'IN_PROGRESS',
          updatedBy: user?.name || 'Usuário Teste',
          updatedAt: new Date().toISOString(),
        }
      }
    };

    socket.emit('test-event', testEvent);
    success('Teste WebSocket', 'Evento de atualização enviado!');
  };

  const testComment = () => {
    if (!socket || !isConnected) {
      error('WebSocket', 'Não conectado ao WebSocket');
      return;
    }

    const testEvent = {
      type: 'comment:new',
      payload: {
        taskId: 'test-task-123',
        comment: {
          id: 'comment-' + Date.now(),
          content: 'Este é um comentário de teste via WebSocket',
          createdBy: user?.name || 'Usuário Teste',
          createdAt: new Date().toISOString(),
        }
      }
    };

    socket.emit('test-event', testEvent);
    success('Teste WebSocket', 'Evento de comentário enviado!');
  };

  const testNotification = () => {
    if (!socket || !isConnected) {
      error('WebSocket', 'Não conectado ao WebSocket');
      return;
    }

    const testNotification = {
      type: 'TASK_ASSIGNED',
      title: 'Nova Tarefa Atribuída',
      message: 'Você foi atribuído a uma nova tarefa: Implementar WebSocket',
      userId: user?.id,
      createdAt: new Date().toISOString(),
    };

    socket.emit('test-notification', testNotification);
    success('Teste WebSocket', 'Notificação de teste enviada!');
  };

  if (!user || !token) {
    return (
      <div className="p-4 border rounded-lg bg-yellow-50 border-yellow-200">
        <p className="text-sm text-yellow-800">
          Faça login para testar o WebSocket
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 border rounded-lg bg-white shadow-sm">
      <h3 className="text-lg font-semibold mb-4">Testes WebSocket</h3>
      
      <div className="space-y-2">
        <div className="flex items-center space-x-2 text-sm">
          <span className="font-medium">Status:</span>
          <span className={`px-2 py-1 rounded text-xs ${
            isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {isConnected ? 'Conectado' : 'Desconectado'}
          </span>
        </div>
        
        {token && (
          <div className="flex items-center space-x-2 text-sm">
            <span className="font-medium">Usuário:</span>
            <span className="text-gray-600">{user?.name}</span>
          </div>
        )}
      </div>
      
      <div className="mt-4 space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <Button 
            onClick={testTaskCreated}
            disabled={!isConnected}
            variant="outline"
            size="sm"
          >
            Testar Tarefa Criada
          </Button>
          
          <Button 
            onClick={testTaskUpdated}
            disabled={!isConnected}
            variant="outline"
            size="sm"
          >
            Testar Tarefa Atualizada
          </Button>
          
          <Button 
            onClick={testComment}
            disabled={!isConnected}
            variant="outline"
            size="sm"
          >
            Testar Comentário
          </Button>
          
          <Button 
            onClick={testNotification}
            disabled={!isConnected}
            variant="outline"
            size="sm"
          >
            Testar Notificação
          </Button>
        </div>
      </div>
    </div>
  );
}