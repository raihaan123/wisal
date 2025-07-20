import { api } from './api'
import { socketService } from './socket'

export interface ApiResponse<T = any> {
  data?: T
  error?: string
  message?: string
  success: boolean
}

export interface LoadingState {
  isLoading: boolean
  error: string | null
}

class ApiClient {
  private loadingStates: Map<string, LoadingState> = new Map()

  private setLoadingState(key: string, state: LoadingState) {
    this.loadingStates.set(key, state)
  }

  getLoadingState(key: string): LoadingState {
    return this.loadingStates.get(key) || { isLoading: false, error: null }
  }

  async request<T = any>(
    method: 'get' | 'post' | 'put' | 'delete' | 'patch',
    url: string,
    data?: any,
    options?: any,
    loadingKey?: string
  ): Promise<ApiResponse<T>> {
    if (loadingKey) {
      this.setLoadingState(loadingKey, { isLoading: true, error: null })
    }

    try {
      const response = await api[method](url, data, options)
      
      if (loadingKey) {
        this.setLoadingState(loadingKey, { isLoading: false, error: null })
      }

      return {
        data: response.data,
        success: true,
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred'
      
      if (loadingKey) {
        this.setLoadingState(loadingKey, { isLoading: false, error: errorMessage })
      }

      // Log error for debugging
      console.error(`API Error [${method.toUpperCase()} ${url}]:`, error)

      return {
        error: errorMessage,
        success: false,
      }
    }
  }

  // Auth endpoints
  async login(email: string, password: string) {
    return this.request('post', '/auth/login', { email, password }, {}, 'login')
  }

  async register(userData: any) {
    return this.request('post', '/auth/register', userData, {}, 'register')
  }

  async logout() {
    socketService.disconnect()
    return this.request('post', '/auth/logout', {}, {}, 'logout')
  }

  async refreshToken() {
    return this.request('post', '/auth/refresh', {}, {}, 'refresh')
  }

  // User endpoints
  async getCurrentUser() {
    return this.request('get', '/users/me', null, {}, 'currentUser')
  }

  async updateProfile(userId: string, data: any) {
    return this.request('put', `/users/${userId}`, data, {}, 'updateProfile')
  }

  async uploadAvatar(userId: string, file: File) {
    const formData = new FormData()
    formData.append('avatar', file)
    
    return this.request('post', `/users/${userId}/avatar`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }, 'uploadAvatar')
  }

  // Lawyer endpoints
  async getLawyers(params?: any) {
    const queryString = new URLSearchParams(params).toString()
    return this.request('get', `/lawyers${queryString ? `?${queryString}` : ''}`, null, {}, 'lawyers')
  }

  async getLawyerById(id: string) {
    return this.request('get', `/lawyers/${id}`, null, {}, `lawyer-${id}`)
  }

  async updateLawyerProfile(id: string, data: any) {
    return this.request('put', `/lawyers/${id}`, data, {}, 'updateLawyer')
  }

  // Query endpoints
  async createQuery(data: any) {
    return this.request('post', '/queries', data, {}, 'createQuery')
  }

  async getQueries(params?: any) {
    const queryString = new URLSearchParams(params).toString()
    return this.request('get', `/queries${queryString ? `?${queryString}` : ''}`, null, {}, 'queries')
  }

  async getQueryById(id: string) {
    return this.request('get', `/queries/${id}`, null, {}, `query-${id}`)
  }

  async updateQuery(id: string, data: any) {
    return this.request('put', `/queries/${id}`, data, {}, 'updateQuery')
  }

  // Conversation endpoints
  async getConversations() {
    return this.request('get', '/conversations', null, {}, 'conversations')
  }

  async getConversationById(id: string) {
    return this.request('get', `/conversations/${id}`, null, {}, `conversation-${id}`)
  }

  async createConversation(data: any) {
    return this.request('post', '/conversations', data, {}, 'createConversation')
  }

  async sendMessage(conversationId: string, content: string, attachments?: any[]) {
    return this.request('post', `/conversations/${conversationId}/messages`, {
      content,
      attachments
    }, {}, 'sendMessage')
  }

  async markMessageAsRead(conversationId: string, messageId: string) {
    return this.request('put', `/conversations/${conversationId}/messages/${messageId}/read`, {}, {}, 'markRead')
  }

  // Post endpoints
  async getPosts(params?: any) {
    const queryString = new URLSearchParams(params).toString()
    return this.request('get', `/posts${queryString ? `?${queryString}` : ''}`, null, {}, 'posts')
  }

  async getPostById(id: string) {
    return this.request('get', `/posts/${id}`, null, {}, `post-${id}`)
  }

  async createPost(data: any) {
    return this.request('post', '/posts', data, {}, 'createPost')
  }

  async updatePost(id: string, data: any) {
    return this.request('put', `/posts/${id}`, data, {}, 'updatePost')
  }

  async deletePost(id: string) {
    return this.request('delete', `/posts/${id}`, null, {}, 'deletePost')
  }

  async likePost(id: string) {
    return this.request('post', `/posts/${id}/like`, {}, {}, 'likePost')
  }

  async unlikePost(id: string) {
    return this.request('delete', `/posts/${id}/like`, null, {}, 'unlikePost')
  }

  async commentOnPost(id: string, content: string) {
    return this.request('post', `/posts/${id}/comments`, { content }, {}, 'commentPost')
  }

  // Search endpoints
  async searchLawyers(query: string, filters?: any) {
    return this.request('post', '/lawyers/search', { query, filters }, {}, 'searchLawyers')
  }

  async searchQueries(query: string, filters?: any) {
    return this.request('post', '/queries/search', { query, filters }, {}, 'searchQueries')
  }

  async searchPosts(query: string, filters?: any) {
    return this.request('post', '/posts/search', { query, filters }, {}, 'searchPosts')
  }
}

export const apiClient = new ApiClient()