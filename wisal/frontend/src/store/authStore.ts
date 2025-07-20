import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { authService } from '@/services/authService'
import type { User, LoginDto, RegisterDto } from '@/types/auth'

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  
  // Actions
  login: (data: LoginDto) => Promise<void>
  register: (data: RegisterDto) => Promise<void>
  logout: () => void
  checkAuth: () => Promise<void>
  clearError: () => void
  updateUser: (user: Partial<User>) => void
}

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