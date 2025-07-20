# Wisal AI Integration Module

## Overview

The Wisal AI integration module provides sophisticated AI capabilities for legal query processing, lawyer matching, and conversational assistance. Built with LangGraph, OpenAI GPT-4o, and vector search capabilities.

## Architecture

### Core Components

1. **LangGraph Orchestration**
   - Query processing workflow
   - Conversational agent management
   - State management and error handling

2. **OpenAI Integration**
   - GPT-4o for text analysis and generation
   - Ada-002 for semantic embeddings
   - Configurable temperature and token limits

3. **Vector Search**
   - MongoDB vector indices for semantic search
   - Cosine similarity matching
   - Filtered search capabilities

4. **Categorization Engine**
   - Legal category detection
   - Specialism extraction
   - Complexity assessment

5. **Matching Algorithm**
   - Multi-factor scoring system
   - Weighted criteria matching
   - Re-ranking capabilities

## Setup

### Prerequisites

```bash
# Environment variables
OPENAI_API_KEY=sk-...
MONGODB_URI=mongodb://localhost:27017/wisal
```

### Installation

```bash
npm install
```

### Initialize AI Service

```typescript
import { aiService } from './ai';

// Initialize on server startup
await aiService.initialize(process.env.MONGODB_URI);
```

## Usage

### Process Legal Query

```typescript
const response = await aiService.processQuery({
  description: "I need help with wrongful termination from my job",
  urgency: "high",
  jurisdiction: "UK"
}, userId);

// Response includes:
// - AI analysis with categories, complexity, key issues
// - Matched lawyers with scores and reasons
// - Suggested follow-up questions
```

### Generate Conversation Suggestions

```typescript
const suggestions = await aiService.generateSuggestions({
  conversationId: "conv123",
  context: "Current message context",
  role: "lawyer"
}, conversationHistory, legalContext);

// Returns:
// - 3 response suggestions
// - Legal citations (for lawyers)
// - Compliance warnings
```

### Semantic Lawyer Search

```typescript
const results = await aiService.semanticLawyerSearch(
  "employment law specialist in London",
  {
    location: { city: "London" },
    languages: ["English", "Spanish"]
  },
  10 // limit
);
```

## API Endpoints

### Query Analysis
```
POST /api/ai/analyze-query
Body: {
  description: string,
  urgency?: "low" | "medium" | "high" | "critical",
  jurisdiction?: string
}
```

### Response Suggestions
```
POST /api/ai/suggest-response
Body: {
  conversationId: string,
  context: string,
  role: "seeker" | "lawyer"
}
```

### Categorization
```
POST /api/ai/categorize
Body: {
  description: string
}
```

### Semantic Search
```
POST /api/ai/semantic-search
Body: {
  query: string,
  filters?: object,
  limit?: number
}
```

## Configuration

Edit `config.ts` to customize:

- OpenAI model settings
- Categorization thresholds
- Matching weights
- Vector search parameters

## Matching Algorithm

The lawyer matching uses a weighted scoring system:

- **Specialism Match (35%)**: How well lawyer's specialisms match the query
- **Location Proximity (15%)**: Geographic distance consideration
- **Availability (15%)**: Schedule compatibility
- **Rating (15%)**: Client satisfaction scores
- **Experience (10%)**: Years qualified and case count
- **Language Match (10%)**: Language requirements

## LangGraph Workflows

### Query Processing Graph

```
Start → Analyze Query → Check Clarification → Categorize → Generate Embeddings → Match Lawyers → Finalize
```

### Conversational Agent Graph

```
Receive Message → Analyze → Generate Suggestions → Check Compliance → Find Citations → Update Context
```

## Best Practices

1. **Error Handling**: All AI operations have fallbacks
2. **Rate Limiting**: Respect OpenAI API limits
3. **Caching**: Embeddings are cached in MongoDB
4. **Privacy**: Clear conversation context after sessions
5. **Monitoring**: Track AI performance metrics

## Monitoring

Check AI health:
```
GET /api/ai/health
```

Returns service status, configuration validity, and vector store readiness.

## Development

### Adding New Categories

1. Update `config.ts` with new categories
2. Retrain categorization prompts if needed
3. Update vector search filters

### Customizing Matching

1. Adjust weights in `config.ts`
2. Add new scoring factors in `matching.ts`
3. Update match reason generation

## Security Considerations

- API keys stored securely in environment variables
- Conversation data cleared after sessions
- Legal advice validated for compliance
- Rate limiting on all endpoints
- Input validation on all requests

## Performance

- Embeddings generated once and cached
- Batch processing for multiple profiles
- Concurrent API calls where possible
- Vector indices for fast similarity search

## Troubleshooting

### Common Issues

1. **OpenAI API Errors**: Check API key and rate limits
2. **Vector Search Failures**: Ensure MongoDB indices are created
3. **Low Match Scores**: Review categorization accuracy
4. **Slow Response**: Check embedding cache hit rate

### Debug Mode

Enable verbose logging:
```typescript
defaultAIConfig.langchain.verbose = true;
```

## Future Enhancements

- Multi-language support for queries
- Fine-tuned models for legal domain
- Real-time conversation streaming
- Advanced compliance checking
- Automated lawyer profile updates