import { Router } from 'express';
import { body, param, query } from 'express-validator';
import * as conversationController from '../controllers/conversationController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validation';

const router = Router();

// Get user's conversations
router.get(
  '/',
  authenticate,
  [
    query('status').optional().isIn(['active', 'completed', 'cancelled']),
    query('type').optional().isIn(['consultation', 'general']),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
  ],
  validate,
  conversationController.getUserConversations
);

// Get single conversation
router.get(
  '/:conversationId',
  authenticate,
  param('conversationId').isMongoId(),
  validate,
  conversationController.getConversation
);

// Create conversation
router.post(
  '/',
  authenticate,
  [
    body('lawyerId').isMongoId(),
    body('queryId').optional().isMongoId(),
    body('type').isIn(['consultation', 'general']),
    body('price').isNumeric().custom(value => value >= 0).withMessage('Price must be positive'),
  ],
  validate,
  conversationController.createConversation
);

// Update conversation status
router.put(
  '/:conversationId/status',
  authenticate,
  param('conversationId').isMongoId(),
  body('status').isIn(['active', 'completed', 'cancelled']),
  validate,
  conversationController.updateConversationStatus
);

// End conversation
router.post(
  '/:conversationId/end',
  authenticate,
  param('conversationId').isMongoId(),
  validate,
  conversationController.endConversation
);

// Rate conversation
router.post(
  '/:conversationId/rate',
  authenticate,
  param('conversationId').isMongoId(),
  [
    body('rating').isInt({ min: 1, max: 5 }),
    body('review').optional().trim().isLength({ max: 1000 }),
  ],
  validate,
  conversationController.rateConversation
);

// Get conversation messages
router.get(
  '/:conversationId/messages',
  authenticate,
  param('conversationId').isMongoId(),
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
  ],
  validate,
  conversationController.getMessages
);

// Send message
router.post(
  '/:conversationId/messages',
  authenticate,
  param('conversationId').isMongoId(),
  [
    body('content').trim().notEmpty().isLength({ max: 10000 }),
    body('type').optional().isIn(['text', 'file', 'image']),
  ],
  validate,
  conversationController.sendMessage
);

// Mark messages as read
router.put(
  '/:conversationId/messages/read',
  authenticate,
  param('conversationId').isMongoId(),
  validate,
  conversationController.markMessagesAsRead
);

export default router;