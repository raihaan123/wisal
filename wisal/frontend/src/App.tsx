import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { useEffect } from 'react'

// Layout components
import MainLayout from '@/components/layout/MainLayout'
import AuthLayout from '@/components/layout/AuthLayout'
import DashboardLayout from '@/components/layout/DashboardLayout'

// Public pages
import LandingPage from '@/pages/LandingPage'
import ActivismHub from '@/pages/ActivismHub'
import LawyerListing from '@/pages/lawyers/LawyerListing'
import LawyerProfile from '@/pages/lawyers/LawyerProfile'

// Auth pages
import Login from '@/pages/auth/Login'
import Register from '@/pages/auth/Register'
import ForgotPassword from '@/pages/auth/ForgotPassword'
import OAuthCallback from '@/pages/auth/OAuthCallback'

// Protected pages
import Dashboard from '@/pages/dashboard/Dashboard'
import ChatInterface from '@/pages/consultations/ChatInterface'

// Route guards
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import PublicRoute from '@/components/auth/PublicRoute'

function App() {
  const { checkAuth } = useAuthStore()

  useEffect(() => {
    checkAuth()
  }, [])

  return (
    <Routes>
      {/* Public routes with main layout */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/activism-hub" element={<ActivismHub />} />
        <Route path="/lawyers" element={<LawyerListing />} />
        <Route path="/lawyers/:id" element={<LawyerProfile />} />
      </Route>

      {/* Auth routes */}
      <Route element={<PublicRoute />}>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
        </Route>
      </Route>

      {/* OAuth callback route - no layout needed */}
      <Route path="/auth/callback" element={<OAuthCallback />} />

      {/* Protected routes with dashboard layout */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          {/* Unified dashboard that routes based on user role */}
          <Route path="/dashboard" element={<Dashboard />} />
          
          {/* Consultation routes */}
          <Route path="/consultations/:id" element={<ChatInterface />} />
        </Route>
      </Route>

      {/* Redirect to home for unknown routes */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App