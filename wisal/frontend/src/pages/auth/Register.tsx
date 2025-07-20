import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { useAuthStore } from '@/store/authStore'
import { useToast } from '@/components/ui/use-toast'
import { Loader2 } from 'lucide-react'
import type { UserRole } from '@/types/auth'

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  role: z.enum(['activist', 'lawyer'] as const),
  
  // Lawyer-specific fields
  barNumber: z.string().optional(),
  specializations: z.string().optional(),
  
  // Activist-specific fields
  causes: z.string().optional(),
  organization: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

type RegisterFormData = z.infer<typeof registerSchema>

export default function Register() {
  const navigate = useNavigate()
  const { register: registerUser, isLoading } = useAuthStore()
  const { toast } = useToast()
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: 'activist',
    },
  })

  const selectedRole = watch('role')

  const onSubmit = async (data: RegisterFormData) => {
    try {
      const registerData = {
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.role as UserRole,
        ...(data.role === 'lawyer' && {
          barNumber: data.barNumber,
          specializations: data.specializations?.split(',').map(s => s.trim()),
        }),
        ...(data.role === 'activist' && {
          causes: data.causes?.split(',').map(c => c.trim()),
          organization: data.organization,
        }),
      }

      await registerUser(registerData)
      toast({
        title: 'Account created!',
        description: 'Welcome to Wisal. You can now access legal support.',
      })
      navigate('/dashboard')
    } catch (error: any) {
      toast({
        title: 'Registration failed',
        description: error.response?.data?.message || 'Something went wrong',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Create your account</h2>
        <p className="mt-2 text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-primary hover:text-primary/80">
            Sign in
          </Link>
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            placeholder="John Doe"
            {...register('name')}
            className={errors.name ? 'border-red-500' : ''}
          />
          {errors.name && (
            <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            {...register('email')}
            className={errors.email ? 'border-red-500' : ''}
          />
          {errors.email && (
            <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Create a strong password"
              {...register('password')}
              className={errors.password ? 'border-red-500' : ''}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-600 hover:text-gray-800"
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
          {errors.password && (
            <p className="text-sm text-red-500 mt-1">{errors.password.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="Confirm your password"
            {...register('confirmPassword')}
            className={errors.confirmPassword ? 'border-red-500' : ''}
          />
          {errors.confirmPassword && (
            <p className="text-sm text-red-500 mt-1">{errors.confirmPassword.message}</p>
          )}
        </div>

        <div>
          <Label>I am a...</Label>
          <RadioGroup
            defaultValue="activist"
            onValueChange={(value) => register('role').onChange({ target: { value } })}
            className="mt-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="activist" id="activist" />
              <Label htmlFor="activist" className="font-normal cursor-pointer">
                Activist seeking legal support
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="lawyer" id="lawyer" />
              <Label htmlFor="lawyer" className="font-normal cursor-pointer">
                Lawyer offering pro bono services
              </Label>
            </div>
          </RadioGroup>
        </div>

        {/* Role-specific fields */}
        {selectedRole === 'lawyer' && (
          <>
            <div>
              <Label htmlFor="barNumber">Bar Number</Label>
              <Input
                id="barNumber"
                placeholder="Your bar admission number"
                {...register('barNumber')}
              />
            </div>
            <div>
              <Label htmlFor="specializations">Specializations</Label>
              <Input
                id="specializations"
                placeholder="Civil rights, Environmental law (comma separated)"
                {...register('specializations')}
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter your areas of expertise separated by commas
              </p>
            </div>
          </>
        )}

        {selectedRole === 'activist' && (
          <>
            <div>
              <Label htmlFor="causes">Causes you support</Label>
              <Input
                id="causes"
                placeholder="Climate, Human rights, Social justice (comma separated)"
                {...register('causes')}
              />
              <p className="text-xs text-gray-500 mt-1">
                Help lawyers understand your activism focus
              </p>
            </div>
            <div>
              <Label htmlFor="organization">Organization (optional)</Label>
              <Input
                id="organization"
                placeholder="Your organization or group"
                {...register('organization')}
              />
            </div>
          </>
        )}

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating account...
            </>
          ) : (
            'Create account'
          )}
        </Button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-gray-500">Or continue with</span>
        </div>
      </div>

      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={() => {
          window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:4000/api'}/auth/linkedin-custom`
        }}
      >
        <svg
          className="mr-2 h-4 w-4"
          fill="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
        </svg>
        Continue with LinkedIn
      </Button>

      <p className="text-center text-xs text-gray-500">
        By creating an account, you agree to our{' '}
        <Link to="/terms" className="underline hover:text-gray-700">
          Terms of Service
        </Link>{' '}
        and{' '}
        <Link to="/privacy" className="underline hover:text-gray-700">
          Privacy Policy
        </Link>
      </p>
    </div>
  )
}