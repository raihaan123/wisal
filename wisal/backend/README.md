# Wisal Backend API

Backend API for the Wisal legal services platform built with TypeScript, Express, MongoDB, and Socket.IO.

## Features

- **Authentication**: JWT-based auth with LinkedIn OAuth integration
- **User Management**: Role-based access control (seeker, lawyer, admin)
- **Legal Queries**: Create, search, and manage legal queries
- **Real-time Messaging**: Socket.IO powered chat system
- **File Uploads**: Secure document and image handling
- **Search**: MongoDB text search and Elasticsearch integration
- **Payment Processing**: Stripe integration for consultations
- **API Security**: Rate limiting, CORS, Helmet.js

## Prerequisites

- Node.js 18+
- MongoDB 6+
- Redis (optional, for caching)
- Elasticsearch (optional, for advanced search)

## Setup

1. Install dependencies:
```bash
npm install
```

2. Copy environment variables:
```bash
cp .env.example .env
```

3. Update `.env` with your configuration

4. Run development server:
```bash
npm run dev
```

## API Routes

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login with email/password
- `GET /api/auth/linkedin` - LinkedIn OAuth
- `POST /api/auth/refresh` - Refresh JWT token
- `GET /api/auth/me` - Get current user

### Users
- `GET /api/users/:userId` - Get user profile
- `PUT /api/users/:userId` - Update user profile
- `POST /api/users/:userId/avatar` - Upload avatar
- `GET /api/users/:userId/conversations` - Get user conversations

### Lawyers
- `GET /api/lawyers/search` - Search lawyers
- `GET /api/lawyers/:lawyerId` - Get lawyer profile
- `POST /api/lawyers` - Create lawyer profile
- `PUT /api/lawyers/:lawyerId` - Update lawyer profile
- `POST /api/lawyers/:lawyerId/verification` - Upload verification docs

### Legal Queries
- `GET /api/queries` - Get queries with filters
- `GET /api/queries/search` - Search queries
- `POST /api/queries` - Create new query
- `PUT /api/queries/:queryId` - Update query
- `POST /api/queries/:queryId/assign` - Assign lawyer

### Conversations
- `GET /api/conversations` - Get user conversations
- `POST /api/conversations` - Start new conversation
- `GET /api/conversations/:conversationId/messages` - Get messages
- `POST /api/conversations/:conversationId/messages` - Send message
- `POST /api/conversations/:conversationId/rate` - Rate conversation

### Posts
- `GET /api/posts` - Get activism posts
- `POST /api/posts` - Create new post
- `POST /api/posts/:postId/like` - Like post
- `POST /api/posts/:postId/comments` - Add comment

## Development

```bash
# Run in development mode
npm run dev

# Build for production
npm run build

# Run production server
npm start

# Run tests
npm test

# Lint code
npm run lint
```

## WebSocket Events

- `join-user` - Join user's personal room
- `join-conversation` - Join conversation room
- `typing-start` - Notify typing started
- `typing-stop` - Notify typing stopped
- `new-message` - New message received

## Security

- JWT tokens for authentication
- Bcrypt for password hashing
- Rate limiting on API endpoints
- Input validation with express-validator
- File upload restrictions
- CORS and Helmet.js protection