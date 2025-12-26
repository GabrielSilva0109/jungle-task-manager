import React from 'react';
import { Wifi, WifiOff } from 'lucide-react';
import { useWebSocket } from '../hooks/useWebSocket';

export function WebSocketStatus() {
  const { isConnected } = useWebSocket();

  return (
    <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-medium ${
      isConnected 
        ? 'bg-green-100 text-green-800' 
        : 'bg-red-100 text-red-800'
    }`}>
      {isConnected ? (
        <>
          <Wifi className="w-3 h-3" />
          <span>Conectado</span>
        </>
      ) : (
        <>
          <WifiOff className="w-3 h-3" />
          <span>Desconectado</span>
        </>
      )}
    </div>
  );
}