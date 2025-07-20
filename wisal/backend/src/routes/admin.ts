import { Router } from 'express';
import { body, param, query } from 'express-validator';
import * as adminController from '../controllers/adminController';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validation';

const router = Router();

// All admin routes require authentication and admin role
router.use(authenticate);
router.use(authorize('admin'));

// User Management Routes
router.get(
  '/users',
  [
    query('role').optional().isIn(['seeker', 'lawyer', 'activist', 'admin']),
    query('isActive').optional().isBoolean(),
    query('isVerified').optional().isBoolean(),
    query('search').optional().trim(),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('sortBy').optional().isIn(['createdAt', 'updatedAt', 'name', 'email']),
    query('sortOrder').optional().isIn(['asc', 'desc'])
  ],
  validate,
  adminController.getAllUsers
);

router.patch(
  '/users/:userId',
  [
    param('userId').isMongoId(),
    body('isActive').optional().isBoolean(),
    body('isVerified').optional().isBoolean(),
    body('role').optional().isIn(['seeker', 'lawyer', 'activist', 'admin'])
  ],
  validate,
  adminController.updateUser
);

router.delete(
  '/users/:userId',
  param('userId').isMongoId(),
  validate,
  adminController.deleteUser
);

router.post(
  '/users/:userId/ban',
  [
    param('userId').isMongoId(),
    body('reason').trim().notEmpty(),
    body('duration').optional().isInt({ min: 1 }) // hours
  ],
  validate,
  adminController.banUser
);

router.post(
  '/users/:userId/unban',
  param('userId').isMongoId(),
  validate,
  adminController.unbanUser
);

// Lawyer Verification Routes
router.get(
  '/lawyers/pending',
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 })
  ],
  validate,
  adminController.getPendingLawyers
);

router.post(
  '/lawyers/:lawyerId/verify',
  [
    param('lawyerId').isMongoId(),
    body('approved').isBoolean(),
    body('notes').optional().trim()
  ],
  validate,
  adminController.verifyLawyer
);

// Content Moderation Routes
router.get(
  '/moderation/queue',
  [
    query('type').optional().isIn(['all', 'posts', 'queries']),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 })
  ],
  validate,
  adminController.getModerationQueue
);

router.post(
  '/moderation/:contentId',
  [
    param('contentId').isMongoId(),
    body('type').isIn(['post', 'query']),
    body('action').isIn(['approve', 'reject', 'flag']),
    body('reason').optional().trim()
  ],
  validate,
  adminController.moderateContent
);

// System Statistics and Analytics Routes
router.get('/stats', adminController.getSystemStats);

router.get(
  '/analytics',
  [
    query('period').optional().isIn(['24h', '7d', '30d', '90d']),
    query('metric').optional().isIn(['registrations', 'queries', 'conversations'])
  ],
  validate,
  adminController.getAnalytics
);

// System Configuration Routes
router.get('/config', adminController.getSystemConfig);

router.put(
  '/config',
  [
    body('config').isObject(),
    body('config.registrationEnabled').optional().isBoolean(),
    body('config.maintenanceMode').optional().isBoolean(),
    body('config.features').optional().isObject(),
    body('config.limits').optional().isObject()
  ],
  validate,
  adminController.updateSystemConfig
);

export default router;