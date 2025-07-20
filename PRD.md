# Product Requirements Document (PRD)
# Wisal - Legal Advice & Social Activism Platform

## Version 1.0
**Last Updated:** January 2025  
**Status:** MVP Definition

---

## Table of Contents
1. [Executive Summary](#executive-summary)
2. [Product **Overview**](#product-overview)
3. [User Personas](#user-personas)
4. [User Journeys](#user-journeys)
5. [Feature Requirements](#feature-requirements)
6. [Technical Architecture](#technical-architecture)
7. [Security & Compliance](#security-compliance)
8. [MVP Scope](#mvp-scope)
9. [LangGraph Implementation](#langgraph-implementation)

---

## 1. Executive Summary {#executive-summary}

Wisal is a dual-purpose platform that combines:
1. **Social Activism Hub** - A forum for verified activists to share news, stories, and urgent updates
2. **Legal Advice Marketplace** - An AI-powered system connecting individuals seeking legal advice with verified legal professionals

The platform addresses the critical gap between social activism and access to legal support, enabling activists and citizens to both stay informed about social issues and quickly obtain professional legal guidance when needed.

### Key Differentiators
- AI-powered intelligent matching between legal needs and professional expertise
- Integrated activism forum providing context for legal issues
- Asynchronous chat system respecting lawyer availability
- LinkedIn SSO for professional verification

---

## 2. Product Overview {#product-overview}

### 2.1 Vision Statement
To democratize access to legal advice while empowering social activists to share their stories and connect communities with the legal support they need.

### 2.2 Core Value Propositions

**For Advice Seekers:**
- Quick access to verified legal professionals
- AI-powered matching to relevant expertise
- Transparent lawyer credentials and experience
- Asynchronous communication respecting both parties' time

**For Legal Professionals:**
- Vetted client connections
- Flexible availability management
- Professional profile showcase
- Streamlined case intake process

**For Activists:**
- Platform to share urgent news and updates
- Direct connection to legal support for their causes
- Community engagement tools
- Verified contributor status

### 2.3 Platform Architecture
The platform consists of two interconnected systems:
1. **Public-facing Activism Hub** - No login required for viewing
2. **Legal Support System** - Requires authentication for all features

---

## 3. User Personas {#user-personas}

### 3.1 Primary Personas

#### Advice Seeker - "Sarah"
- **Demographics:** 28-45, urban/suburban, varied income levels
- **Goals:** Find quick, reliable legal advice for personal or activism-related issues
- **Pain Points:** 
  - Doesn't know which lawyer to trust
  - Uncertain about legal costs
  - Needs help urgently but lawyers are often unavailable
- **Tech Savvy:** Moderate to high

#### Legal Professional - "James"
- **Demographics:** 30-60, qualified lawyer/barrister, urban
- **Goals:** 
  - Build reputation and client base
  - Help people while managing time effectively
  - Contribute to social causes
- **Pain Points:**
  - Difficult to find clients who need specific expertise
  - Time management between pro bono and paid work
  - Verification of credentials is cumbersome
- **Tech Savvy:** Moderate

#### Activist Contributor - "Maya"
- **Demographics:** 25-50, engaged in social causes
- **Goals:**
  - Share important updates about social issues
  - Connect community with resources
  - Drive awareness and action
- **Pain Points:**
  - Limited platforms for verified activist content
  - Difficulty connecting supporters with legal help
  - Need for urgent issue amplification
- **Tech Savvy:** High

### 3.2 Secondary Personas

#### Platform Admin - "Alex"
- Manages user verification
- Moderates content
- Monitors platform health
- Ensures compliance

#### General Public User - "David"
- Browses activism content without account
- Shares interesting posts
- May convert to advice seeker when needed

---

## 4. User Journeys {#user-journeys}

### 4.1 Advice Seeker Journey

```
1. Discovery
   ├── Land on activism hub
   ├── Read relevant activism content
   └── Click "Need Legal Help?" button

2. Initial Engagement
   ├── Choose: Ask Question OR Submit Case
   ├── Enter legal issue description
   └── System processes with AI

3. Matching Process
   ├── AI categorizes issue
   ├── Matches with suitable lawyers
   └── Generates summary for lawyers

4. Communication
   ├── Receive lawyer responses
   ├── View lawyer profiles
   ├── Initiate chat with chosen lawyer
   └── Continue async conversation

5. Resolution
   ├── Receive legal guidance
   ├── Rate experience
   └── Option to escalate to full case
```

### 4.2 Legal Professional Journey

```
1. Onboarding
   ├── Sign up via form or LinkedIn
   ├── Complete detailed profile
   ├── Upload credentials
   └── Await verification

2. Verification
   ├── Admin reviews credentials
   ├── Profile approved/rejected
   └── Receive notification

3. Active Participation
   ├── Set availability in profile
   ├── Receive matched queries
   ├── Review case summaries
   ├── Accept/decline requests
   └── Respond via chat

4. Case Management
   ├── Track active conversations
   ├── Update case status
   ├── Manage time allocation
   └── Close completed queries
```

### 4.3 Activist Journey

```
1. Application
   ├── Request contributor access
   ├── Provide activism credentials
   └── Await admin approval

2. Content Creation
   ├── Submit posts for review
   ├── Include relevant tags/topics
   └── Track approval status

3. Engagement
   ├── Respond to comments
   └── Connect readers to legal help
```

---

## 5. Feature Requirements {#feature-requirements}

### 5.1 Landing Page & Activism Hub

#### 5.1.1 Public Homepage
- **Hero Section**
  - Platform mission statement
  - "Need Legal Help?" CTA button (persistent)
  - Login/Sign Up options

- **Activism Feed**
  - Card-based layout with:
    - Title, author, date, tags
    - Featured image
    - Content snippet
    - "Read More" link
  - Filtering options:
    - By topic (Housing, Rights, Environment, etc.)
    - By urgency
    - By date
  - Sort options:
    - Most Recent
    - Trending
    - Featured

- **Sidebar**
  - Persistent help message
  - Quick topic navigation
  - Trending tags

#### 5.1.2 Post Detail View
- Full article content
- Author bio with verification badge
- Related posts
- Share functionality
- "Need Legal Help?" context-aware CTA

### 5.2 Authentication & Onboarding

#### 5.2.1 User Type Selection
- Modal with two options:
  - "I am seeking legal advice"
  - "I am a legal professional"
- LinkedIn SSO option for both
- Email/password alternative

#### 5.2.2 Advice Seeker Registration
**Required Fields:**
- Name
- Email
- Password & confirmation
- Location (postcode)

**Optional Fields:**
- Gender
- Phone number
- Preferred contact method

#### 5.2.3 Legal Professional Registration
**Required Fields:**
- Name
- Email
- Password & confirmation
- Location
- Legal specialisms (multi-select)
- Qualified since (year)
- Current role & employer

**Optional Fields:**
- Bar/certification number
- Languages spoken
- Availability preferences
- Pro bono interest areas

**Verification Documents:**
- Professional license upload
- Bar council certificate
- Work email verification

#### 5.2.4 LinkedIn Integration
- Pre-populate profile fields
- Verify professional status
- Import work history
- Extract specializations

### 5.3 Legal Support System

#### 5.3.1 Legal Help Modal
Triggered by "Need Legal Help?" button:

**Option A: Ask a Legal Question**
- Text input (max 500 characters)
- Category auto-suggestion
- Urgency indicator
- Submit button

**Option B: Submit a Legal Case**
- Detailed description field
- File upload capability
- Relevant dates
- Desired outcome
- Budget range (optional)

#### 5.3.2 AI Processing Engine
- **Natural Language Processing**
  - Extract key legal concepts
  - Identify jurisdiction requirements
  - Categorize by legal domain
  - Assess complexity level

- **Matching Algorithm**
  - Vector similarity search
  - Expertise matching score
  - Availability weighting
  - Location relevance
  - Language matching

- **Task Generation** (if needed)
  - Break complex cases into subtasks
  - Identify required specialisms
  - Estimate time requirements
  - Create workflow structure

#### 5.3.3 Search Interface
- **Pre-login Search**
  - Prompt: "What would you like help with?"
  - Show anonymized match count
  - Display "Sign up to connect" CTA

- **Post-login Search**
  - Full lawyer profiles
  - Real-time availability
  - Direct chat initiation
  - Saved search functionality

### 5.4 Communication System

#### 5.4.1 Chat Interface
- **Conversation List**
  - Active chats
  - Pending requests
  - Archived conversations
  - Unread indicator

- **Chat Window**
  - Message history
  - File sharing
  - Read receipts
  - Typing indicators
  - Timestamp display

- **AI Assistant Features**
  - Auto-generated summaries
  - Suggested responses
  - Key point extraction
  - Next step recommendations

#### 5.4.2 Notification System
- **Push Notifications**
  - New chat requests
  - Message received
  - Profile approval status
  - Urgent updates

- **Email Notifications**
  - Daily digest option
  - Urgent message alerts
  - Weekly availability reminder

### 5.5 Profile Management

#### 5.5.1 Advice Seeker Profile
- Basic information
- Case history (private)
- Saved lawyers
- Communication preferences
- Notification settings

#### 5.5.2 Legal Professional Profile
- **Public View**
  - Name & photo
  - Verification badge
  - Specializations
  - Years of experience
  - Languages
  - Availability status
  - Response time average
  - Anonymous reviews/ratings

- **Private Settings**
  - Availability calendar (Calendar view like Cal.com for office hours)
  - Case load limits
  - Notification preferences

### 5.6 Admin Dashboard

#### 5.6.1 User Management
- Verification queue
- Profile approval/rejection
- Credential validation
- User reports handling

#### 5.6.2 Content Moderation
- Post approval queue
- Content flagging system
- Activist verification

---

## 6. Technical Architecture {#technical-architecture}

### 6.1 Frontend
- **Framework:** React 18+ with TypeScript
- **Styling:** TailwindCSS (used throughout - color scheme to be managed later)
- **State Management:** Zustand
- **Real-time:** Database polling (~10s)
- **PWA:** Service workers for offline capability
- **Design:** Minimal layout, desktop-first, highly responsive design

### 6.2 Backend
- **Runtime:** Node.js with Express
- **Language:** TypeScript
- **API:** RESTful + GraphQL for complex queries
- **Authentication:** JWT with refresh tokens
- **File Storage:** Local / mount on container

### 6.3 Database
- **Primary:** MongoDB via docker compose
- **Search:** Elasticsearch for full-text search
- **Vector DB:** MongoDB with vector indices (preferred) or ChromaDB if needed
- Store artifacts locally in container volume

### 6.4 AI/ML Stack
- **LLM:** OpenAI GPT-4o for text processing
- **Embeddings:** Ada-002 for semantic search
- **Framework:** LangGraph for orchestration

### 6.5 Infrastructure
- **Containerization:** Docker + Docker Compose

### 6.6 Third-party Services
- **OAuth:** LinkedIn OAuth 2.0

### 6.7 Docker Compose Organization

```yaml
# docker-compose.yml structure
version: '3.8'

services:
  # Frontend React Application
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - REACT_APP_API_URL=http://localhost:4000
    volumes:
      - ./frontend:/app
      - /app/node_modules
    depends_on:
      - backend

  # Backend Node.js API
  backend:
    build: ./backend
    ports:
      - "4000:4000"
    environment:
      - NODE_ENV=development
      - JWT_SECRET=${JWT_SECRET}
      - MONGODB_URI=mongodb://mongo:27017/wisal
      - ELASTICSEARCH_NODE=http://elasticsearch:9200
      - OPENAI_API_KEY=${OPENAI_API_KEY}
    volumes:
      - ./backend:/app
      - /app/node_modules
      - uploads:/app/uploads
    depends_on:
      - mongo
      - elasticsearch
      - redis

  # MongoDB Database
  mongo:
    image: mongo:7.0
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db
      - ./backend/scripts/init-mongo.js:/docker-entrypoint-initdb.d/init-mongo.js
    environment:
      - MONGO_INITDB_DATABASE=wisal

  # Elasticsearch for Full-text Search
  elasticsearch:
    image: elasticsearch:8.11.0
    ports:
      - "9200:9200"
    environment:
      - discovery.type=single-node
      - xpack.security.enabled=false
      - "ES_JAVA_OPTS=-Xms512m -Xmx512m"
    volumes:
      - es_data:/usr/share/elasticsearch/data

  # Redis for Caching & Sessions
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  # Nginx Reverse Proxy (Production)
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./nginx/ssl:/etc/nginx/ssl
    depends_on:
      - frontend
      - backend

volumes:
  mongo_data:
  es_data:
  redis_data:
  uploads:

networks:
  default:
    name: wisal_network
```

### 6.8 Data Structures

#### 6.8.1 Core Models

```typescript
// User Model
interface User {
  _id: ObjectId;
  email: string;
  password?: string; // null for OAuth users
  name: string;
  role: 'seeker' | 'lawyer' | 'activist' | 'admin';
  profile: SeekerProfile | LawyerProfile | ActivistProfile;
  authProvider: 'local' | 'linkedin';
  linkedinId?: string;
  isVerified: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Seeker Profile
interface SeekerProfile {
  location: {
    postcode: string;
    city?: string;
    country: string;
  };
  gender?: 'male' | 'female' | 'other' | 'prefer-not-to-say';
  phone?: string;
  preferredContact: 'email' | 'phone' | 'chat';
  savedLawyers: ObjectId[];
  caseHistory: ObjectId[];
}

// Lawyer Profile
interface LawyerProfile {
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
  stats: {
    casesHandled: number;
    responseTime: number; // minutes
    rating: number;
    reviewCount: number;
  };
}

// Availability Slot
interface AvailabilitySlot {
  dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  startTime: string; // "09:00"
  endTime: string; // "17:00"
  isRecurring: boolean;
}

// Legal Query (as defined in LangGraph section)
interface LegalQuery {
  _id: ObjectId;
  seekerId: ObjectId;
  type: 'question' | 'case';
  category: string;
  description: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  jurisdiction?: string;
  attachments?: string[]; // file URLs
  aiAnalysis: {
    summary: string;
    categories: string[];
    complexity: 'simple' | 'moderate' | 'complex';
    estimatedTime: number; // minutes
    suggestedSpecialisms: string[];
  };
  matchedLawyers: {
    lawyerId: ObjectId;
    score: number;
    reason: string;
  }[];
  status: 'pending' | 'analyzing' | 'matched' | 'accepted' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}

// Chat Conversation
interface Conversation {
  _id: ObjectId;
  queryId: ObjectId;
  seekerId: ObjectId;
  lawyerId: ObjectId;
  messages: Message[];
  status: 'active' | 'closed' | 'archived';
  metadata: {
    startedAt: Date;
    lastMessageAt: Date;
    closedAt?: Date;
    closureReason?: string;
  };
}

// Message
interface Message {
  _id: ObjectId;
  senderId: ObjectId;
  senderRole: 'seeker' | 'lawyer' | 'system';
  content: string;
  attachments?: string[];
  metadata?: {
    isAiGenerated?: boolean;
    suggestedResponses?: string[];
  };
  readAt?: Date;
  createdAt: Date;
}

// Activism Post
interface ActivismPost {
  _id: ObjectId;
  authorId: ObjectId;
  title: string;
  content: string;
  excerpt: string;
  featuredImage?: string;
  tags: string[];
  category: 'housing' | 'rights' | 'environment' | 'justice' | 'other';
  urgency: 'normal' | 'urgent' | 'critical';
  status: 'draft' | 'pending' | 'published' | 'archived';
  stats: {
    views: number;
    shares: number;
    linkedCases: number;
  };
  relatedPosts?: ObjectId[];
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Role and Permission Models for RBAC
interface Role {
  _id: ObjectId;
  name: string;
  description: string;
  permissions: Permission[];
  isSystem: boolean; // cannot be deleted
  createdAt: Date;
}

interface Permission {
  _id: ObjectId;
  resource: string; // e.g., 'users', 'posts', 'queries'
  action: string; // e.g., 'create', 'read', 'update', 'delete'
  conditions?: Record<string, any>; // e.g., { ownOnly: true }
}
```

### 6.9 API Endpoints

#### 6.9.1 Authentication Endpoints

```typescript
// Auth Routes
POST   /api/auth/register
       Body: { email, password, name, role, profile }
       Response: { token, user }

POST   /api/auth/login
       Body: { email, password }
       Response: { token, user }

GET    /api/auth/linkedin
       Redirects to LinkedIn OAuth

GET    /api/auth/linkedin/callback
       Query: { code }
       Response: { token, user }

POST   /api/auth/refresh
       Body: { refreshToken }
       Response: { token, refreshToken }

POST   /api/auth/logout
       Headers: { Authorization: Bearer <token> }
       Response: { success: true }
```

#### 6.9.2 User & Profile Endpoints

```typescript
// User Routes
GET    /api/users/me
       Headers: { Authorization: Bearer <token> }
       Response: { user }

PUT    /api/users/me
       Headers: { Authorization: Bearer <token> }
       Body: { updates }
       Response: { user }

GET    /api/lawyers
       Query: { specialisms?, location?, available?, page?, limit? }
       Response: { lawyers, total, page }

GET    /api/lawyers/:id
       Response: { lawyer }

PUT    /api/lawyers/:id/availability
       Headers: { Authorization: Bearer <token> }
       Body: { schedule }
       Response: { availability }
```

#### 6.9.3 Legal Query Endpoints

```typescript
// Query Routes
POST   /api/queries
       Headers: { Authorization: Bearer <token> }
       Body: { type, description, urgency, attachments? }
       Response: { query, conversationId }

GET    /api/queries/:id
       Headers: { Authorization: Bearer <token> }
       Response: { query }

POST   /api/queries/:id/match
       Headers: { Authorization: Bearer <token> }
       Response: { matchedLawyers }

POST   /api/queries/:id/accept
       Headers: { Authorization: Bearer <token> }
       Body: { lawyerId }
       Response: { conversation }
```

#### 6.9.4 Chat/Conversation Endpoints

```typescript
// Conversation Routes
GET    /api/conversations
       Headers: { Authorization: Bearer <token> }
       Query: { status?, page?, limit? }
       Response: { conversations, total }

GET    /api/conversations/:id
       Headers: { Authorization: Bearer <token> }
       Response: { conversation }

POST   /api/conversations/:id/messages
       Headers: { Authorization: Bearer <token> }
       Body: { content, attachments? }
       Response: { message }

GET    /api/conversations/:id/messages
       Headers: { Authorization: Bearer <token> }
       Query: { since?, limit? }
       Response: { messages }

PUT    /api/conversations/:id/close
       Headers: { Authorization: Bearer <token> }
       Body: { reason }
       Response: { conversation }
```

#### 6.9.5 Activism Hub Endpoints

```typescript
// Public Post Routes (No Auth Required)
GET    /api/posts
       Query: { category?, urgency?, tags?, search?, page?, limit? }
       Response: { posts, total }

GET    /api/posts/:id
       Response: { post }

GET    /api/posts/trending
       Query: { limit? }
       Response: { posts }

// Authenticated Post Routes
POST   /api/posts
       Headers: { Authorization: Bearer <token> }
       Body: { title, content, category, tags, featuredImage? }
       Response: { post }

PUT    /api/posts/:id
       Headers: { Authorization: Bearer <token> }
       Body: { updates }
       Response: { post }

DELETE /api/posts/:id
       Headers: { Authorization: Bearer <token> }
       Response: { success: true }
```

#### 6.9.6 Admin Endpoints

```typescript
// Admin Routes
GET    /api/admin/users
       Headers: { Authorization: Bearer <token> }
       Query: { role?, verified?, page?, limit? }
       Response: { users, total }

PUT    /api/admin/users/:id/verify
       Headers: { Authorization: Bearer <token> }
       Body: { verified, reason? }
       Response: { user }

GET    /api/admin/posts/pending
       Headers: { Authorization: Bearer <token> }
       Response: { posts }

PUT    /api/admin/posts/:id/approve
       Headers: { Authorization: Bearer <token> }
       Body: { approved, reason? }
       Response: { post }

GET    /api/admin/stats
       Headers: { Authorization: Bearer <token> }
       Response: { userStats, postStats, queryStats }
```

#### 6.9.7 Search & AI Endpoints

```typescript
// Search Routes
GET    /api/search/lawyers
       Query: { query, filters? }
       Response: { results, facets }

POST   /api/search/semantic
       Body: { query, type }
       Response: { results }

// AI Processing Routes
POST   /api/ai/analyze-query
       Headers: { Authorization: Bearer <token> }
       Body: { description }
       Response: { analysis }

POST   /api/ai/suggest-response
       Headers: { Authorization: Bearer <token> }
       Body: { conversationId, context }
       Response: { suggestions }
```

---

## 7. Security & Compliance {#security-compliance}

### 7.3 Access Control
- Role-based permissions (RBAC) - setup both tables (roles and permissions)

### 7.4 Content Moderation
- Human review queue
- Report abuse functionality

---
---

## 8. MVP Scope {#mvp-scope}

### 8.1 MVP Features (Phase 1)
✅ **Authentication & Profiles**
- Basic registration (email/password)
- LinkedIn SSO
- Simple profile creation
- Manual verification process (admin dashboard)

✅ **Activism Hub**
- Public post viewing
- Basic filtering/sorting
- Admin post creation
- Share functionality

✅ **Legal Matching**
- AI-powered categorization
- Basic matching algorithm
- Search results display
- Profile viewing

✅ **Communication**
- Asynchronous chat

✅ **Admin Tools**
- User verification
- Content moderation

---

## Appendices

### A. Wireframe References
- See Figma board: [Wisal App MVP](https://www.figma.com/board/6MpL7WNHgDSYEvTTqC4cZQ/Wisal-App-MVP)

### B. Technical Specifications
- Detailed API documentation (to be created)
- Database schema (to be created)
- Security protocols (to be created)

### C. Legal Considerations
- Terms of Service draft (pending legal review)
- Privacy Policy draft (pending legal review)
- Lawyer agreement template (pending legal review)

---

**Document Control:**
- Author: Product Team
- Reviewers: [To be added]
- Approval: [Pending]
- Next Review Date: [To be scheduled]




## 9. LangGraph Implementation {#langgraph-implementation}

### 9.1 Query Processing Architecture

#### 9.1.1 Legal Query Data Structure
```typescript
interface LegalQuery {
  id: string;
  userId: string;
  type: 'question' | 'case';
  category: string;
  description: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  jurisdiction?: string;
  attachments?: File[];
  metadata: {
    createdAt: Date;
    processedAt?: Date;
    matchedLawyers?: string[];
    aiSummary?: string;
  };
}
```

This structured query object will be:
- The start of each legal consultation chat
- Handled differently in the UI with special formatting
- Type-safe throughout the application

#### 9.1.2 Conversational Agent Flow

```
1. Initial Query Intake
   ├── User submits basic description
   ├── Agent analyzes for missing information
   └── Generates follow-up questions

2. Information Gathering Loop
   ├── Agent asks clarifying questions
   ├── User provides responses
   ├── Agent validates completeness
   └── Repeat until sufficient info collected

3. Case Preparation
   ├── Agent summarizes collected information
   ├── Categorizes legal issue
   ├── Identifies relevant jurisdictions
   └── Prepares structured case brief

4. Lawyer Matching
   ├── RAG search across lawyer profiles
   ├── Vector similarity matching
   ├── Availability filtering
   └── Ranking by relevance score

5. Connection Request
   ├── Send case brief to matched lawyers
   ├── Await acceptance
   └── Initiate chat session
```

#### 9.1.3 Agent Behavior Rules

- **Persistence**: Agent must continue querying until all required information is collected
- **Context Awareness**: Maintain conversation context throughout the gathering process
- **Validation**: Ensure collected information is sufficient before attempting lawyer match
- **User Experience**: Provide clear explanations for why information is needed

#### 9.1.4 Technical Implementation

- **Framework**: LangGraph for orchestration
- **LLM**: OpenAI GPT-4o for conversational intelligence
- **State Management**: Persist conversation state between interactions
- **Error Handling**: Graceful fallbacks for unclear responses

#### 9.1.5 Configuration

- OpenAI API key stored in `.env` file
- Environment variable: `OPENAI_API_KEY`
- Must be mounted into container at runtime