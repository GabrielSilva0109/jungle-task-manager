import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
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
  const recentNotificationsRef = useRef<Set<string>>(new Set());

  const addNotification = useCallback((
    type: Notification['type'],
    title: string,
    message: string,
    duration = 5000
  ) => {
    // Create a unique key for deduplication
    const notificationKey = `${type}-${title}-${message}`;
    
    // Prevent duplicate notifications within 2 seconds
    if (recentNotificationsRef.current.has(notificationKey)) {
      console.log('🚫 Duplicate notification prevented:', { type, title, message });
      return;
    }
    
    recentNotificationsRef.current.add(notificationKey);
    
    // Remove from recent notifications after 2 seconds
    setTimeout(() => {
      recentNotificationsRef.current.delete(notificationKey);
    }, 2000);
    
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
    <div className="fixed top-4 right-4 z-50 space-y-3 w-96">
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
        return <CheckCircle className="w-6 h-6 text-green-600" />;
      case 'info':
        return <Info className="w-6 h-6 text-blue-600" />;
      case 'error':
        return <AlertCircle className="w-6 h-6 text-red-600" />;
      case 'warning':
        return <AlertCircle className="w-6 h-6 text-amber-600" />;
      default:
        return <Info className="w-6 h-6 text-blue-600" />;
    }
  };

  const getBackgroundColor = () => {
    switch (notification.type) {
      case 'success':
        return 'bg-green-50 border-green-300 shadow-green-100';
      case 'info':
        return 'bg-blue-50 border-blue-300 shadow-blue-100';
      case 'error':
        return 'bg-red-50 border-red-300 shadow-red-100';
      case 'warning':
        return 'bg-amber-50 border-amber-300 shadow-amber-100';
      default:
        return 'bg-blue-50 border-blue-300 shadow-blue-100';
    }
  };

  return (
    <div className={`
      w-full min-w-0
      border-2 rounded-xl shadow-xl
      p-5 ${getBackgroundColor()}
      transform transition-all duration-300 ease-in-out
      hover:scale-105 hover:shadow-2xl
      animate-in slide-in-from-right fade-in
      backdrop-blur-sm
    `}>
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0 pt-1">
          {getIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-base font-semibold text-gray-900 leading-tight">
            {notification.title}
          </p>
          <p className="mt-2 text-sm text-gray-700 leading-relaxed">
            {notification.message}
          </p>
        </div>
        <div className="flex-shrink-0">
          <button
            className="bg-white/80 hover:bg-white rounded-full p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-sm"
            onClick={onClose}
          >
            <span className="sr-only">Close</span>
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}