// @ts-ignore - elasticsearch types may be missing
import { Client } from '@elastic/elasticsearch';
import logger from '../utils/logger';
import { ILegalQuery, ILawyerProfile, IActivismPost } from '../types';

// Elasticsearch client instance
const esClient = new Client({
  node: process.env.ELASTICSEARCH_URL || 'http://localhost:9200',
  auth: {
    username: process.env.ELASTICSEARCH_USERNAME || 'elastic',
    password: process.env.ELASTICSEARCH_PASSWORD || 'changeme'
  },
  maxRetries: 5,
  requestTimeout: 60000,
  sniffOnStart: false, // Disable sniffing to avoid Docker network issues
  sniffOnConnectionFault: false
});

// Index names
export const INDICES = {
  LEGAL_QUERIES: 'legal_queries',
  LAWYER_PROFILES: 'lawyer_profiles',
  ACTIVISM_POSTS: 'activism_posts'
};

// Elasticsearch Service Class
export class ElasticsearchService {
  // Initialize indices and mappings
  static async initializeIndices(): Promise<void> {
    try {
      // Create Legal Queries Index
      const legalQueriesExists = await esClient.indices.exists({ index: INDICES.LEGAL_QUERIES });
      if (!legalQueriesExists) {
        await esClient.indices.create({
          index: INDICES.LEGAL_QUERIES,
          body: {
            settings: {
              number_of_shards: 2,
              number_of_replicas: 1,
              analysis: {
                analyzer: {
                  legal_analyzer: {
                    type: 'custom',
                    tokenizer: 'standard',
                    filter: ['lowercase', 'stop', 'snowball', 'synonym_filter']
                  }
                },
                filter: {
                  synonym_filter: {
                    type: 'synonym',
                    synonyms: [
                      'lawyer,attorney,counsel',
                      'divorce,separation,custody',
                      'criminal,felony,misdemeanor',
                      'contract,agreement,document'
                    ]
                  }
                }
              }
            },
            mappings: {
              properties: {
                seekerId: { type: 'keyword' },
                title: { 
                  type: 'text',
                  analyzer: 'legal_analyzer',
                  fields: {
                    keyword: { type: 'keyword' }
                  }
                },
                description: { 
                  type: 'text',
                  analyzer: 'legal_analyzer'
                },
                category: { type: 'keyword' },
                urgencyLevel: { type: 'keyword' },
                budget: { type: 'float' },
                status: { type: 'keyword' },
                tags: { type: 'keyword' },
                viewCount: { type: 'integer' },
                responseCount: { type: 'integer' },
                createdAt: { type: 'date' },
                updatedAt: { type: 'date' },
                location: {
                  properties: {
                    city: { type: 'keyword' },
                    state: { type: 'keyword' },
                    coordinates: { type: 'geo_point' }
                  }
                },
                aiAnalysis: {
                  properties: {
                    summary: { type: 'text' },
                    categories: { type: 'keyword' },
                    complexity: { type: 'keyword' },
                    suggestedSpecialisms: { type: 'keyword' },
                    embeddings: { 
                      type: 'dense_vector',
                      dims: 1536  // OpenAI embeddings dimension
                    }
                  }
                }
              }
            }
          }
        });
        logger.info('Legal Queries index created');
      }

      // Create Lawyer Profiles Index
      const lawyerProfilesExists = await esClient.indices.exists({ index: INDICES.LAWYER_PROFILES });
      if (!lawyerProfilesExists) {
        await esClient.indices.create({
          index: INDICES.LAWYER_PROFILES,
          body: {
            settings: {
              number_of_shards: 2,
              number_of_replicas: 1,
              analysis: {
                analyzer: {
                  profile_analyzer: {
                    type: 'custom',
                    tokenizer: 'standard',
                    filter: ['lowercase', 'stop', 'snowball']
                  }
                }
              }
            },
            mappings: {
              properties: {
                userId: { type: 'keyword' },
                barNumber: { type: 'keyword' },
                licenseState: { type: 'keyword' },
                practiceAreas: { type: 'keyword' },
                yearsOfExperience: { type: 'integer' },
                bio: { 
                  type: 'text',
                  analyzer: 'profile_analyzer'
                },
                languages: { type: 'keyword' },
                hourlyRate: { type: 'float' },
                consultationFee: { type: 'float' },
                rating: {
                  properties: {
                    average: { type: 'float' },
                    count: { type: 'integer' }
                  }
                },
                completedConsultations: { type: 'integer' },
                verified: { type: 'boolean' },
                location: {
                  properties: {
                    city: { type: 'keyword' },
                    state: { type: 'keyword' },
                    coordinates: { type: 'geo_point' }
                  }
                },
                availability: {
                  properties: {
                    dayOfWeek: { type: 'integer' },
                    startTime: { type: 'keyword' },
                    endTime: { type: 'keyword' }
                  }
                },
                embeddings: { 
                  type: 'dense_vector',
                  dims: 1536  // For semantic search
                }
              }
            }
          }
        });
        logger.info('Lawyer Profiles index created');
      }

      // Create Activism Posts Index
      const activismPostsExists = await esClient.indices.exists({ index: INDICES.ACTIVISM_POSTS });
      if (!activismPostsExists) {
        await esClient.indices.create({
          index: INDICES.ACTIVISM_POSTS,
          body: {
            settings: {
              number_of_shards: 1,
              number_of_replicas: 1,
              analysis: {
                analyzer: {
                  content_analyzer: {
                    type: 'custom',
                    tokenizer: 'standard',
                    filter: ['lowercase', 'stop', 'snowball']
                  }
                }
              }
            },
            mappings: {
              properties: {
                authorId: { type: 'keyword' },
                title: { 
                  type: 'text',
                  analyzer: 'content_analyzer',
                  fields: {
                    keyword: { type: 'keyword' }
                  }
                },
                content: { 
                  type: 'text',
                  analyzer: 'content_analyzer'
                },
                category: { type: 'keyword' },
                tags: { type: 'keyword' },
                likes: { type: 'keyword' },
                shares: { type: 'integer' },
                viewCount: { type: 'integer' },
                isPublished: { type: 'boolean' },
                publishedAt: { type: 'date' },
                createdAt: { type: 'date' },
                embeddings: { 
                  type: 'dense_vector',
                  dims: 1536  // For content similarity
                }
              }
            }
          }
        });
        logger.info('Activism Posts index created');
      }
    } catch (error) {
      logger.error('Error initializing Elasticsearch indices:', error);
      throw error;
    }
  }

  // Index a legal query
  static async indexLegalQuery(query: ILegalQuery & { _id: string }): Promise<void> {
    try {
      await esClient.index({
        index: INDICES.LEGAL_QUERIES,
        id: query._id.toString(),
        body: {
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
        }
      });
      await esClient.indices.refresh({ index: INDICES.LEGAL_QUERIES });
    } catch (error) {
      logger.error('Error indexing legal query:', error);
      throw error;
    }
  }

  // Index a lawyer profile
  static async indexLawyerProfile(profile: ILawyerProfile & { _id: string }): Promise<void> {
    try {
      await esClient.index({
        index: INDICES.LAWYER_PROFILES,
        id: profile._id.toString(),
        body: {
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
        }
      });
      await esClient.indices.refresh({ index: INDICES.LAWYER_PROFILES });
    } catch (error) {
      logger.error('Error indexing lawyer profile:', error);
      throw error;
    }
  }

  // Index an activism post
  static async indexActivismPost(post: IActivismPost & { _id: string }): Promise<void> {
    try {
      await esClient.index({
        index: INDICES.ACTIVISM_POSTS,
        id: post._id.toString(),
        body: {
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
        }
      });
      await esClient.indices.refresh({ index: INDICES.ACTIVISM_POSTS });
    } catch (error) {
      logger.error('Error indexing activism post:', error);
      throw error;
    }
  }

  // Search legal queries with advanced filtering
  static async searchLegalQueries(params: {
    query?: string;
    category?: string;
    urgencyLevel?: string;
    status?: string;
    minBudget?: number;
    maxBudget?: number;
    from?: number;
    size?: number;
    sortBy?: 'relevance' | 'date' | 'views' | 'responses';
  }): Promise<any> {
    try {
      const { 
        query, 
        category, 
        urgencyLevel, 
        status, 
        minBudget, 
        maxBudget, 
        from = 0, 
        size = 20,
        sortBy = 'relevance'
      } = params;

      const must: any[] = [];
      const filter: any[] = [];

      // Full-text search on title and description
      if (query) {
        must.push({
          multi_match: {
            query,
            fields: ['title^2', 'description', 'tags'],
            type: 'best_fields',
            fuzziness: 'AUTO'
          }
        });
      }

      // Filters
      if (category) filter.push({ term: { category } });
      if (urgencyLevel) filter.push({ term: { urgencyLevel } });
      if (status) filter.push({ term: { status } });
      if (minBudget || maxBudget) {
        filter.push({
          range: {
            budget: {
              ...(minBudget && { gte: minBudget }),
              ...(maxBudget && { lte: maxBudget })
            }
          }
        });
      }

      // Sort options
      let sort: any[] = [];
      switch (sortBy) {
        case 'date':
          sort = [{ createdAt: { order: 'desc' } }];
          break;
        case 'views':
          sort = [{ viewCount: { order: 'desc' } }];
          break;
        case 'responses':
          sort = [{ responseCount: { order: 'desc' } }];
          break;
        default:
          if (query) sort = ['_score'];
          else sort = [{ createdAt: { order: 'desc' } }];
      }

      const response = await esClient.search({
        index: INDICES.LEGAL_QUERIES,
        body: {
          query: {
            bool: {
              must: must.length > 0 ? must : [{ match_all: {} }],
              filter
            }
          },
          sort,
          from,
          size,
          highlight: {
            fields: {
              title: {},
              description: { fragment_size: 150 }
            }
          }
        }
      });

      return {
        hits: response.hits.hits.map((hit: any) => {
          const source = hit._source as Record<string, any>;
          return {
            ...(source ? source : {}),
            _id: hit._id,
            _score: hit._score,
            highlight: hit.highlight
          };
        }),
        total: response.hits.total,
        took: response.took
      };
    } catch (error) {
      logger.error('Error searching legal queries:', error);
      throw error;
    }
  }

  // Search lawyer profiles with semantic search
  static async searchLawyerProfiles(params: {
    query?: string;
    practiceAreas?: string[];
    licenseState?: string;
    languages?: string[];
    minRate?: number;
    maxRate?: number;
    minExperience?: number;
    verified?: boolean;
    from?: number;
    size?: number;
    embeddings?: number[];
  }): Promise<any> {
    try {
      const {
        query,
        practiceAreas,
        licenseState,
        languages,
        minRate,
        maxRate,
        minExperience,
        verified,
        from = 0,
        size = 20,
        embeddings
      } = params;

      const must: any[] = [];
      const filter: any[] = [];

      // Text search on bio
      if (query) {
        must.push({
          match: {
            bio: {
              query,
              fuzziness: 'AUTO'
            }
          }
        });
      }

      // Semantic search using embeddings
      if (embeddings && embeddings.length > 0) {
        must.push({
          script_score: {
            query: { match_all: {} },
            script: {
              source: "cosineSimilarity(params.query_vector, 'embeddings') + 1.0",
              params: {
                query_vector: embeddings
              }
            }
          }
        });
      }

      // Filters
      if (practiceAreas && practiceAreas.length > 0) {
        filter.push({ terms: { practiceAreas } });
      }
      if (licenseState) filter.push({ term: { licenseState } });
      if (languages && languages.length > 0) {
        filter.push({ terms: { languages } });
      }
      if (minRate || maxRate) {
        filter.push({
          range: {
            hourlyRate: {
              ...(minRate && { gte: minRate }),
              ...(maxRate && { lte: maxRate })
            }
          }
        });
      }
      if (minExperience) {
        filter.push({
          range: {
            yearsOfExperience: { gte: minExperience }
          }
        });
      }
      if (verified !== undefined) {
        filter.push({ term: { verified } });
      }

      const response = await esClient.search({
        index: INDICES.LAWYER_PROFILES,
        body: {
          query: {
            bool: {
              must: must.length > 0 ? must : [{ match_all: {} }],
              filter
            }
          },
          sort: [
            { 'rating.average': { order: 'desc' } },
            { completedConsultations: { order: 'desc' } }
          ],
          from,
          size
        }
      });

      return {
        hits: response.hits.hits.map((hit: any) => {
          const source = hit._source as Record<string, any>;
          return {
            ...(source ? source : {}),
            _id: hit._id,
            _score: hit._score
          };
        }),
        total: response.hits.total,
        took: response.took
      };
    } catch (error) {
      logger.error('Error searching lawyer profiles:', error);
      throw error;
    }
  }

  // Search activism posts
  static async searchActivismPosts(params: {
    query?: string;
    category?: string;
    tags?: string[];
    authorId?: string;
    from?: number;
    size?: number;
  }): Promise<any> {
    try {
      const {
        query,
        category,
        tags,
        authorId,
        from = 0,
        size = 20
      } = params;

      const must: any[] = [];
      const filter: any[] = [
        { term: { isPublished: true } }
      ];

      // Full-text search
      if (query) {
        must.push({
          multi_match: {
            query,
            fields: ['title^2', 'content', 'tags'],
            type: 'best_fields',
            fuzziness: 'AUTO'
          }
        });
      }

      // Filters
      if (category) filter.push({ term: { category } });
      if (tags && tags.length > 0) filter.push({ terms: { tags } });
      if (authorId) filter.push({ term: { authorId } });

      const response = await esClient.search({
        index: INDICES.ACTIVISM_POSTS,
        body: {
          query: {
            bool: {
              must: must.length > 0 ? must : [{ match_all: {} }],
              filter
            }
          },
          sort: [
            { publishedAt: { order: 'desc' } }
          ],
          from,
          size,
          highlight: {
            fields: {
              title: {},
              content: { fragment_size: 200 }
            }
          }
        }
      });

      return {
        hits: response.hits.hits.map((hit: any) => {
          const source = hit._source as Record<string, any>;
          return {
            ...(source ? source : {}),
            _id: hit._id,
            _score: hit._score,
            highlight: hit.highlight
          };
        }),
        total: response.hits.total,
        took: response.took
      };
    } catch (error) {
      logger.error('Error searching activism posts:', error);
      throw error;
    }
  }

  // Bulk index documents
  static async bulkIndex(index: string, documents: any[]): Promise<void> {
    try {
      const body = documents.flatMap(doc => [
        { index: { _index: index, _id: doc._id } },
        doc
      ]);

      const response = await esClient.bulk({ body });
      
      if (response.errors) {
        const erroredDocuments = response.items.filter((item: any) => item.index?.error);
        logger.error('Bulk indexing errors:', erroredDocuments);
      }

      await esClient.indices.refresh({ index });
    } catch (error) {
      logger.error('Error bulk indexing:', error);
      throw error;
    }
  }

  // Delete document from index
  static async deleteDocument(index: string, id: string): Promise<void> {
    try {
      await esClient.delete({
        index,
        id
      });
      await esClient.indices.refresh({ index });
    } catch (error) {
      logger.error('Error deleting document:', error);
      throw error;
    }
  }

  // Update document in index
  static async updateDocument(index: string, id: string, doc: any): Promise<void> {
    try {
      await esClient.update({
        index,
        id,
        body: {
          doc
        }
      });
      await esClient.indices.refresh({ index });
    } catch (error) {
      logger.error('Error updating document:', error);
      throw error;
    }
  }

  // Get cluster health
  static async getClusterHealth(): Promise<any> {
    try {
      const health = await esClient.cluster.health();
      return health;
    } catch (error) {
      logger.error('Error getting cluster health:', error);
      throw error;
    }
  }

  // Check if Elasticsearch is connected
  static async isConnected(): Promise<boolean> {
    try {
      const response = await esClient.ping();
      return true;
    } catch (error) {
      logger.error('Elasticsearch connection error:', error);
      return false;
    }
  }
}

// Export the client for direct use if needed
export { esClient };

// Export default instance
export default ElasticsearchService;