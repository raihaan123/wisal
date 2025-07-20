import { defaultAIConfig as config } from '../ai/config';
import { processLegalQuery } from '../ai/graphs/query-processor';
import { vectorSearch } from '../ai/vector-search';
import { categorizeQuery } from '../ai/categorization';
import { generateEmbeddings } from '../ai/embeddings';

export interface QueryAnalysis {
  intent: string;
  confidence: number;
  entities: Record<string, any>;
  suggestedResponse: string;
  requiredInfo: string[];
}

export interface ResponseSuggestion {
  suggestions: Array<{
    text: string;
    confidence: number;
    tone: string;
  }>;
  improvements: string[];
}

export interface Categorization {
  category: string;
  confidence: number;
  alternativeCategories: Array<{
    category: string;
    confidence: number;
  }>;
  reasoning: string;
}

export interface EmbeddingResult {
  embeddings: Array<{
    text: string;
    embedding: number[];
  }>;
  model: string;
  dimensions: number;
}

export interface SearchResult {
  results: Array<{
    text: string;
    score: number;
    metadata: Record<string, any>;
  }>;
  totalResults: number;
  searchTime: number;
}

export class AIService {
  private openAIKey: string;

  constructor() {
    this.openAIKey = config.openai.apiKey;
    if (!this.openAIKey) {
      console.warn('OpenAI API key not configured');
    }
  }

  async analyzeQuery(query: string, context?: any): Promise<QueryAnalysis> {
    try {
      // Use the existing query processor
      const result = await processLegalQuery({
        query,
        conversationHistory: context?.conversationHistory || [],
        previousAnalysis: context?.previousAnalysis
      }, context?.userId || 'anonymous');
      
      return {
        intent: result.intent || 'general_inquiry',
        confidence: result.confidence || 0.8,
        entities: result.entities || {},
        suggestedResponse: result.response || 'I can help you with that.',
        requiredInfo: result.requiredInfo || []
      };
    } catch (error) {
      console.error('Error analyzing query:', error);
      throw new Error('Failed to analyze query');
    }
  }

  async suggestResponse(
    context: string, 
    currentDraft: string, 
    tone: string = 'professional'
  ): Promise<ResponseSuggestion> {
    try {
      // For now, return mock suggestions
      // In production, this would call OpenAI or another LLM
      const suggestions = this.generateMockSuggestions(context, currentDraft, tone);
      
      return {
        suggestions,
        improvements: [
          'Add more specific details',
          'Include relevant links or resources',
          'Personalize the response based on user history'
        ]
      };
    } catch (error) {
      console.error('Error suggesting response:', error);
      throw new Error('Failed to generate response suggestions');
    }
  }

  async categorizeText(
    text: string, 
    availableCategories: string[]
  ): Promise<Categorization> {
    try {
      const categories = await categorizeQuery(text);
      const result = {
        category: categories[0] || availableCategories[0],
        confidence: 0.85,
        alternatives: categories.slice(1).map((cat, idx) => ({
          category: cat,
          confidence: 0.85 - (idx + 1) * 0.1
        })),
        reasoning: 'Based on AI analysis of the text content'
      };
      
      return {
        category: result.category,
        confidence: result.confidence,
        alternativeCategories: result.alternatives || [],
        reasoning: result.reasoning || 'Based on keyword analysis and context'
      };
    } catch (error) {
      console.error('Error categorizing text:', error);
      throw new Error('Failed to categorize text');
    }
  }

  async generateEmbeddings(texts: string[]): Promise<EmbeddingResult> {
    try {
      const embeddings = await Promise.all(
        texts.map(async (text) => {
          const embedding = await generateEmbeddings(text);
          return { text, embedding };
        })
      );

      return {
        embeddings,
        model: 'text-embedding-ada-002',
        dimensions: embeddings[0]?.embedding.length || 768
      };
    } catch (error) {
      console.error('Error generating embeddings:', error);
      throw new Error('Failed to generate embeddings');
    }
  }

  async semanticSearch(
    query: string, 
    limit: number = 10, 
    threshold: number = 0.7
  ): Promise<SearchResult> {
    try {
      const startTime = Date.now();
      const queryEmbedding = await generateEmbeddings(query);
      const searchResults = await vectorSearch({
        embedding: queryEmbedding,
        limit
        // threshold not supported in current implementation
      });
      const results = searchResults;
      
      return {
        results: results.map(r => ({
          text: r.profile?.bio || '',
          score: r.score,
          metadata: r.profile || {}
        })),
        totalResults: results.length,
        searchTime: Date.now() - startTime
      };
    } catch (error) {
      console.error('Error performing semantic search:', error);
      throw new Error('Failed to perform semantic search');
    }
  }

  private generateMockSuggestions(
    context: string, 
    currentDraft: string, 
    tone: string
  ) {
    const baseSuggestion = currentDraft || context.substring(0, 100);
    
    const toneVariations = {
      professional: [
        `${baseSuggestion}. I'll be happy to assist you further with this matter.`,
        `Regarding your inquiry: ${baseSuggestion}. Please let me know if you need additional information.`
      ],
      friendly: [
        `${baseSuggestion}! Let me know if you have any other questions!`,
        `Great question! ${baseSuggestion}. Feel free to ask if you need more help!`
      ],
      formal: [
        `In response to your inquiry: ${baseSuggestion}. We remain at your disposal for further assistance.`,
        `${baseSuggestion}. Should you require additional information, please do not hesitate to contact us.`
      ]
    };

    const suggestions = (toneVariations[tone as keyof typeof toneVariations] || toneVariations.professional)
      .map((text, index) => ({
        text,
        confidence: 0.95 - (index * 0.05),
        tone
      }));

    return suggestions;
  }
}

// Export singleton instance
export const aiService = new AIService();