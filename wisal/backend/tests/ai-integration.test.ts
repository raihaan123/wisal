import request from 'supertest';
import { app } from '../src/index';
import { AIService } from '../src/services/AIService';

// Mock the AI Service
jest.mock('../src/services/AIService');

// Mock data for testing
const mockQuery = {
  query: "What is the status of my visa application?",
  context: {
    userId: "test-user-123",
    conversationId: "conv-456"
  }
};

const mockSuggestRequest = {
  context: "Customer is asking about visa processing times",
  currentDraft: "Your visa application typically takes",
  tone: "professional"
};

const mockCategorizeRequest = {
  text: "I need help with my visa application status",
  availableCategories: ["visa", "passport", "general", "technical"]
};

const mockEmbeddingsRequest = {
  texts: ["visa application", "passport renewal", "travel documents"]
};

const mockSemanticSearchRequest = {
  query: "visa processing time",
  limit: 5,
  threshold: 0.7
};

describe('AI Integration Tests', () => {
  let server: any;

  beforeAll(() => {
    // Start server on test port
    server = app.listen(3003);
  });

  afterAll((done) => {
    server.close(done);
  });

  describe('POST /api/ai/analyze-query', () => {
    it('should successfully analyze a query', async () => {
      // Mock the AI service response
      const mockResponse = {
        intent: "visa_status_inquiry",
        confidence: 0.95,
        entities: {
          type: "visa",
          action: "status_check"
        },
        suggestedResponse: "I can help you check your visa application status.",
        requiredInfo: ["application_number", "passport_number"]
      };

      (AIService.prototype.analyzeQuery as jest.Mock) = jest.fn().mockResolvedValue(mockResponse);

      const response = await request(app)
        .post('/api/ai/analyze-query')
        .send(mockQuery)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('intent');
      expect(response.body).toHaveProperty('confidence');
      expect(response.body).toHaveProperty('entities');
      expect(response.body).toHaveProperty('suggestedResponse');
      expect(response.body.intent).toBe('visa_status_inquiry');
      expect(response.body.confidence).toBeGreaterThan(0.8);
    });

    it('should handle missing query parameter', async () => {
      const response = await request(app)
        .post('/api/ai/analyze-query')
        .send({ context: mockQuery.context })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Query is required');
    });

    it('should handle AI service errors gracefully', async () => {
      (AIService.prototype.analyzeQuery as jest.Mock) = jest.fn()
        .mockRejectedValue(new Error('AI service unavailable'));

      const response = await request(app)
        .post('/api/ai/analyze-query')
        .send(mockQuery)
        .expect(500);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Failed to analyze query');
    });
  });

  describe('POST /api/ai/suggest-response', () => {
    it('should generate response suggestions', async () => {
      const mockSuggestions = {
        suggestions: [
          {
            text: "Your visa application typically takes 15-20 business days to process.",
            confidence: 0.92,
            tone: "professional"
          },
          {
            text: "The standard processing time for visa applications is approximately 3 weeks.",
            confidence: 0.88,
            tone: "formal"
          }
        ],
        improvements: [
          "Add specific timeline based on visa type",
          "Include link to tracking portal"
        ]
      };

      (AIService.prototype.suggestResponse as jest.Mock) = jest.fn()
        .mockResolvedValue(mockSuggestions);

      const response = await request(app)
        .post('/api/ai/suggest-response')
        .send(mockSuggestRequest)
        .expect(200);

      expect(response.body).toHaveProperty('suggestions');
      expect(response.body.suggestions).toBeInstanceOf(Array);
      expect(response.body.suggestions.length).toBeGreaterThan(0);
      expect(response.body.suggestions[0]).toHaveProperty('text');
      expect(response.body.suggestions[0]).toHaveProperty('confidence');
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/ai/suggest-response')
        .send({ tone: 'professional' })
        .expect(400);

      expect(response.body.error).toContain('Context is required');
    });
  });

  describe('POST /api/ai/categorize', () => {
    it('should categorize text correctly', async () => {
      const mockCategorization = {
        category: "visa",
        confidence: 0.94,
        alternativeCategories: [
          { category: "general", confidence: 0.45 },
          { category: "technical", confidence: 0.12 }
        ],
        reasoning: "Text contains visa-related keywords and intent"
      };

      (AIService.prototype.categorizeText as jest.Mock) = jest.fn()
        .mockResolvedValue(mockCategorization);

      const response = await request(app)
        .post('/api/ai/categorize')
        .send(mockCategorizeRequest)
        .expect(200);

      expect(response.body).toHaveProperty('category');
      expect(response.body).toHaveProperty('confidence');
      expect(response.body.category).toBe('visa');
      expect(response.body.confidence).toBeGreaterThan(0.8);
    });

    it('should handle empty text', async () => {
      const response = await request(app)
        .post('/api/ai/categorize')
        .send({ text: '', availableCategories: ['visa'] })
        .expect(400);

      expect(response.body.error).toContain('Text is required');
    });
  });

  describe('POST /api/ai/embeddings', () => {
    it('should generate embeddings for texts', async () => {
      const mockEmbeddings = {
        embeddings: [
          { text: "visa application", embedding: new Array(768).fill(0.1) },
          { text: "passport renewal", embedding: new Array(768).fill(0.2) },
          { text: "travel documents", embedding: new Array(768).fill(0.3) }
        ],
        model: "text-embedding-ada-002",
        dimensions: 768
      };

      (AIService.prototype.generateEmbeddings as jest.Mock) = jest.fn()
        .mockResolvedValue(mockEmbeddings);

      const response = await request(app)
        .post('/api/ai/embeddings')
        .send(mockEmbeddingsRequest)
        .expect(200);

      expect(response.body).toHaveProperty('embeddings');
      expect(response.body.embeddings).toBeInstanceOf(Array);
      expect(response.body.embeddings.length).toBe(3);
      expect(response.body.embeddings[0]).toHaveProperty('text');
      expect(response.body.embeddings[0]).toHaveProperty('embedding');
    });

    it('should validate text array', async () => {
      const response = await request(app)
        .post('/api/ai/embeddings')
        .send({ texts: [] })
        .expect(400);

      expect(response.body.error).toContain('At least one text is required');
    });

    it('should handle large text arrays', async () => {
      const largeTextArray = new Array(101).fill('test text');
      
      const response = await request(app)
        .post('/api/ai/embeddings')
        .send({ texts: largeTextArray })
        .expect(400);

      expect(response.body.error).toContain('Maximum 100 texts allowed');
    });
  });

  describe('POST /api/ai/semantic-search', () => {
    it('should perform semantic search', async () => {
      const mockSearchResults = {
        results: [
          {
            text: "Visa processing typically takes 15-20 business days",
            score: 0.94,
            metadata: { documentId: "doc-123", section: "processing" }
          },
          {
            text: "Express visa processing available for 5-7 business days",
            score: 0.88,
            metadata: { documentId: "doc-124", section: "express" }
          }
        ],
        totalResults: 2,
        searchTime: 145
      };

      (AIService.prototype.semanticSearch as jest.Mock) = jest.fn()
        .mockResolvedValue(mockSearchResults);

      const response = await request(app)
        .post('/api/ai/semantic-search')
        .send(mockSemanticSearchRequest)
        .expect(200);

      expect(response.body).toHaveProperty('results');
      expect(response.body.results).toBeInstanceOf(Array);
      expect(response.body.results[0]).toHaveProperty('score');
      expect(response.body.results[0].score).toBeGreaterThan(0.7);
    });

    it('should respect search limits', async () => {
      const response = await request(app)
        .post('/api/ai/semantic-search')
        .send({ ...mockSemanticSearchRequest, limit: 1000 })
        .expect(400);

      expect(response.body.error).toContain('Limit must be between 1 and 100');
    });

    it('should validate threshold values', async () => {
      const response = await request(app)
        .post('/api/ai/semantic-search')
        .send({ ...mockSemanticSearchRequest, threshold: 1.5 })
        .expect(400);

      expect(response.body.error).toContain('Threshold must be between 0 and 1');
    });
  });

  describe('Error Handling', () => {
    it('should handle malformed JSON', async () => {
      const response = await request(app)
        .post('/api/ai/analyze-query')
        .set('Content-Type', 'application/json')
        .send('{ invalid json')
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should handle missing content-type', async () => {
      const response = await request(app)
        .post('/api/ai/analyze-query')
        .send('plain text')
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('Performance Tests', () => {
    it('should respond within acceptable time limits', async () => {
      const startTime = Date.now();
      
      await request(app)
        .post('/api/ai/analyze-query')
        .send(mockQuery)
        .expect(200);

      const responseTime = Date.now() - startTime;
      expect(responseTime).toBeLessThan(2000); // Should respond within 2 seconds
    });

    it('should handle concurrent requests', async () => {
      const requests = Array(10).fill(null).map(() => 
        request(app)
          .post('/api/ai/analyze-query')
          .send(mockQuery)
      );

      const responses = await Promise.all(requests);
      
      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('intent');
      });
    });
  });
});

// Integration test for full AI workflow
describe('AI Workflow Integration', () => {
  it('should complete full customer support workflow', async () => {
    // Step 1: Analyze customer query
    const analyzeResponse = await request(app)
      .post('/api/ai/analyze-query')
      .send(mockQuery)
      .expect(200);

    expect(analyzeResponse.body.intent).toBeDefined();

    // Step 2: Categorize the query
    const categorizeResponse = await request(app)
      .post('/api/ai/categorize')
      .send({
        text: mockQuery.query,
        availableCategories: ["visa", "passport", "general"]
      })
      .expect(200);

    expect(categorizeResponse.body.category).toBe('visa');

    // Step 3: Search for relevant information
    const searchResponse = await request(app)
      .post('/api/ai/semantic-search')
      .send({
        query: mockQuery.query,
        limit: 3
      })
      .expect(200);

    expect(searchResponse.body.results).toBeDefined();

    // Step 4: Generate response suggestion
    const suggestResponse = await request(app)
      .post('/api/ai/suggest-response')
      .send({
        context: mockQuery.query,
        currentDraft: "",
        tone: "helpful"
      })
      .expect(200);

    expect(suggestResponse.body.suggestions).toBeDefined();
    expect(suggestResponse.body.suggestions.length).toBeGreaterThan(0);
  });
});