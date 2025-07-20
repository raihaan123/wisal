import { io, Socket } from 'socket.io-client'
import { useAuthStore } from '@/store/authStore'

class SocketService {
  private socket: Socket | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000

  connect() {
    const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:4000'
    
    this.socket = io(socketUrl, {
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: this.reconnectDelay,
      transports: ['websocket', 'polling'],
      auth: {
        token: useAuthStore.getState().token,
      },
    })

    this.setupEventHandlers()
    this.socket.connect()
  }

  private setupEventHandlers() {
    if (!this.socket) return

    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket?.id)
      this.reconnectAttempts = 0
      
      // Join user room if authenticated
      const user = useAuthStore.getState().user
      if (user?._id) {
        this.joinUserRoom(user._id)
      }
    })

    this.socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason)
      if (reason === 'io server disconnect') {
        // Server disconnected, manually reconnect
        this.socket?.connect()
      }
    })

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error.message)
      this.reconnectAttempts++
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('Max reconnection attempts reached')
        this.socket?.disconnect()
      }
    })

    this.socket.on('error', (error) => {
      console.error('Socket error:', error)
    })
  }

  joinUserRoom(userId: string) {
    this.socket?.emit('join-user', userId)
  }

  joinConversation(conversationId: string) {
    this.socket?.emit('join-conversation', conversationId)
  }

  leaveConversation(conversationId: string) {
    this.socket?.emit('leave-conversation', conversationId)
  }

  startTyping(conversationId: string, userId: string) {
    this.socket?.emit('typing-start', { conversationId, userId })
  }

  stopTyping(conversationId: string, userId: string) {
    this.socket?.emit('typing-stop', { conversationId, userId })
  }

  onNewMessage(callback: (message: any) => void) {
    this.socket?.on('new-message', callback)
  }

  onUserTyping(callback: (data: { userId: string; conversationId: string }) => void) {
    this.socket?.on('user-typing', callback)
  }

  onUserStoppedTyping(callback: (data: { userId: string; conversationId: string }) => void) {
    this.socket?.on('user-stopped-typing', callback)
  }

  onMessageRead(callback: (data: { messageId: string; userId: string }) => void) {
    this.socket?.on('message-read', callback)
  }

  onUserOnline(callback: (userId: string) => void) {
    this.socket?.on('user-online', callback)
  }

  onUserOffline(callback: (userId: string) => void) {
    this.socket?.on('user-offline', callback)
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
  }

  isConnected(): boolean {
    return this.socket?.connected || false
  }

  getSocket(): Socket | null {
    return this.socket
  }
}

export const socketService = new SocketService()