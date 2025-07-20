# Wisal Backend API

Backend API for the Wisal legal services platform built with TypeScript, Express, MongoDB, and Socket.IO.

## 🚀 Features

### Core Features
- **Authentication**: JWT-based auth with LinkedIn OAuth integration
- **User Management**: Role-based access control (seeker, lawyer, activist, admin)
- **AI-Powered Search**: Advanced lawyer matching using GPT-4o and vector embeddings
- **Real-time Messaging**: Socket.IO powered chat system with typing indicators
- **Legal Queries**: Create, search, and manage legal questions
- **Consultation Management**: Book and manage video/phone/chat consultations
- **File Uploads**: Secure document and image handling with S3 integration
- **Payment Processing**: Stripe integration for paid consultations

### AI Integration
- **Query Analysis**: Automatic categorization and complexity assessment
- **Lawyer Matching**: AI-powered matching based on specialization, location, and experience
- **Response Suggestions**: Context-aware response generation for conversations
- **Semantic Search**: Vector-based search using MongoDB Atlas
- **Legal Citations**: Automatic citation suggestions for lawyers

### Security & Performance
- **API Security**: Rate limiting, CORS, Helmet.js, CSRF protection
- **Input Validation**: Comprehensive validation with express-validator
- **Error Handling**: Centralized error handling with detailed logging
- **Database Optimization**: Proper indexing and query optimization
- **Caching Strategy**: Redis integration for performance

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

## 📚 Documentation

### API Documentation
- **Full API Documentation**: See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
- **Postman Collection**: Available in `/docs/postman/`
- **OpenAPI Spec**: Coming soon

### Directory Structure
```
src/
├── ai/              # AI integration (LangGraph, OpenAI)
├── config/          # Configuration files
├── controllers/     # Request handlers
├── database/        # Database seeds and migrations
├── middleware/      # Express middleware
├── models/          # Mongoose schemas
├── routes/          # API routes
├── services/        # Business logic
├── types/           # TypeScript types
└── utils/           # Helper functions
```

### Key Documentation
- [Controllers README](./src/controllers/README.md) - Controller patterns and usage
- [Routes README](./src/routes/README.md) - Complete endpoint reference
- [Models README](./src/models/README.md) - Database schema documentation
- [Middleware README](./src/middleware/README.md) - Middleware usage guide
- [AI Module README](./src/ai/README.md) - AI integration details
- [Database Seeds README](./src/database/seeds/README.md) - Seeding instructions

## Development

### Available Scripts

```bash
# Development
npm run dev              # Run with nodemon and hot reload
npm run dev:minimal      # Run minimal server (auth + basic routes only)

# Production
npm run build           # Compile TypeScript
npm start              # Run production server

# Database
npm run seed:rbac      # Seed roles and permissions
npm run seed:mock      # Seed mock data (50 lawyers, 25 seekers)
npm run seed:all       # Seed everything

# Testing & Quality
npm test               # Run test suite
npm run lint           # ESLint check
npm run lint:fix       # Auto-fix linting issues
npm run typecheck      # TypeScript type checking

# Utilities
npm run clean          # Clean build artifacts
npm run analyze        # Bundle size analysis
```

### Database Seeding

The project includes comprehensive seed data:

**Mock Data Includes:**
- 50 lawyer profiles with diverse specializations
- 25 seeker profiles with various legal needs
- Languages: 15+ including Arabic, Spanish, French
- Locations: 25 major cities worldwide
- Specializations: 25+ legal areas

**Test Accounts (after seeding):**
```
Lawyer: sarah.johnson1@example.com / Test123!@#
Seeker: ahmed.hassan.seeker1@example.com / Test123!@#
```

## WebSocket Events

### Connection
```javascript
const socket = io('http://localhost:4000', {
  auth: { token: 'jwt-token' }
});
```

### Available Events
- `join-user` - Join user's personal room
- `join-conversation` - Join conversation room  
- `send-message` - Send message to conversation
- `typing-start` - Notify typing started
- `typing-stop` - Notify typing stopped
- `new-message` - Receive new message
- `message-read` - Mark message as read
- `user-online` - User comes online
- `user-offline` - User goes offline

## 🔒 Security

### Authentication & Authorization
- JWT tokens with refresh token rotation
- Bcrypt password hashing (10 rounds)
- LinkedIn OAuth 2.0 integration
- Role-based access control (RBAC)
- Permission-based authorization

### API Security
- Rate limiting (configurable per endpoint)
- CORS with whitelist configuration
- Helmet.js security headers
- CSRF protection for state-changing operations
- Input validation and sanitization
- SQL injection protection via Mongoose
- XSS prevention with content security policy

### File Security
- File type validation
- Size limits (5MB images, 10MB documents)
- Virus scanning integration ready
- Secure S3 bucket configuration

## 🚀 Deployment

### Docker Deployment
See [Docker Deployment Guide](../DOCKER_DEPLOYMENT_GUIDE.md)

### Environment Variables
See `.env.example` for all required variables

### Production Checklist
- [ ] Set NODE_ENV=production
- [ ] Configure MongoDB Atlas
- [ ] Set up Redis for caching
- [ ] Configure S3 for file storage
- [ ] Set up Stripe for payments
- [ ] Configure email service
- [ ] Enable SSL/TLS
- [ ] Set up monitoring (PM2, New Relic)
- [ ] Configure backup strategy

## 🧪 Testing

### Running Tests
```bash
# Unit tests
npm run test:unit

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e

# Coverage report
npm run test:coverage
```

### Test Structure
- Unit tests for models and services
- Integration tests for API endpoints
- E2E tests for critical user flows
- Mock data fixtures available

## 📊 Monitoring

### Health Check
```
GET /api/health
GET /api/ai/health
```

### Metrics
- Request/response times
- Error rates
- AI service performance
- Database query performance
- WebSocket connection stats

## 🤝 Contributing

1. Follow TypeScript best practices
2. Write tests for new features
3. Update documentation
4. Use conventional commits
5. Run linter before committing

## 📄 License

Proprietary - All rights reserved