import api from './api'
import type { LoginDto, RegisterDto, AuthResponse, User } from '@/types/auth'

/**
 * Authentication Service
 * 
 * Handles all authentication-related API calls including:
 * - User login/registration
 * - Profile management
 * - Password operations
 * - Token management
 * 
 * @module authService
 */
export const authService = {
  /**
   * Authenticates a user with email and password
   * @param data - Login credentials
   * @returns Authentication response with user data and token
   * @throws API error if login fails
   */
  async login(data: LoginDto): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', data)
    if (response.data.token) {
      localStorage.setItem('token', response.data.token)
    }
    return response.data
  },

  /**
   * Registers a new user account
   * @param data - Registration information
   * @returns Authentication response with user data and token
   * @throws API error if registration fails
   */
  async register(data: RegisterDto): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/register', data)
    if (response.data.token) {
      localStorage.setItem('token', response.data.token)
    }
    return response.data
  },

  /**
   * Fetches the current authenticated user's data
   * @returns Current user information
   * @throws API error if not authenticated
   */
  async getCurrentUser(): Promise<User> {
    const response = await api.get<User>('/auth/me')
    return response.data
  },

  /**
   * Updates the current user's profile
   * @param data - Partial user data to update
   * @returns Updated user information
   */
  async updateProfile(data: Partial<User>): Promise<User> {
    const response = await api.put<User>('/auth/profile', data)
    return response.data
  },

  /**
   * Changes the user's password
   * @param data - Current and new password
   */
  async changePassword(data: { currentPassword: string; newPassword: string }): Promise<void> {
    await api.post('/auth/change-password', data)
  },

  /**
   * Initiates password reset process
   * @param email - User's email address
   */
  async forgotPassword(email: string): Promise<void> {
    await api.post('/auth/forgot-password', { email })
  },

  /**
   * Completes password reset with token
   * @param data - Reset token and new password
   */
  async resetPassword(data: { token: string; password: string }): Promise<void> {
    await api.post('/auth/reset-password', data)
  },

  /**
   * Logs out the user by removing the stored token
   */
  logout(): void {
    localStorage.removeItem('token')
  },
}