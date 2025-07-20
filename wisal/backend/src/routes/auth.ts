import { Router } from 'express';
import { body } from 'express-validator';
import passport from 'passport';
import * as authController from '../controllers/authController';
import { validate } from '../middleware/validation';
import { authenticate } from '../middleware/auth';

const router = Router();

// Local Registration (signup)
router.post(
  '/signup',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('role').isIn(['seeker', 'lawyer', 'activist']).withMessage('Role must be seeker, lawyer, or activist'),
  ],
  validate,
  authController.register
);

// Keep register route for backward compatibility
router.post(
  '/register',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('role').isIn(['seeker', 'lawyer', 'activist']).withMessage('Role must be seeker, lawyer, or activist'),
  ],
  validate,
  authController.register
);

// Local Login
router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty(),
  ],
  validate,
  authController.login
);

// LinkedIn OAuth using custom implementation
// We use custom implementation instead of passport-linkedin-oauth2 
// because the package is outdated and doesn't support OpenID Connect
router.get(
  '/linkedin-custom',
  authController.linkedinAuthCustom
);

router.get(
  '/linkedin/callback-custom',
  authController.linkedinCallbackCustom
);

// Debug endpoint to check LinkedIn configuration
router.get('/linkedin/debug', (req, res) => {
  res.json({
    configured: true,
    clientId: process.env.LINKEDIN_CLIENT_ID ? 'Set' : 'Not set',
    clientSecret: process.env.LINKEDIN_CLIENT_SECRET ? 'Set' : 'Not set',
    callbackUrl: process.env.LINKEDIN_CALLBACK_URL || 'Not set',
    frontendUrl: process.env.FRONTEND_URL || 'Not set',
    authUrl: `${req.protocol}://${req.get('host')}/api/auth/linkedin-custom`,
    expectedCallback: process.env.LINKEDIN_CALLBACK_URL || `${req.protocol}://${req.get('host')}/api/auth/linkedin/callback-custom`
  });
});

// Refresh Token
router.post(
  '/refresh',
  [body('refreshToken').notEmpty()],
  validate,
  authController.refreshToken
);

// Logout
router.post('/logout', authenticate, authController.logout);

// Verify Email
router.get('/verify/:token', authController.verifyEmail);

// Forgot Password
router.post(
  '/forgot-password',
  [body('email').isEmail().normalizeEmail()],
  validate,
  authController.forgotPassword
);

// Reset Password
router.post(
  '/reset-password',
  [
    body('token').notEmpty(),
    body('password').isLength({ min: 8 }),
  ],
  validate,
  authController.resetPassword
);

// Get Current User
router.get('/me', authenticate, authController.getCurrentUser);

export default router;