import { 
  AIQueryRequest, 
  AIQueryResponse, 
  AISuggestionRequest, 
  AISuggestionResponse,
  AIAnalysis,
  LegalQuery,
  Message,
  LawyerProfile,
  Complexity
} from '../types';
import { defaultAIConfig, validateAIConfig } from './config';
// import { processLegalQuery } from './graphs/query-processor';
// import { generateAISuggestions } from './graphs/conversational-agent';
import { generateEmbeddings, createLawyerProfileEmbedding, batchProcessLawyerProfiles } from './embeddings';
import { categorizeQuery, extractSpecialisms, assessComplexity } from './categorization';
import { matchLawyers } from './matching';
import { initializeVectorStore, storeLawyerVector, vectorSearch } from './vector-search';

export class AIService {
  private initialized: boolean = false;

  /**
   * Initialize the AI service
   */
  async initialize(mongoUri: string): Promise<void> {
    try {
      // Validate configuration
      validateAIConfig(defaultAIConfig);

      // Initialize vector store
      await initializeVectorStore(mongoUri);

      this.initialized = true;
      console.log('AI Service initialized successfully');
    } catch (error) {
      console.error('Error initializing AI Service:', error);
      throw error;
    }
  }

  /**
   * Process a legal query through the complete AI pipeline
   */
  async processQuery(request: AIQueryRequest, userId: string): Promise<AIQueryResponse> {
    if (!this.initialized) {
      throw new Error('AI Service not initialized');
    }

    try {
      // Process through LangGraph
      // const result = await processLegalQuery(request, userId);
      // Temporary stub until query-processor is fixed
      const result = { 
        query: request, 
        lawyerMatches: [], 
        error: null,
        analysis: {
          summary: 'Temporary analysis',
          categories: ['general'],
          complexity: 'moderate' as Complexity,
          estimatedTime: 30,
          suggestedSpecialisms: [],
          keyIssues: [],
          recommendedActions: [],
        },
        categories: ['general'],
        complexity: 'moderate' as Complexity,
        clarificationQuestions: [],
        clarificationNeeded: false
      };

      if (result.error) {
        throw new Error(result.error);
      }

      // Build response
      const defaultComplexity: Complexity = 'moderate';
      const analysis: AIAnalysis = result.analysis || {
        summary: '',
        categories: result.categories || ['general'],
        complexity: (result.complexity || defaultComplexity) as Complexity,
        estimatedTime: 30,
        suggestedSpecialisms: [],
        keyIssues: [],
        recommendedActions: [],
      };
      
      const response: AIQueryResponse = {
        analysis,
        suggestedQuestions: result.clarificationQuestions || [],
        clarificationNeeded: result.clarificationNeeded || false,
        confidence: 0.8, // Default confidence
      };

      return response;
    } catch (error) {
      console.error('Error processing query:', error);
      throw error;
    }
  }

  /**
   * Generate AI suggestions for conversation
   */
  async generateSuggestions(
    request: AISuggestionRequest,
    conversationHistory: Message[],
    legalContext?: any
  ): Promise<AISuggestionResponse> {
    if (!this.initialized) {
      throw new Error('AI Service not initialized');
    }

    try {
      // const result = await generateAISuggestions(
      //   request,
      //   conversationHistory,
      //   legalContext
      // );
      // Temporary stub until conversational-agent is fixed
      const result = { 
        suggestions: [], 
        confidence: 0.5,
        legalCitations: [],
        warnings: []
      };

      return {
        suggestions: result.suggestions,
        legalCitations: result.legalCitations,
        warnings: result.warnings,
      };
    } catch (error) {
      console.error('Error generating suggestions:', error);
      throw error;
    }
  }

  /**
   * Analyze and categorize a legal query
   */
  async analyzeQuery(description: string): Promise<{
    categories: string[];
    specialisms: string[];
    complexity: 'simple' | 'moderate' | 'complex';
  }> {
    try {
      const categories = await categorizeQuery(description);
      const specialisms = await extractSpecialisms(description, categories[0] || 'other');
      const complexity = await assessComplexity(description, categories[0] || 'other');

      return {
        categories,
        specialisms,
        complexity,
      };
    } catch (error) {
      console.error('Error analyzing query:', error);
      throw error;
    }
  }

  /**
   * Match lawyers for a query
   */
  async matchLawyersForQuery(
    query: LegalQuery,
    location?: any
  ): Promise<any[]> {
    if (!this.initialized) {
      throw new Error('AI Service not initialized');
    }

    try {
      const matches = await matchLawyers({
        analysis: query.aiAnalysis,
        categories: query.aiAnalysis.categories,
        urgency: query.urgency,
        jurisdiction: query.jurisdiction,
        location,
      });

      return matches;
    } catch (error) {
      console.error('Error matching lawyers:', error);
      throw error;
    }
  }

  /**
   * Generate embeddings for text
   */
  async generateEmbeddings(text: string): Promise<number[]> {
    try {
      return await generateEmbeddings(text);
    } catch (error) {
      console.error('Error generating embeddings:', error);
      throw error;
    }
  }

  /**
   * Index lawyer profile for vector search
   */
  async indexLawyerProfile(
    lawyerId: string,
    profile: LawyerProfile
  ): Promise<void> {
    if (!this.initialized) {
      throw new Error('AI Service not initialized');
    }

    try {
      const embedding = await createLawyerProfileEmbedding({
        specialisms: profile.specialisms,
        currentRole: profile.currentRole,
        employer: profile.employer,
        languages: profile.languages,
        proBonoAreas: profile.proBonoAreas,
      });

      await storeLawyerVector(lawyerId, profile, embedding);
    } catch (error) {
      console.error('Error indexing lawyer profile:', error);
      throw error;
    }
  }

  /**
   * Batch index lawyer profiles
   */
  async batchIndexLawyerProfiles(
    profiles: Array<{
      id: string;
      profile: LawyerProfile;
    }>
  ): Promise<void> {
    if (!this.initialized) {
      throw new Error('AI Service not initialized');
    }

    try {
      const profilesWithEmbeddings = await batchProcessLawyerProfiles(
        profiles.map(p => ({
          id: p.id,
          specialisms: p.profile.specialisms,
          currentRole: p.profile.currentRole,
          employer: p.profile.employer,
          languages: p.profile.languages,
          proBonoAreas: p.profile.proBonoAreas,
        }))
      );

      // Store in vector database
      for (let i = 0; i < profiles.length; i++) {
        await storeLawyerVector(
          profiles[i].id,
          profiles[i].profile,
          profilesWithEmbeddings[i].embedding
        );
      }

      console.log(`Indexed ${profiles.length} lawyer profiles`);
    } catch (error) {
      console.error('Error batch indexing lawyer profiles:', error);
      throw error;
    }
  }

  /**
   * Search for lawyers using semantic search
   */
  async semanticLawyerSearch(
    query: string,
    filters?: any,
    limit?: number
  ): Promise<any[]> {
    if (!this.initialized) {
      throw new Error('AI Service not initialized');
    }

    try {
      const queryEmbedding = await generateEmbeddings(query);
      
      const results = await vectorSearch({
        embedding: queryEmbedding,
        filter: filters,
        limit,
      });

      return results;
    } catch (error) {
      console.error('Error in semantic lawyer search:', error);
      throw error;
    }
  }

  /**
   * Get AI service health status
   */
  getHealthStatus(): {
    initialized: boolean;
    openAIConfigured: boolean;
    vectorStoreReady: boolean;
  } {
    return {
      initialized: this.initialized,
      openAIConfigured: !!defaultAIConfig.openai.apiKey,
      vectorStoreReady: this.initialized,
    };
  }

  /**
   * Clear conversation context (for privacy)
   */
  async clearConversationContext(conversationId: string): Promise<void> {
    // In a production system, this would clear any cached conversation data
    console.log(`Clearing context for conversation: ${conversationId}`);
  }

  /**
   * Generate legal document summary
   */
  async summarizeDocument(documentText: string): Promise<string> {
    // Placeholder for document summarization
    // Would use GPT-4 to generate concise summaries
    return 'Document summary functionality to be implemented';
  }

  /**
   * Validate legal advice for compliance
   */
  async validateLegalAdvice(advice: string): Promise<{
    compliant: boolean;
    issues: string[];
    suggestions: string[];
  }> {
    // Placeholder for compliance validation
    // Would check for unauthorized practice of law, missing disclaimers, etc.
    return {
      compliant: true,
      issues: [],
      suggestions: [],
    };
  }
}

// Export singleton instance
export const aiService = new AIService();