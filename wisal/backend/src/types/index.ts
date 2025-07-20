import { ObjectId, Document } from 'mongoose';
import { Request } from 'express';

// Re-export user types
export * from './user.types';

// Request types
export interface AuthRequest extends Request {
  user?: any;
}

// Additional interfaces for models
export interface IActivismPost extends Document {
  authorId: ObjectId;
  title: string;
  content: string;
  category: string;
  tags: string[];
  images?: string[];
  urgency?: 'low' | 'medium' | 'high' | 'urgent';
  visibility: 'public' | 'verified' | 'private';
  status: 'draft' | 'published' | 'archived';
  isPublished?: boolean;
  publishedAt?: Date;
  likes?: ObjectId[];
  shares?: number;
  comments?: Array<{
    userId: ObjectId;
    content: string;
    createdAt: Date;
  }>;
  viewCount: number;
  shareCount: number;
  engagementCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IActivistProfile extends Document {
  userId: ObjectId;
  organization?: string;
  causes: string[];
  bio?: string;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  verifiedBy?: ObjectId;
  verifiedAt?: Date;
  postsCount: number;
  followers: ObjectId[];
  following?: ObjectId[];
  website?: string;
  socialLinks?: {
    twitter?: string;
    facebook?: string;
    instagram?: string;
    linkedin?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface IConversation extends Document {
  queryId?: ObjectId;
  seekerId: ObjectId;
  lawyerId: ObjectId;
  status: ConversationStatus;
  price?: number;
  type: 'consultation' | 'general';
  startTime: Date;
  endTime?: Date;
  duration?: number;
  totalCost?: number;
  isPaid?: boolean;
  messages?: ObjectId[];
  lastMessageAt?: Date;
  rating?: number;
  review?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ILawyerProfile extends Document {
  userId: ObjectId;
  // MongoDB validation required fields
  location: {
    postcode: string;
    city: string;
    country: string;
  };
  specialisms: string[];
  qualifiedSince: number;
  currentRole: string;
  employer: string;
  // Existing fields
  barNumber: string;
  licenseState: string;
  practiceAreas: string[];
  yearsOfExperience: number;
  education: Array<{
    degree: string;
    institution: string;
    year: number;
  }>;
  certifications?: string[];
  languages: string[];
  bio: string;
  hourlyRate: number;
  consultationFee: number;
  availability?: {
    days?: string[];
    hours?: Array<{
      day: string;
      start: string;
      end: string;
    }>;
  };
  rating?: {
    average: number;
    count: number;
  };
  reviewCount?: number;
  completedConsultations?: number;
  consultations?: {
    total: number;
    completed: number;
  };
  responseTime?: {
    average: number;
    lastCalculated: Date;
  };
  proBonoAreas?: string[];
  verified: boolean;
  verificationDocuments?: string[];
  verifiedAt?: Date;
  verifiedBy?: ObjectId;
  verificationNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ILegalQuery extends Document {
  seekerId: ObjectId;
  title: string;
  description: string;
  category: string;
  urgencyLevel: Urgency;
  budget?: number;
  isAnonymous: boolean;
  tags: string[];
  attachments?: string[];
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  assignedLawyer?: ObjectId;
  aiAnalysis?: AIAnalysis;
  views: number;
  viewCount?: number;
  responseCount?: number;
  responses: Array<{
    lawyerId: ObjectId;
    message: string;
    proposedFee: number;
    respondedAt: Date;
  }>;
  resolvedAt?: Date;
  flaggedForReview?: boolean;
  moderatedBy?: ObjectId;
  moderatedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IMessage extends Document {
  conversationId: ObjectId;
  senderId: ObjectId;
  content: string;
  type: MessageType;
  attachments?: string[];
  readBy: Array<{
    userId: ObjectId;
    readAt: Date;
  }>;
  editedAt?: Date;
  deletedAt?: Date;
  createdAt: Date;
}

export interface ISeekerProfile extends Document {
  userId: ObjectId;
  demographics?: {
    age?: number;
    gender?: string;
    location?: string;
    incomeLevel?: 'low' | 'medium' | 'high' | 'prefer_not_to_say';
  };
  legalHistory?: {
    previousConsultations?: number;
    categories?: string[];
    lastConsultation?: Date;
  };
  preferences?: {
    communicationMethod?: 'phone' | 'email' | 'chat' | 'video';
    languages?: string[];
    preferredTimes?: string[];
  };
  savedLawyers?: ObjectId[];
  blockedLawyers?: ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

// User Types
export type UserRole = 'seeker' | 'lawyer' | 'activist' | 'admin';
export type AuthProvider = 'local' | 'linkedin';
export type Gender = 'male' | 'female' | 'other' | 'prefer-not-to-say';
export type ContactPreference = 'email' | 'phone' | 'chat';

// Query Types
export type QueryType = 'question' | 'case';
export type Urgency = 'low' | 'medium' | 'high' | 'critical';
export type Complexity = 'simple' | 'moderate' | 'complex';

// Post Types
export type PostStatus = 'draft' | 'pending' | 'approved' | 'rejected';
export type PostCategory = 'legal-update' | 'activism' | 'news' | 'guide' | 'urgent';

// Conversation Types
export type ConversationStatus = 'active' | 'closed' | 'archived';
export type MessageType = 'text' | 'ai-suggestion' | 'system';

// JWT Types
export interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole; // Keep for backward compatibility
  roles?: string[]; // Array of role names for RBAC
}

// User Interfaces
export interface User {
  _id: ObjectId;
  email: string;
  password?: string; // null for OAuth users
  name: string;
  role: UserRole;
  profile: SeekerProfile | LawyerProfile | ActivistProfile;
  authProvider: AuthProvider;
  linkedinId?: string;
  isVerified: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface SeekerProfile {
  location: {
    postcode: string;
    city?: string;
    country: string;
  };
  gender?: Gender;
  phone?: string;
  preferredContact: ContactPreference;
  savedLawyers: ObjectId[];
  caseHistory: ObjectId[];
}

export interface LawyerProfile {
  location: {
    postcode: string;
    city: string;
    country: string;
  };
  specialisms: string[];
  qualifiedSince: number;
  currentRole: string;
  employer: string;
  barNumber?: string;
  languages: string[];
  availability: {
    schedule: AvailabilitySlot[];
    timezone: string;
    autoAccept: boolean;
  };
  proBonoAreas?: string[];
  credentials: {
    license?: string;
    certificateUrl?: string;
    verifiedAt?: Date;
    verifiedBy?: ObjectId;
  };
  rating?: {
    average: number;
    count: number;
  };
  caseCount: number;
}

export interface ActivistProfile {
  organization?: string;
  causes: string[];
  verificationStatus: 'pending' | 'verified' | 'rejected';
  verifiedBy?: ObjectId;
  verifiedAt?: Date;
  postsCount: number;
  followers: ObjectId[];
}

export interface AvailabilitySlot {
  dayOfWeek: number; // 0-6
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  isActive: boolean;
}

// Legal Query Interfaces
export interface LegalQuery {
  _id: ObjectId;
  seekerId: ObjectId;
  type: QueryType;
  category: string;
  description: string;
  urgency: Urgency;
  jurisdiction?: string;
  attachments?: string[]; // file URLs
  aiAnalysis: AIAnalysis;
  matchedLawyers: MatchedLawyer[];
  status: 'pending' | 'processing' | 'matched' | 'accepted' | 'closed';
  conversationId?: ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface AIAnalysis {
  summary: string;
  categories: string[];
  complexity: Complexity;
  estimatedTime: number; // minutes
  suggestedSpecialisms: string[];
  keyIssues: string[];
  recommendedActions: string[];
  embeddings?: number[]; // for vector search
}

export interface MatchedLawyer {
  lawyerId: ObjectId;
  score: number;
  reason: string;
  matchedAt: Date;
  responded: boolean;
}

// Conversation Interfaces
export interface Conversation {
  _id: ObjectId;
  queryId: ObjectId;
  seekerId: ObjectId;
  lawyerId: ObjectId;
  status: ConversationStatus;
  lastActivity: Date;
  rating?: {
    score: number;
    feedback?: string;
    ratedAt: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  _id: ObjectId;
  conversationId: ObjectId;
  senderId: ObjectId;
  content: string;
  type: MessageType;
  attachments?: string[];
  aiSuggestions?: string[];
  readAt?: Date;
  createdAt: Date;
}

// Post Interfaces
export interface Post {
  _id: ObjectId;
  authorId: ObjectId;
  title: string;
  content: string;
  excerpt?: string;
  category: PostCategory;
  tags: string[];
  urgency?: Urgency;
  featuredImage?: string;
  status: PostStatus;
  viewCount: number;
  shares: number;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// AI Processing Interfaces
export interface AIQueryRequest {
  description: string;
  urgency?: Urgency;
  jurisdiction?: string;
  previousContext?: string;
}

export interface AIQueryResponse {
  analysis: AIAnalysis;
  suggestedQuestions: string[];
  clarificationNeeded: boolean;
  confidence: number;
}

export interface AISuggestionRequest {
  conversationId: string;
  context: string;
  role: 'seeker' | 'lawyer';
}

export interface AISuggestionResponse {
  suggestions: string[];
  legalCitations?: string[];
  warnings?: string[];
}

// Vector Search Interfaces
export interface VectorSearchQuery {
  embedding: number[];
  filter?: {
    specialisms?: string[];
    location?: {
      postcode?: string;
      city?: string;
      radius?: number;
    };
    availability?: boolean;
    languages?: string[];
  };
  limit?: number;
}

export interface VectorSearchResult {
  lawyerId: ObjectId;
  score: number;
  profile: LawyerProfile;
}