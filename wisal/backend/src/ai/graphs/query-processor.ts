import { AIQueryRequest, AIAnalysis } from '../../types';
import { defaultAIConfig } from '../config';
import { generateEmbeddings } from '../embeddings';
import { categorizeQuery } from '../categorization';
import { matchLawyers } from '../matching';

// Simplified query state for now
export interface QueryState {
  request?: AIQueryRequest;
  userId?: string;
  rawQuery?: string;
  clarificationNeeded?: boolean;
  clarificationQuestions?: string[];
  analysis?: AIAnalysis;
  embeddings?: number[];
  categories?: string[];
  complexity?: 'simple' | 'moderate' | 'complex';
  matchedLawyerIds?: string[];
  matchScores?: Record<string, number>;
  messages?: any[];
  conversationId?: string;
  stage?: 'initial' | 'analyzing' | 'clarifying' | 'categorizing' | 'matching' | 'finalizing' | 'complete';
  error?: string;
}

// Main query processing function - simplified version
export async function processLegalQuery(
  request: AIQueryRequest,
  userId: string
): Promise<QueryState> {
  console.log('Processing legal query:', request.description);
  
  try {
    // 1. Basic analysis (simplified for now)
    const analysis: AIAnalysis = {
      summary: `Legal query about: ${request.description.substring(0, 100)}...`,
      categories: ['general'],
      complexity: 'moderate' as const,
      estimatedTime: 30,
      suggestedSpecialisms: ['general practice'],
      keyIssues: [request.description],
      recommendedActions: ['Contact a lawyer for consultation'],
      embeddings: []
    };

    // 2. Generate embeddings
    let embeddings: number[] = [];
    try {
      embeddings = await generateEmbeddings(request.description);
      analysis.embeddings = embeddings;
    } catch (error) {
      console.error('Error generating embeddings:', error);
    }

    // 3. Categorize query
    let categories = ['general'];
    try {
      categories = await categorizeQuery(request.description, analysis.categories);
    } catch (error) {
      console.error('Error categorizing query:', error);
    }

    // 4. Match lawyers
    let matchedLawyerIds: string[] = [];
    let matchScores: Record<string, number> = {};
    
    try {
      const matchResults = await matchLawyers({
        analysis,
        categories,
        urgency: request.urgency || 'medium',
        jurisdiction: request.jurisdiction,
      });
      
      // Get top 3 matches
      const topMatches = matchResults
        .sort((a, b) => b.score - a.score)
        .slice(0, 3);
      
      matchedLawyerIds = topMatches.map(m => m.lawyerId.toString());
      matchScores = topMatches.reduce((acc, m) => {
        acc[m.lawyerId.toString()] = m.score;
        return acc;
      }, {} as Record<string, number>);
    } catch (error) {
      console.error('Error matching lawyers:', error);
    }

    // Return completed state
    return {
      request,
      userId,
      rawQuery: request.description,
      clarificationNeeded: false,
      clarificationQuestions: [],
      analysis,
      embeddings,
      categories,
      complexity: analysis.complexity,
      matchedLawyerIds,
      matchScores,
      messages: [],
      stage: 'complete',
    };
  } catch (error) {
    console.error('Error processing legal query:', error);
    return {
      request,
      userId,
      rawQuery: request.description,
      error: 'Failed to process query',
      stage: 'complete',
      clarificationNeeded: false,
      clarificationQuestions: [],
      categories: [],
      complexity: 'moderate',
      matchedLawyerIds: [],
      matchScores: {},
      messages: [],
    };
  }
}