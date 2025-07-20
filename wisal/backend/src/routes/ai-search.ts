import { Router } from 'express';
import { aiSearchController } from '../controllers/aiSearchController';
import { authenticateOptional } from '../middleware/auth';

const router = Router();

/**
 * @route   POST /api/ai/search
 * @desc    Process AI-powered legal search query
 * @access  Public (with limited results for guests)
 */
router.post('/search', authenticateOptional, aiSearchController.search);

/**
 * @route   GET /api/ai/suggestions
 * @desc    Get search query suggestions
 * @access  Public
 */
router.get('/suggestions', aiSearchController.getSuggestions);

/**
 * @route   GET /api/ai/config/validate
 * @desc    Validate AI configuration
 * @access  Public
 */
router.get('/config/validate', aiSearchController.validateConfig);

export default router;