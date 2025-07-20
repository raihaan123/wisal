import { useState, useCallback, useEffect, useRef } from 'react'
import { toast } from 'react-hot-toast'
import { ApiResponse } from '@/services/apiClient'

interface UseApiCallOptions {
  onSuccess?: (data: any) => void
  onError?: (error: string) => void
  showSuccessToast?: boolean
  showErrorToast?: boolean
  successMessage?: string
  errorMessage?: string
}

interface UseApiCallReturn<T> {
  data: T | null
  loading: boolean
  error: string | null
  execute: (...args: any[]) => Promise<ApiResponse<T>>
  reset: () => void
}

export function useApiCall<T = any>(
  apiFunction: (...args: any[]) => Promise<ApiResponse<T>>,
  options: UseApiCallOptions = {}
): UseApiCallReturn<T> {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const isMountedRef = useRef(true)

  const {
    onSuccess,
    onError,
    showSuccessToast = false,
    showErrorToast = true,
    successMessage = 'Success!',
    errorMessage,
  } = options

  useEffect(() => {
    return () => {
      isMountedRef.current = false
    }
  }, [])

  const execute = useCallback(
    async (...args: any[]): Promise<ApiResponse<T>> => {
      setLoading(true)
      setError(null)

      try {
        const response = await apiFunction(...args)

        if (!isMountedRef.current) {
          return response
        }

        if (response.success && response.data) {
          setData(response.data)
          
          if (showSuccessToast) {
            toast.success(successMessage)
          }
          
          onSuccess?.(response.data)
        } else if (response.error) {
          const errorMsg = errorMessage || response.error
          setError(errorMsg)
          
          if (showErrorToast) {
            toast.error(errorMsg)
          }
          
          onError?.(errorMsg)
        }

        setLoading(false)
        return response
      } catch (err: any) {
        if (!isMountedRef.current) {
          return { success: false, error: err.message }
        }

        const errorMsg = errorMessage || err.message || 'An unexpected error occurred'
        setError(errorMsg)
        setLoading(false)
        
        if (showErrorToast) {
          toast.error(errorMsg)
        }
        
        onError?.(errorMsg)
        
        return { success: false, error: errorMsg }
      }
    },
    [apiFunction, onSuccess, onError, showSuccessToast, showErrorToast, successMessage, errorMessage]
  )

  const reset = useCallback(() => {
    setData(null)
    setError(null)
    setLoading(false)
  }, [])

  return { data, loading, error, execute, reset }
}

// Hook for paginated API calls
interface PaginationState {
  page: number
  limit: number
  total: number
  hasMore: boolean
}

interface UsePaginatedApiCallReturn<T> extends UseApiCallReturn<T[]> {
  pagination: PaginationState
  loadMore: () => Promise<void>
  refresh: () => Promise<void>
  setPage: (page: number) => void
}

export function usePaginatedApiCall<T = any>(
  apiFunction: (params: { page: number; limit: number }) => Promise<ApiResponse<{ items: T[]; total: number }>>,
  limit: number = 10,
  options: UseApiCallOptions = {}
): UsePaginatedApiCallReturn<T> {
  const [items, setItems] = useState<T[]>([])
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    limit,
    total: 0,
    hasMore: true,
  })

  const apiCall = useApiCall(apiFunction, {
    ...options,
    onSuccess: (response) => {
      const { items: newItems, total } = response
      
      if (pagination.page === 1) {
        setItems(newItems)
      } else {
        setItems(prev => [...prev, ...newItems])
      }
      
      setPagination(prev => ({
        ...prev,
        total,
        hasMore: (prev.page * prev.limit) < total,
      }))
      
      options.onSuccess?.(response)
    },
  })

  const loadMore = useCallback(async () => {
    if (!pagination.hasMore || apiCall.loading) return
    
    setPagination(prev => ({ ...prev, page: prev.page + 1 }))
    await apiCall.execute({ page: pagination.page + 1, limit: pagination.limit })
  }, [pagination, apiCall])

  const refresh = useCallback(async () => {
    setPagination(prev => ({ ...prev, page: 1 }))
    setItems([])
    await apiCall.execute({ page: 1, limit: pagination.limit })
  }, [pagination.limit, apiCall])

  const setPage = useCallback((page: number) => {
    setPagination(prev => ({ ...prev, page }))
  }, [])

  return {
    ...apiCall,
    data: items,
    pagination,
    loadMore,
    refresh,
    setPage,
  }
}

// Hook for form submissions
interface UseFormSubmitOptions<T> extends UseApiCallOptions {
  resetFormOnSuccess?: boolean
}

export function useFormSubmit<T = any, F = any>(
  apiFunction: (formData: F) => Promise<ApiResponse<T>>,
  options: UseFormSubmitOptions<T> = {}
) {
  const { resetFormOnSuccess = true, ...apiOptions } = options
  
  return useApiCall(apiFunction, {
    showSuccessToast: true,
    ...apiOptions,
  })
}