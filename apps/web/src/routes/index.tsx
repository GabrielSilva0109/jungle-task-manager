import { createFileRoute, Navigate } from '@tanstack/react-router'
import Dashboard from '../pages/Dashboard'
import { useAuthStore } from '../stores/auth'

export const Route = createFileRoute('/')({
  component: Index,
})

function Index() {
  const { isAuthenticated } = useAuthStore()
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />
  }
  
  return <Dashboard />
}