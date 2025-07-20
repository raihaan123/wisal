import api from './api'
import type { Conversation, Message, SendMessageDto } from '@/types/chat'

export const chatService = {
  async getConversations(): Promise<Conversation[]> {
    const response = await api.get<Conversation[]>('/conversations')
    return response.data
  },

  async getConversation(conversationId: string): Promise<Conversation> {
    const response = await api.get<Conversation>(`/conversations/${conversationId}`)
    return response.data
  },

  async createConversation(lawyerId: string, initialMessage: string): Promise<Conversation> {
    const response = await api.post<Conversation>('/conversations', {
      lawyerId,
      message: initialMessage,
    })
    return response.data
  },

  async getMessages(conversationId: string, page = 1, limit = 50): Promise<Message[]> {
    const response = await api.get<Message[]>(`/conversations/${conversationId}/messages`, {
      params: { page, limit },
    })
    return response.data
  },

  async sendMessage(conversationId: string, data: SendMessageDto): Promise<Message> {
    const formData = new FormData()
    formData.append('content', data.content)
    
    if (data.attachments) {
      data.attachments.forEach((file) => {
        formData.append('attachments', file)
      })
    }

    const response = await api.post<Message>(
      `/conversations/${conversationId}/messages`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    )
    return response.data
  },

  async markAsRead(conversationId: string): Promise<void> {
    await api.put(`/conversations/${conversationId}/read`)
  },

  async closeConversation(conversationId: string): Promise<void> {
    await api.put(`/conversations/${conversationId}/close`)
  },
}