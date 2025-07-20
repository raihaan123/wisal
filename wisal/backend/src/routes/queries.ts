import { Router } from 'express';
import { body, param, query } from 'express-validator';
import * as queryController from '../controllers/queryController';
import { authenticate, authorize, optionalAuth } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { upload } from '../middleware/upload';

const router = Router();

// Get queries (with filters)
router.get(
  '/',
  optionalAuth,
  [
    query('category').optional(),
    query('status').optional().isIn(['open', 'in_progress', 'resolved', 'closed']),
    query('urgencyLevel').optional().isIn(['low', 'medium', 'high', 'urgent']),
    query('minBudget').optional().isNumeric(),
    query('maxBudget').optional().isNumeric(),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
  ],
  validate,
  queryController.getQueries
);

// Search queries
router.get(
  '/search',
  optionalAuth,
  [
    query('q').trim().notEmpty(),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
  ],
  validate,
  queryController.searchQueries
);

// Get single query
router.get(
  '/:queryId',
  optionalAuth,
  param('queryId').isMongoId(),
  validate,
  queryController.getQuery
);

// Create query
router.post(
  '/',
  authenticate,
  authorize('seeker'),
  [
    body('title').trim().isLength({ min: 10, max: 200 }),
    body('description').trim().isLength({ min: 50, max: 5000 }),
    body('category').trim().notEmpty(),
    body('urgencyLevel').isIn(['low', 'medium', 'high', 'urgent']),
    body('budget').isNumeric().custom(value => value >= 0).withMessage('Budget must be positive'),
    body('isAnonymous').optional().isBoolean(),
    body('tags').optional().isArray(),
  ],
  validate,
  queryController.createQuery
);

// Update query
router.put(
  '/:queryId',
  authenticate,
  authorize('seeker'),
  param('queryId').isMongoId(),
  validate,
  queryController.updateQuery
);

// Delete query
router.delete(
  '/:queryId',
  authenticate,
  authorize('seeker'),
  param('queryId').isMongoId(),
  validate,
  queryController.deleteQuery
);

// Upload attachments
router.post(
  '/:queryId/attachments',
  authenticate,
  authorize('seeker'),
  param('queryId').isMongoId(),
  upload.array('attachments', 5),
  validate,
  queryController.uploadAttachments
);

// Assign lawyer to query
router.post(
  '/:queryId/assign',
  authenticate,
  authorize('seeker'),
  param('queryId').isMongoId(),
  body('lawyerId').isMongoId(),
  validate,
  queryController.assignLawyer
);

// Get query responses
router.get(
  '/:queryId/responses',
  authenticate,
  param('queryId').isMongoId(),
  validate,
  queryController.getQueryResponses
);

// Respond to query (lawyers)
router.post(
  '/:queryId/respond',
  authenticate,
  authorize('lawyer'),
  param('queryId').isMongoId(),
  [
    body('message').trim().notEmpty(),
    body('proposedFee').isNumeric().custom(value => value >= 0).withMessage('Proposed fee must be positive'),
  ],
  validate,
  queryController.respondToQuery
);

export default router;