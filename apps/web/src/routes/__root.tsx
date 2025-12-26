import { createRootRoute, Outlet } from '@tanstack/react-router'
import { useAuthStore } from '../stores/auth'
import { useWebSocket } from '../hooks/useWebSocket'
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
      <Outlet />
    </div>
  );
}

export const Route = createRootRoute({
  component: RootComponent,
})