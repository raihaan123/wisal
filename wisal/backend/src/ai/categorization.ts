import { ChatOpenAI } from '@langchain/openai';
import { SystemMessage, HumanMessage } from '@langchain/core/messages';
import { z } from 'zod';
import { defaultAIConfig } from './config';

const llm = new ChatOpenAI({
  openAIApiKey: defaultAIConfig.openai.apiKey,
  modelName: defaultAIConfig.openai.model,
  temperature: 0.3, // Lower temperature for more consistent categorization
});

// Schema for categorization response
const CategorizationResponseSchema = z.object({
  primaryCategory: z.string(),
  secondaryCategories: z.array(z.string()),
  specialisms: z.array(z.string()),
  confidence: z.number().min(0).max(1),
  reasoning: z.string(),
});

/**
 * Categorize a legal query using GPT-4
 */
export async function categorizeQuery(
  query: string,
  suggestedCategories?: string[]
): Promise<string[]> {
  const availableCategories = defaultAIConfig.categorization.categories;
  const availableSpecialisms = defaultAIConfig.categorization.specialisms;

  const systemPrompt = `You are a legal categorization expert. Analyze the following legal query and categorize it.

Available categories:
${availableCategories.join(', ')}

Available specialisms:
${availableSpecialisms.join(', ')}

Instructions:
1. Identify the primary legal category
2. List any secondary categories that apply
3. Identify specific legal specialisms needed
4. Provide confidence score (0-1)
5. Explain your reasoning briefly

Return your response as JSON matching this structure:
{
  "primaryCategory": "string",
  "secondaryCategories": ["string"],
  "specialisms": ["string"],
  "confidence": number,
  "reasoning": "string"
}`;

  try {
    const response = await llm.invoke([
      new SystemMessage(systemPrompt),
      new HumanMessage(`Query: ${query}${
        suggestedCategories 
          ? `\n\nInitial analysis suggests: ${suggestedCategories.join(', ')}` 
          : ''
      }`)
    ]);

    const parsed = CategorizationResponseSchema.parse(
      JSON.parse(response.content as string)
    );

    // Only return categories with sufficient confidence
    if (parsed.confidence < defaultAIConfig.categorization.minConfidence) {
      console.warn('Low confidence categorization:', parsed);
      return ['other'];
    }

    // Combine primary and secondary categories
    const allCategories = [parsed.primaryCategory, ...parsed.secondaryCategories];
    
    // Filter to only valid categories
    return allCategories.filter(cat => 
      availableCategories.includes(cat)
    );
  } catch (error) {
    console.error('Error categorizing query:', error);
    return ['other'];
  }
}

/**
 * Extract legal specialisms from a query
 */
export async function extractSpecialisms(
  query: string,
  category: string
): Promise<string[]> {
  const availableSpecialisms = defaultAIConfig.categorization.specialisms;

  const systemPrompt = `Given a legal query in the category "${category}", identify the specific legal specialisms required.

Available specialisms:
${availableSpecialisms.join(', ')}

Return a JSON array of relevant specialisms (maximum 5, most relevant first).`;

  try {
    const response = await llm.invoke([
      new SystemMessage(systemPrompt),
      new HumanMessage(query)
    ]);

    const specialisms = JSON.parse(response.content as string);
    
    if (!Array.isArray(specialisms)) {
      throw new Error('Invalid response format');
    }

    // Filter to valid specialisms and limit to 5
    return specialisms
      .filter(s => availableSpecialisms.includes(s))
      .slice(0, 5);
  } catch (error) {
    console.error('Error extracting specialisms:', error);
    return [];
  }
}

/**
 * Determine query complexity
 */
export async function assessComplexity(
  query: string,
  category: string
): Promise<'simple' | 'moderate' | 'complex'> {
  const systemPrompt = `Assess the complexity of this legal query in the "${category}" category.

Consider:
1. Number of legal issues involved
2. Jurisdictional complications
3. Time sensitivity
4. Potential consequences
5. Need for specialized expertise

Return one of: "simple", "moderate", or "complex"`;

  try {
    const response = await llm.invoke([
      new SystemMessage(systemPrompt),
      new HumanMessage(query)
    ]);

    const complexity = response.content as string;
    
    if (['simple', 'moderate', 'complex'].includes(complexity.toLowerCase().trim())) {
      return complexity.toLowerCase().trim() as 'simple' | 'moderate' | 'complex';
    }

    // Default to moderate if unclear
    return 'moderate';
  } catch (error) {
    console.error('Error assessing complexity:', error);
    return 'moderate';
  }
}

/**
 * Batch categorize multiple queries
 */
export async function batchCategorizeQueries(
  queries: string[]
): Promise<Array<{
  categories: string[];
  specialisms: string[];
  confidence: number;
}>> {
  const results = await Promise.all(
    queries.map(async (query) => {
      try {
        const categories = await categorizeQuery(query);
        const specialisms = await extractSpecialisms(query, categories[0] || 'other');
        
        return {
          categories,
          specialisms,
          confidence: 0.8, // Default confidence for batch processing
        };
      } catch (error) {
        console.error('Error in batch categorization:', error);
        return {
          categories: ['other'],
          specialisms: [],
          confidence: 0.5,
        };
      }
    })
  );

  return results;
}

/**
 * Validate and normalize categories
 */
export function validateCategories(categories: string[]): string[] {
  const validCategories = defaultAIConfig.categorization.categories;
  
  return categories.filter(cat => validCategories.includes(cat));
}

/**
 * Get related categories for a given category
 */
export function getRelatedCategories(category: string): string[] {
  const relationships: Record<string, string[]> = {
    'family-law': ['child-custody', 'divorce', 'domestic-violence'],
    'employment-law': ['discrimination', 'unfair-dismissal', 'employment-disputes'],
    'immigration-law': ['asylum', 'visa-applications', 'deportation'],
    'property-law': ['tenancy', 'property-disputes'],
    'criminal-law': ['criminal-defense', 'fraud'],
    'corporate-law': ['company-formation', 'mergers-acquisitions'],
    'intellectual-property': ['trademark', 'copyright', 'patent'],
    'tax-law': ['tax-planning', 'tax-disputes'],
  };

  return relationships[category] || [];
}