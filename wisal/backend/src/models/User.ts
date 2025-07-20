import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { IUser } from '../types';

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: function() {
        return this.authProvider === 'local';
      },
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ['seeker', 'lawyer', 'activist', 'admin'],
      default: 'seeker',
    },
    // New: Support for multiple roles through RBAC
    roles: [{
      type: String,
      ref: 'Role',
      lowercase: true,
      trim: true
    }],
    authProvider: {
      type: String,
      enum: ['local', 'linkedin'],
      default: 'local',
    },
    linkedinId: {
      type: String,
      sparse: true,
    },
    profilePicture: {
      type: String,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
    },
    bannedAt: {
      type: Date,
    },
    banReason: {
      type: String,
    },
    banDuration: {
      type: Number, // hours
    },
  },
  {
    timestamps: true,
  }
);

// Index for email searches
userSchema.index({ email: 1 });
userSchema.index({ role: 1, isActive: 1 });

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) {
    return next();
  }
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  if (!this.password) {
    return false;
  }
  return bcrypt.compare(candidatePassword, this.password);
};

// Generate JWT token
userSchema.methods.generateAccessToken = function (): string {
  const payload = {
    userId: this._id,
    email: this.email,
    role: this.role, // Keep for backward compatibility
    roles: this.roles || [this.role], // Include roles array
  };
  
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not defined');
  }
  
  return jwt.sign(payload, secret, {
    expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as any,
  } as SignOptions);
};

// Generate refresh token
userSchema.methods.generateRefreshToken = function (): string {
  const payload = {
    userId: this._id,
    tokenType: 'refresh',
  };
  
  const secret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not defined');
  }
  
  return jwt.sign(payload, secret, {
    expiresIn: (process.env.JWT_REFRESH_EXPIRE || '30d') as any,
  } as SignOptions);
};

const User = mongoose.model<IUser>('User', userSchema);

export default User;