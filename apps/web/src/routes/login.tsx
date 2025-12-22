import { createFileRoute, Navigate } from '@tanstack/react-router'
import { useAuthStore } from '../stores/auth'
import AuthPage from '@/pages/AuthPage'

export const Route = createFileRoute('/login')({
  component: LoginRoute,
})

function LoginRoute() {
  const { isAuthenticated } = useAuthStore()
  
  if (isAuthenticated) {
    return <Navigate to="/" />
  }
  
  return <AuthPage />
}