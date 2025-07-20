import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'

export default function PublicRoute() {
  const { isAuthenticated, user } = useAuthStore()

  if (isAuthenticated && user) {
    // Redirect to appropriate dashboard based on role
    switch (user.role) {
      case 'activist':
        return <Navigate to="/dashboard/activist" replace />
      case 'lawyer':
        return <Navigate to="/dashboard/lawyer" replace />
      case 'admin':
        return <Navigate to="/dashboard/admin" replace />
      default:
        return <Navigate to="/" replace />
    }
  }

  return <Outlet />
}