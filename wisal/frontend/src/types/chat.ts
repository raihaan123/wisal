export interface Conversation {
  id: string
  participants: {
    activist: {
      id: string
      name: string
      avatar?: string
    }
    lawyer: {
      id: string
      name: string
      avatar?: string
      specializations: string[]
    }
  }
  lastMessage?: {
    content: string
    timestamp: string
    senderId: string
  }
  unreadCount: number
  status: 'active' | 'closed' | 'archived'
  createdAt: string
  updatedAt: string
}

export interface Message {
  id: string
  conversationId: string
  senderId: string
  senderRole: 'activist' | 'lawyer'
  content: string
  attachments?: Attachment[]
  status: 'sending' | 'sent' | 'delivered' | 'read'
  timestamp: string
  editedAt?: string
}

export interface Attachment {
  id: string
  type: 'image' | 'document' | 'audio'
  url: string
  name: string
  size: number
  mimeType: string
}

export interface SendMessageDto {
  content: string
  attachments?: File[]
}

export interface TypingIndicator {
  conversationId: string
  userId: string
  isTyping: boolean
}