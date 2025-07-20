import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import SeekerDashboard from './SeekerDashboard'
import LawyerDashboard from './LawyerDashboard'
import AdminDashboard from './AdminDashboard'

export default function Dashboard() {
  const { user } = useAuthStore()

  if (!user) {
    return <Navigate to="/login" replace />
  }

  switch (user.role) {
    case 'activist':
      return <SeekerDashboard />
    case 'lawyer':
      return <LawyerDashboard />
    case 'admin':
      return <AdminDashboard />
    default:
      return <Navigate to="/login" replace />
  }
}