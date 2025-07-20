/**
 * Wisal AI Integration Module
 * 
 * This module provides comprehensive AI capabilities for the Wisal platform:
 * - LangGraph orchestration for conversational query processing
 * - OpenAI GPT-4o integration for text analysis
 * - Legal query categorization and analysis
 * - Lawyer matching algorithm with vector search
 * - Conversational agent for information gathering
 * - AI-powered response suggestions for lawyers
 * - Semantic search implementation
 */

export { aiService, AIService } from './ai-service';
export { defaultAIConfig, validateAIConfig, AIConfig } from './config';
export { default as aiRoutes } from './routes';

// Graphs
export { createQueryProcessorGraph, processLegalQuery } from './graphs/query-processor';
export { createConversationalAgentGraph, processConversationMessage } from './graphs/conversational-agent';

// Core AI functions
export {
  generateEmbeddings,
  generateBatchEmbeddings,
  cosineSimilarity,
  findMostSimilar,
  createLawyerProfileEmbedding,
  createQueryEmbedding,
  batchProcessLawyerProfiles,
} from './embeddings';

export {
  categorizeQuery,
  extractSpecialisms,
  assessComplexity,
  batchCategorizeQueries,
  validateCategories,
  getRelatedCategories,
} from './categorization';

export {
  matchLawyers,
  rerankMatches,
} from './matching';

export {
  initializeVectorStore,
  storeLawyerVector,
  vectorSearch,
  batchUpdateLawyerVectors,
  findSimilarLawyers,
  deleteLawyerVector,
  getVectorStoreStats,
} from './vector-search';

// Compatibility exports - function names expected by tests
export {
  processQuery,
  generateSuggestions,
  analyzeQuery,
  semanticLawyerSearch,
} from './compatibility-exports';

// Re-export types
export type {
  AIQueryRequest,
  AIQueryResponse,
  AIAnalysis,
  AISuggestionRequest,
  AISuggestionResponse,
  VectorSearchQuery,
  VectorSearchResult,
} from '../types';