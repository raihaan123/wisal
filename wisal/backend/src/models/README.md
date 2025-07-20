# Models

## Overview

This directory contains Mongoose schema definitions and models for the Wisal platform. Each model represents a collection in MongoDB and defines the structure, validation rules, and methods for working with the data.

## Model Files

### User Models

#### `User.ts`
Core user model for authentication and profile management:

```typescript
interface IUser {
  email: string;
  password: string; // Hashed with bcrypt
  name: string;
  role: 'seeker' | 'lawyer' | 'activist' | 'admin';
  profilePicture?: string;
  isActive: boolean;
  isVerified: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

**Key Features:**
- Password hashing on save
- JWT token generation
- Password comparison method
- Virtual fields for profile references
- Indexes on email (unique) and role

#### `SeekerProfile.ts`
Profile for users seeking legal help:

```typescript
interface ISeekerProfile {
  userId: ObjectId; // Reference to User
  demographics: {
    age?: number;
    gender?: string;
    ethnicity?: string;
    nationality?: string;
  };
  location: {
    city?: string;
    state?: string;
    country: string;
  };
  legalHelpCategories: string[];
  preferredLanguages: string[];
  communicationPreferences: {
    email: boolean;
    sms: boolean;
    inApp: boolean;
  };
  budget?: {
    min: number;
    max: number;
  };
}
```

#### `LawyerProfile.ts`
Comprehensive lawyer profile:

```typescript
interface ILawyerProfile {
  userId: ObjectId;
  barNumber: string;
  licenseNumber: string;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  verificationDocuments: string[];
  
  // Professional Info
  specialisms: string[];
  yearsOfExperience: number;
  education: Array<{
    institution: string;
    degree: string;
    year: number;
  }>;
  certifications: Array<{
    name: string;
    issuer: string;
    year: number;
  }>;
  
  // Service Details
  languages: string[];
  location: {
    city: string;
    state?: string;
    country: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  servicesOffered: string[];
  consultationTypes: ('video' | 'phone' | 'chat' | 'inPerson')[];
  
  // Availability & Rates
  availability: {
    days: string[];
    hours: {
      start: string;
      end: string;
    };
    timezone: string;
  };
  hourlyRate: number;
  currency: string;
  freeConsultation: boolean;
  freeConsultationDuration?: number;
  
  // Performance Metrics
  rating: number;
  reviewCount: number;
  consultationCount: number;
  responseTime: number; // in hours
  
  // Profile Content
  bio: string;
  profileCompleteness: number;
  
  // Vector Search
  embedding?: number[];
}
```

**Indexes:**
- Compound index on specialisms and location
- Text index on bio
- 2dsphere index on location.coordinates
- Vector index on embedding for AI search

#### `ActivistProfile.ts`
Profile for legal activists:

```typescript
interface IActivistProfile {
  userId: ObjectId;
  organization?: string;
  focusAreas: string[];
  verificationStatus: 'pending' | 'verified' | 'unverified';
  socialMedia?: {
    twitter?: string;
    linkedin?: string;
    website?: string;
  };
  impactMetrics: {
    postsCount: number;
    followersCount: number;
    engagementRate: number;
  };
}
```

### Communication Models

#### `Conversation.ts`
Real-time chat conversations:

```typescript
interface IConversation {
  participants: ObjectId[];
  queryId?: ObjectId; // Optional link to legal query
  lastMessage?: {
    content: string;
    sender: ObjectId;
    timestamp: Date;
  };
  unreadCount: Map<string, number>; // userId -> count
  status: 'active' | 'archived' | 'closed';
  metadata: {
    startedBy: ObjectId;
    purpose?: string;
    tags?: string[];
  };
}
```

**Methods:**
- `addMessage()` - Add message and update lastMessage
- `markAsRead()` - Reset unread count for user
- `archive()` - Archive conversation

#### `Message.ts`
Individual messages in conversations:

```typescript
interface IMessage {
  conversationId: ObjectId;
  sender: ObjectId;
  content: string;
  attachments?: Array<{
    url: string;
    type: 'image' | 'document' | 'video';
    name: string;
    size: number;
  }>;
  metadata: {
    isEdited: boolean;
    editedAt?: Date;
    isDeleted: boolean;
    deletedAt?: Date;
  };
  readBy: Array<{
    userId: ObjectId;
    readAt: Date;
  }>;
  reactions?: Map<string, ObjectId[]>; // emoji -> userIds
}
```

### Legal Content Models

#### `LegalQuery.ts`
Legal questions and requests:

```typescript
interface ILegalQuery {
  seekerId: ObjectId;
  title: string;
  description: string;
  category: string;
  subcategories?: string[];
  
  // Query Details
  urgency: 'low' | 'medium' | 'high' | 'critical';
  jurisdiction?: string;
  budget?: {
    min: number;
    max: number;
    currency: string;
  };
  preferredLanguages?: string[];
  
  // Assignment
  assignedLawyer?: ObjectId;
  assignedAt?: Date;
  status: 'open' | 'assigned' | 'in_progress' | 'resolved' | 'closed';
  
  // AI Analysis
  aiAnalysis?: {
    categories: string[];
    complexity: string;
    suggestedSpecialisms: string[];
    keyIssues: string[];
    embedding?: number[];
  };
  
  // Metrics
  viewCount: number;
  responseCount: number;
  
  // Timestamps
  resolvedAt?: Date;
  closedAt?: Date;
}
```

**Indexes:**
- Text index on title and description
- Compound index on status and urgency
- Index on seekerId and assignedLawyer

#### `ActivismPost.ts`
Legal activism and educational content:

```typescript
interface IActivismPost {
  authorId: ObjectId;
  title: string;
  content: string; // Markdown supported
  category: string;
  tags: string[];
  
  // Media
  featuredImage?: string;
  attachments?: Array<{
    url: string;
    type: string;
    caption?: string;
  }>;
  
  // Engagement
  likes: ObjectId[];
  shares: number;
  comments: Array<{
    userId: ObjectId;
    content: string;
    createdAt: Date;
    likes: ObjectId[];
  }>;
  
  // Moderation
  status: 'draft' | 'published' | 'hidden' | 'removed';
  moderationFlags?: Array<{
    reason: string;
    reportedBy: ObjectId;
    reportedAt: Date;
  }>;
  
  // Analytics
  viewCount: number;
  shareCount: number;
  engagementRate: number;
}
```

### Access Control Models

#### `Role.ts`
Role-based access control:

```typescript
interface IRole {
  name: string; // 'admin', 'lawyer', 'seeker', 'activist'
  description: string;
  permissions: ObjectId[]; // References to Permission model
  isSystem: boolean; // Cannot be deleted if true
}
```

#### `Permission.ts`
Granular permissions:

```typescript
interface IPermission {
  resource: string; // 'user', 'query', 'conversation', etc.
  action: string; // 'create', 'read', 'update', 'delete'
  description: string;
  conditions?: object; // Additional conditions for permission
}
```

## Common Patterns

### Timestamps
All models include Mongoose timestamps:
```typescript
{
  timestamps: true // Adds createdAt and updatedAt
}
```

### Soft Deletes
Models that support soft deletion include:
```typescript
{
  isDeleted: { type: Boolean, default: false },
  deletedAt: Date
}
```

### Virtual Fields
Computed properties that don't store in DB:
```typescript
schema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});
```

### Indexes
Optimized for common queries:
```typescript
schema.index({ field1: 1, field2: -1 }); // Compound index
schema.index({ textField: 'text' }); // Full-text search
schema.index({ location: '2dsphere' }); // Geospatial
```

### Methods
Instance methods for business logic:
```typescript
schema.methods.methodName = function() {
  // Method implementation
};
```

### Statics
Model-level methods:
```typescript
schema.statics.findByEmail = function(email: string) {
  return this.findOne({ email });
};
```

### Middleware
Pre/post hooks for operations:
```typescript
schema.pre('save', async function() {
  // Before save logic
});

schema.post('save', async function() {
  // After save logic
});
```

## Validation

All models include comprehensive validation:
- Required fields
- String length limits
- Enum constraints
- Custom validators
- Format validation (email, URL, etc.)

## Relationships

### One-to-One
- User ←→ SeekerProfile
- User ←→ LawyerProfile
- User ←→ ActivistProfile

### One-to-Many
- User → LegalQueries
- User → ActivismPosts
- Conversation → Messages

### Many-to-Many
- Users ←→ Conversations (participants)
- Users ←→ Roles
- Roles ←→ Permissions

## Best Practices

1. **Lean Queries**: Use `.lean()` for read-only operations
2. **Select Fields**: Only query needed fields with `.select()`
3. **Populate Wisely**: Avoid deep population chains
4. **Index Strategy**: Index based on query patterns
5. **Validation**: Validate at model level, not just API
6. **Error Handling**: Use model validation errors consistently
7. **Migrations**: Version schema changes properly