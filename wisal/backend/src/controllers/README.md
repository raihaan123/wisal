# Controllers

## Overview

This directory contains all the controller modules that handle HTTP request/response logic for the Wisal backend API. Controllers are responsible for request validation, calling appropriate services, and formatting responses.

## Controller Files

### Core Controllers

#### `authController.ts`
Handles authentication and authorization operations:
- **Register**: New user registration with email/password
- **Login**: Email/password authentication
- **LinkedIn OAuth**: OAuth2 flow for LinkedIn login
- **Refresh Token**: JWT token refresh
- **Me**: Get current authenticated user
- **Logout**: Clear authentication tokens

#### `userController.ts`
Manages user profile operations:
- **Get Profile**: Retrieve user profile by ID
- **Update Profile**: Update user information
- **Upload Avatar**: Handle profile picture uploads
- **Get Conversations**: List user's conversations
- **Delete Account**: Soft delete user account

#### `lawyerController.ts`
Handles lawyer-specific operations:
- **Search Lawyers**: Advanced search with filters (specialization, location, language, etc.)
- **Get Lawyer**: Retrieve detailed lawyer profile
- **Create Profile**: Set up new lawyer profile
- **Update Profile**: Modify lawyer information
- **Upload Verification**: Handle document uploads for verification
- **Update Availability**: Manage schedule and availability

### Communication Controllers

#### `conversationController.ts`
Manages real-time messaging:
- **List Conversations**: Get user's conversation list
- **Create Conversation**: Start new conversation between users
- **Get Messages**: Retrieve paginated messages
- **Send Message**: Add message to conversation
- **Mark as Read**: Update read status
- **Rate Conversation**: Add rating and feedback

#### `consultationController.ts`
Handles legal consultation management:
- **Create Consultation**: Book new consultation session
- **Get Consultations**: List consultations with filters
- **Update Status**: Change consultation status
- **Add Notes**: Lawyer adds consultation notes
- **Process Payment**: Handle Stripe payment integration

### Content Controllers

#### `queryController.ts`
Manages legal queries:
- **Create Query**: Submit new legal question
- **Search Queries**: Full-text and filtered search
- **Get Query**: Retrieve query details
- **Update Query**: Modify query information
- **Assign Lawyer**: Connect query to lawyer
- **Add Response**: Lawyer responds to query

#### `postController.ts`
Handles activism posts and social features:
- **List Posts**: Get paginated posts feed
- **Create Post**: Publish new activism post
- **Like Post**: Toggle like on post
- **Add Comment**: Comment on posts
- **Share Post**: Share functionality
- **Report Post**: Flag inappropriate content

### AI Controllers

#### `aiSearchController.ts`
Provides AI-powered search and matching:
- **Analyze Query**: AI analysis of legal queries
- **Semantic Search**: Vector-based lawyer search
- **Suggest Response**: AI-generated response suggestions
- **Categorize**: Automatic legal category detection
- **Match Lawyers**: AI-powered lawyer matching

### Administrative Controllers

#### `adminController.ts`
Administrative functions (requires admin role):
- **User Management**: List, update, suspend users
- **Verification**: Approve/reject lawyer verifications
- **Analytics**: Platform usage statistics
- **Content Moderation**: Review reported content
- **System Settings**: Manage platform configuration

## Common Patterns

### Request Validation
All controllers use `express-validator` for input validation:
```typescript
const validation = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 })
];
```

### Error Handling
Controllers use consistent error handling:
```typescript
try {
  // Controller logic
} catch (error) {
  return res.status(500).json({ 
    error: 'Operation failed',
    message: error.message 
  });
}
```

### Authentication
Protected routes use auth middleware:
```typescript
router.post('/create', authenticate, authorize(['lawyer']), createController);
```

### Response Format
Standardized response structure:
```typescript
// Success
res.json({
  success: true,
  data: result,
  message: 'Operation successful'
});

// Error
res.status(400).json({
  success: false,
  error: 'Validation failed',
  errors: validationErrors
});
```

## Testing

Each controller should have corresponding tests in `/tests/controllers/`:
- Unit tests for individual methods
- Integration tests for full request flows
- Mock external services (database, AI, payments)

## Best Practices

1. **Separation of Concerns**: Controllers only handle HTTP logic
2. **Validation First**: Always validate input before processing
3. **Consistent Responses**: Use standard response formats
4. **Error Details**: Provide helpful error messages
5. **Logging**: Log important operations for debugging
6. **Rate Limiting**: Apply appropriate rate limits
7. **Security**: Sanitize inputs, validate permissions