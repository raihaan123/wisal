import { Request, Response } from 'express';
import { processLegalQuery } from '../ai/graphs/query-processor';
import LawyerProfile from '../models/LawyerProfile';
import User from '../models/User';
import { defaultAIConfig } from '../ai/config';

export const aiSearchController = {
  /**
   * Process an AI-powered search query
   * Supports both authenticated and guest users
   */
  async search(req: Request, res: Response) {
    try {
      const { description, clarificationResponses, urgency, jurisdiction } = req.body;
      
      if (!description || typeof description !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'Please provide a description of your legal needs',
        });
      }

      // Check if user is authenticated
      const userId = (req as any).user?._id;
      const isGuest = !userId;
      
      console.log(`Processing AI search query for ${isGuest ? 'guest' : 'user ' + userId}`);

      // Process the query through LangGraph
      const queryResult = await processLegalQuery(
        {
          description,
          urgency: urgency || 'medium',
          jurisdiction,
        },
        userId
      );

      // Check if clarification is needed
      if (queryResult.clarificationNeeded && !clarificationResponses) {
        return res.json({
          success: true,
          clarificationNeeded: true,
          clarificationQuestions: queryResult.clarificationQuestions,
          message: 'Please provide additional information',
        });
      }

      // Check for errors
      if (queryResult.error) {
        console.error('Query processing error:', queryResult.error);
        return res.status(500).json({
          success: false,
          message: 'Failed to process your query. Please try again.',
          error: queryResult.error,
        });
      }

      // Fetch lawyer details for matches
      const matchedLawyerIds = queryResult.matchedLawyerIds.slice(0, 3); // Top 3 matches
      
      if (isGuest) {
        // For guests, return limited information
        return res.json({
          success: true,
          clarificationNeeded: false,
          matchedLawyers: matchedLawyerIds, // Just IDs for guests
          matchScores: queryResult.matchScores,
          isGuest: true,
          message: 'Sign up or log in to view lawyer profiles',
        });
      }

      // For authenticated users, fetch full lawyer profiles
      const lawyerProfiles = await LawyerProfile.find({
        _id: { $in: matchedLawyerIds },
        isApproved: true,
      })
        .populate('user', 'name email')
        .lean();

      // Sort lawyers by match score
      const sortedLawyers = lawyerProfiles.sort((a, b) => {
        const scoreA = queryResult.matchScores[a._id.toString()] || 0;
        const scoreB = queryResult.matchScores[b._id.toString()] || 0;
        return scoreB - scoreA;
      });

      return res.json({
        success: true,
        clarificationNeeded: false,
        matchedLawyers: matchedLawyerIds,
        matchScores: queryResult.matchScores,
        lawyerProfiles: sortedLawyers,
        analysis: queryResult.analysis,
        isGuest: false,
      });
    } catch (error) {
      console.error('AI search error:', error);
      return res.status(500).json({
        success: false,
        message: 'An error occurred while processing your search',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  },

  /**
   * Get search suggestions based on partial query
   */
  async getSuggestions(req: Request, res: Response) {
    try {
      const { query } = req.query;
      
      if (!query || typeof query !== 'string' || query.length < 3) {
        return res.json({
          success: true,
          suggestions: [],
        });
      }

      // Common legal query suggestions
      const commonQueries = [
        'I need help with wrongful termination',
        'My landlord is trying to evict me',
        'I was arrested at a protest',
        'I need immigration legal advice',
        'My employer is discriminating against me',
        'I need help with a civil rights violation',
        'Police violated my rights',
        'I need help with environmental regulations',
        'My freedom of speech was violated',
        'I need help with labor union issues',
      ];

      // Filter suggestions based on query
      const suggestions = commonQueries
        .filter(suggestion => 
          suggestion.toLowerCase().includes(query.toLowerCase())
        )
        .slice(0, 5);

      return res.json({
        success: true,
        suggestions,
      });
    } catch (error) {
      console.error('Suggestions error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to get suggestions',
      });
    }
  },

  /**
   * Validate AI configuration
   */
  async validateConfig(req: Request, res: Response) {
    try {
      const hasOpenAIKey = !!defaultAIConfig.openai.apiKey;
      const hasValidModel = ['gpt-4', 'gpt-4-turbo-preview', 'gpt-3.5-turbo'].includes(
        defaultAIConfig.openai.model
      );

      return res.json({
        success: true,
        configured: hasOpenAIKey && hasValidModel,
        model: defaultAIConfig.openai.model,
        features: {
          embeddings: hasOpenAIKey,
          categorization: hasOpenAIKey,
          matching: true,
          clarification: hasOpenAIKey,
        },
      });
    } catch (error) {
      console.error('Config validation error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to validate configuration',
      });
    }
  },
};