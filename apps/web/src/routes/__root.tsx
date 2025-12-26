import { createRootRoute, Outlet } from '@tanstack/react-router'
import { useAuthStore } from '../stores/auth'
import { useWebSocket } from '../hooks/useWebSocket'
import { WebSocketStatus } from '../components/WebSocketStatus'
import { useEffect } from 'react'

function RootComponent() {
  const { initialize } = useAuthStore();
  
  // Initialize WebSocket connection when app loads
  useWebSocket();

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed top-4 left-4 z-50">
        <WebSocketStatus />
      </div>
      <Outlet />
    </div>
  );
}

export const Route = createRootRoute({
  component: RootComponent,
})