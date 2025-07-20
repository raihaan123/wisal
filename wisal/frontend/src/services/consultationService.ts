import api from './api'
import type { User } from '@/types/auth'

export interface Consultation {
  id: string
  lawyerId: string
  seekerId: string
  type: 'chat' | 'video' | 'phone'
  status: 'pending' | 'active' | 'completed' | 'cancelled'
  scheduledAt?: string
  startedAt?: string
  endedAt?: string
  duration?: number
  topic: string
  description: string
  isAnonymous: boolean
  rating?: number
  review?: string
  lawyer?: User
  seeker?: User
  createdAt: string
  updatedAt: string
}

export interface CreateConsultationDto {
  lawyerId: string
  type: 'chat' | 'video' | 'phone'
  topic: string
  description: string
  isAnonymous?: boolean
  scheduledAt?: string
}

export interface ConsultationMessage {
  id: string
  consultationId: string
  senderId: string
  content: string
  attachments?: {
    id: string
    name: string
    url: string
    type: string
  }[]
  createdAt: string
  readAt?: string
}

export const consultationService = {
  // Create a new consultation request
  async createConsultation(data: CreateConsultationDto): Promise<Consultation> {
    const response = await api.post('/consultations', data)
    return response.data
  },

  // Get user's consultations (as seeker or lawyer)
  async getMyConsultations(role: 'seeker' | 'lawyer', status?: string): Promise<Consultation[]> {
    const params = new URLSearchParams()
    if (status) params.append('status', status)
    params.append('role', role)
    
    const response = await api.get(`/consultations/my?${params}`)
    return response.data
  },

  // Get consultation by ID
  async getConsultationById(id: string): Promise<Consultation> {
    const response = await api.get(`/consultations/${id}`)
    return response.data
  },

  // Update consultation status
  async updateConsultationStatus(id: string, status: Consultation['status']): Promise<Consultation> {
    const response = await api.put(`/consultations/${id}/status`, { status })
    return response.data
  },

  // Get consultation messages
  async getMessages(consultationId: string): Promise<ConsultationMessage[]> {
    const response = await api.get(`/consultations/${consultationId}/messages`)
    return response.data
  },

  // Send a message
  async sendMessage(consultationId: string, content: string, attachments?: File[]): Promise<ConsultationMessage> {
    const formData = new FormData()
    formData.append('content', content)
    
    if (attachments) {
      attachments.forEach(file => {
        formData.append('attachments', file)
      })
    }
    
    const response = await api.post(`/consultations/${consultationId}/messages`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return response.data
  },

  // Mark message as read
  async markMessageAsRead(consultationId: string, messageId: string): Promise<void> {
    await api.put(`/consultations/${consultationId}/messages/${messageId}/read`)
  },

  // Rate and review consultation
  async rateConsultation(id: string, rating: number, review?: string): Promise<Consultation> {
    const response = await api.post(`/consultations/${id}/review`, { rating, review })
    return response.data
  },

  // Get consultation statistics
  async getStatistics(): Promise<{
    total: number
    pending: number
    active: number
    completed: number
    averageRating: number
  }> {
    const response = await api.get('/consultations/statistics')
    return response.data
  }
}