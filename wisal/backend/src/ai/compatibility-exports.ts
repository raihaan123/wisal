/**
 * Compatibility exports for AI module
 * This file provides function aliases to match expected names in tests
 */

import { aiService } from './ai-service';

/**
 * Re-export all methods from aiService instance with expected names
 */
export const processQuery = aiService.processQuery.bind(aiService);
export const generateSuggestions = aiService.generateSuggestions.bind(aiService);
export const analyzeQuery = aiService.analyzeQuery.bind(aiService);
export const generateEmbeddings = aiService.generateEmbeddings.bind(aiService);
export const semanticLawyerSearch = aiService.semanticLawyerSearch.bind(aiService);