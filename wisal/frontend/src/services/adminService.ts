import api from './api'
import type { User } from '@/types/auth'

export interface AdminStatistics {
  totalUsers: number
  totalLawyers: number
  totalActivists: number
  totalConsultations: number
  pendingVerifications: number
  activeConsultations: number
  reportedContent: number
  revenue: {
    daily: number
    weekly: number
    monthly: number
  }
}

export interface VerificationRequest {
  id: string
  userId: string
  user: User
  documents: {
    id: string
    type: string
    url: string
    uploadedAt: string
  }[]
  status: 'pending' | 'approved' | 'rejected'
  reviewedBy?: string
  reviewedAt?: string
  notes?: string
  createdAt: string
}

export interface ContentReport {
  id: string
  reporterId: string
  reporter: User
  targetType: 'user' | 'consultation' | 'message'
  targetId: string
  reason: string
  description: string
  status: 'pending' | 'resolved' | 'dismissed'
  resolvedBy?: string
  resolvedAt?: string
  resolution?: string
  createdAt: string
}

export const adminService = {
  // Get admin dashboard statistics
  async getStatistics(): Promise<AdminStatistics> {
    const response = await api.get('/admin/statistics')
    return response.data
  },

  // Get all users with filters
  async getUsers(filters?: {
    role?: string
    status?: string
    search?: string
    page?: number
    limit?: number
  }): Promise<{
    users: User[]
    total: number
    page: number
    totalPages: number
  }> {
    const params = new URLSearchParams()
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value.toString())
      })
    }
    
    const response = await api.get(`/admin/users?${params}`)
    return response.data
  },

  // Get verification requests
  async getVerificationRequests(status?: 'pending' | 'approved' | 'rejected'): Promise<VerificationRequest[]> {
    const params = status ? `?status=${status}` : ''
    const response = await api.get(`/admin/verifications${params}`)
    return response.data
  },

  // Review verification request
  async reviewVerification(id: string, decision: {
    status: 'approved' | 'rejected'
    notes?: string
  }): Promise<VerificationRequest> {
    const response = await api.put(`/admin/verifications/${id}/review`, decision)
    return response.data
  },

  // Get content reports
  async getContentReports(status?: 'pending' | 'resolved' | 'dismissed'): Promise<ContentReport[]> {
    const params = status ? `?status=${status}` : ''
    const response = await api.get(`/admin/reports${params}`)
    return response.data
  },

  // Resolve content report
  async resolveReport(id: string, resolution: {
    status: 'resolved' | 'dismissed'
    resolution: string
  }): Promise<ContentReport> {
    const response = await api.put(`/admin/reports/${id}/resolve`, resolution)
    return response.data
  },

  // Suspend/unsuspend user
  async toggleUserSuspension(userId: string, suspend: boolean, reason?: string): Promise<User> {
    const response = await api.put(`/admin/users/${userId}/suspension`, { suspend, reason })
    return response.data
  },

  // Delete user
  async deleteUser(userId: string): Promise<void> {
    await api.delete(`/admin/users/${userId}`)
  },

  // Get system logs
  async getSystemLogs(filters?: {
    type?: string
    startDate?: string
    endDate?: string
    page?: number
    limit?: number
  }): Promise<{
    logs: Array<{
      id: string
      type: string
      action: string
      userId?: string
      metadata?: any
      createdAt: string
    }>
    total: number
  }> {
    const params = new URLSearchParams()
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value.toString())
      })
    }
    
    const response = await api.get(`/admin/logs?${params}`)
    return response.data
  },

  // Get revenue analytics
  async getRevenueAnalytics(period: 'daily' | 'weekly' | 'monthly' | 'yearly'): Promise<{
    labels: string[]
    data: number[]
    total: number
    average: number
  }> {
    const response = await api.get(`/admin/analytics/revenue?period=${period}`)
    return response.data
  }
}