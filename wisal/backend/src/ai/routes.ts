import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { aiService } from './ai-service';
import { AIQueryRequest, AISuggestionRequest } from '../types';

const router = Router();

/**
 * Analyze a legal query
 * POST /api/ai/analyze-query
 */
router.post(
  '/analyze-query',
  [
    body('description').isString().isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
    body('urgency').optional().isIn(['low', 'medium', 'high', 'critical']),
    body('jurisdiction').optional().isString(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const request: AIQueryRequest = req.body;
      const userId = (req as any).user?.id || 'anonymous';

      const result = await aiService.processQuery(request, userId);
      
      res.json(result);
    } catch (error) {
      console.error('Error analyzing query:', error);
      res.status(500).json({ 
        error: 'Failed to analyze query',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

/**
 * Get AI suggestions for conversation
 * POST /api/ai/suggest-response
 */
router.post(
  '/suggest-response',
  [
    body('conversationId').isString(),
    body('context').isString(),
    body('role').isIn(['seeker', 'lawyer']),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const request: AISuggestionRequest = req.body;
      
      // In a real implementation, fetch conversation history from database
      const conversationHistory: any[] = [];
      const legalContext = undefined; // Would be fetched from conversation

      const result = await aiService.generateSuggestions(
        request,
        conversationHistory,
        legalContext
      );
      
      res.json(result);
    } catch (error) {
      console.error('Error generating suggestions:', error);
      res.status(500).json({ 
        error: 'Failed to generate suggestions',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

/**
 * Categorize a legal query
 * POST /api/ai/categorize
 */
router.post(
  '/categorize',
  [
    body('description').isString().isLength({ min: 10 }),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { description } = req.body;
      const result = await aiService.analyzeQuery(description);
      
      res.json(result);
    } catch (error) {
      console.error('Error categorizing query:', error);
      res.status(500).json({ 
        error: 'Failed to categorize query',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

/**
 * Generate embeddings for text
 * POST /api/ai/embeddings
 */
router.post(
  '/embeddings',
  [
    body('text').isString().isLength({ min: 1 }),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { text } = req.body;
      const embeddings = await aiService.generateEmbeddings(text);
      
      res.json({ 
        embeddings,
        dimension: embeddings.length 
      });
    } catch (error) {
      console.error('Error generating embeddings:', error);
      res.status(500).json({ 
        error: 'Failed to generate embeddings',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

/**
 * Semantic search for lawyers
 * POST /api/ai/semantic-search
 */
router.post(
  '/semantic-search',
  [
    body('query').isString().isLength({ min: 5 }),
    body('filters').optional().isObject(),
    body('limit').optional().isInt({ min: 1, max: 50 }),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { query, filters, limit } = req.body;
      const results = await aiService.semanticLawyerSearch(query, filters, limit);
      
      res.json({ 
        results,
        count: results.length 
      });
    } catch (error) {
      console.error('Error in semantic search:', error);
      res.status(500).json({ 
        error: 'Failed to perform semantic search',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

/**
 * Get AI service health status
 * GET /api/ai/health
 */
router.get('/health', (req, res) => {
  try {
    const status = aiService.getHealthStatus();
    
    res.json({
      status: 'ok',
      ...status,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'error',
      error: 'Failed to get health status',
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * Index lawyer profile for vector search
 * POST /api/ai/index-lawyer
 * (Admin only in production)
 */
router.post(
  '/index-lawyer',
  [
    body('lawyerId').isString(),
    body('profile').isObject(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { lawyerId, profile } = req.body;
      await aiService.indexLawyerProfile(lawyerId, profile);
      
      res.json({ 
        success: true,
        message: 'Lawyer profile indexed successfully' 
      });
    } catch (error) {
      console.error('Error indexing lawyer profile:', error);
      res.status(500).json({ 
        error: 'Failed to index lawyer profile',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

/**
 * Batch index lawyer profiles
 * POST /api/ai/batch-index-lawyers
 * (Admin only in production)
 */
router.post(
  '/batch-index-lawyers',
  [
    body('profiles').isArray().withMessage('Profiles must be an array'),
    body('profiles.*.id').isString(),
    body('profiles.*.profile').isObject(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { profiles } = req.body;
      await aiService.batchIndexLawyerProfiles(profiles);
      
      res.json({ 
        success: true,
        message: `Indexed ${profiles.length} lawyer profiles`,
        count: profiles.length,
      });
    } catch (error) {
      console.error('Error batch indexing lawyer profiles:', error);
      res.status(500).json({ 
        error: 'Failed to batch index lawyer profiles',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

/**
 * Clear conversation context
 * POST /api/ai/clear-context
 */
router.post(
  '/clear-context',
  [
    body('conversationId').isString(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { conversationId } = req.body;
      await aiService.clearConversationContext(conversationId);
      
      res.json({ 
        success: true,
        message: 'Conversation context cleared' 
      });
    } catch (error) {
      console.error('Error clearing context:', error);
      res.status(500).json({ 
        error: 'Failed to clear conversation context',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

export default router;