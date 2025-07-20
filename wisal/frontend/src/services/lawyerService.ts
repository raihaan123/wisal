import api from './api'
import type { User, LawyerProfile } from '@/types/auth'

export interface LawyerFilter {
  specializations?: string[]
  languages?: string[]
  location?: {
    city?: string
    state?: string
    country?: string
  }
  minRating?: number
  consultationTypes?: ('chat' | 'video' | 'phone')[]
  page?: number
  limit?: number
}

export interface LawyerListResponse {
  lawyers: User[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface LawyerAvailability {
  date: string
  slots: {
    time: string
    available: boolean
  }[]
}

export const lawyerService = {
  // Get list of lawyers with filters
  async getLawyers(filters?: LawyerFilter): Promise<LawyerListResponse> {
    const params = new URLSearchParams()
    
    if (filters) {
      if (filters.specializations?.length) {
        params.append('specializations', filters.specializations.join(','))
      }
      if (filters.languages?.length) {
        params.append('languages', filters.languages.join(','))
      }
      if (filters.location?.city) {
        params.append('city', filters.location.city)
      }
      if (filters.location?.state) {
        params.append('state', filters.location.state)
      }
      if (filters.location?.country) {
        params.append('country', filters.location.country)
      }
      if (filters.minRating) {
        params.append('minRating', filters.minRating.toString())
      }
      if (filters.consultationTypes?.length) {
        params.append('consultationTypes', filters.consultationTypes.join(','))
      }
      if (filters.page) {
        params.append('page', filters.page.toString())
      }
      if (filters.limit) {
        params.append('limit', filters.limit.toString())
      }
    }
    
    const response = await api.get(`/lawyers?${params}`)
    return response.data
  },

  // Get lawyer by ID
  async getLawyerById(id: string): Promise<User> {
    const response = await api.get(`/lawyers/${id}`)
    return response.data
  },

  // Get lawyer availability
  async getAvailability(lawyerId: string, month: string): Promise<LawyerAvailability[]> {
    const response = await api.get(`/lawyers/${lawyerId}/availability`, {
      params: { month }
    })
    return response.data
  },

  // Update lawyer profile
  async updateProfile(id: string, data: Partial<LawyerProfile>): Promise<User> {
    const response = await api.put(`/lawyers/${id}/profile`, data)
    return response.data
  },

  // Update availability
  async updateAvailability(id: string, availability: { days: string[], hours: string }): Promise<void> {
    await api.put(`/lawyers/${id}/availability`, availability)
  },

  // Get lawyer statistics
  async getStatistics(id: string): Promise<{
    totalConsultations: number
    completedConsultations: number
    averageRating: number
    monthlyEarnings: number
    upcomingConsultations: number
  }> {
    const response = await api.get(`/lawyers/${id}/statistics`)
    return response.data
  }
}