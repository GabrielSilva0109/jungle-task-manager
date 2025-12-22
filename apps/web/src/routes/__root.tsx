import { createRootRoute, Outlet } from '@tanstack/react-router'
import { useAuthStore } from '../stores/auth'
import { useEffect } from 'react'

function RootComponent() {
  const { initialize } = useAuthStore();

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