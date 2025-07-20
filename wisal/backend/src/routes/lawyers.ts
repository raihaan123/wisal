import { Router } from 'express';
import { body, param, query } from 'express-validator';
import * as lawyerController from '../controllers/lawyerController';
import { authenticate, authorize, optionalAuth } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { upload } from '../middleware/upload';

const router = Router();

// Search lawyers (public)
router.get(
  '/search',
  optionalAuth,
  [
    query('q').optional().trim(),
    query('practiceAreas').optional(),
    query('location').optional(),
    query('minPrice').optional().isNumeric(),
    query('maxPrice').optional().isNumeric(),
    query('languages').optional(),
    query('rating').optional().isNumeric(),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
  ],
  validate,
  lawyerController.searchLawyers
);

// Get lawyer profile (public)
router.get(
  '/:lawyerId',
  optionalAuth,
  param('lawyerId').isMongoId(),
  validate,
  lawyerController.getLawyerProfile
);

// Create lawyer profile
router.post(
  '/',
  authenticate,
  authorize('lawyer'),
  [
    body('barNumber').trim().notEmpty(),
    body('licenseState').trim().notEmpty(),
    body('practiceAreas').isArray({ min: 1 }),
    body('yearsOfExperience').isInt({ min: 0 }),
    body('education').isArray({ min: 1 }),
    body('languages').isArray({ min: 1 }),
    body('bio').trim().isLength({ min: 50, max: 2000 }),
    body('hourlyRate').isNumeric().custom(value => value >= 0).withMessage('Hourly rate must be positive'),
    body('consultationFee').isNumeric().custom(value => value >= 0).withMessage('Consultation fee must be positive'),
  ],
  validate,
  lawyerController.createLawyerProfile
);

// Update lawyer profile
router.put(
  '/:lawyerId',
  authenticate,
  authorize('lawyer'),
  param('lawyerId').isMongoId(),
  validate,
  lawyerController.updateLawyerProfile
);

// Upload verification documents
router.post(
  '/:lawyerId/verification',
  authenticate,
  authorize('lawyer'),
  param('lawyerId').isMongoId(),
  upload.array('documents', 5),
  validate,
  lawyerController.uploadVerificationDocs
);

// Update availability
router.put(
  '/:lawyerId/availability',
  authenticate,
  authorize('lawyer'),
  param('lawyerId').isMongoId(),
  body('availability').isArray(),
  validate,
  lawyerController.updateAvailability
);

// Get lawyer reviews
router.get(
  '/:lawyerId/reviews',
  param('lawyerId').isMongoId(),
  validate,
  lawyerController.getLawyerReviews
);

// Get lawyer statistics
router.get(
  '/:lawyerId/stats',
  authenticate,
  authorize('lawyer'),
  param('lawyerId').isMongoId(),
  validate,
  lawyerController.getLawyerStats
);

// Admin routes
router.put(
  '/:lawyerId/verify',
  authenticate,
  authorize('admin'),
  param('lawyerId').isMongoId(),
  body('isVerified').isBoolean(),
  validate,
  lawyerController.verifyLawyer
);

export default router;