import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { useToast } from '@/components/ui/use-toast'
import { authService } from '@/services/authService'
import { Loader2 } from 'lucide-react'

export default function OAuthCallback() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { toast } = useToast()
  const [isProcessing, setIsProcessing] = useState(true)

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        // Log the full URL and search params for debugging
        console.log('OAuth Callback - Current URL:', window.location.href)
        console.log('OAuth Callback - Search params:', Object.fromEntries(searchParams))
        
        const token = searchParams.get('token')
        const refreshToken = searchParams.get('refreshToken')
        const error = searchParams.get('error')
        const errorDescription = searchParams.get('description')
        const role = searchParams.get('role')

        // Handle OAuth errors
        if (error) {
          console.error('OAuth error received:', error, errorDescription)
          toast({
            title: 'Authentication failed',
            description: errorDescription || error,
            variant: 'destructive',
          })
          navigate('/login', { replace: true })
          return
        }

        // Check for missing tokens
        if (!token || !refreshToken) {
          console.error('Missing tokens - token:', !!token, 'refreshToken:', !!refreshToken)
          toast({
            title: 'Authentication failed',
            description: 'Missing authentication tokens. Please try signing in again.',
            variant: 'destructive',
          })
          navigate('/login', { replace: true })
          return
        }

        console.log('Valid tokens received, processing authentication...')
        
        // Store tokens in localStorage
        localStorage.setItem('token', token)
        localStorage.setItem('refreshToken', refreshToken)
        
        console.log('Tokens stored in localStorage')
        
        // Update the auth store directly with all necessary data
        // This avoids the need to call checkAuth which might fail
        useAuthStore.setState({ 
          token, 
          isAuthenticated: true,
          isLoading: false 
        })
        
        // Try to fetch user data
        try {
          console.log('Fetching user data...')
          const userData = await authService.getCurrentUser()
          console.log('User data fetched successfully:', userData)
          
          // Update store with user data
          useAuthStore.setState({ 
            user: userData,
            isAuthenticated: true,
            isLoading: false 
          })
          
          toast({
            title: 'Welcome!',
            description: 'You have successfully signed in with LinkedIn.',
          })
          
          // Navigate based on role or default to dashboard
          const targetPath = role === 'lawyer' ? '/dashboard' : 
                           role === 'activist' ? '/dashboard' : 
                           '/dashboard'
          
          navigate(targetPath, { replace: true })
        } catch (userError) {
          console.error('Failed to fetch user data:', userError)
          // Even if user fetch fails, we have valid tokens
          // Let the user proceed and retry on next page load
          toast({
            title: 'Signed in',
            description: 'You have been signed in. Some profile data may be loading.',
          })
          navigate('/dashboard', { replace: true })
        }
        
      } catch (error: any) {
        console.error('OAuth callback error:', error)
        toast({
          title: 'Authentication failed',
          description: 'An unexpected error occurred. Please try again.',
          variant: 'destructive',
        })
        
        // Clear any stored tokens on error
        localStorage.removeItem('token')
        localStorage.removeItem('refreshToken')
        useAuthStore.setState({ 
          token: null, 
          user: null,
          isAuthenticated: false,
          isLoading: false 
        })
        
        navigate('/login', { replace: true })
      } finally {
        setIsProcessing(false)
      }
    }

    // Only run once when component mounts
    handleOAuthCallback()
  }, []) // Empty dependency array - no dependencies to avoid re-runs

  // Show loading state
  if (isProcessing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <h2 className="text-xl font-semibold text-gray-900">Completing sign in...</h2>
          <p className="text-sm text-gray-600 mt-2">Please wait while we redirect you.</p>
        </div>
      </div>
    )
  }

  // If not processing and still here, something went wrong
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-900">Redirecting...</h2>
      </div>
    </div>
  )
}