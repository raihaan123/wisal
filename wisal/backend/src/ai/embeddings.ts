import { OpenAIEmbeddings } from '@langchain/openai';
import { defaultAIConfig } from './config';

// Initialize embeddings model
const embeddings = new OpenAIEmbeddings({
  openAIApiKey: defaultAIConfig.openai.apiKey,
  modelName: defaultAIConfig.openai.embeddingModel,
});

/**
 * Generate embeddings for a given text
 */
export async function generateEmbeddings(text: string): Promise<number[]> {
  try {
    const result = await embeddings.embedQuery(text);
    return result;
  } catch (error) {
    console.error('Error generating embeddings:', error);
    throw new Error('Failed to generate embeddings');
  }
}

/**
 * Generate embeddings for multiple texts
 */
export async function generateBatchEmbeddings(texts: string[]): Promise<number[][]> {
  try {
    const results = await embeddings.embedDocuments(texts);
    return results;
  } catch (error) {
    console.error('Error generating batch embeddings:', error);
    throw new Error('Failed to generate batch embeddings');
  }
}

/**
 * Calculate cosine similarity between two embeddings
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error('Embeddings must have the same dimension');
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  normA = Math.sqrt(normA);
  normB = Math.sqrt(normB);

  if (normA === 0 || normB === 0) {
    return 0;
  }

  return dotProduct / (normA * normB);
}

/**
 * Find most similar embeddings from a list
 */
export function findMostSimilar(
  queryEmbedding: number[],
  embeddings: number[][],
  topK: number = 5
): Array<{ index: number; score: number }> {
  const similarities = embeddings.map((embedding, index) => ({
    index,
    score: cosineSimilarity(queryEmbedding, embedding),
  }));

  return similarities
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}

/**
 * Create embeddings for lawyer profiles for semantic search
 */
export async function createLawyerProfileEmbedding(profile: {
  specialisms: string[];
  currentRole: string;
  employer: string;
  languages: string[];
  proBonoAreas?: string[];
}): Promise<number[]> {
  // Combine relevant profile information for embedding
  const profileText = [
    `Specialisms: ${profile.specialisms.join(', ')}`,
    `Role: ${profile.currentRole}`,
    `Employer: ${profile.employer}`,
    `Languages: ${profile.languages.join(', ')}`,
    profile.proBonoAreas ? `Pro Bono: ${profile.proBonoAreas.join(', ')}` : '',
  ]
    .filter(Boolean)
    .join('. ');

  return generateEmbeddings(profileText);
}

/**
 * Create embeddings for legal queries
 */
export async function createQueryEmbedding(query: {
  description: string;
  category?: string;
  urgency?: string;
}): Promise<number[]> {
  // Include metadata in the embedding for better matching
  const queryText = [
    query.description,
    query.category ? `Category: ${query.category}` : '',
    query.urgency ? `Urgency: ${query.urgency}` : '',
  ]
    .filter(Boolean)
    .join('. ');

  return generateEmbeddings(queryText);
}

/**
 * Batch process lawyer profiles for vector database
 */
export async function batchProcessLawyerProfiles(
  profiles: Array<{
    id: string;
    specialisms: string[];
    currentRole: string;
    employer: string;
    languages: string[];
    proBonoAreas?: string[];
  }>
): Promise<Array<{ id: string; embedding: number[] }>> {
  const profileTexts = profiles.map(profile => {
    return [
      `Specialisms: ${profile.specialisms.join(', ')}`,
      `Role: ${profile.currentRole}`,
      `Employer: ${profile.employer}`,
      `Languages: ${profile.languages.join(', ')}`,
      profile.proBonoAreas ? `Pro Bono: ${profile.proBonoAreas.join(', ')}` : '',
    ]
      .filter(Boolean)
      .join('. ');
  });

  const embeddings = await generateBatchEmbeddings(profileTexts);

  return profiles.map((profile, index) => ({
    id: profile.id,
    embedding: embeddings[index],
  }));
}