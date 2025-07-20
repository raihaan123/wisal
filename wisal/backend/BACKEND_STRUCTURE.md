# Backend Structure Guide

## 📁 Directory Overview

```
wisal/backend/
├── src/                      # Source code
│   ├── ai/                  # AI integration module
│   │   ├── graphs/          # LangGraph workflows
│   │   ├── examples/        # AI usage examples
│   │   └── README.md        # AI module documentation
│   ├── config/              # Configuration files
│   │   ├── database.ts      # MongoDB connection
│   │   └── passport.ts      # OAuth strategies
│   ├── controllers/         # Request handlers
│   │   └── README.md        # Controller patterns
│   ├── database/            # Database related
│   │   └── seeds/          # Seed data scripts
│   ├── middleware/          # Express middleware
│   │   └── README.md        # Middleware guide
│   ├── models/              # Mongoose schemas
│   │   └── README.md        # Model documentation
│   ├── routes/              # API endpoints
│   │   └── README.md        # Route reference
│   ├── services/            # Business logic
│   │   ├── AIService.ts     # AI service wrapper
│   │   └── elasticsearch.ts # Search service
│   ├── types/               # TypeScript types
│   ├── utils/               # Helper functions
│   ├── server.ts            # Main server file
│   └── server-minimal.ts    # Minimal server (dev)
├── scripts/                  # Utility scripts
│   ├── seed-mock-data.ts    # Mock data seeder
│   └── test-db-connection.ts # DB test script
├── tests/                    # Test files
│   └── manual/              # Manual test scripts
├── dist/                     # Compiled JavaScript
├── API_DOCUMENTATION.md      # Full API reference
├── BACKEND_STRUCTURE.md      # This file
├── README.md                 # Main backend README
├── package.json              # Dependencies
├── tsconfig.json             # TypeScript config
└── .env.example              # Environment template
```

## 🔗 Key Relationships

### Request Flow
```
Client Request → Routes → Middleware → Controllers → Services → Models → Database
```

### Authentication Flow
```
1. User registers/logs in via authController
2. JWT token generated and returned
3. authenticate middleware verifies token on protected routes
4. authorize middleware checks role permissions
5. Request proceeds to controller if authorized
```

### AI Integration Flow
```
1. Legal query received by aiSearchController
2. Query processed by AIService using LangGraph
3. OpenAI analyzes and categorizes query
4. Vector search finds matching lawyers
5. Results ranked and returned with suggestions
```

## 📝 Key Files

### Entry Points
- `server.ts` - Full server with all features
- `server-minimal.ts` - Lightweight dev server

### Core Services
- `ai/index.ts` - Main AI service integration
- `services/AIService.ts` - AI service wrapper
- `config/database.ts` - MongoDB connection
- `middleware/auth.ts` - JWT authentication

### Main Controllers
- `authController.ts` - Authentication endpoints
- `lawyerController.ts` - Lawyer search and profiles
- `conversationController.ts` - Real-time messaging
- `aiSearchController.ts` - AI-powered features

### Data Models
- `User.ts` - Core user authentication
- `LawyerProfile.ts` - Lawyer information
- `SeekerProfile.ts` - Legal help seeker
- `Conversation.ts` - Chat conversations
- `LegalQuery.ts` - Legal questions

## 🔧 Configuration

### Environment Variables
Required variables in `.env`:
```
# Database
MONGODB_URI=mongodb://localhost:27017/wisal

# Authentication
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret

# LinkedIn OAuth
LINKEDIN_CLIENT_ID=your-client-id
LINKEDIN_CLIENT_SECRET=your-client-secret

# AI Integration
OPENAI_API_KEY=sk-...

# Frontend
FRONTEND_URL=http://localhost:3000
```

### Database Indexes
Key indexes for performance:
- User: email (unique), role
- LawyerProfile: specialisms + location, embedding (vector)
- Conversation: participants, lastMessage.timestamp
- LegalQuery: status + urgency, text search

## 🚀 Development Workflow

### Adding a New Feature
1. Define data model in `/models`
2. Create controller in `/controllers`
3. Add routes in `/routes`
4. Implement middleware if needed
5. Add service logic if complex
6. Update API documentation
7. Write tests

### Common Tasks

**Add a new endpoint:**
1. Create route in appropriate route file
2. Add controller method
3. Apply necessary middleware
4. Document in API_DOCUMENTATION.md

**Add authentication to route:**
```typescript
import { authenticate, authorize } from '../middleware/auth';

router.post('/protected', 
  authenticate,
  authorize(['lawyer', 'admin']),
  controller
);
```

**Add AI analysis:**
```typescript
import { aiService } from '../ai';

const analysis = await aiService.processQuery({
  description: userQuery,
  urgency: 'high'
}, userId);
```

## 🧪 Testing

### Test Structure
```
tests/
├── unit/          # Unit tests
├── integration/   # API integration tests
├── e2e/           # End-to-end tests
└── manual/        # Manual test scripts
```

### Running Tests
```bash
# All tests
npm test

# Specific test type
npm run test:unit
npm run test:integration

# Manual tests
node tests/manual/test-auth.js
```

## 📊 Performance Optimization

### Database
- Proper indexing on frequently queried fields
- Lean queries for read operations
- Pagination for list endpoints
- Connection pooling configured

### Caching
- Redis integration ready
- Cache lawyer search results
- Cache AI embeddings
- Session management

### API
- Rate limiting per endpoint
- Response compression
- Field selection in queries
- Async/await for all operations

## 🔒 Security Measures

### Authentication
- JWT with refresh tokens
- Bcrypt password hashing
- OAuth 2.0 integration
- Session management

### Authorization
- Role-based access control
- Permission-based checks
- Resource ownership validation
- Admin-only endpoints

### Input Validation
- express-validator on all inputs
- Sanitization of user content
- File type/size restrictions
- SQL injection protection

### API Security
- CORS configuration
- Helmet.js headers
- Rate limiting
- CSRF protection

## 📝 Documentation

### Available Documentation
- [README.md](./README.md) - Overview and setup
- [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) - Complete API reference
- [src/ai/README.md](./src/ai/README.md) - AI integration guide
- [src/controllers/README.md](./src/controllers/README.md) - Controller patterns
- [src/routes/README.md](./src/routes/README.md) - Route reference
- [src/models/README.md](./src/models/README.md) - Model schemas
- [src/middleware/README.md](./src/middleware/README.md) - Middleware usage

### API Documentation Tools
- Postman collection in `/docs/postman/`
- OpenAPI/Swagger spec (coming soon)
- cURL examples in API_DOCUMENTATION.md

## 🚫 Common Pitfalls

1. **Forgetting to await async operations** - Always use async/await
2. **Not handling errors properly** - Use try-catch blocks
3. **Missing indexes** - Check query performance
4. **Circular dependencies** - Keep imports clean
5. **Not validating input** - Always validate user input
6. **Hardcoding values** - Use environment variables
7. **Not documenting changes** - Update docs with code

## 🚀 Next Steps

1. Review specific module documentation
2. Set up your development environment
3. Run the seed scripts to populate test data
4. Test the API endpoints with Postman
5. Explore the AI integration features