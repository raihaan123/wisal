# Wisal API Documentation

## Base URL
- Development: `http://localhost:4000/api`
- Production: `https://api.wisal.com/api`

## Authentication

The API uses JWT (JSON Web Token) authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## API Endpoints

### Authentication Endpoints

#### Register New User
```http
POST /auth/register
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "name": "John Doe",
  "role": "seeker",  // "seeker" or "lawyer"
  "phone": "+1234567890"
}
```

**Response:**
```json
{
  "token": "jwt-token",
  "user": {
    "id": "user-id",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "seeker"
  }
}
```

#### Login
```http
POST /auth/login
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response:**
```json
{
  "token": "jwt-token",
  "refreshToken": "refresh-token",
  "user": {
    "id": "user-id",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "seeker"
  }
}
```

#### LinkedIn OAuth Login
```http
GET /auth/linkedin-custom
```

**Description:** Redirects user to LinkedIn for authentication using OpenID Connect.

**LinkedIn Callback:**
```http
GET /auth/linkedin/callback-custom?code=<auth-code>&state=<state>
```

**Description:** Handles LinkedIn OAuth callback and creates/updates user account.

#### Refresh Token
```http
POST /auth/refresh
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response:**
```json
{
  "token": "jwt-token",
  "user": {
    "id": "user-id",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "seeker"
  }
}
```

#### LinkedIn OAuth
```http
GET /auth/linkedin
```
Redirects to LinkedIn OAuth flow

#### Refresh Token
```http
POST /auth/refresh
```

**Request Body:**
```json
{
  "refreshToken": "refresh-token"
}
```

#### Get Current User
```http
GET /auth/me
```
Requires authentication

**Response:**
```json
{
  "id": "user-id",
  "email": "user@example.com",
  "name": "John Doe",
  "role": "seeker",
  "profile": {
    "phone": "+1234567890",
    "avatar": "https://example.com/avatar.jpg"
  }
}
```

### User Endpoints

#### Get User Profile
```http
GET /users/:userId
```

**Response:**
```json
{
  "id": "user-id",
  "name": "John Doe",
  "email": "user@example.com",
  "role": "seeker",
  "profile": {
    "bio": "User bio",
    "avatar": "avatar-url",
    "location": "City, Country"
  }
}
```

#### Update User Profile
```http
PUT /users/:userId
```
Requires authentication (own profile only)

**Request Body:**
```json
{
  "name": "Updated Name",
  "profile": {
    "bio": "Updated bio",
    "location": "New City"
  }
}
```

#### Upload Avatar
```http
POST /users/:userId/avatar
```
Requires authentication

**Request:** Multipart form data with image file

#### Get User Conversations
```http
GET /users/:userId/conversations
```
Requires authentication

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 20)
- `status`: active, archived, closed

### Lawyer Endpoints

#### Search Lawyers
```http
GET /lawyers/search
```

**Query Parameters:**
- `q`: Search query
- `specialization`: Legal specialization
- `location`: City or region
- `minRating`: Minimum rating (1-5)
- `maxPrice`: Maximum consultation price
- `verified`: true/false
- `page` (default: 1)
- `limit` (default: 20)

**Response:**
```json
{
  "lawyers": [
    {
      "id": "lawyer-id",
      "user": {
        "name": "Jane Smith",
        "avatar": "avatar-url"
      },
      "specializations": ["family", "civil"],
      "rating": 4.5,
      "reviewCount": 23,
      "consultationPrice": 100,
      "verified": true,
      "location": "New York, NY"
    }
  ],
  "total": 150,
  "page": 1,
  "pages": 8
}
```

#### Get Lawyer Profile
```http
GET /lawyers/:lawyerId
```

**Response:**
```json
{
  "id": "lawyer-id",
  "user": {
    "id": "user-id",
    "name": "Jane Smith",
    "email": "lawyer@example.com"
  },
  "barNumber": "123456",
  "specializations": ["family", "civil", "corporate"],
  "experience": 10,
  "education": [
    {
      "degree": "JD",
      "institution": "Harvard Law School",
      "year": 2010
    }
  ],
  "consultationPrice": 100,
  "bio": "Experienced lawyer specializing in...",
  "verified": true,
  "rating": 4.5,
  "reviewCount": 23
}
```

#### Create Lawyer Profile
```http
POST /lawyers
```
Requires authentication (lawyer role)

**Request Body:**
```json
{
  "barNumber": "123456",
  "specializations": ["family", "civil"],
  "experience": 10,
  "education": [...],
  "consultationPrice": 100,
  "bio": "Professional bio"
}
```

#### Update Lawyer Profile
```http
PUT /lawyers/:lawyerId
```
Requires authentication (own profile)

#### Upload Verification Documents
```http
POST /lawyers/:lawyerId/verification
```
Requires authentication

**Request:** Multipart form data with document files

### Legal Query Endpoints

#### Get Queries
```http
GET /queries
```

**Query Parameters:**
- `status`: open, assigned, closed
- `urgency`: low, medium, high, critical
- `category`: family, civil, criminal, corporate, etc.
- `userId`: Filter by user
- `lawyerId`: Filter by assigned lawyer
- `page` (default: 1)
- `limit` (default: 20)

**Response:**
```json
{
  "queries": [
    {
      "id": "query-id",
      "title": "Legal Query Title",
      "description": "Brief description",
      "category": "family",
      "urgency": "high",
      "status": "open",
      "user": {
        "id": "user-id",
        "name": "John Doe"
      },
      "createdAt": "2024-01-15T10:00:00Z"
    }
  ],
  "total": 45,
  "page": 1,
  "pages": 3
}
```

#### Search Queries
```http
GET /queries/search
```

**Query Parameters:**
- `q`: Search text
- `filters`: JSON object with additional filters

#### Create Query
```http
POST /queries
```
Requires authentication

**Request Body:**
```json
{
  "title": "Need help with custody agreement",
  "description": "Detailed description of the legal issue...",
  "category": "family",
  "urgency": "high",
  "preferredLocation": "New York",
  "budget": {
    "min": 100,
    "max": 500
  }
}
```

#### Update Query
```http
PUT /queries/:queryId
```
Requires authentication (query owner)

#### Assign Lawyer to Query
```http
POST /queries/:queryId/assign
```
Requires authentication

**Request Body:**
```json
{
  "lawyerId": "lawyer-id"
}
```

### Conversation Endpoints

#### Get Conversations
```http
GET /conversations
```
Requires authentication

**Query Parameters:**
- `role`: participant role filter
- `status`: active, archived
- `page` (default: 1)
- `limit` (default: 20)

#### Start Conversation
```http
POST /conversations
```
Requires authentication

**Request Body:**
```json
{
  "participants": ["user-id-1", "user-id-2"],
  "queryId": "query-id",  // optional
  "initialMessage": "Hello, I need help with..."
}
```

#### Get Messages
```http
GET /conversations/:conversationId/messages
```
Requires authentication (participant only)

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 50)

**Response:**
```json
{
  "messages": [
    {
      "id": "message-id",
      "conversationId": "conversation-id",
      "sender": {
        "id": "user-id",
        "name": "John Doe"
      },
      "content": "Message content",
      "timestamp": "2024-01-15T10:30:00Z",
      "read": true
    }
  ],
  "total": 125,
  "page": 1
}
```

#### Send Message
```http
POST /conversations/:conversationId/messages
```
Requires authentication (participant only)

**Request Body:**
```json
{
  "content": "Message content",
  "attachments": ["file-id-1", "file-id-2"]  // optional
}
```

#### Rate Conversation
```http
POST /conversations/:conversationId/rate
```
Requires authentication (participant only)

**Request Body:**
```json
{
  "rating": 5,
  "feedback": "Excellent service"
}
```

### Social Activism Endpoints

#### Get Posts
```http
GET /posts
```

**Query Parameters:**
- `type`: campaign, article, event
- `category`: Filter by activism category
- `author`: Filter by author ID
- `trending`: true/false
- `page` (default: 1)
- `limit` (default: 20)

**Response:**
```json
{
  "posts": [
    {
      "id": "post-id",
      "title": "Campaign Title",
      "content": "Post content",
      "type": "campaign",
      "author": {
        "id": "user-id",
        "name": "Jane Doe"
      },
      "likes": 45,
      "comments": 12,
      "shares": 8,
      "createdAt": "2024-01-15T09:00:00Z"
    }
  ],
  "total": 200,
  "page": 1
}
```

#### Create Post
```http
POST /posts
```
Requires authentication

**Request Body:**
```json
{
  "title": "Campaign for Legal Reform",
  "content": "Detailed content...",
  "type": "campaign",
  "category": "legal-reform",
  "tags": ["justice", "reform", "community"]
}
```

#### Like Post
```http
POST /posts/:postId/like
```
Requires authentication

#### Add Comment
```http
POST /posts/:postId/comments
```
Requires authentication

**Request Body:**
```json
{
  "content": "Great initiative!"
}
```

### AI Service Endpoints

#### Analyze Legal Query
```http
POST /ai/analyze-query
```

**Request Body:**
```json
{
  "description": "I need help with a custody dispute...",
  "urgency": "high",
  "jurisdiction": "New York"
}
```

**Response:**
```json
{
  "category": "family",
  "subcategories": ["custody", "divorce"],
  "urgencyAssessment": "high",
  "suggestedSpecializations": ["family law", "child custody"],
  "estimatedComplexity": "medium",
  "keyIssues": ["custody rights", "visitation schedule"]
}
```

#### Get Response Suggestions
```http
POST /ai/suggest-response
```
Requires authentication

**Request Body:**
```json
{
  "conversationId": "conversation-id",
  "context": "Current conversation context",
  "role": "lawyer"
}
```

**Response:**
```json
{
  "suggestions": [
    "Based on what you've described, you may want to consider...",
    "Have you documented all incidents? This could be important for..."
  ]
}
```

#### Semantic Lawyer Search
```http
POST /ai/semantic-search
```

**Request Body:**
```json
{
  "query": "Need lawyer experienced in international custody disputes",
  "filters": {
    "location": "New York",
    "minRating": 4
  },
  "limit": 10
}
```

**Response:**
```json
{
  "results": [
    {
      "lawyerId": "lawyer-id",
      "relevanceScore": 0.95,
      "matchedExpertise": ["international law", "custody"],
      "profile": {...}
    }
  ],
  "count": 10
}
```

#### AI Service Health Check
```http
GET /ai/health
```

**Response:**
```json
{
  "status": "ok",
  "models": {
    "anthropic": "active",
    "openai": "active",
    "gemini": "active"
  },
  "vectorStore": "connected",
  "timestamp": "2024-01-15T10:00:00Z"
}
```

#### Categorize Legal Query
```http
POST /ai/categorize
```

**Request Body:**
```json
{
  "description": "I need help with a workplace discrimination case..."
}
```

**Response:**
```json
{
  "category": "employment",
  "subcategories": ["discrimination", "workplace rights"],
  "confidence": 0.92,
  "suggestedTags": ["civil rights", "employment law", "discrimination"]
}
```

#### Generate Text Embeddings
```http
POST /ai/embeddings
```

**Request Body:**
```json
{
  "text": "Experienced lawyer specializing in intellectual property and patent law"
}
```

**Response:**
```json
{
  "embeddings": [0.123, -0.456, 0.789, ...],
  "dimension": 1536
}
```

#### Index Lawyer Profile (Admin Only)
```http
POST /ai/index-lawyer
```

**Request Body:**
```json
{
  "lawyerId": "lawyer-123",
  "profile": {
    "name": "Jane Smith",
    "specializations": ["family law", "mediation"],
    "experience": "15 years of experience in family law...",
    "location": "New York, NY"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Lawyer profile indexed successfully"
}
```

#### Batch Index Lawyers (Admin Only)
```http
POST /ai/batch-index-lawyers
```

**Request Body:**
```json
{
  "profiles": [
    {
      "id": "lawyer-123",
      "profile": { ... }
    },
    {
      "id": "lawyer-456",
      "profile": { ... }
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Indexed 2 lawyer profiles",
  "count": 2
}
```

#### Clear Conversation Context
```http
POST /ai/clear-context
```

**Request Body:**
```json
{
  "conversationId": "conversation-123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Conversation context cleared"
}
```

### Admin Endpoints

All admin endpoints require authentication with an admin role.

#### Get All Users
```http
GET /admin/users
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `role` (optional): Filter by role (seeker, lawyer, activist, admin)
- `status` (optional): Filter by status (active, inactive, suspended)

**Response:**
```json
{
  "users": [
    {
      "id": "user-123",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "seeker",
      "status": "active",
      "createdAt": "2024-01-15T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "pages": 8
  }
}
```

#### Update User Status
```http
PUT /admin/users/:userId/status
```

**Request Body:**
```json
{
  "status": "suspended",
  "reason": "Violation of terms of service"
}
```

#### Get System Statistics
```http
GET /admin/stats
```

**Response:**
```json
{
  "users": {
    "total": 1500,
    "seekers": 1200,
    "lawyers": 250,
    "activists": 45,
    "admins": 5
  },
  "queries": {
    "total": 3200,
    "pending": 150,
    "resolved": 3050
  },
  "conversations": {
    "total": 2800,
    "active": 320
  },
  "lastUpdated": "2024-01-15T10:00:00Z"
}
```

#### Manage Roles and Permissions
```http
GET /admin/roles
POST /admin/roles
PUT /admin/roles/:roleId
DELETE /admin/roles/:roleId
```

**Create Role Request:**
```json
{
  "name": "moderator",
  "permissions": ["view_users", "moderate_posts", "view_reports"],
  "description": "Community moderator role"
}
```

#### View Activity Logs
```http
GET /admin/logs
```

**Query Parameters:**
- `type` (optional): Log type (auth, api, error, admin)
- `userId` (optional): Filter by user
- `startDate` (optional): Start date (ISO 8601)
- `endDate` (optional): End date (ISO 8601)

**Response:**
```json
{
  "logs": [
    {
      "id": "log-123",
      "type": "admin",
      "action": "user_suspended",
      "userId": "admin-456",
      "targetId": "user-789",
      "details": { ... },
      "timestamp": "2024-01-15T10:00:00Z"
    }
  ]
}
```

#### Manage Legal Categories
```http
GET /admin/categories
POST /admin/categories
PUT /admin/categories/:categoryId
DELETE /admin/categories/:categoryId
```

**Create Category Request:**
```json
{
  "name": "Immigration Law",
  "slug": "immigration-law",
  "description": "Legal matters related to immigration",
  "parentId": null,
  "active": true
}
```

## WebSocket Events

Connect to WebSocket at `ws://localhost:4000` (or production URL)

### Client Events (Emit)

#### Join User Room
```javascript
socket.emit('join-user', { userId: 'user-id' });
```

#### Join Conversation
```javascript
socket.emit('join-conversation', { conversationId: 'conversation-id' });
```

#### Typing Indicators
```javascript
socket.emit('typing-start', { conversationId: 'conversation-id' });
socket.emit('typing-stop', { conversationId: 'conversation-id' });
```

### Server Events (Listen)

#### New Message
```javascript
socket.on('new-message', (data) => {
  // data: { conversationId, message, sender }
});
```

#### User Typing
```javascript
socket.on('user-typing', (data) => {
  // data: { conversationId, userId, isTyping }
});
```

#### User Status
```javascript
socket.on('user-status', (data) => {
  // data: { userId, status: 'online' | 'offline' }
});
```

## Error Responses

All endpoints return consistent error responses:

```json
{
  "error": "Error type",
  "message": "Human-readable error message",
  "code": "ERROR_CODE",
  "details": {}  // Optional additional details
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `422` - Validation Error
- `429` - Too Many Requests
- `500` - Internal Server Error

## Rate Limiting

API endpoints are rate-limited:
- General endpoints: 100 requests per minute
- Auth endpoints: 10 requests per minute
- AI endpoints: 20 requests per minute

Rate limit headers:
- `X-RateLimit-Limit`: Request limit
- `X-RateLimit-Remaining`: Remaining requests
- `X-RateLimit-Reset`: Reset timestamp

## Pagination

List endpoints support pagination with these parameters:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20, max: 100)

Response includes:
```json
{
  "data": [...],
  "total": 500,
  "page": 1,
  "pages": 25,
  "hasNext": true,
  "hasPrev": false
}
```