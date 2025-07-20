import dotenv from 'dotenv';
import ElasticsearchService, { esClient, INDICES } from './elasticsearch';
import ElasticsearchSyncService from './elasticsearch-sync';
import logger from '../utils/logger';
import mongoose from 'mongoose';

// Load environment variables
dotenv.config();

/**
 * Initialize Elasticsearch for the Wisal platform
 * This script should be run during application startup or as a separate initialization script
 */
export class ElasticsearchInitializer {
  /**
   * Initialize Elasticsearch with all required configurations
   */
  static async initialize(): Promise<void> {
    try {
      logger.info('Starting Elasticsearch initialization...');

      // Check Elasticsearch connection
      const isConnected = await ElasticsearchService.isConnected();
      if (!isConnected) {
        throw new Error('Cannot connect to Elasticsearch. Please ensure Elasticsearch is running.');
      }
      logger.info('Successfully connected to Elasticsearch');

      // Get cluster health
      const health = await ElasticsearchService.getClusterHealth();
      logger.info(`Elasticsearch cluster health: ${health.status}`);

      // Initialize indices with mappings
      await ElasticsearchService.initializeIndices();
      logger.info('Elasticsearch indices initialized');

      // Check if MongoDB is connected (required for sync)
      if (mongoose.connection.readyState === 1) {
        // Perform initial full sync from MongoDB
        logger.info('Starting initial data sync from MongoDB...');
        await ElasticsearchSyncService.performFullSync();
        logger.info('Initial data sync completed');

        // Initialize change streams for real-time sync
        await ElasticsearchSyncService.initializeChangeStreams();
        logger.info('MongoDB change streams initialized');

        // Start periodic sync as backup
        ElasticsearchSyncService.startPeriodicSync(30); // Every 30 minutes
        logger.info('Periodic sync started');

        // Verify sync consistency
        const consistency = await ElasticsearchSyncService.verifySyncConsistency();
        if (consistency.consistent) {
          logger.info('Elasticsearch and MongoDB are in sync');
        } else {
          logger.warn('Sync discrepancies found:', consistency.discrepancies);
        }
      } else {
        logger.warn('MongoDB not connected. Skipping data sync.');
      }

      logger.info('Elasticsearch initialization completed successfully');
    } catch (error) {
      logger.error('Elasticsearch initialization failed:', error);
      throw error;
    }
  }

  /**
   * Gracefully shutdown Elasticsearch connections and sync services
   */
  static async shutdown(): Promise<void> {
    try {
      logger.info('Shutting down Elasticsearch services...');

      // Stop periodic sync
      ElasticsearchSyncService.stopPeriodicSync();

      // Close Elasticsearch client connections
      await esClient.close();

      logger.info('Elasticsearch services shut down successfully');
    } catch (error) {
      logger.error('Error during Elasticsearch shutdown:', error);
      throw error;
    }
  }

  /**
   * Reindex all data (useful for schema changes or data recovery)
   */
  static async reindexAll(): Promise<void> {
    try {
      logger.info('Starting full reindex of all data...');

      // Delete existing indices
      const indices = Object.values(INDICES);
      for (const index of indices) {
        try {
          await esClient.indices.delete({ index });
          logger.info(`Deleted index: ${index}`);
        } catch (error: any) {
          if (error.meta?.statusCode !== 404) {
            throw error;
          }
        }
      }

      // Recreate indices with latest mappings
      await ElasticsearchService.initializeIndices();

      // Perform full sync
      await ElasticsearchSyncService.performFullSync();

      logger.info('Full reindex completed successfully');
    } catch (error) {
      logger.error('Reindex failed:', error);
      throw error;
    }
  }
}

// Export for use in server startup
export default ElasticsearchInitializer;

// If run directly, initialize Elasticsearch
if (require.main === module) {
  (async () => {
    try {
      // Connect to MongoDB first if not connected
      if (mongoose.connection.readyState !== 1) {
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/wisal';
        await mongoose.connect(mongoUri);
        logger.info('Connected to MongoDB');
      }

      // Initialize Elasticsearch
      await ElasticsearchInitializer.initialize();

      // Keep the process running
      logger.info('Elasticsearch initialization script completed. Press Ctrl+C to exit.');
    } catch (error) {
      logger.error('Failed to initialize Elasticsearch:', error);
      process.exit(1);
    }
  })();
}