export type UserRole = 'activist' | 'lawyer' | 'admin'

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  avatar?: string
  bio?: string
  isVerified: boolean
  createdAt: string
  updatedAt: string
  
  // Role-specific fields
  lawyerProfile?: LawyerProfile
  activistProfile?: ActivistProfile
}

export interface LawyerProfile {
  id: string
  barNumber: string
  specializations: string[]
  yearsOfExperience: number
  languages: string[]
  location: {
    city: string
    state: string
    country: string
  }
  availability: {
    days: string[]
    hours: string
  }
  consultationTypes: ('chat' | 'video' | 'phone')[]
  verificationStatus: 'pending' | 'verified' | 'rejected'
  verificationDocuments: string[]
  rating?: number
  totalConsultations: number
}

export interface ActivistProfile {
  id: string
  causes: string[]
  organization?: string
  location?: {
    city: string
    state: string
    country: string
  }
  anonymityPreference: 'full' | 'partial' | 'none'
}

export interface LoginDto {
  email: string
  password: string
}

export interface RegisterDto {
  email: string
  password: string
  name: string
  role: UserRole
  
  // Lawyer-specific registration fields
  barNumber?: string
  specializations?: string[]
  
  // Activist-specific registration fields
  causes?: string[]
  organization?: string
}

export interface AuthResponse {
  user: User
  token: string
}