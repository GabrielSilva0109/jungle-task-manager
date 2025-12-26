import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, Info, AlertCircle, X } from 'lucide-react';

interface Notification {
  id: string;
  type: 'success' | 'info' | 'error' | 'warning';
  title: string;
  message: string;
  duration?: number;
}

interface NotificationContextValue {
  notifications: Notification[];
  success: (title: string, message: string, duration?: number) => void;
  info: (title: string, message: string, duration?: number) => void;
  error: (title: string, message: string, duration?: number) => void;
  warning: (title: string, message: string, duration?: number) => void;
  remove: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback((
    type: Notification['type'],
    title: string,
    message: string,
    duration = 5000
  ) => {
    const id = Math.random().toString(36).substring(2);
    
    setNotifications(prev => [...prev, { id, type, title, message, duration }]);

    if (duration > 0) {
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== id));
      }, duration);
    }
  }, []);

  const remove = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const success = useCallback((title: string, message: string, duration?: number) => {
    addNotification('success', title, message, duration);
  }, [addNotification]);

  const info = useCallback((title: string, message: string, duration?: number) => {
    addNotification('info', title, message, duration);
  }, [addNotification]);

  const error = useCallback((title: string, message: string, duration?: number) => {
    addNotification('error', title, message, duration);
  }, [addNotification]);

  const warning = useCallback((title: string, message: string, duration?: number) => {
    addNotification('warning', title, message, duration);
  }, [addNotification]);

  return (
    <NotificationContext.Provider value={{
      notifications,
      success,
      info,
      error,
      warning,
      remove
    }}>
      {children}
      <NotificationContainer notifications={notifications} onRemove={remove} />
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
function NotificationContainer({ 
  notifications, 
  onRemove 
}: { 
  notifications: Notification[];
  onRemove: (id: string) => void;
}) {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map((notification) => (
        <NotificationToast
          key={notification.id}
          notification={notification}
          onClose={() => onRemove(notification.id)}
        />
      ))}
    </div>
  );
}

function NotificationToast({ 
  notification, 
  onClose 
}: { 
  notification: Notification;
  onClose: () => void;
}) {
  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getBackgroundColor = () => {
    switch (notification.type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'info':
        return 'bg-blue-50 border-blue-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  return (
    <div className={`
      max-w-sm w-full 
      border rounded-lg shadow-lg
      p-4 ${getBackgroundColor()}
      animate-in slide-in-from-right
      duration-300
    `}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          {getIcon()}
        </div>
        <div className="ml-3 w-0 flex-1">
          <p className="text-sm font-medium text-gray-900">
            {notification.title}
          </p>
          <p className="mt-1 text-sm text-gray-500">
            {notification.message}
          </p>
        </div>
        <div className="ml-4 flex-shrink-0 flex">
          <button
            className="bg-transparent rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            onClick={onClose}
          >
            <span className="sr-only">Close</span>
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}