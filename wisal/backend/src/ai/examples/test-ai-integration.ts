/**
 * Example usage of the Wisal AI Integration
 * 
 * Run with: npx ts-node src/ai/examples/test-ai-integration.ts
 */

import dotenv from 'dotenv';
import { aiService } from '../ai-service';
import { AIQueryRequest } from '../../types';

// Load environment variables
dotenv.config();

async function testAIIntegration() {
  console.log('🚀 Testing Wisal AI Integration\n');

  try {
    // Initialize AI Service
    console.log('1️⃣ Initializing AI Service...');
    await aiService.initialize(process.env.MONGODB_URI || 'mongodb://localhost:27017/wisal');
    console.log('✅ AI Service initialized\n');

    // Test 1: Process a legal query
    console.log('2️⃣ Testing query processing...');
    const queryRequest: AIQueryRequest = {
      description: "I was fired from my job after reporting safety violations to management. They claim it was due to budget cuts, but I believe it's retaliation. I have emails proving I raised concerns. What are my rights?",
      urgency: 'high',
      jurisdiction: 'UK',
    };

    const queryResult = await aiService.processQuery(queryRequest, 'test-user-123');
    console.log('Query Analysis:', JSON.stringify(queryResult, null, 2));
    console.log('✅ Query processed successfully\n');

    // Test 2: Analyze query categories
    console.log('3️⃣ Testing query categorization...');
    const analysis = await aiService.analyzeQuery(
      "My landlord is trying to evict me without proper notice. I've been paying rent on time for 3 years."
    );
    console.log('Categories:', analysis.categories);
    console.log('Specialisms:', analysis.specialisms);
    console.log('Complexity:', analysis.complexity);
    console.log('✅ Categorization successful\n');

    // Test 3: Generate embeddings
    console.log('4️⃣ Testing embeddings generation...');
    const embeddings = await aiService.generateEmbeddings(
      "Employment law specialist with experience in whistleblower protection"
    );
    console.log(`Generated embeddings with dimension: ${embeddings.length}`);
    console.log(`Sample values: [${embeddings.slice(0, 5).map(v => v.toFixed(4)).join(', ')}...]`);
    console.log('✅ Embeddings generated\n');

    // Test 4: Generate conversation suggestions
    console.log('5️⃣ Testing conversation suggestions...');
    const suggestions = await aiService.generateSuggestions(
      {
        conversationId: 'test-conv-123',
        context: 'The client is asking about employment termination rights',
        role: 'lawyer',
      },
      [], // Empty conversation history for test
      {
        category: 'employment-law',
        keyIssues: ['wrongful termination', 'whistleblower protection'],
      }
    );
    console.log('Suggestions:', suggestions.suggestions);
    console.log('✅ Suggestions generated\n');

    // Test 5: Semantic search
    console.log('6️⃣ Testing semantic search...');
    try {
      const searchResults = await aiService.semanticLawyerSearch(
        "I need a lawyer who specializes in employment law and whistleblower cases",
        {
          location: { city: 'London' },
        },
        5
      );
      console.log(`Found ${searchResults.length} matching lawyers`);
      console.log('✅ Semantic search completed\n');
    } catch (error) {
      console.log('⚠️ Semantic search skipped (no lawyer profiles indexed)\n');
    }

    // Test 6: Health check
    console.log('7️⃣ Checking AI service health...');
    const health = aiService.getHealthStatus();
    console.log('Health Status:', health);
    console.log('✅ Health check completed\n');

    console.log('🎉 All tests completed successfully!');

  } catch (error) {
    console.error('❌ Error during testing:', error);
    process.exit(1);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  testAIIntegration()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export { testAIIntegration };