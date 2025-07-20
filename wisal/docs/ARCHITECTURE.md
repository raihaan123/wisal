# Wisal Platform Architecture

## Overview

The Wisal platform is built on a modern, scalable microservices architecture designed to handle high traffic, ensure data security, and provide real-time features for legal consultations and social activism.

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                          Load Balancer                           │
│                         (Nginx/HAProxy)                          │
└─────────────────┬───────────────────────┬───────────────────────┘
                  │                       │
        ┌─────────▼──────────┐  ┌────────▼────────┐
        │   Frontend (React) │  │  Mobile Apps    │
        │   - Next.js SSR    │  │  - React Native │
        │   - TypeScript     │  │  - Flutter      │
        └─────────┬──────────┘  └────────┬────────┘
                  │                       │
        ┌─────────▼───────────────────────▼────────┐
        │            API Gateway (Nginx)           │
        │         - Rate Limiting                  │
        │         - Authentication                 │
        │         - Request Routing                │
        └─────────┬───────────────────────┬────────┘
                  │                       │
    ┌─────────────▼──────────┐  ┌────────▼────────────┐
    │   Backend API (Node.js)│  │  WebSocket Server   │
    │   - Express.js         │  │  - Socket.io        │
    │   - TypeScript         │  │  - Real-time chat  │
    │   - REST APIs          │  │  - Notifications   │
    └─────────┬──────────────┘  └────────┬────────────┘
              │                           │
    ┌─────────▼───────────────────────────▼────────┐
    │              Service Layer                    │
    ├───────────────────┬───────────────────────────┤
    │  Business Logic   │   AI Services            │
    │  - User Service   │   - LangChain           │
    │  - Query Service  │   - Anthropic/OpenAI    │
    │  - Chat Service   │   - Vector Search       │
    └───────────────────┴───────────────────────────┘
              │
    ┌─────────▼─────────────────────────────────────┐
    │              Data Layer                       │
    ├─────────────┬──────────────┬─────────────────┤
    │  MongoDB    │  Redis       │  Elasticsearch  │
    │  - Users    │  - Cache     │  - Search       │
    │  - Queries  │  - Sessions  │  - Analytics    │
    │  - Messages │  - Queue     │  - Logging      │
    └─────────────┴──────────────┴─────────────────┘
```

## Component Architecture

### Frontend Architecture

```
Frontend/
├── Presentation Layer
│   ├── Pages (Route Components)
│   ├── Components (Reusable UI)
│   └── Layouts (Page Templates)
├── State Management
│   ├── Zustand Stores
│   ├── React Query (Server State)
│   └── Context Providers
├── Service Layer
│   ├── API Services
│   ├── WebSocket Services
│   └── Utility Services
└── Infrastructure
    ├── Authentication
    ├── Error Handling
    └── Performance Monitoring
```

### Backend Architecture

```
Backend/
├── API Layer
│   ├── Routes
│   ├── Controllers
│   └── Middleware
├── Service Layer
│   ├── Business Logic
│   ├── AI Integration
│   └── External Services
├── Data Access Layer
│   ├── Models (Mongoose)
│   ├── Repositories
│   └── Database Utils
└── Infrastructure
    ├── Authentication
    ├── Logging
    ├── Caching
    └── Queue Management
```

## Data Flow Architecture

### Request Flow

```
Client Request
    │
    ▼
Nginx (Load Balancer)
    │
    ▼
API Gateway
    │
    ├─► Rate Limiting
    ├─► Authentication
    └─► Request Validation
        │
        ▼
Backend API
    │
    ├─► Controller
    ├─► Service Layer
    ├─► Data Access
    └─► Response
        │
        ▼
Client Response
```

### Real-time Communication Flow

```
Client (WebSocket)
    │
    ▼
Socket.io Server
    │
    ├─► Authentication
    ├─► Room Management
    └─► Event Handling
        │
        ├─► Message Broadcasting
        ├─► Presence Updates
        └─► Typing Indicators
```

## Database Architecture

### MongoDB Schema Design

```javascript
// Users Collection
{
  _id: ObjectId,
  email: String,
  password: String (hashed),
  name: String,
  role: "seeker" | "lawyer" | "admin",
  profile: {
    avatar: String,
    phone: String,
    location: {
      type: "Point",
      coordinates: [longitude, latitude]
    }
  },
  createdAt: Date,
  updatedAt: Date
}

// Lawyers Collection
{
  _id: ObjectId,
  userId: ObjectId (ref: Users),
  barNumber: String,
  specializations: [String],
  experience: Number,
  education: [{
    degree: String,
    institution: String,
    year: Number
  }],
  consultationPrice: Number,
  rating: Number,
  reviewCount: Number,
  verified: Boolean,
  documents: [String],
  availability: {
    schedule: Object,
    timezone: String
  }
}

// Queries Collection
{
  _id: ObjectId,
  userId: ObjectId (ref: Users),
  title: String,
  description: String,
  category: String,
  urgency: "low" | "medium" | "high" | "critical",
  status: "open" | "assigned" | "in_progress" | "closed",
  assignedLawyer: ObjectId (ref: Lawyers),
  attachments: [String],
  budget: {
    min: Number,
    max: Number
  },
  createdAt: Date,
  updatedAt: Date
}

// Conversations Collection
{
  _id: ObjectId,
  participants: [ObjectId (ref: Users)],
  queryId: ObjectId (ref: Queries),
  lastMessage: {
    content: String,
    sender: ObjectId,
    timestamp: Date
  },
  status: "active" | "archived" | "closed",
  createdAt: Date
}

// Messages Collection
{
  _id: ObjectId,
  conversationId: ObjectId (ref: Conversations),
  sender: ObjectId (ref: Users),
  content: String,
  attachments: [String],
  readBy: [{
    userId: ObjectId,
    readAt: Date
  }],
  timestamp: Date
}
```

### Redis Data Structure

```
// Session Storage
session:{sessionId} → User session data

// Cache
cache:user:{userId} → User profile cache
cache:lawyer:{lawyerId} → Lawyer profile cache
cache:query:{queryId} → Query details cache

// Real-time
presence:{userId} → Online status
typing:{conversationId}:{userId} → Typing indicator

// Rate Limiting
rate:api:{ip} → API rate limit counter
rate:auth:{ip} → Auth rate limit counter
```

## AI Architecture

### LangChain Integration

```
User Query
    │
    ▼
Query Analysis Agent
    │
    ├─► Category Classification
    ├─► Urgency Assessment
    └─► Key Information Extraction
        │
        ▼
Lawyer Matching Agent
    │
    ├─► Semantic Search
    ├─► Expertise Matching
    └─► Availability Check
        │
        ▼
Response Generation Agent
    │
    ├─► Context Analysis
    ├─► Legal Suggestions
    └─► Safety Checks
```

### Vector Search Architecture

```
Lawyer Profiles
    │
    ▼
Embedding Generation
    │
    ├─► Specialization Embeddings
    ├─► Experience Embeddings
    └─► Case History Embeddings
        │
        ▼
Vector Database (Pinecone/Weaviate)
    │
    ▼
Semantic Search
    │
    ├─► Query Embedding
    ├─► Similarity Search
    └─► Ranking Algorithm
```

## Security Architecture

### Authentication Flow

```
Login Request
    │
    ▼
Validate Credentials
    │
    ▼
Generate JWT Token
    │
    ├─► Access Token (15min)
    └─► Refresh Token (7days)
        │
        ▼
Store in HttpOnly Cookie
    │
    ▼
Authenticated Requests
```

### Security Layers

1. **Network Security**
   - SSL/TLS encryption
   - DDoS protection
   - Web Application Firewall (WAF)

2. **Application Security**
   - Input validation
   - SQL injection prevention
   - XSS protection
   - CSRF tokens

3. **Data Security**
   - Encryption at rest
   - Encryption in transit
   - PII data masking
   - Secure file storage

## Scalability Architecture

### Horizontal Scaling

```
Load Balancer
    │
    ├─► Backend Instance 1
    ├─► Backend Instance 2
    ├─► Backend Instance 3
    └─► Backend Instance N
        │
        ▼
Shared Resources
    ├─► MongoDB Replica Set
    ├─► Redis Cluster
    └─► Elasticsearch Cluster
```

### Caching Strategy

1. **Browser Cache**
   - Static assets
   - API responses (with ETags)

2. **CDN Cache**
   - Images and media
   - JavaScript bundles
   - CSS files

3. **Application Cache (Redis)**
   - User sessions
   - Frequently accessed data
   - API response cache

4. **Database Cache**
   - Query result cache
   - Index optimization

## Performance Architecture

### Frontend Performance

1. **Code Splitting**
   - Route-based splitting
   - Component lazy loading
   - Dynamic imports

2. **Optimization Techniques**
   - Tree shaking
   - Bundle minification
   - Image optimization
   - Progressive Web App (PWA)

### Backend Performance

1. **API Optimization**
   - Response compression
   - Pagination
   - Field filtering
   - Query optimization

2. **Database Performance**
   - Proper indexing
   - Query optimization
   - Connection pooling
   - Read replicas

## Monitoring Architecture

### Application Monitoring

```
Application
    │
    ├─► Metrics Collection
    │   ├─► Response times
    │   ├─► Error rates
    │   └─► Throughput
    │
    ├─► Log Aggregation
    │   ├─► Application logs
    │   ├─► Error logs
    │   └─► Access logs
    │
    └─► Health Checks
        ├─► Service health
        ├─► Database health
        └─► External service health
```

### Infrastructure Monitoring

- **Prometheus**: Metrics collection
- **Grafana**: Visualization
- **ELK Stack**: Log management
- **Sentry**: Error tracking
- **New Relic/Datadog**: APM

## Deployment Architecture

### Container Architecture

```
Docker Host
    │
    ├─► Frontend Container
    │   └─► Node.js/React
    │
    ├─► Backend Container
    │   └─► Node.js/Express
    │
    ├─► MongoDB Container
    │   └─► Persistent Volume
    │
    ├─► Redis Container
    │   └─► Persistent Volume
    │
    └─► Nginx Container
        └─► Config Volume
```

### CI/CD Pipeline

```
Code Push → GitHub
    │
    ▼
GitHub Actions
    │
    ├─► Lint & Test
    ├─► Build
    ├─► Security Scan
    └─► Deploy
        │
        ├─► Staging
        └─► Production
```

## Disaster Recovery

### Backup Strategy

1. **Database Backups**
   - Daily automated backups
   - Point-in-time recovery
   - Geo-redundant storage

2. **Application Backups**
   - Code repository
   - Configuration backups
   - Environment snapshots

### Recovery Procedures

1. **RTO (Recovery Time Objective)**: < 4 hours
2. **RPO (Recovery Point Objective)**: < 1 hour

## Technology Stack Summary

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: TailwindCSS
- **State Management**: Zustand
- **Data Fetching**: React Query
- **Real-time**: Socket.io Client

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB
- **Cache**: Redis
- **Search**: Elasticsearch
- **AI**: LangChain

### Infrastructure
- **Container**: Docker
- **Orchestration**: Kubernetes
- **Proxy**: Nginx
- **Monitoring**: Prometheus/Grafana
- **CI/CD**: GitHub Actions

## Future Architecture Considerations

1. **Microservices Migration**
   - Separate auth service
   - Independent AI service
   - Message queue service

2. **Event-Driven Architecture**
   - Apache Kafka integration
   - Event sourcing
   - CQRS pattern

3. **Edge Computing**
   - CDN edge functions
   - Regional deployments
   - Latency optimization

4. **Advanced AI Features**
   - Custom ML models
   - Real-time translation
   - Voice consultations