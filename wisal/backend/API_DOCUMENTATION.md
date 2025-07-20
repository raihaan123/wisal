# Wisal API Documentation

## Base URL

```
Development: http://localhost:4000/api
Production: https://api.wisal.com/api
```

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Response Format

All API responses follow a consistent format:

### Success Response
```json
{
  "success": true,
  "data": { /* response data */ },
  "message": "Operation successful"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error Type",
  "message": "Detailed error message",
  "errors": [ /* validation errors if applicable */ ]
}
```

## API Endpoints

### Authentication Endpoints

#### Register User
```http
POST /auth/register
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "name": "John Doe",
  "role": "seeker" // "seeker", "lawyer", or "activist"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "userId",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "seeker"
    },
    "token": "jwt-token"
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
  "password": "SecurePassword123!"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": { /* user object */ },
    "token": "jwt-token"
  }
}
```

#### LinkedIn OAuth
```http
GET /auth/linkedin
```
Redirects to LinkedIn OAuth page

```http
GET /auth/linkedin/callback?code=<auth-code>
```
Handles OAuth callback and returns JWT token

#### Get Current User
```http
GET /auth/me
```
**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "user": { /* complete user object with profile */ }
  }
}
```

### User Endpoints

#### Get User Profile
```http
GET /users/:userId
```
**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "userId",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "seeker",
      "seekerProfile": { /* if role is seeker */ },
      "lawyerProfile": { /* if role is lawyer */ }
    }
  }
}
```

#### Update User Profile
```http
PUT /users/:userId
```
**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "name": "Updated Name",
  "phone": "+1234567890",
  "seekerProfile": {
    "demographics": {
      "age": 30,
      "gender": "male"
    }
  }
}
```

#### Upload Avatar
```http
POST /users/:userId/avatar
```
**Headers:** `Authorization: Bearer <token>`
**Content-Type:** `multipart/form-data`
**Form Data:** `avatar: <file>`

### Lawyer Endpoints

#### Search Lawyers
```http
GET /lawyers/search
```

**Query Parameters:**
- `specialization` - Filter by legal specialization
- `location` - Filter by city/country
- `language` - Filter by language
- `minRating` - Minimum rating (1-5)
- `maxRate` - Maximum hourly rate
- `availability` - Available now (true/false)
- `freeConsultation` - Offers free consultation (true/false)
- `page` - Page number (default: 1)
- `limit` - Results per page (default: 20)
- `sort` - Sort by: rating, rate, experience (default: rating)

**Response:**
```json
{
  "success": true,
  "data": {
    "lawyers": [
      {
        "id": "userId",
        "email": "lawyer@example.com",
        "name": "Jane Smith",
        "role": "lawyer",
        "lawyerProfile": {
          "specializations": ["Immigration Law", "Human Rights"],
          "languages": ["English", "Spanish"],
          "location": {
            "city": "New York",
            "state": "NY",
            "country": "USA"
          },
          "hourlyRate": 150,
          "rating": 4.8,
          "consultationTypes": ["video", "phone", "chat"],
          "availability": { /* schedule */ }
        }
      }
    ],
    "total": 50,
    "page": 1,
    "totalPages": 3
  }
}
```

#### Get Lawyer Profile
```http
GET /lawyers/:lawyerId
```

**Response:** Complete lawyer profile with reviews and statistics

#### Create Lawyer Profile
```http
POST /lawyers
```
**Headers:** `Authorization: Bearer <token>`
**Required Role:** `lawyer`

**Request Body:**
```json
{
  "barNumber": "123456",
  "licenseNumber": "LIC123456",
  "specializations": ["Immigration Law", "Human Rights"],
  "languages": ["English", "Spanish"],
  "location": {
    "city": "New York",
    "state": "NY",
    "country": "USA"
  },
  "education": [
    {
      "institution": "Harvard Law School",
      "degree": "J.D.",
      "year": 2015
    }
  ],
  "hourlyRate": 150,
  "bio": "Experienced immigration lawyer...",
  "consultationTypes": ["video", "phone", "chat"]
}
```

### Legal Query Endpoints

#### Create Query
```http
POST /queries
```
**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "title": "Need help with work visa",
  "description": "I need assistance with H1-B visa application...",
  "category": "Immigration Law",
  "urgency": "high", // "low", "medium", "high", "critical"
  "budget": {
    "min": 100,
    "max": 500
  },
  "preferredLanguages": ["English", "Spanish"],
  "jurisdiction": "USA"
}
```

#### Search Queries
```http
GET /queries/search
```

**Query Parameters:**
- `q` - Search text
- `category` - Legal category
- `status` - open, assigned, closed
- `urgency` - low, medium, high, critical
- `page` - Page number
- `limit` - Results per page

### Conversation Endpoints

#### Start Conversation
```http
POST /conversations
```
**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "participantId": "otherUserId",
  "queryId": "queryId", // optional
  "initialMessage": "Hello, I need help with..."
}
```

#### Get Conversations
```http
GET /conversations
```
**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `status` - active, archived
- `unreadOnly` - true/false
- `page` - Page number
- `limit` - Results per page

#### Send Message
```http
POST /conversations/:conversationId/messages
```
**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "content": "Message content",
  "attachments": [ // optional
    {
      "url": "https://...",
      "type": "document",
      "name": "contract.pdf"
    }
  ]
}
```

### AI Search Endpoints

#### Analyze Legal Query
```http
POST /ai/analyze-query
```
**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "description": "I was terminated from my job without cause...",
  "urgency": "high",
  "jurisdiction": "California, USA"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "analysis": {
      "categories": ["Employment Law", "Wrongful Termination"],
      "complexity": "medium",
      "urgencyAssessment": "high",
      "keyIssues": [
        "At-will employment considerations",
        "Potential discrimination claims",
        "Severance negotiation"
      ],
      "suggestedSpecialisms": ["Employment Law", "Labor Law"]
    },
    "matchedLawyers": [
      {
        "lawyer": { /* lawyer object */ },
        "matchScore": 0.92,
        "matchReasons": [
          "Specializes in employment law",
          "Experience with wrongful termination cases",
          "Located in California"
        ]
      }
    ],
    "followUpQuestions": [
      "How long were you employed?",
      "Do you have a written employment contract?",
      "Were you given any reason for termination?"
    ]
  }
}
```

#### Get AI Response Suggestions
```http
POST /ai/suggest-response
```
**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "conversationId": "conv123",
  "context": "Client asking about visa options",
  "role": "lawyer" // or "seeker"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "suggestions": [
      {
        "text": "Based on your situation, you may qualify for...",
        "tone": "professional",
        "intent": "informative"
      },
      {
        "text": "I'd need more information about...",
        "tone": "inquisitive",
        "intent": "clarification"
      }
    ],
    "legalCitations": [ // for lawyers only
      {
        "statute": "8 U.S.C. § 1101",
        "relevance": "Defines visa categories"
      }
    ]
  }
}
```

### Post Endpoints

#### Create Post
```http
POST /posts
```
**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "title": "Know Your Rights: Workplace Discrimination",
  "content": "Detailed content about workplace rights...",
  "category": "Employment Rights",
  "tags": ["discrimination", "workplace", "rights"]
}
```

#### Get Posts Feed
```http
GET /posts
```

**Query Parameters:**
- `category` - Filter by category
- `tags` - Filter by tags (comma-separated)
- `authorId` - Filter by author
- `sort` - trending, recent, popular
- `page` - Page number
- `limit` - Results per page

### Consultation Endpoints

#### Book Consultation
```http
POST /consultations
```
**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "lawyerId": "lawyerId",
  "type": "video", // "video", "phone", "chat"
  "scheduledFor": "2024-01-15T14:00:00Z",
  "duration": 60, // minutes
  "description": "Immigration consultation for H1-B visa",
  "queryId": "queryId" // optional
}
```

#### Process Payment
```http
POST /consultations/:consultationId/payment
```
**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "paymentMethodId": "pm_stripe_method_id",
  "amount": 150
}
```

## WebSocket Events

### Connection
```javascript
const socket = io('http://localhost:4000', {
  auth: {
    token: 'your-jwt-token'
  }
});
```

### Events

#### Join User Room
```javascript
socket.emit('join-user', userId);
```

#### Join Conversation
```javascript
socket.emit('join-conversation', conversationId);
```

#### Send Message
```javascript
socket.emit('send-message', {
  conversationId: 'conv123',
  content: 'Hello',
  attachments: []
});
```

#### Receive Message
```javascript
socket.on('new-message', (message) => {
  console.log('New message:', message);
});
```

#### Typing Indicators
```javascript
// Start typing
socket.emit('typing-start', { conversationId: 'conv123' });

// Stop typing
socket.emit('typing-stop', { conversationId: 'conv123' });

// Listen for typing
socket.on('user-typing', ({ userId, conversationId }) => {
  console.log(`User ${userId} is typing...`);
});
```

## Rate Limiting

- Authentication endpoints: 5 requests per 15 minutes per IP
- API endpoints: 100 requests per 15 minutes per user
- File uploads: 10 requests per hour per user
- AI endpoints: 20 requests per hour per user

## Error Codes

| Code | Description |
|------|-------------|
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Invalid or missing token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource doesn't exist |
| 409 | Conflict - Resource already exists |
| 422 | Unprocessable Entity - Validation failed |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error |
| 503 | Service Unavailable |

## Testing

### Using cURL

```bash
# Register
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!@#","name":"Test User","role":"seeker"}'

# Login
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!@#"}'

# Search Lawyers (with token)
curl -X GET "http://localhost:4000/api/lawyers/search?specialization=Immigration%20Law&location=New%20York" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Using Postman

Import the Postman collection from `/docs/postman/wisal-api.postman_collection.json`

## SDK Examples

### JavaScript/TypeScript

```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:4000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth token
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Login
const login = async (email: string, password: string) => {
  const response = await api.post('/auth/login', { email, password });
  return response.data;
};

// Search lawyers
const searchLawyers = async (params: any) => {
  const response = await api.get('/lawyers/search', { params });
  return response.data;
};
```