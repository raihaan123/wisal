import { Router } from 'express';
import { body, param } from 'express-validator';
import * as userController from '../controllers/userController';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { upload } from '../middleware/upload';

const router = Router();

// Get user profile
router.get(
  '/:userId',
  authenticate,
  param('userId').isMongoId(),
  validate,
  userController.getUserProfile
);

// Update user profile
router.put(
  '/:userId',
  authenticate,
  param('userId').isMongoId(),
  [
    body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
    body('email').optional().isEmail().normalizeEmail(),
  ],
  validate,
  userController.updateUserProfile
);

// Upload profile picture
router.post(
  '/:userId/avatar',
  authenticate,
  param('userId').isMongoId(),
  upload.single('avatar'),
  validate,
  userController.uploadAvatar
);

// Delete user account
router.delete(
  '/:userId',
  authenticate,
  param('userId').isMongoId(),
  validate,
  userController.deleteAccount
);

// Get user's conversations
router.get(
  '/:userId/conversations',
  authenticate,
  param('userId').isMongoId(),
  validate,
  userController.getUserConversations
);

// Get user's queries (for seekers)
router.get(
  '/:userId/queries',
  authenticate,
  param('userId').isMongoId(),
  validate,
  userController.getUserQueries
);

// Get user's posts
router.get(
  '/:userId/posts',
  authenticate,
  param('userId').isMongoId(),
  validate,
  userController.getUserPosts
);

// Admin routes
router.get(
  '/',
  authenticate,
  authorize('admin'),
  userController.getAllUsers
);

router.put(
  '/:userId/status',
  authenticate,
  authorize('admin'),
  param('userId').isMongoId(),
  body('isActive').isBoolean(),
  validate,
  userController.updateUserStatus
);

export default router;