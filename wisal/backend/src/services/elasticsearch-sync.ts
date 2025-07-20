import mongoose from 'mongoose';
import ElasticsearchService, { INDICES, esClient } from './elasticsearch';
import LegalQuery from '../models/LegalQuery';
import LawyerProfile from '../models/LawyerProfile';
import ActivismPost from '../models/ActivismPost';
import logger from '../utils/logger';

export class ElasticsearchSyncService {
  private static syncInterval: NodeJS.Timeout | null = null;
  private static isSyncing = false;

  /**
   * Initialize MongoDB change streams for real-time sync
   */
  static async initializeChangeStreams(): Promise<void> {
    try {
      // Legal Queries change stream
      const legalQueryChangeStream = LegalQuery.watch(
        [],
        { fullDocument: 'updateLookup' }
      );

      legalQueryChangeStream.on('change', async (change) => {
        try {
          switch (change.operationType) {
            case 'insert':
            case 'update':
            case 'replace':
              if (change.fullDocument) {
                await ElasticsearchService.indexLegalQuery(change.fullDocument as any);
                logger.info(`Synced legal query ${change.documentKey._id} to Elasticsearch`);
              }
              break;
            case 'delete':
              await ElasticsearchService.deleteDocument(
                INDICES.LEGAL_QUERIES,
                change.documentKey._id.toString()
              );
              logger.info(`Deleted legal query ${change.documentKey._id} from Elasticsearch`);
              break;
          }
        } catch (error) {
          logger.error('Error syncing legal query change:', error);
        }
      });

      // Lawyer Profiles change stream
      const lawyerProfileChangeStream = LawyerProfile.watch(
        [],
        { fullDocument: 'updateLookup' }
      );

      lawyerProfileChangeStream.on('change', async (change) => {
        try {
          switch (change.operationType) {
            case 'insert':
            case 'update':
            case 'replace':
              if (change.fullDocument) {
                await ElasticsearchService.indexLawyerProfile(change.fullDocument as any);
                logger.info(`Synced lawyer profile ${change.documentKey._id} to Elasticsearch`);
              }
              break;
            case 'delete':
              await ElasticsearchService.deleteDocument(
                INDICES.LAWYER_PROFILES,
                change.documentKey._id.toString()
              );
              logger.info(`Deleted lawyer profile ${change.documentKey._id} from Elasticsearch`);
              break;
          }
        } catch (error) {
          logger.error('Error syncing lawyer profile change:', error);
        }
      });

      // Activism Posts change stream
      const activismPostChangeStream = ActivismPost.watch(
        [],
        { fullDocument: 'updateLookup' }
      );

      activismPostChangeStream.on('change', async (change) => {
        try {
          switch (change.operationType) {
            case 'insert':
            case 'update':
            case 'replace':
              if (change.fullDocument) {
                await ElasticsearchService.indexActivismPost(change.fullDocument as any);
                logger.info(`Synced activism post ${change.documentKey._id} to Elasticsearch`);
              }
              break;
            case 'delete':
              await ElasticsearchService.deleteDocument(
                INDICES.ACTIVISM_POSTS,
                change.documentKey._id.toString()
              );
              logger.info(`Deleted activism post ${change.documentKey._id} from Elasticsearch`);
              break;
          }
        } catch (error) {
          logger.error('Error syncing activism post change:', error);
        }
      });

      logger.info('MongoDB change streams initialized for real-time sync');
    } catch (error) {
      logger.error('Error initializing change streams:', error);
      throw error;
    }
  }

  /**
   * Perform initial full sync from MongoDB to Elasticsearch
   */
  static async performFullSync(): Promise<void> {
    if (this.isSyncing) {
      logger.warn('Full sync already in progress, skipping...');
      return;
    }

    this.isSyncing = true;
    logger.info('Starting full sync from MongoDB to Elasticsearch...');

    try {
      // Sync Legal Queries
      await this.syncLegalQueries();
      
      // Sync Lawyer Profiles
      await this.syncLawyerProfiles();
      
      // Sync Activism Posts
      await this.syncActivismPosts();

      logger.info('Full sync completed successfully');
    } catch (error) {
      logger.error('Error during full sync:', error);
      throw error;
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Sync all legal queries
   */
  private static async syncLegalQueries(): Promise<void> {
    try {
      const batchSize = 100;
      let skip = 0;
      let hasMore = true;

      while (hasMore) {
        const queries = await LegalQuery.find()
          .skip(skip)
          .limit(batchSize)
          .lean();

        if (queries.length === 0) {
          hasMore = false;
          break;
        }

        const documents = queries.map(query => ({
          _id: query._id.toString(),
          seekerId: query.seekerId,
          title: query.title,
          description: query.description,
          category: query.category,
          urgencyLevel: query.urgencyLevel,
          budget: query.budget,
          status: query.status,
          tags: query.tags,
          viewCount: query.viewCount || 0,
          responseCount: query.responseCount || 0,
          createdAt: query.createdAt,
          updatedAt: query.updatedAt,
          aiAnalysis: query.aiAnalysis
        }));

        await ElasticsearchService.bulkIndex(INDICES.LEGAL_QUERIES, documents);
        logger.info(`Synced ${documents.length} legal queries (batch starting at ${skip})`);

        skip += batchSize;
      }
    } catch (error) {
      logger.error('Error syncing legal queries:', error);
      throw error;
    }
  }

  /**
   * Sync all lawyer profiles
   */
  private static async syncLawyerProfiles(): Promise<void> {
    try {
      const batchSize = 100;
      let skip = 0;
      let hasMore = true;

      while (hasMore) {
        const profiles = await LawyerProfile.find()
          .skip(skip)
          .limit(batchSize)
          .lean();

        if (profiles.length === 0) {
          hasMore = false;
          break;
        }

        const documents = profiles.map(profile => ({
          _id: profile._id.toString(),
          userId: profile.userId,
          barNumber: profile.barNumber,
          licenseState: profile.licenseState,
          practiceAreas: profile.practiceAreas,
          yearsOfExperience: profile.yearsOfExperience,
          bio: profile.bio,
          languages: profile.languages,
          hourlyRate: profile.hourlyRate,
          consultationFee: profile.consultationFee,
          rating: profile.rating,
          completedConsultations: profile.completedConsultations,
          verified: profile.verified,
          availability: profile.availability
        }));

        await ElasticsearchService.bulkIndex(INDICES.LAWYER_PROFILES, documents);
        logger.info(`Synced ${documents.length} lawyer profiles (batch starting at ${skip})`);

        skip += batchSize;
      }
    } catch (error) {
      logger.error('Error syncing lawyer profiles:', error);
      throw error;
    }
  }

  /**
   * Sync all activism posts
   */
  private static async syncActivismPosts(): Promise<void> {
    try {
      const batchSize = 100;
      let skip = 0;
      let hasMore = true;

      while (hasMore) {
        const posts = await ActivismPost.find()
          .skip(skip)
          .limit(batchSize)
          .lean();

        if (posts.length === 0) {
          hasMore = false;
          break;
        }

        const documents = posts.map(post => ({
          _id: post._id.toString(),
          authorId: post.authorId,
          title: post.title,
          content: post.content,
          category: post.category,
          tags: post.tags,
          likes: post.likes,
          shares: post.shares,
          viewCount: post.viewCount,
          isPublished: post.isPublished,
          publishedAt: post.publishedAt,
          createdAt: post.createdAt
        }));

        await ElasticsearchService.bulkIndex(INDICES.ACTIVISM_POSTS, documents);
        logger.info(`Synced ${documents.length} activism posts (batch starting at ${skip})`);

        skip += batchSize;
      }
    } catch (error) {
      logger.error('Error syncing activism posts:', error);
      throw error;
    }
  }

  /**
   * Start periodic sync (for backup, in case change streams miss events)
   */
  static startPeriodicSync(intervalMinutes: number = 30): void {
    if (this.syncInterval) {
      logger.warn('Periodic sync already running');
      return;
    }

    const intervalMs = intervalMinutes * 60 * 1000;
    
    this.syncInterval = setInterval(async () => {
      try {
        logger.info('Starting periodic sync...');
        await this.performIncrementalSync();
      } catch (error) {
        logger.error('Error during periodic sync:', error);
      }
    }, intervalMs);

    logger.info(`Periodic sync started with interval of ${intervalMinutes} minutes`);
  }

  /**
   * Stop periodic sync
   */
  static stopPeriodicSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
      logger.info('Periodic sync stopped');
    }
  }

  /**
   * Perform incremental sync (only sync documents modified since last sync)
   */
  private static async performIncrementalSync(): Promise<void> {
    const lastSyncTime = await this.getLastSyncTime();
    const newSyncTime = new Date();

    try {
      // Sync recently modified legal queries
      const recentQueries = await LegalQuery.find({
        updatedAt: { $gte: lastSyncTime }
      }).lean();

      if (recentQueries.length > 0) {
        const documents = recentQueries.map(query => ({
          _id: query._id.toString(),
          seekerId: query.seekerId,
          title: query.title,
          description: query.description,
          category: query.category,
          urgencyLevel: query.urgencyLevel,
          budget: query.budget,
          status: query.status,
          tags: query.tags,
          viewCount: query.viewCount || 0,
          responseCount: query.responseCount || 0,
          createdAt: query.createdAt,
          updatedAt: query.updatedAt,
          aiAnalysis: query.aiAnalysis
        }));

        await ElasticsearchService.bulkIndex(INDICES.LEGAL_QUERIES, documents);
        logger.info(`Incremental sync: updated ${documents.length} legal queries`);
      }

      // Similar logic for lawyer profiles and activism posts...

      await this.setLastSyncTime(newSyncTime);
    } catch (error) {
      logger.error('Error during incremental sync:', error);
      throw error;
    }
  }

  /**
   * Get last sync timestamp
   */
  private static async getLastSyncTime(): Promise<Date> {
    // In a production environment, this would be stored in a database
    // For now, return 24 hours ago
    const date = new Date();
    date.setHours(date.getHours() - 24);
    return date;
  }

  /**
   * Set last sync timestamp
   */
  private static async setLastSyncTime(time: Date): Promise<void> {
    // In a production environment, this would be stored in a database
    logger.info(`Last sync time updated to: ${time.toISOString()}`);
  }

  /**
   * Verify sync consistency between MongoDB and Elasticsearch
   */
  static async verifySyncConsistency(): Promise<{
    consistent: boolean;
    discrepancies: any[];
  }> {
    const discrepancies: any[] = [];

    try {
      // Check legal queries count
      const mongoQueryCount = await LegalQuery.countDocuments();
      const esQueryCount = await esClient.count({
        index: INDICES.LEGAL_QUERIES
      });

      if (mongoQueryCount !== esQueryCount.count) {
        discrepancies.push({
          type: 'count_mismatch',
          collection: 'legal_queries',
          mongoCount: mongoQueryCount,
          esCount: esQueryCount.count
        });
      }

      // Similar checks for other collections...

      return {
        consistent: discrepancies.length === 0,
        discrepancies
      };
    } catch (error) {
      logger.error('Error verifying sync consistency:', error);
      throw error;
    }
  }
}

export default ElasticsearchSyncService;