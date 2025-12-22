import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';

interface Notification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
  timestamp: Date;
}

interface NotificationSystemProps {
  notifications: Notification[];
  onRemove: (id: string) => void;
}

export function NotificationSystem({ notifications, onRemove }: NotificationSystemProps) {
  useEffect(() => {
    notifications.forEach((notification) => {
      const timer = setTimeout(() => {
        onRemove(notification.id);
      }, 5000); // Auto-remove after 5 seconds

      return () => clearTimeout(timer);
    });
  }, [notifications, onRemove]);

  if (notifications.length === 0) return null;

  const getNotificationStyle = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return 'border-l-4 border-green-500 bg-green-50';
      case 'error':
        return 'border-l-4 border-red-500 bg-red-50';
      case 'warning':
        return 'border-l-4 border-yellow-500 bg-yellow-50';
      case 'info':
      default:
        return 'border-l-4 border-blue-500 bg-blue-50';
    }
  };

  const getIconForType = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'info':
      default:
        return 'ℹ️';
    }
  };

  return (
    <div className="fixed top-4 right-4 space-y-2 z-50">
      {notifications.map((notification) => (
        <Card
          key={notification.id}
          className={`w-80 ${getNotificationStyle(notification.type)} shadow-lg`}
        >
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div className="flex items-start space-x-3">
                <span className="text-lg">
                  {getIconForType(notification.type)}
                </span>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">
                    {notification.title}
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">
                    {notification.message}
                  </p>
                  <p className="text-xs text-gray-400 mt-2">
                    {notification.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRemove(notification.id)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// Hook for managing notifications
export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = (
    type: Notification['type'],
    title: string,
    message: string
  ) => {
    const notification: Notification = {
      id: Date.now().toString(),
      type,
      title,
      message,
      timestamp: new Date(),
    };
    setNotifications(prev => [...prev, notification]);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return {
    notifications,
    addNotification,
    removeNotification,
    success: (title: string, message: string) => addNotification('success', title, message),
    error: (title: string, message: string) => addNotification('error', title, message),
    warning: (title: string, message: string) => addNotification('warning', title, message),
    info: (title: string, message: string) => addNotification('info', title, message),
  };
}