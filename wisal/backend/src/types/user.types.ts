import { Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  password?: string;
  name: string;
  role: 'seeker' | 'lawyer' | 'activist' | 'admin';
  roles: string[]; // Array of role names for RBAC
  authProvider: 'local' | 'linkedin';
  linkedinId?: string;
  profilePicture?: string;
  isVerified: boolean;
  isActive: boolean;
  lastLogin?: Date;
  refreshToken?: string;
  bannedAt?: Date;
  banReason?: string;
  banDuration?: number;
  createdAt: Date;
  updatedAt: Date;
  
  // Methods
  comparePassword(candidatePassword: string): Promise<boolean>;
  generateAccessToken(): string;
  generateRefreshToken(): string;
}