import { z } from 'zod';

// AI Configuration Schema
export const AIConfigSchema = z.object({
  openai: z.object({
    apiKey: z.string(),
    model: z.string().default('gpt-4o'),
    embeddingModel: z.string().default('text-embedding-3-small'),
    temperature: z.number().default(0.7),
    maxTokens: z.number().default(2000),
  }),
  langchain: z.object({
    verbose: z.boolean().default(false),
    cacheEnabled: z.boolean().default(true),
    maxRetries: z.number().default(3),
  }),
  vectorStore: z.object({
    dimension: z.number().default(1536), // OpenAI embeddings dimension
    similarityThreshold: z.number().default(0.7),
    maxResults: z.number().default(10),
  }),
  categorization: z.object({
    minConfidence: z.number().default(0.6),
    categories: z.array(z.string()).default([
      'family-law',
      'employment-law',
      'criminal-law',
      'immigration-law',
      'property-law',
      'civil-litigation',
      'corporate-law',
      'intellectual-property',
      'tax-law',
      'human-rights',
      'other',
    ]),
    specialisms: z.array(z.string()).default([
      'divorce',
      'child-custody',
      'domestic-violence',
      'employment-disputes',
      'unfair-dismissal',
      'discrimination',
      'visa-applications',
      'asylum',
      'deportation',
      'property-disputes',
      'tenancy',
      'personal-injury',
      'defamation',
      'contract-disputes',
      'criminal-defense',
      'fraud',
      'company-formation',
      'mergers-acquisitions',
      'trademark',
      'copyright',
      'patent',
      'tax-planning',
      'tax-disputes',
    ]),
  }),
  matching: z.object({
    weights: z.object({
      specialismMatch: z.number().default(0.35),
      locationProximity: z.number().default(0.15),
      availability: z.number().default(0.15),
      rating: z.number().default(0.15),
      experience: z.number().default(0.10),
      languageMatch: z.number().default(0.10),
    }),
    minMatchScore: z.number().default(0.5),
    maxMatches: z.number().default(5),
  }),
  conversation: z.object({
    contextWindowSize: z.number().default(10), // messages
    summaryThreshold: z.number().default(20), // messages before summarization
    suggestionsEnabled: z.boolean().default(true),
    maxSuggestions: z.number().default(3),
  }),
});

export type AIConfig = z.infer<typeof AIConfigSchema>;

// Default configuration
export const defaultAIConfig: AIConfig = {
  openai: {
    apiKey: process.env.OPENAI_API_KEY || '',
    model: 'gpt-4o',
    embeddingModel: 'text-embedding-3-small',
    temperature: 0.7,
    maxTokens: 2000,
  },
  langchain: {
    verbose: process.env.NODE_ENV === 'development',
    cacheEnabled: true,
    maxRetries: 3,
  },
  vectorStore: {
    dimension: 1536,
    similarityThreshold: 0.7,
    maxResults: 10,
  },
  categorization: {
    minConfidence: 0.6,
    categories: [
      'family-law',
      'employment-law',
      'criminal-law',
      'immigration-law',
      'property-law',
      'civil-litigation',
      'corporate-law',
      'intellectual-property',
      'tax-law',
      'human-rights',
      'other',
    ],
    specialisms: [
      'divorce',
      'child-custody',
      'domestic-violence',
      'employment-disputes',
      'unfair-dismissal',
      'discrimination',
      'visa-applications',
      'asylum',
      'deportation',
      'property-disputes',
      'tenancy',
      'personal-injury',
      'defamation',
      'contract-disputes',
      'criminal-defense',
      'fraud',
      'company-formation',
      'mergers-acquisitions',
      'trademark',
      'copyright',
      'patent',
      'tax-planning',
      'tax-disputes',
    ],
  },
  matching: {
    weights: {
      specialismMatch: 0.35,
      locationProximity: 0.15,
      availability: 0.15,
      rating: 0.15,
      experience: 0.10,
      languageMatch: 0.10,
    },
    minMatchScore: 0.5,
    maxMatches: 5,
  },
  conversation: {
    contextWindowSize: 10,
    summaryThreshold: 20,
    suggestionsEnabled: true,
    maxSuggestions: 3,
  },
};

// Validate configuration at startup
export function validateAIConfig(config: any): AIConfig {
  try {
    return AIConfigSchema.parse(config);
  } catch (error) {
    console.error('Invalid AI configuration:', error);
    throw new Error('Invalid AI configuration');
  }
}