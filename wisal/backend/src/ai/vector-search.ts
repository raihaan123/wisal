import { MongoClient, Db, Collection } from 'mongodb';
import { VectorSearchQuery, VectorSearchResult, LawyerProfile } from '../types';
import { defaultAIConfig } from './config';
import { cosineSimilarity } from './embeddings';

let db: Db | null = null;
let vectorCollection: Collection | null = null;

/**
 * Initialize MongoDB connection for vector search
 */
export async function initializeVectorStore(mongoUri: string): Promise<void> {
  try {
    const client = new MongoClient(mongoUri);
    await client.connect();
    
    db = client.db('wisal');
    vectorCollection = db.collection('lawyer_vectors');
    
    // Create vector search index if it doesn't exist
    await createVectorSearchIndex();
    
    console.log('Vector store initialized successfully');
  } catch (error) {
    console.error('Error initializing vector store:', error);
    throw error;
  }
}

/**
 * Create MongoDB Atlas vector search index
 */
async function createVectorSearchIndex(): Promise<void> {
  if (!vectorCollection) {
    throw new Error('Vector collection not initialized');
  }

  try {
    // Check if index already exists
    const indexes = await vectorCollection.listIndexes().toArray();
    const vectorIndexExists = indexes.some(idx => idx.name === 'vector_index');
    
    if (!vectorIndexExists) {
      // Create vector search index
      // Note: This is a simplified version. In production, you'd use MongoDB Atlas
      // vector search capabilities or create the index through Atlas UI
      await vectorCollection.createIndex(
        { embedding: '2dsphere' },
        { name: 'vector_index' }
      );
    }
  } catch (error) {
    console.error('Error creating vector search index:', error);
    // Continue without index - fallback to linear search
  }
}

/**
 * Store lawyer profile with embeddings
 */
export async function storeLawyerVector(
  lawyerId: string,
  profile: LawyerProfile,
  embedding: number[]
): Promise<void> {
  if (!vectorCollection) {
    throw new Error('Vector collection not initialized');
  }

  try {
    await vectorCollection.replaceOne(
      { lawyerId },
      {
        lawyerId,
        profile,
        embedding,
        updatedAt: new Date(),
      },
      { upsert: true }
    );
  } catch (error) {
    console.error('Error storing lawyer vector:', error);
    throw error;
  }
}

/**
 * Perform vector search for similar lawyers
 */
export async function vectorSearch(
  query: VectorSearchQuery
): Promise<VectorSearchResult[]> {
  if (!vectorCollection) {
    throw new Error('Vector collection not initialized');
  }

  try {
    // Build filter query
    const filter: any = {};
    
    if (query.filter) {
      if (query.filter.specialisms && query.filter.specialisms.length > 0) {
        filter['profile.specialisms'] = { $in: query.filter.specialisms };
      }
      
      if (query.filter.location) {
        if (query.filter.location.city) {
          filter['profile.location.city'] = query.filter.location.city;
        }
        if (query.filter.location.postcode) {
          filter['profile.location.postcode'] = {
            $regex: `^${query.filter.location.postcode.substring(0, 3)}`,
          };
        }
      }
      
      if (query.filter.availability) {
        filter['profile.availability.schedule'] = {
          $elemMatch: { isActive: true },
        };
      }
      
      if (query.filter.languages && query.filter.languages.length > 0) {
        filter['profile.languages'] = { $in: query.filter.languages };
      }
    }

    // Fetch candidates based on filters
    const candidates = await vectorCollection
      .find(filter)
      .limit(query.limit || defaultAIConfig.vectorStore.maxResults * 2)
      .toArray();

    // Calculate similarity scores
    const results: VectorSearchResult[] = candidates
      .map(doc => {
        const score = cosineSimilarity(query.embedding, doc.embedding);
        return {
          lawyerId: doc.lawyerId,
          score,
          profile: doc.profile,
        };
      })
      .filter(result => result.score >= defaultAIConfig.vectorStore.similarityThreshold)
      .sort((a, b) => b.score - a.score)
      .slice(0, query.limit || defaultAIConfig.vectorStore.maxResults);

    return results;
  } catch (error) {
    console.error('Error performing vector search:', error);
    return [];
  }
}

/**
 * Update lawyer embeddings in batch
 */
export async function batchUpdateLawyerVectors(
  updates: Array<{
    lawyerId: string;
    profile: LawyerProfile;
    embedding: number[];
  }>
): Promise<void> {
  if (!vectorCollection) {
    throw new Error('Vector collection not initialized');
  }

  try {
    const bulkOps = updates.map(update => ({
      replaceOne: {
        filter: { lawyerId: update.lawyerId },
        replacement: {
          lawyerId: update.lawyerId,
          profile: update.profile,
          embedding: update.embedding,
          updatedAt: new Date(),
        },
        upsert: true,
      },
    }));

    await vectorCollection.bulkWrite(bulkOps);
    console.log(`Updated ${updates.length} lawyer vectors`);
  } catch (error) {
    console.error('Error batch updating lawyer vectors:', error);
    throw error;
  }
}

/**
 * Find similar lawyers based on a lawyer profile
 */
export async function findSimilarLawyers(
  lawyerId: string,
  limit: number = 5
): Promise<VectorSearchResult[]> {
  if (!vectorCollection) {
    throw new Error('Vector collection not initialized');
  }

  try {
    // Get the lawyer's embedding
    const lawyer = await vectorCollection.findOne({ lawyerId });
    
    if (!lawyer || !lawyer.embedding) {
      return [];
    }

    // Search for similar lawyers (excluding the original)
    const candidates = await vectorCollection
      .find({ lawyerId: { $ne: lawyerId } })
      .limit(limit * 2)
      .toArray();

    const results: VectorSearchResult[] = candidates
      .map(doc => {
        const score = cosineSimilarity(lawyer.embedding, doc.embedding);
        return {
          lawyerId: doc.lawyerId,
          score,
          profile: doc.profile,
        };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    return results;
  } catch (error) {
    console.error('Error finding similar lawyers:', error);
    return [];
  }
}

/**
 * Delete lawyer vector
 */
export async function deleteLawyerVector(lawyerId: string): Promise<void> {
  if (!vectorCollection) {
    throw new Error('Vector collection not initialized');
  }

  try {
    await vectorCollection.deleteOne({ lawyerId });
  } catch (error) {
    console.error('Error deleting lawyer vector:', error);
    throw error;
  }
}

/**
 * Get vector store statistics
 */
export async function getVectorStoreStats(): Promise<{
  totalVectors: number;
  lastUpdated?: Date;
  averageVectorSize?: number;
}> {
  if (!vectorCollection) {
    throw new Error('Vector collection not initialized');
  }

  try {
    const totalVectors = await vectorCollection.countDocuments();
    const latestDoc = await vectorCollection
      .findOne({}, { sort: { updatedAt: -1 } });

    return {
      totalVectors,
      lastUpdated: latestDoc?.updatedAt,
      averageVectorSize: defaultAIConfig.vectorStore.dimension,
    };
  } catch (error) {
    console.error('Error getting vector store stats:', error);
    return { totalVectors: 0 };
  }
}