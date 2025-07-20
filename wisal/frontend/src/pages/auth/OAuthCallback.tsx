import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { useToast } from '@/components/ui/use-toast'
import { Loader2 } from 'lucide-react'

export default function OAuthCallback() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { toast } = useToast()
  const authStore = useAuthStore()

  useEffect(() => {
    const handleOAuthCallback = async () => {
      const token = searchParams.get('token')
      const refreshToken = searchParams.get('refreshToken')
      const error = searchParams.get('error')

      if (error) {
        toast({
          title: 'Authentication failed',
          description: error,
          variant: 'destructive',
        })
        navigate('/login')
        return
      }

      if (!token || !refreshToken) {
        toast({
          title: 'Authentication failed',
          description: 'Missing authentication tokens',
          variant: 'destructive',
        })
        navigate('/login')
        return
      }

      try {
        // Store tokens in auth store
        authStore.token = token
        localStorage.setItem('token', token)
        localStorage.setItem('refreshToken', refreshToken)

        // Fetch user data
        await authStore.checkAuth()

        toast({
          title: 'Welcome!',
          description: 'You have successfully signed in with LinkedIn.',
        })

        // Redirect to dashboard
        navigate('/dashboard')
      } catch (error) {
        console.error('OAuth callback error:', error)
        toast({
          title: 'Authentication failed',
          description: 'Failed to complete sign in process',
          variant: 'destructive',
        })
        navigate('/login')
      }
    }

    handleOAuthCallback()
  }, [searchParams, navigate, toast, authStore])

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