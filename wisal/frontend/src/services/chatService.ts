import api from './api'
import type { Conversation, Message, SendMessageDto } from '@/types/chat'

/**
 * Chat Service
 * 
 * Manages real-time chat functionality for consultations.
 * Handles:
 * - Conversation management (create, retrieve, list)
 * - Message operations (send, receive, pagination)
 * - File attachments in messages
 * - Conversation status updates
 * 
 * @module chatService
 */
export const chatService = {
  /**
   * Retrieves all conversations for the current user
   * @returns Array of conversations
   */
  async getConversations(): Promise<Conversation[]> {
    const response = await api.get<Conversation[]>('/conversations')
    return response.data
  },

  /**
   * Gets a specific conversation by ID
   * @param conversationId - Unique conversation identifier
   * @returns Conversation details
   */
  async getConversation(conversationId: string): Promise<Conversation> {
    const response = await api.get<Conversation>(`/conversations/${conversationId}`)
    return response.data
  },

  /**
   * Creates a new conversation with a lawyer
   * @param lawyerId - ID of the lawyer to chat with
   * @param initialMessage - First message to send
   * @returns Newly created conversation
   */
  async createConversation(lawyerId: string, initialMessage: string): Promise<Conversation> {
    const response = await api.post<Conversation>('/conversations', {
      lawyerId,
      message: initialMessage,
    })
    return response.data
  },

  /**
   * Retrieves paginated messages for a conversation
   * @param conversationId - Conversation ID
   * @param page - Page number (default: 1)
   * @param limit - Messages per page (default: 50)
   * @returns Array of messages
   */
  async getMessages(conversationId: string, page = 1, limit = 50): Promise<Message[]> {
    const response = await api.get<Message[]>(`/conversations/${conversationId}/messages`, {
      params: { page, limit },
    })
    return response.data
  },

  /**
   * Sends a message with optional file attachments
   * @param conversationId - Target conversation ID
   * @param data - Message content and optional attachments
   * @returns Sent message
   */
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