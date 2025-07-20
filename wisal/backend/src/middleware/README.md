# Middleware

## Overview

This directory contains Express middleware functions that process requests before they reach the route handlers. Middleware handles cross-cutting concerns like authentication, validation, error handling, and file uploads.

## Middleware Files

### `auth.ts`
**Authentication and JWT Verification**

Provides authentication middleware for protecting routes:

```typescript
// Basic authentication - verifies JWT token
export const authenticate = async (req, res, next) => {
  // Extracts token from Authorization header
  // Verifies token validity
  // Attaches user to req.user
  // Returns 401 if invalid
};

// Optional authentication - doesn't fail if no token
export const optionalAuth = async (req, res, next) => {
  // Same as authenticate but continues without user
  // Useful for public routes with optional user context
};
```

**Usage:**
```typescript
router.get('/profile', authenticate, getProfile);
router.get('/posts', optionalAuth, getPosts); // Works with or without auth
```

### `rbac.ts`
**Role-Based Access Control**

Implements fine-grained permission checking:

```typescript
// Check if user has specific roles
export const authorize = (roles: string[]) => {
  return (req, res, next) => {
    // Checks if req.user has one of the allowed roles
    // Returns 403 if unauthorized
  };
};

// Check specific permissions
export const checkPermission = (resource: string, action: string) => {
  return async (req, res, next) => {
    // Checks if user's role has permission for resource:action
    // Example: 'user:update', 'post:delete'
  };
};
```

**Usage:**
```typescript
// Role-based
router.post('/admin', authenticate, authorize(['admin']), adminAction);

// Permission-based
router.delete('/posts/:id', authenticate, checkPermission('post', 'delete'), deletePost);
```

### `validation.ts`
**Request Validation**

Handles validation errors from express-validator:

```typescript
export const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};
```

**Usage with express-validator:**
```typescript
import { body } from 'express-validator';

const loginValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 })
];

router.post('/login', loginValidation, validateRequest, login);
```

### `upload.ts`
**File Upload Handling**

Configures multer for different file upload scenarios:

```typescript
// Avatar upload configuration
export const avatarUpload = multer({
  storage: multerS3({ /* S3 config */ }),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: imageFileFilter
});

// Document upload configuration
export const documentUpload = multer({
  storage: multerS3({ /* S3 config */ }),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: documentFileFilter
});

// Generic upload
export const upload = {
  single: (fieldName) => avatarUpload.single(fieldName),
  multiple: (fieldName, maxCount) => documentUpload.array(fieldName, maxCount)
};
```

**Usage:**
```typescript
// Single file
router.post('/avatar', authenticate, upload.single('avatar'), uploadAvatar);

// Multiple files
router.post('/documents', authenticate, upload.multiple('docs', 5), uploadDocs);
```

### `errorHandler.ts`
**Centralized Error Handling**

Catches and formats all errors consistently:

```typescript
export const errorHandler = (err, req, res, next) => {
  // Log error for debugging
  logger.error(err);

  // Handle different error types
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: 'Validation Error',
      message: formatValidationErrors(err)
    });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      error: 'Invalid ID',
      message: 'The provided ID is invalid'
    });
  }

  // Default error
  res.status(err.status || 500).json({
    success: false,
    error: err.name || 'Server Error',
    message: err.message || 'Something went wrong'
  });
};
```

### `rbac-usage-example.ts`
**RBAC Usage Examples**

Demonstrates how to use the RBAC middleware in various scenarios:
- Basic role checking
- Permission-based access
- Dynamic permission checking
- Custom authorization logic

## Common Middleware Patterns

### Middleware Order

The order of middleware matters:

```typescript
// Correct order
router.post('/protected',
  authenticate,          // First: verify user
  authorize(['admin']),  // Second: check role
  validation,           // Third: validate input
  validateRequest,      // Fourth: handle validation errors
  controller           // Finally: process request
);
```

### Conditional Middleware

Apply middleware conditionally:

```typescript
const conditionalAuth = (req, res, next) => {
  if (req.headers['x-api-key']) {
    return apiKeyAuth(req, res, next);
  }
  return authenticate(req, res, next);
};
```

### Async Middleware

Handle async operations properly:

```typescript
export const asyncMiddleware = async (req, res, next) => {
  try {
    await someAsyncOperation();
    next();
  } catch (error) {
    next(error); // Pass to error handler
  }
};
```

## Testing Middleware

Each middleware should have unit tests:

```typescript
// Test authentication
describe('authenticate middleware', () => {
  it('should attach user to request with valid token', async () => {
    const req = { headers: { authorization: 'Bearer valid-token' } };
    await authenticate(req, res, next);
    expect(req.user).toBeDefined();
    expect(next).toHaveBeenCalled();
  });

  it('should return 401 with invalid token', async () => {
    const req = { headers: { authorization: 'Bearer invalid' } };
    await authenticate(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
  });
});
```

## Best Practices

1. **Single Responsibility**: Each middleware does one thing well
2. **Error Handling**: Always use try-catch for async operations
3. **Next() Calls**: Remember to call next() or send response
4. **Request Mutation**: Be careful when modifying req object
5. **Performance**: Keep middleware lightweight
6. **Reusability**: Make middleware configurable and reusable
7. **Documentation**: Document expected req properties and behavior