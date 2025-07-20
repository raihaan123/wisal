import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { authService } from '@/services/authService'
import type { User, LoginDto, RegisterDto } from '@/types/auth'

/**
 * Authentication Store
 * 
 * Global state management for authentication using Zustand.
 * Features:
 * - Persistent token storage
 * - Automatic auth state restoration
 * - Global loading and error states
 * - User profile management
 * 
 * @module authStore
 */

/**
 * Authentication state interface
 */
interface AuthState {
  // State
  user: User | null              // Current authenticated user
  token: string | null           // JWT token
  isAuthenticated: boolean       // Authentication status
  isLoading: boolean            // Loading state for auth operations
  error: string | null          // Error message from last operation
  
  // Actions
  login: (data: LoginDto) => Promise<void>           // User login
  register: (data: RegisterDto) => Promise<void>     // User registration
  logout: () => void                                 // Clear auth state
  checkAuth: () => Promise<void>                     // Verify current token
  clearError: () => void                             // Clear error state
  updateUser: (user: Partial<User>) => void          // Update user data
}

/**
 * Authentication store hook
 * 
 * @example
 * const { user, login, logout } = useAuthStore()
 * await login({ email, password })
 */
export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set, get) => ({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,

        login: async (data) => {
          set({ isLoading: true, error: null })
          try {
            const response = await authService.login(data)
            set({
              user: response.user,
              token: response.token,
              isAuthenticated: true,
              isLoading: false,
            })
          } catch (error: any) {
            set({
              error: error.response?.data?.message || 'Login failed',
              isLoading: false,
            })
            throw error
          }
        },

        register: async (data) => {
          set({ isLoading: true, error: null })
          try {
            const response = await authService.register(data)
            set({
              user: response.user,
              token: response.token,
              isAuthenticated: true,
              isLoading: false,
            })
          } catch (error: any) {
            set({
              error: error.response?.data?.message || 'Registration failed',
              isLoading: false,
            })
            throw error
          }
        },

        logout: () => {
          authService.logout()
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            error: null,
          })
        },

        checkAuth: async () => {
          const token = get().token
          if (!token) {
            set({ isAuthenticated: false })
            return
          }

          set({ isLoading: true })
          try {
            const user = await authService.getCurrentUser()
            set({
              user,
              isAuthenticated: true,
              isLoading: false,
            })
          } catch (error) {
            set({
              user: null,
              token: null,
              isAuthenticated: false,
              isLoading: false,
            })
          }
        },

        clearError: () => set({ error: null }),

        updateUser: (userData) => {
          set((state) => ({
            user: state.user ? { ...state.user, ...userData } : null,
          }))
        },
      }),
      {
        name: 'auth-storage',
        partialize: (state) => ({ token: state.token }),
      }
    )
  )
)