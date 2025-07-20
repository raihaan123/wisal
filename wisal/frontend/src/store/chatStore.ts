import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { chatService } from '@/services/chatService'
import type { Conversation, Message } from '@/types/chat'

interface ChatState {
  conversations: Conversation[]
  activeConversation: Conversation | null
  messages: Message[]
  isLoading: boolean
  error: string | null
  unreadCount: number
  
  // Actions
  loadConversations: () => Promise<void>
  loadConversation: (conversationId: string) => Promise<void>
  sendMessage: (content: string, attachments?: File[]) => Promise<void>
  createConversation: (lawyerId: string, message: string) => Promise<Conversation>
  markAsRead: (conversationId: string) => Promise<void>
  setActiveConversation: (conversation: Conversation | null) => void
  addMessage: (message: Message) => void
  updateMessage: (messageId: string, updates: Partial<Message>) => void
  clearError: () => void
}

export const useChatStore = create<ChatState>()(
  devtools((set, get) => ({
    conversations: [],
    activeConversation: null,
    messages: [],
    isLoading: false,
    error: null,
    unreadCount: 0,

    loadConversations: async () => {
      set({ isLoading: true, error: null })
      try {
        const conversations = await chatService.getConversations()
        const unreadCount = conversations.reduce(
          (count, conv) => count + (conv.unreadCount || 0),
          0
        )
        set({ conversations, unreadCount, isLoading: false })
      } catch (error: any) {
        set({
          error: error.response?.data?.message || 'Failed to load conversations',
          isLoading: false,
        })
      }
    },

    loadConversation: async (conversationId) => {
      set({ isLoading: true, error: null })
      try {
        const [conversation, messages] = await Promise.all([
          chatService.getConversation(conversationId),
          chatService.getMessages(conversationId),
        ])
        set({
          activeConversation: conversation,
          messages,
          isLoading: false,
        })
      } catch (error: any) {
        set({
          error: error.response?.data?.message || 'Failed to load conversation',
          isLoading: false,
        })
      }
    },

    sendMessage: async (content, attachments) => {
      const { activeConversation } = get()
      if (!activeConversation) return

      try {
        const message = await chatService.sendMessage(activeConversation.id, {
          content,
          attachments,
        })
        set((state) => ({
          messages: [...state.messages, message],
        }))
      } catch (error: any) {
        set({
          error: error.response?.data?.message || 'Failed to send message',
        })
      }
    },

    createConversation: async (lawyerId, message) => {
      set({ isLoading: true, error: null })
      try {
        const conversation = await chatService.createConversation(lawyerId, message)
        set((state) => ({
          conversations: [conversation, ...state.conversations],
          activeConversation: conversation,
          isLoading: false,
        }))
        return conversation
      } catch (error: any) {
        set({
          error: error.response?.data?.message || 'Failed to create conversation',
          isLoading: false,
        })
        throw error
      }
    },

    markAsRead: async (conversationId) => {
      try {
        await chatService.markAsRead(conversationId)
        set((state) => ({
          conversations: state.conversations.map((conv) =>
            conv.id === conversationId ? { ...conv, unreadCount: 0 } : conv
          ),
          unreadCount: Math.max(0, state.unreadCount - (state.activeConversation?.unreadCount || 0)),
        }))
      } catch (error) {
        console.error('Failed to mark as read:', error)
      }
    },

    setActiveConversation: (conversation) => {
      set({ activeConversation: conversation, messages: [] })
    },

    addMessage: (message) => {
      set((state) => ({
        messages: [...state.messages, message],
      }))
    },

    updateMessage: (messageId, updates) => {
      set((state) => ({
        messages: state.messages.map((msg) =>
          msg.id === messageId ? { ...msg, ...updates } : msg
        ),
      }))
    },

    clearError: () => set({ error: null }),
  }))
)