# Wisal - Legal Advice & Social Activism Platform

A full-stack application connecting individuals with legal professionals and fostering social activism communities.

## 🚀 Quick Start

### Prerequisites

- Docker and Docker Compose
- Node.js (v18+ recommended) - for local development
- npm or yarn

### Running with Docker (Recommended)

1. **Clone and Setup Environment**
   ```bash
   # Copy the main environment file
   cp .env.example .env
   
   # Update .env with your configuration (especially OAuth credentials)
   ```

2. **Start All Services**
   ```bash
   # From root directory
   docker-compose up -d
   ```

   This will start:
   - Frontend on http://localhost:3000
   - Backend API on http://localhost:4000
   - MongoDB on localhost:27017
   - Redis on localhost:6379
   - Elasticsearch on localhost:9200
   - Nginx proxy on http://localhost

3. **View Logs**
   ```bash
   # All services
   docker-compose logs -f
   
   # Specific service
   docker-compose logs -f backend
   ```

### Running Locally (Development)

1. **Clone and Setup Environment**
   ```bash
   # Copy environment files
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env
   
   # Update .env files with your configuration
   ```

2. **Install Dependencies**
   ```bash
   # Backend
   cd backend && npm install
   
   # Frontend
   cd ../frontend && npm install
   ```

3. **Run Development Environment**
   ```bash
   # From root directory
   ./start-dev.sh
   ```

   This will start:
   - Backend API on http://localhost:4000
   - Frontend on http://localhost:3000

## 🏗️ Architecture

### Backend
- **Framework**: Express.js with TypeScript
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT with Passport.js
- **Real-time**: Socket.IO for chat
- **AI Integration**: LangChain for intelligent matching
- **Security**: Helmet, CORS, rate limiting

### Frontend
- **Framework**: React 18 with TypeScript (using Vite as build tool)
- **Build Tool**: Vite (for fast HMR and optimized builds)
- **State Management**: Zustand
- **Styling**: Tailwind CSS with Radix UI components
- **API Client**: Axios with custom hooks
- **Real-time**: Socket.IO client
- **Form Handling**: React Hook Form with Zod validation

## 📁 Project Structure

```
wisal/
├── backend/
│   ├── src/
│   │   ├── config/          # Database and passport config
│   │   ├── controllers/     # Route controllers
│   │   ├── middleware/      # Express middleware
│   │   ├── models/          # Mongoose models
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic
│   │   ├── utils/           # Utilities
│   │   └── server.ts        # Main server file
│   ├── tests/               # Integration tests
│   └── uploads/             # File uploads
│
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── pages/           # Page components
│   │   ├── services/        # API and Socket services
│   │   ├── store/           # Zustand stores
│   │   └── App.tsx          # Main App component
│   └── public/              # Static assets
│
└── start-dev.sh             # Development startup script
```

## 🔌 API Integration

### Frontend API Service

The frontend uses a centralized API client with:
- Automatic token management
- Error handling and loading states
- Request/response interceptors
- TypeScript support

```typescript
import { apiClient } from '@/services/apiClient'

// Example usage
const { data, loading, error, execute } = useApiCall(
  apiClient.login,
  { showSuccessToast: true }
)
```

### Socket.IO Integration

Real-time features include:
- Live chat messaging
- Typing indicators
- Online/offline status
- Message read receipts

```typescript
import { socketService } from '@/services/socket'

// Connect on app start
socketService.connect()

// Join conversation
socketService.joinConversation(conversationId)

// Listen for messages
socketService.onNewMessage((message) => {
  // Handle new message
})
```

## 🧪 Testing

### Running Tests

```bash
# Run all tests
cd backend && npm test

# Run with coverage
npm run test:coverage

# Run integration tests only
npm run test:integration

# Watch mode
npm run test:watch
```

### Test Structure
- Unit tests for services and utilities
- Integration tests for API endpoints
- Socket.IO connection tests
- Authentication flow tests

## 🔐 Security

- JWT-based authentication
- Refresh token rotation
- Rate limiting on API endpoints
- Input validation with express-validator
- XSS protection with Helmet
- CORS configuration
- File upload restrictions

## 📊 Environment Variables

### Backend (.env)
```env
NODE_ENV=development
PORT=4000
MONGODB_URI=mongodb://localhost:27017/wisal
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
FRONTEND_URL=http://localhost:3000

# OAuth Configuration
LINKEDIN_CLIENT_ID=your_linkedin_client_id
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret
LINKEDIN_CALLBACK_URL=http://localhost:4000/api/auth/linkedin/callback-custom

# AI Services (Optional)
OPENAI_API_KEY=your_openai_api_key

# Elasticsearch
ELASTICSEARCH_URL=http://localhost:9200
ELASTICSEARCH_USERNAME=elastic
ELASTICSEARCH_PASSWORD=changeme
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:4000/api
VITE_SOCKET_URL=http://localhost:4000
```

## 🔐 OAuth Setup

### LinkedIn OAuth Configuration

1. **Create LinkedIn App**
   - Go to [LinkedIn Developers](https://www.linkedin.com/developers/)
   - Create a new app
   - Add "Sign In with LinkedIn using OpenID Connect" product

2. **Configure Redirect URLs**
   - Add authorized redirect URL: `http://localhost:4000/api/auth/linkedin/callback-custom`
   - For production, add your production URL

3. **Update Environment Variables**
   - Copy Client ID and Client Secret to your `.env` file
   - Ensure the callback URL matches exactly

## 🛠️ Development

### Code Quality
```bash
# Lint code
npm run lint

# Format code
npm run format
```

### Building for Production
```bash
# Backend
cd backend && npm run build

# Frontend
cd frontend && npm run build
```

## 📝 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout user

### User Endpoints
- `GET /api/users/me` - Get current user
- `PUT /api/users/:id` - Update user profile
- `POST /api/users/:id/avatar` - Upload avatar

### Lawyer Endpoints
- `GET /api/lawyers` - Get lawyers list
- `GET /api/lawyers/:id` - Get lawyer details
- `POST /api/lawyers/search` - Search lawyers

### Query Endpoints
- `POST /api/queries` - Create legal query
- `GET /api/queries` - Get user queries
- `PUT /api/queries/:id` - Update query

### Conversation Endpoints
- `GET /api/conversations` - Get conversations
- `POST /api/conversations` - Start conversation
- `POST /api/conversations/:id/messages` - Send message

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is proprietary and confidential.