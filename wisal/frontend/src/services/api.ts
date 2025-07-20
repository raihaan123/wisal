import axios from 'axios'
import { useAuthStore } from '@/store/authStore'

/**
 * Base API configuration
 * 
 * This module provides the core Axios instance used throughout the application.
 * It includes:
 * - Automatic token injection for authenticated requests
 * - Global error handling for 401 responses
 * - Base URL configuration from environment variables
 * 
 * @module api
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api'

/**
 * Configured Axios instance for API communication
 * 
 * @example
 * import api from '@/services/api'
 * const response = await api.get('/users')
 */
export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

/**
 * Request interceptor
 * Automatically adds the JWT token to all requests if available
 */
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

/**
 * Response interceptor
 * Handles global error responses:
 * - 401: Redirects to login (except on auth pages)
 * - Clears auth state on token expiration
 */
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Don't redirect if we're already on auth pages
      const currentPath = window.location.pathname
      const authPaths = ['/login', '/register', '/auth/callback', '/forgot-password']
      
      if (!authPaths.some(path => currentPath.includes(path))) {
        // Token expired or invalid - only redirect if not on auth pages
        useAuthStore.getState().logout()
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default api