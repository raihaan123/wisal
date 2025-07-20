# Wisal Development Guide

This guide helps developers set up their local development environment and understand the development workflow for the Wisal platform.

## Table of Contents
- [Development Environment Setup](#development-environment-setup)
- [Project Structure](#project-structure)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Debugging](#debugging)
- [Performance Optimization](#performance-optimization)
- [Contributing](#contributing)

## Development Environment Setup

### Prerequisites

1. **Required Software**
   - Node.js 18+ (use nvm for version management)
   - npm or yarn
   - Docker Desktop
   - Git
   - VS Code (recommended) or your preferred IDE

2. **Recommended VS Code Extensions**
   - ESLint
   - Prettier
   - TypeScript and JavaScript Language Features
   - Docker
   - MongoDB for VS Code
   - Thunder Client (API testing)
   - GitLens

### Initial Setup

1. **Clone the Repository**
   ```bash
   git clone https://github.com/yourusername/wisal.git
   cd wisal
   ```

2. **Install Dependencies**
   ```bash
   # Install backend dependencies
   cd backend
   npm install
   
   # Install frontend dependencies
   cd ../frontend
   npm install
   ```

3. **Environment Configuration**
   ```bash
   # Copy environment template
   cp .env.example .env
   
   # Edit with your local configuration
   nano .env
   ```

   Required environment variables:
   ```env
   # Backend
   NODE_ENV=development
   PORT=4000
   
   # Database
   MONGO_URI=mongodb://localhost:27017/wisal
   REDIS_URL=redis://localhost:6379
   
   # Authentication
   JWT_SECRET=your-dev-jwt-secret
   JWT_EXPIRES_IN=24h
   
   # AI Services (get free API keys)
   ANTHROPIC_API_KEY=your-key
   OPENAI_API_KEY=your-key
   GOOGLE_GEMINI_API_KEY=your-key
   
   # Frontend
   VITE_API_URL=http://localhost:4000/api
   VITE_SOCKET_URL=http://localhost:4000
   ```

4. **Start Development Services**
   
   **Option 1: Using Docker (Recommended)**
   ```bash
   # Start all services with hot reload
   ./scripts/docker-start.sh dev
   ```
   
   **Option 2: Manual Setup**
   ```bash
   # Terminal 1: Start MongoDB
   docker run -d -p 27017:27017 --name wisal-mongo mongo:6
   
   # Terminal 2: Start Redis
   docker run -d -p 6379:6379 --name wisal-redis redis:7
   
   # Terminal 3: Start Backend
   cd backend
   npm run dev
   
   # Terminal 4: Start Frontend
   cd frontend
   npm run dev
   ```

5. **Verify Installation**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:4000
   - API Health: http://localhost:4000/health

## Project Structure

### Backend Structure
```
backend/
├── src/
│   ├── controllers/     # Request handlers
│   ├── models/          # MongoDB schemas
│   ├── routes/          # API route definitions
│   ├── services/        # Business logic
│   ├── middleware/      # Express middleware
│   ├── ai/             # AI integration layer
│   ├── utils/          # Helper functions
│   ├── types/          # TypeScript types
│   └── index.ts        # Application entry point
├── tests/              # Test files
├── scripts/            # Utility scripts
└── package.json
```

### Frontend Structure
```
frontend/
├── src/
│   ├── components/     # React components
│   │   ├── ui/        # Base UI components (Radix UI)
│   │   ├── auth/      # Authentication components
│   │   └── layout/    # Layout components
│   ├── pages/         # Page components
│   ├── hooks/         # Custom React hooks
│   ├── services/      # API service layer
│   ├── store/         # Zustand state stores
│   ├── utils/         # Helper functions
│   └── types/         # TypeScript types
├── public/            # Static assets
├── index.html         # HTML entry point
├── vite.config.ts     # Vite configuration
└── package.json
```

## Development Workflow

### Git Workflow

1. **Branch Naming Convention**
   - Features: `feature/description`
   - Bugfixes: `fix/description`
   - Hotfixes: `hotfix/description`
   - Releases: `release/version`

2. **Commit Message Format**
   ```
   type(scope): subject
   
   body (optional)
   
   footer (optional)
   ```
   
   Types: feat, fix, docs, style, refactor, test, chore
   
   Example:
   ```
   feat(auth): add LinkedIn OAuth integration
   
   - Implemented OAuth2 flow
   - Added user profile sync
   - Updated authentication middleware
   
   Closes #123
   ```

3. **Pull Request Process**
   - Create feature branch from `develop`
   - Make changes and commit
   - Push branch and create PR
   - Request code review
   - Address feedback
   - Merge after approval

### Development Commands

**Backend Development**
```bash
# Start development server with hot reload
npm run dev

# Run linter
npm run lint

# Format code
npm run format

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Build for production
npm run build
```

**Frontend Development**
```bash
# Start development server
npm run dev

# Run linter
npm run lint

# Run type checking
npm run type-check

# Build for production
npm run build

# Analyze bundle size
npm run analyze
```

## Coding Standards

### TypeScript Guidelines

1. **Type Safety**
   ```typescript
   // Good: Explicit types
   interface User {
     id: string;
     email: string;
     role: 'seeker' | 'lawyer' | 'admin';
   }
   
   // Bad: Using any
   const processUser = (user: any) => { ... }
   ```

2. **Async/Await**
   ```typescript
   // Good: Async/await with error handling
   try {
     const user = await User.findById(userId);
     if (!user) {
       throw new NotFoundError('User not found');
     }
     return user;
   } catch (error) {
     logger.error('Error fetching user:', error);
     throw error;
   }
   ```

3. **Error Handling**
   ```typescript
   // Custom error classes
   class ValidationError extends Error {
     constructor(public fields: Record<string, string>) {
       super('Validation failed');
       this.name = 'ValidationError';
     }
   }
   ```

### React Best Practices

1. **Component Structure**
   ```typescript
   // Good: Typed functional component
   interface ButtonProps {
     variant: 'primary' | 'secondary';
     onClick: () => void;
     children: React.ReactNode;
   }
   
   export const Button: React.FC<ButtonProps> = ({
     variant,
     onClick,
     children
   }) => {
     return (
       <button
         className={cn('btn', `btn-${variant}`)}
         onClick={onClick}
       >
         {children}
       </button>
     );
   };
   ```

2. **Custom Hooks**
   ```typescript
   // Good: Reusable custom hook
   export const useAuth = () => {
     const { user, loading } = useAuthStore();
     
     const login = useCallback(async (credentials: LoginCredentials) => {
       // Implementation
     }, []);
     
     return { user, loading, login };
   };
   ```

### API Design Guidelines

1. **RESTful Endpoints**
   ```typescript
   // Good: RESTful resource endpoints
   router.get('/users', getAllUsers);
   router.get('/users/:id', getUser);
   router.post('/users', createUser);
   router.put('/users/:id', updateUser);
   router.delete('/users/:id', deleteUser);
   ```

2. **Response Format**
   ```typescript
   // Consistent response structure
   interface ApiResponse<T> {
     success: boolean;
     data?: T;
     error?: {
       code: string;
       message: string;
       details?: any;
     };
     meta?: {
       page?: number;
       total?: number;
     };
   }
   ```

## Testing

### Backend Testing

1. **Unit Tests**
   ```typescript
   // tests/services/userService.test.ts
   describe('UserService', () => {
     describe('createUser', () => {
       it('should create a new user', async () => {
         const userData = {
           email: 'test@example.com',
           password: 'password123',
           name: 'Test User'
         };
         
         const user = await userService.createUser(userData);
         
         expect(user).toBeDefined();
         expect(user.email).toBe(userData.email);
         expect(user.password).not.toBe(userData.password); // Hashed
       });
     });
   });
   ```

2. **Integration Tests**
   ```typescript
   // tests/routes/auth.test.ts
   describe('POST /api/auth/login', () => {
     it('should login with valid credentials', async () => {
       const response = await request(app)
         .post('/api/auth/login')
         .send({
           email: 'test@example.com',
           password: 'password123'
         });
       
       expect(response.status).toBe(200);
       expect(response.body.token).toBeDefined();
     });
   });
   ```

### Frontend Testing

1. **Component Tests**
   ```typescript
   // tests/components/Button.test.tsx
   import { render, fireEvent } from '@testing-library/react';
   import { Button } from '@/components/ui/Button';
   
   describe('Button', () => {
     it('should handle click events', () => {
       const handleClick = jest.fn();
       const { getByText } = render(
         <Button onClick={handleClick}>Click me</Button>
       );
       
       fireEvent.click(getByText('Click me'));
       expect(handleClick).toHaveBeenCalledTimes(1);
     });
   });
   ```

2. **Hook Tests**
   ```typescript
   // tests/hooks/useAuth.test.ts
   import { renderHook, act } from '@testing-library/react-hooks';
   import { useAuth } from '@/hooks/useAuth';
   
   describe('useAuth', () => {
     it('should login user', async () => {
       const { result } = renderHook(() => useAuth());
       
       await act(async () => {
         await result.current.login({
           email: 'test@example.com',
           password: 'password123'
         });
       });
       
       expect(result.current.user).toBeDefined();
     });
   });
   ```

## Debugging

### Backend Debugging

1. **VS Code Debug Configuration**
   ```json
   {
     "version": "0.2.0",
     "configurations": [
       {
         "type": "node",
         "request": "launch",
         "name": "Debug Backend",
         "skipFiles": ["<node_internals>/**"],
         "program": "${workspaceFolder}/backend/src/index.ts",
         "preLaunchTask": "tsc: build - backend/tsconfig.json",
         "outFiles": ["${workspaceFolder}/backend/dist/**/*.js"],
         "env": {
           "NODE_ENV": "development"
         }
       }
     ]
   }
   ```

2. **Logging**
   ```typescript
   import { logger } from '@/utils/logger';
   
   // Different log levels
   logger.debug('Debug information');
   logger.info('General information');
   logger.warn('Warning message');
   logger.error('Error occurred', error);
   ```

### Frontend Debugging

1. **React Developer Tools**
   - Install browser extension
   - Inspect component tree
   - Monitor state changes
   - Profile performance

2. **Network Debugging**
   ```typescript
   // Add request interceptor for debugging
   axios.interceptors.request.use(request => {
     console.log('Starting Request:', request);
     return request;
   });
   
   axios.interceptors.response.use(
     response => {
       console.log('Response:', response);
       return response;
     },
     error => {
       console.error('Request failed:', error);
       return Promise.reject(error);
     }
   );
   ```

## Performance Optimization

### Backend Optimization

1. **Database Queries**
   ```typescript
   // Good: Selective fields and pagination
   const users = await User
     .find({ role: 'lawyer' })
     .select('name email specializations')
     .limit(20)
     .skip((page - 1) * 20)
     .lean();
   ```

2. **Caching Strategy**
   ```typescript
   // Redis caching example
   const cacheKey = `user:${userId}`;
   const cached = await redis.get(cacheKey);
   
   if (cached) {
     return JSON.parse(cached);
   }
   
   const user = await User.findById(userId);
   await redis.set(cacheKey, JSON.stringify(user), 'EX', 3600);
   return user;
   ```

### Frontend Optimization

1. **Code Splitting**
   ```typescript
   // Lazy load components
   const LawyerDashboard = lazy(() => import('./pages/LawyerDashboard'));
   
   // Use Suspense
   <Suspense fallback={<Loading />}>
     <LawyerDashboard />
   </Suspense>
   ```

2. **Memoization**
   ```typescript
   // Memoize expensive computations
   const expensiveValue = useMemo(() => {
     return computeExpensiveValue(data);
   }, [data]);
   
   // Memoize components
   const MemoizedComponent = memo(({ data }) => {
     return <div>{data}</div>;
   });
   ```

## Common Development Tasks

### Adding a New API Endpoint

1. **Define the route** in `backend/src/routes/`
2. **Create controller** in `backend/src/controllers/`
3. **Add service logic** in `backend/src/services/`
4. **Update types** in `backend/src/types/`
5. **Add tests** in `backend/tests/`
6. **Update API documentation**

### Adding a New Page

1. **Create page component** in `frontend/src/pages/`
2. **Add route** in `frontend/src/App.tsx`
3. **Create API service** in `frontend/src/services/`
4. **Add state management** if needed
5. **Create tests**
6. **Update navigation**

### Database Schema Changes

1. **Update model** in `backend/src/models/`
2. **Create migration script** if needed
3. **Update validation** schemas
4. **Update TypeScript types**
5. **Test thoroughly**
6. **Document changes**

## Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   # Find process using port
   lsof -i :3001
   
   # Kill process
   kill -9 <PID>
   ```

2. **MongoDB Connection Issues**
   ```bash
   # Check if MongoDB is running
   docker ps | grep mongo
   
   # Start MongoDB
   docker start wisal-mongo
   ```

3. **Module Not Found**
   ```bash
   # Clear node_modules and reinstall
   rm -rf node_modules package-lock.json
   npm install
   ```

4. **TypeScript Errors**
   ```bash
   # Rebuild TypeScript
   npm run build
   
   # Check for type errors
   npx tsc --noEmit
   ```

## Resources

### Documentation
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [React Documentation](https://react.dev/)
- [Express Documentation](https://expressjs.com/)
- [MongoDB Documentation](https://docs.mongodb.com/)

### Learning Resources
- [TypeScript Best Practices](https://www.typescriptlang.org/docs/handbook/declaration-files/do-s-and-don-ts.html)
- [React Patterns](https://reactpatterns.com/)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)

### Tools
- [Postman](https://www.postman.com/) - API testing
- [MongoDB Compass](https://www.mongodb.com/products/compass) - Database GUI
- [Redis Commander](https://github.com/joeferner/redis-commander) - Redis GUI
- [React Developer Tools](https://react.dev/learn/react-developer-tools) - Browser extension

## Getting Help

- **Documentation**: Check `/docs` directory
- **Issues**: Search existing GitHub issues
- **Discussions**: Join development discussions
- **Team Chat**: Contact team via Slack/Discord