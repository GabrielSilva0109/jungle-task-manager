import React from 'react';

interface StatusIndicatorProps {
  isOnline?: boolean;
  lastSync?: Date;
}

export default function StatusIndicator({ isOnline = true, lastSync }: StatusIndicatorProps) {
  return (
    <div className="flex items-center space-x-2 text-sm">
      <div className="flex items-center space-x-1">
        <div 
          className={`w-2 h-2 rounded-full ${
            isOnline ? 'bg-green-500' : 'bg-red-500'
          }`}
        />
        <span className={isOnline ? 'text-green-600' : 'text-red-600'}>
          {isOnline ? 'Online' : 'Offline'}
        </span>
      </div>
      
      {lastSync && (
        <div className="text-gray-500">
          • Sincronizado {lastSync.toLocaleTimeString()}
        </div>
      )}
    </div>
  );
}