# Routes

## Overview

This directory contains all Express route definitions for the Wisal backend API. Each route file defines the HTTP endpoints, applies middleware, and connects to the appropriate controller methods.

## Route Files

### Authentication Routes (`auth.ts`)
**Base path**: `/api/auth`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/register` | Register new user | No |
| POST | `/login` | Login with email/password | No |
| GET | `/linkedin` | Initiate LinkedIn OAuth | No |
| GET | `/linkedin/callback` | LinkedIn OAuth callback | No |
| POST | `/refresh` | Refresh JWT token | No |
| GET | `/me` | Get current user | Yes |
| POST | `/logout` | Logout user | Yes |

### User Routes (`users.ts`)
**Base path**: `/api/users`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/:userId` | Get user profile | Yes |
| PUT | `/:userId` | Update user profile | Yes (owner) |
| POST | `/:userId/avatar` | Upload avatar | Yes (owner) |
| GET | `/:userId/conversations` | Get user conversations | Yes (owner) |
| DELETE | `/:userId` | Delete user account | Yes (owner) |

### Lawyer Routes (`lawyers.ts`)
**Base path**: `/api/lawyers`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/search` | Search lawyers with filters | No |
| GET | `/:lawyerId` | Get lawyer profile | No |
| POST | `/` | Create lawyer profile | Yes (lawyer) |
| PUT | `/:lawyerId` | Update lawyer profile | Yes (owner) |
| POST | `/:lawyerId/verification` | Upload verification docs | Yes (owner) |
| PUT | `/:lawyerId/availability` | Update availability | Yes (owner) |
| GET | `/:lawyerId/reviews` | Get lawyer reviews | No |

### Consultation Routes (`consultations.ts`)
**Base path**: `/api/consultations`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/` | Create consultation | Yes |
| GET | `/` | List consultations | Yes |
| GET | `/:consultationId` | Get consultation details | Yes (participant) |
| PUT | `/:consultationId/status` | Update status | Yes (participant) |
| POST | `/:consultationId/notes` | Add consultation notes | Yes (lawyer) |
| POST | `/:consultationId/payment` | Process payment | Yes (seeker) |
| POST | `/:consultationId/review` | Add review | Yes (seeker) |

### Conversation Routes (`conversations.ts`)
**Base path**: `/api/conversations`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | List user conversations | Yes |
| POST | `/` | Create new conversation | Yes |
| GET | `/:conversationId` | Get conversation details | Yes (participant) |
| GET | `/:conversationId/messages` | Get messages | Yes (participant) |
| POST | `/:conversationId/messages` | Send message | Yes (participant) |
| PUT | `/:conversationId/read` | Mark as read | Yes (participant) |
| POST | `/:conversationId/rate` | Rate conversation | Yes (participant) |

### Query Routes (`queries.ts`)
**Base path**: `/api/queries`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | List queries | No |
| GET | `/search` | Search queries | No |
| POST | `/` | Create query | Yes |
| GET | `/:queryId` | Get query details | No |
| PUT | `/:queryId` | Update query | Yes (owner) |
| POST | `/:queryId/assign` | Assign to lawyer | Yes (owner/admin) |
| POST | `/:queryId/responses` | Add response | Yes (lawyer) |

### Post Routes (`posts.ts`)
**Base path**: `/api/posts`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | List posts | No |
| POST | `/` | Create post | Yes |
| GET | `/:postId` | Get post details | No |
| PUT | `/:postId` | Update post | Yes (owner) |
| DELETE | `/:postId` | Delete post | Yes (owner/admin) |
| POST | `/:postId/like` | Toggle like | Yes |
| POST | `/:postId/comments` | Add comment | Yes |
| POST | `/:postId/share` | Share post | Yes |
| POST | `/:postId/report` | Report post | Yes |

### AI Search Routes (`ai-search.ts`)
**Base path**: `/api/ai`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/analyze-query` | Analyze legal query | Yes |
| POST | `/semantic-search` | Semantic lawyer search | Yes |
| POST | `/suggest-response` | Get response suggestions | Yes |
| POST | `/categorize` | Categorize legal issue | Yes |
| GET | `/health` | Check AI service health | No |

### Admin Routes (`admin.ts`)
**Base path**: `/api/admin`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/users` | List all users | Yes (admin) |
| PUT | `/users/:userId/status` | Update user status | Yes (admin) |
| GET | `/verifications` | List pending verifications | Yes (admin) |
| PUT | `/verifications/:id` | Approve/reject verification | Yes (admin) |
| GET | `/analytics` | Platform analytics | Yes (admin) |
| GET | `/reports` | Content reports | Yes (admin) |
| PUT | `/reports/:id` | Handle report | Yes (admin) |

## Middleware Usage

### Authentication Middleware
```typescript
import { authenticate } from '../middleware/auth';

router.get('/protected', authenticate, controller);
```

### Authorization Middleware
```typescript
import { authorize } from '../middleware/rbac';

router.post('/admin-only', authenticate, authorize(['admin']), controller);
```

### Validation Middleware
```typescript
import { validateRequest } from '../middleware/validation';
import { body } from 'express-validator';

const validation = [
  body('email').isEmail(),
  body('password').isLength({ min: 8 })
];

router.post('/register', validation, validateRequest, controller);
```

### File Upload Middleware
```typescript
import { upload } from '../middleware/upload';

router.post('/avatar', authenticate, upload.single('avatar'), controller);
```

## Route Organization

### Naming Conventions
- Use kebab-case for URLs: `/api/user-profiles`
- Use plural nouns for resources: `/api/users`, `/api/lawyers`
- Use verbs for actions: `/api/auth/login`, `/api/posts/:id/like`

### RESTful Patterns
- GET `/resource` - List resources
- GET `/resource/:id` - Get single resource
- POST `/resource` - Create resource
- PUT `/resource/:id` - Update resource
- DELETE `/resource/:id` - Delete resource

### Nested Resources
For related resources, use nested routes:
- `/api/users/:userId/conversations`
- `/api/conversations/:conversationId/messages`
- `/api/lawyers/:lawyerId/reviews`

## Error Handling

All routes use centralized error handling middleware:
```typescript
app.use(errorHandler);
```

Error responses follow consistent format:
```json
{
  "success": false,
  "error": "Error type",
  "message": "Detailed error message",
  "errors": [] // For validation errors
}
```

## Rate Limiting

Sensitive endpoints have rate limiting:
- Authentication: 5 requests per 15 minutes
- API general: 100 requests per 15 minutes
- File uploads: 10 requests per hour

## API Versioning

Current version: v1 (implicit)
Future versions will use: `/api/v2/...`

## Testing Routes

Use the following tools for testing:
- Postman collection (available in `/docs/postman/`)
- cURL examples in each controller file
- Integration tests in `/tests/routes/`

## Security Considerations

1. **CORS**: Configured for allowed origins only
2. **CSRF**: Protected with tokens for state-changing operations
3. **Input Validation**: All inputs validated and sanitized
4. **SQL Injection**: Protected via Mongoose ODM
5. **XSS**: Inputs escaped, CSP headers set
6. **Rate Limiting**: Prevents brute force attacks