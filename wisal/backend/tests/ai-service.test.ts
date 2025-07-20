import { AIService } from '../src/services/AIService';
import { processQuery } from '../src/ai/query-processor';
import { searchSimilar } from '../src/ai/vector-search';
import { categorizeText } from '../src/ai/categorization';
import { generateEmbedding } from '../src/ai/embeddings';

// Mock the AI modules
jest.mock('../src/ai/query-processor');
jest.mock('../src/ai/vector-search');
jest.mock('../src/ai/categorization');
jest.mock('../src/ai/embeddings');
jest.mock('../src/ai/config', () => ({
  config: {
    openAIKey: 'test-key',
    modelName: 'gpt-3.5-turbo',
    embeddingModel: 'text-embedding-ada-002'
  }
}));

describe('AIService Unit Tests', () => {
  let aiService: AIService;

  beforeEach(() => {
    jest.clearAllMocks();
    aiService = new AIService();
  });

  describe('analyzeQuery', () => {
    it('should successfully analyze a query', async () => {
      const mockQueryResult = {
        intent: 'visa_status_inquiry',
        confidence: 0.95,
        entities: { type: 'visa', action: 'status_check' },
        response: 'I can help you check your visa application status.',
        requiredInfo: ['application_number']
      };

      (processQuery as jest.Mock).mockResolvedValue(mockQueryResult);

      const result = await aiService.analyzeQuery('What is my visa status?');

      expect(result).toEqual({
        intent: 'visa_status_inquiry',
        confidence: 0.95,
        entities: { type: 'visa', action: 'status_check' },
        suggestedResponse: 'I can help you check your visa application status.',
        requiredInfo: ['application_number']
      });

      expect(processQuery).toHaveBeenCalledWith('What is my visa status?', undefined);
    });

    it('should handle errors gracefully', async () => {
      (processQuery as jest.Mock).mockRejectedValue(new Error('Processing failed'));

      await expect(aiService.analyzeQuery('test query'))
        .rejects.toThrow('Failed to analyze query');
    });
  });

  describe('suggestResponse', () => {
    it('should generate response suggestions', async () => {
      const result = await aiService.suggestResponse(
        'Customer asking about visa',
        'Your visa application',
        'professional'
      );

      expect(result).toHaveProperty('suggestions');
      expect(result.suggestions).toBeInstanceOf(Array);
      expect(result.suggestions.length).toBeGreaterThan(0);
      expect(result.suggestions[0]).toHaveProperty('text');
      expect(result.suggestions[0]).toHaveProperty('confidence');
      expect(result.suggestions[0]).toHaveProperty('tone');
      expect(result).toHaveProperty('improvements');
    });
  });

  describe('categorizeText', () => {
    it('should categorize text correctly', async () => {
      const mockCategorization = {
        category: 'visa',
        confidence: 0.92,
        alternatives: [
          { category: 'general', confidence: 0.45 }
        ],
        reasoning: 'Contains visa-related keywords'
      };

      (categorizeText as jest.Mock).mockResolvedValue(mockCategorization);

      const result = await aiService.categorizeText(
        'I need help with my visa application',
        ['visa', 'passport', 'general']
      );

      expect(result).toEqual({
        category: 'visa',
        confidence: 0.92,
        alternativeCategories: [
          { category: 'general', confidence: 0.45 }
        ],
        reasoning: 'Contains visa-related keywords'
      });

      expect(categorizeText).toHaveBeenCalledWith(
        'I need help with my visa application',
        ['visa', 'passport', 'general']
      );
    });

    it('should handle categorization errors', async () => {
      (categorizeText as jest.Mock).mockRejectedValue(new Error('Categorization failed'));

      await expect(aiService.categorizeText('test', ['cat1']))
        .rejects.toThrow('Failed to categorize text');
    });
  });

  describe('generateEmbeddings', () => {
    it('should generate embeddings for texts', async () => {
      const mockEmbedding = new Array(768).fill(0.1);
      (generateEmbedding as jest.Mock).mockResolvedValue(mockEmbedding);

      const texts = ['text1', 'text2'];
      const result = await aiService.generateEmbeddings(texts);

      expect(result.embeddings).toHaveLength(2);
      expect(result.embeddings[0]).toEqual({
        text: 'text1',
        embedding: mockEmbedding
      });
      expect(result.model).toBe('text-embedding-ada-002');
      expect(result.dimensions).toBe(768);

      expect(generateEmbedding).toHaveBeenCalledTimes(2);
    });

    it('should handle embedding generation errors', async () => {
      (generateEmbedding as jest.Mock).mockRejectedValue(new Error('Embedding failed'));

      await expect(aiService.generateEmbeddings(['text']))
        .rejects.toThrow('Failed to generate embeddings');
    });
  });

  describe('semanticSearch', () => {
    it('should perform semantic search', async () => {
      const mockSearchResults = [
        {
          text: 'Visa processing takes 15-20 days',
          score: 0.94,
          metadata: { docId: 'doc1' }
        },
        {
          text: 'Express visa available',
          score: 0.88,
          metadata: { docId: 'doc2' }
        }
      ];

      (searchSimilar as jest.Mock).mockResolvedValue(mockSearchResults);

      const result = await aiService.semanticSearch('visa processing time', 5, 0.7);

      expect(result.results).toHaveLength(2);
      expect(result.results[0].score).toBe(0.94);
      expect(result.totalResults).toBe(2);
      expect(result.searchTime).toBeGreaterThan(0);

      expect(searchSimilar).toHaveBeenCalledWith('visa processing time', 5, 0.7);
    });

    it('should handle search errors', async () => {
      (searchSimilar as jest.Mock).mockRejectedValue(new Error('Search failed'));

      await expect(aiService.semanticSearch('test query'))
        .rejects.toThrow('Failed to perform semantic search');
    });
  });
});