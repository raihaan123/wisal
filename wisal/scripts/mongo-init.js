// MongoDB initialization script
// This script runs when MongoDB container starts for the first time

// Switch to the wisal database
db = db.getSiblingDB('wisal');

// Create collections with schema validation
db.createCollection('users', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['email', 'name', 'role', 'authProvider', 'isVerified', 'isActive', 'createdAt'],
      properties: {
        email: {
          bsonType: 'string',
          pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
          description: 'must be a valid email and is required'
        },
        password: {
          bsonType: 'string',
          description: 'password hash - null for OAuth users'
        },
        name: {
          bsonType: 'string',
          description: 'full name of the user'
        },
        role: {
          enum: ['seeker', 'lawyer', 'activist', 'admin'],
          description: 'user role in the platform'
        },
        profile: {
          bsonType: 'object',
          description: 'role-specific profile data'
        },
        authProvider: {
          enum: ['local', 'linkedin'],
          description: 'authentication provider'
        },
        linkedinId: {
          bsonType: 'string',
          description: 'LinkedIn user ID for OAuth users'
        },
        isVerified: {
          bsonType: 'bool',
          description: 'whether user is verified'
        },
        isActive: {
          bsonType: 'bool',
          description: 'whether user account is active'
        },
        createdAt: {
          bsonType: 'date'
        },
        updatedAt: {
          bsonType: 'date'
        }
      }
    }
  }
});

// Create indexes for users
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ role: 1 });
db.users.createIndex({ isActive: 1, isVerified: 1 });
db.users.createIndex({ createdAt: -1 });
db.users.createIndex({ 'authProvider': 1, 'linkedinId': 1 });

// Create conversations collection
db.createCollection('conversations', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['userId', 'messages', 'createdAt'],
      properties: {
        userId: {
          bsonType: 'objectId',
          description: 'must be an objectId and is required'
        },
        title: {
          bsonType: 'string'
        },
        messages: {
          bsonType: 'array',
          items: {
            bsonType: 'object',
            required: ['role', 'content', 'timestamp'],
            properties: {
              role: {
                enum: ['user', 'assistant', 'system'],
                description: 'message role'
              },
              content: {
                bsonType: 'string'
              },
              timestamp: {
                bsonType: 'date'
              }
            }
          }
        },
        metadata: {
          bsonType: 'object'
        },
        createdAt: {
          bsonType: 'date'
        },
        updatedAt: {
          bsonType: 'date'
        }
      }
    }
  }
});

// Create indexes for conversations
db.conversations.createIndex({ userId: 1, createdAt: -1 });
db.conversations.createIndex({ 'messages.timestamp': -1 });

// Create prompts collection
db.createCollection('prompts', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['title', 'content', 'category', 'userId', 'createdAt'],
      properties: {
        title: {
          bsonType: 'string'
        },
        content: {
          bsonType: 'string'
        },
        category: {
          bsonType: 'string'
        },
        tags: {
          bsonType: 'array',
          items: {
            bsonType: 'string'
          }
        },
        userId: {
          bsonType: 'objectId'
        },
        isPublic: {
          bsonType: 'bool'
        },
        likes: {
          bsonType: 'int'
        },
        views: {
          bsonType: 'int'
        },
        createdAt: {
          bsonType: 'date'
        },
        updatedAt: {
          bsonType: 'date'
        }
      }
    }
  }
});

// Create indexes for prompts
db.prompts.createIndex({ title: 'text', content: 'text' });
db.prompts.createIndex({ category: 1, createdAt: -1 });
db.prompts.createIndex({ tags: 1 });
db.prompts.createIndex({ userId: 1 });
db.prompts.createIndex({ isPublic: 1, likes: -1 });

// Create analytics collection
db.createCollection('analytics', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['eventType', 'userId', 'timestamp'],
      properties: {
        eventType: {
          bsonType: 'string'
        },
        userId: {
          bsonType: 'objectId'
        },
        data: {
          bsonType: 'object'
        },
        timestamp: {
          bsonType: 'date'
        }
      }
    }
  }
});

// Create indexes for analytics
db.analytics.createIndex({ userId: 1, timestamp: -1 });
db.analytics.createIndex({ eventType: 1, timestamp: -1 });

// Create API keys collection
db.createCollection('apikeys', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['key', 'userId', 'name', 'createdAt'],
      properties: {
        key: {
          bsonType: 'string'
        },
        userId: {
          bsonType: 'objectId'
        },
        name: {
          bsonType: 'string'
        },
        permissions: {
          bsonType: 'array',
          items: {
            bsonType: 'string'
          }
        },
        expiresAt: {
          bsonType: 'date'
        },
        lastUsed: {
          bsonType: 'date'
        },
        isActive: {
          bsonType: 'bool'
        },
        createdAt: {
          bsonType: 'date'
        }
      }
    }
  }
});

// Create indexes for API keys
db.apikeys.createIndex({ key: 1 }, { unique: true });
db.apikeys.createIndex({ userId: 1 });
db.apikeys.createIndex({ expiresAt: 1 });

// Create legal queries collection
db.createCollection('legalqueries', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['seekerId', 'type', 'category', 'description', 'urgency', 'status', 'createdAt'],
      properties: {
        seekerId: {
          bsonType: 'objectId',
          description: 'ID of the seeker who created the query'
        },
        type: {
          enum: ['question', 'case'],
          description: 'type of legal query'
        },
        category: {
          bsonType: 'string',
          description: 'legal category'
        },
        description: {
          bsonType: 'string',
          description: 'detailed description of the legal issue'
        },
        urgency: {
          enum: ['low', 'medium', 'high', 'critical'],
          description: 'urgency level of the query'
        },
        jurisdiction: {
          bsonType: 'string'
        },
        attachments: {
          bsonType: 'array',
          items: {
            bsonType: 'string'
          }
        },
        aiAnalysis: {
          bsonType: 'object',
          properties: {
            summary: { bsonType: 'string' },
            categories: {
              bsonType: 'array',
              items: { bsonType: 'string' }
            },
            complexity: {
              enum: ['simple', 'moderate', 'complex']
            },
            estimatedTime: { bsonType: 'int' },
            suggestedSpecialisms: {
              bsonType: 'array',
              items: { bsonType: 'string' }
            }
          }
        },
        matchedLawyers: {
          bsonType: 'array',
          items: {
            bsonType: 'object',
            properties: {
              lawyerId: { bsonType: 'objectId' },
              score: { bsonType: 'double' },
              reason: { bsonType: 'string' }
            }
          }
        },
        status: {
          enum: ['pending', 'analyzing', 'matched', 'accepted', 'completed'],
          description: 'current status of the query'
        },
        createdAt: {
          bsonType: 'date'
        },
        updatedAt: {
          bsonType: 'date'
        }
      }
    }
  }
});

// Create indexes for legal queries
db.legalqueries.createIndex({ seekerId: 1, createdAt: -1 });
db.legalqueries.createIndex({ status: 1, urgency: 1 });
db.legalqueries.createIndex({ category: 1 });
db.legalqueries.createIndex({ 'matchedLawyers.lawyerId': 1 });

// Create activism posts collection
db.createCollection('activismposts', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['authorId', 'title', 'content', 'excerpt', 'tags', 'category', 'urgency', 'status', 'createdAt'],
      properties: {
        authorId: {
          bsonType: 'objectId',
          description: 'ID of the activist author'
        },
        title: {
          bsonType: 'string'
        },
        content: {
          bsonType: 'string'
        },
        excerpt: {
          bsonType: 'string',
          maxLength: 300
        },
        featuredImage: {
          bsonType: 'string'
        },
        tags: {
          bsonType: 'array',
          items: {
            bsonType: 'string'
          }
        },
        category: {
          enum: ['housing', 'rights', 'environment', 'justice', 'other'],
          description: 'post category'
        },
        urgency: {
          enum: ['normal', 'urgent', 'critical']
        },
        status: {
          enum: ['draft', 'pending', 'published', 'archived']
        },
        stats: {
          bsonType: 'object',
          properties: {
            views: { bsonType: 'int' },
            shares: { bsonType: 'int' },
            linkedCases: { bsonType: 'int' }
          }
        },
        relatedPosts: {
          bsonType: 'array',
          items: {
            bsonType: 'objectId'
          }
        },
        publishedAt: {
          bsonType: 'date'
        },
        createdAt: {
          bsonType: 'date'
        },
        updatedAt: {
          bsonType: 'date'
        }
      }
    }
  }
});

// Create indexes for activism posts
db.activismposts.createIndex({ title: 'text', content: 'text' });
db.activismposts.createIndex({ authorId: 1, status: 1 });
db.activismposts.createIndex({ category: 1, urgency: -1, publishedAt: -1 });
db.activismposts.createIndex({ tags: 1 });
db.activismposts.createIndex({ status: 1, publishedAt: -1 });

// Create profile collections for different user types
db.createCollection('seekerprofiles', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['userId'],
      properties: {
        userId: {
          bsonType: 'objectId',
          description: 'reference to user document'
        },
        location: {
          bsonType: 'object',
          properties: {
            postcode: { bsonType: 'string' },
            city: { bsonType: 'string' },
            country: { bsonType: 'string' }
          }
        },
        gender: {
          enum: ['male', 'female', 'other', 'prefer-not-to-say']
        },
        phone: {
          bsonType: 'string'
        },
        preferredContact: {
          enum: ['email', 'phone', 'chat']
        },
        savedLawyers: {
          bsonType: 'array',
          items: {
            bsonType: 'objectId'
          }
        },
        caseHistory: {
          bsonType: 'array',
          items: {
            bsonType: 'objectId'
          }
        }
      }
    }
  }
});

db.createCollection('lawyerprofiles', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['userId', 'location', 'specialisms', 'qualifiedSince', 'currentRole', 'employer'],
      properties: {
        userId: {
          bsonType: 'objectId',
          description: 'reference to user document'
        },
        location: {
          bsonType: 'object',
          required: ['postcode', 'city', 'country'],
          properties: {
            postcode: { bsonType: 'string' },
            city: { bsonType: 'string' },
            country: { bsonType: 'string' }
          }
        },
        specialisms: {
          bsonType: 'array',
          items: {
            bsonType: 'string'
          }
        },
        qualifiedSince: {
          bsonType: 'int'
        },
        currentRole: {
          bsonType: 'string'
        },
        employer: {
          bsonType: 'string'
        },
        barNumber: {
          bsonType: 'string'
        },
        languages: {
          bsonType: 'array',
          items: {
            bsonType: 'string'
          }
        },
        availability: {
          bsonType: 'object',
          properties: {
            schedule: {
              bsonType: 'array',
              items: {
                bsonType: 'object',
                properties: {
                  dayOfWeek: {
                    bsonType: 'int',
                    minimum: 0,
                    maximum: 6
                  },
                  startTime: { bsonType: 'string' },
                  endTime: { bsonType: 'string' },
                  isRecurring: { bsonType: 'bool' }
                }
              }
            },
            timezone: { bsonType: 'string' },
            autoAccept: { bsonType: 'bool' }
          }
        },
        proBonoAreas: {
          bsonType: 'array',
          items: {
            bsonType: 'string'
          }
        },
        credentials: {
          bsonType: 'object',
          properties: {
            license: { bsonType: 'string' },
            certificateUrl: { bsonType: 'string' },
            verifiedAt: { bsonType: 'date' },
            verifiedBy: { bsonType: 'objectId' }
          }
        },
        stats: {
          bsonType: 'object',
          properties: {
            casesHandled: { bsonType: 'int' },
            responseTime: { bsonType: 'int' },
            rating: { bsonType: 'double' },
            reviewCount: { bsonType: 'int' }
          }
        }
      }
    }
  }
});

db.createCollection('activistprofiles', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['userId', 'causes', 'verificationStatus'],
      properties: {
        userId: {
          bsonType: 'objectId',
          description: 'reference to user document'
        },
        causes: {
          bsonType: 'array',
          items: {
            bsonType: 'string'
          },
          description: 'causes the activist supports'
        },
        organization: {
          bsonType: 'string',
          description: 'affiliated organization'
        },
        bio: {
          bsonType: 'string',
          description: 'activist biography'
        },
        socialLinks: {
          bsonType: 'object',
          properties: {
            twitter: { bsonType: 'string' },
            linkedin: { bsonType: 'string' },
            website: { bsonType: 'string' }
          }
        },
        verificationStatus: {
          enum: ['pending', 'verified', 'rejected'],
          description: 'activist verification status'
        },
        verificationDocs: {
          bsonType: 'array',
          items: {
            bsonType: 'string'
          }
        },
        stats: {
          bsonType: 'object',
          properties: {
            postsPublished: { bsonType: 'int' },
            totalViews: { bsonType: 'int' },
            totalShares: { bsonType: 'int' }
          }
        }
      }
    }
  }
});

// Create indexes for profile collections
db.seekerprofiles.createIndex({ userId: 1 }, { unique: true });
db.lawyerprofiles.createIndex({ userId: 1 }, { unique: true });
db.lawyerprofiles.createIndex({ specialisms: 1 });
db.lawyerprofiles.createIndex({ 'location.city': 1, 'location.country': 1 });
db.lawyerprofiles.createIndex({ 'stats.rating': -1, 'stats.reviewCount': -1 });
db.activistprofiles.createIndex({ userId: 1 }, { unique: true });
db.activistprofiles.createIndex({ causes: 1 });
db.activistprofiles.createIndex({ verificationStatus: 1 });

// Create sample users (for development)
// Admin user
const adminId = ObjectId();
db.users.insertOne({
  _id: adminId,
  email: 'admin@wisal.com',
  password: '$2a$10$YourHashedPasswordHere', // This should be properly hashed in production
  name: 'Admin User',
  role: 'admin',
  profile: {},
  authProvider: 'local',
  isVerified: true,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
});

// Sample lawyer user
const lawyerId = ObjectId();
db.users.insertOne({
  _id: lawyerId,
  email: 'james.lawyer@example.com',
  password: '$2a$10$YourHashedPasswordHere',
  name: 'James Wilson',
  role: 'lawyer',
  profile: {},
  authProvider: 'local',
  isVerified: true,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
});

// Create lawyer profile
db.lawyerprofiles.insertOne({
  userId: lawyerId,
  location: {
    postcode: 'SW1A 1AA',
    city: 'London',
    country: 'United Kingdom'
  },
  specialisms: ['Employment Law', 'Human Rights', 'Civil Rights'],
  qualifiedSince: 2015,
  currentRole: 'Senior Partner',
  employer: 'Wilson & Associates',
  barNumber: 'BAR123456',
  languages: ['English', 'Spanish'],
  availability: {
    schedule: [
      { dayOfWeek: 1, startTime: '09:00', endTime: '17:00', isRecurring: true },
      { dayOfWeek: 2, startTime: '09:00', endTime: '17:00', isRecurring: true },
      { dayOfWeek: 3, startTime: '09:00', endTime: '17:00', isRecurring: true },
      { dayOfWeek: 4, startTime: '09:00', endTime: '17:00', isRecurring: true },
      { dayOfWeek: 5, startTime: '09:00', endTime: '15:00', isRecurring: true }
    ],
    timezone: 'Europe/London',
    autoAccept: false
  },
  proBonoAreas: ['Human Rights', 'Refugee Law'],
  credentials: {
    license: 'UK-LAW-2015-001',
    verifiedAt: new Date(),
    verifiedBy: adminId
  },
  stats: {
    casesHandled: 0,
    responseTime: 60,
    rating: 0,
    reviewCount: 0
  }
});

// Sample seeker user
const seekerId = ObjectId();
db.users.insertOne({
  _id: seekerId,
  email: 'sarah.seeker@example.com',
  password: '$2a$10$YourHashedPasswordHere',
  name: 'Sarah Johnson',
  role: 'seeker',
  profile: {},
  authProvider: 'local',
  isVerified: true,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
});

// Create seeker profile
db.seekerprofiles.insertOne({
  userId: seekerId,
  location: {
    postcode: 'E1 6AN',
    city: 'London',
    country: 'United Kingdom'
  },
  gender: 'female',
  phone: '+44 20 7123 4567',
  preferredContact: 'email',
  savedLawyers: [],
  caseHistory: []
});

// Sample activist user
const activistId = ObjectId();
db.users.insertOne({
  _id: activistId,
  email: 'maya.activist@example.com',
  password: '$2a$10$YourHashedPasswordHere',
  name: 'Maya Patel',
  role: 'activist',
  profile: {},
  authProvider: 'local',
  isVerified: true,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
});

// Create activist profile
db.activistprofiles.insertOne({
  userId: activistId,
  causes: ['Housing Rights', 'Social Justice', 'Environmental Justice'],
  organization: 'London Housing Coalition',
  bio: 'Housing rights activist working to ensure everyone has access to safe, affordable housing.',
  socialLinks: {
    twitter: '@maya_housing',
    linkedin: 'linkedin.com/in/mayapatel',
    website: 'londonhousingcoalition.org'
  },
  verificationStatus: 'verified',
  verificationDocs: ['verification-doc-1.pdf'],
  stats: {
    postsPublished: 0,
    totalViews: 0,
    totalShares: 0
  }
});

// Sample activism post
db.activismposts.insertOne({
  authorId: activistId,
  title: 'Urgent: Families Facing Eviction in East London',
  content: 'We need immediate legal support for 15 families facing eviction from their homes in Tower Hamlets...',
  excerpt: 'Urgent legal support needed for families facing eviction in Tower Hamlets.',
  featuredImage: '/images/posts/tower-hamlets-eviction.jpg',
  tags: ['housing', 'eviction', 'urgent', 'tower-hamlets'],
  category: 'housing',
  urgency: 'critical',
  status: 'published',
  stats: {
    views: 0,
    shares: 0,
    linkedCases: 0
  },
  relatedPosts: [],
  publishedAt: new Date(),
  createdAt: new Date(),
  updatedAt: new Date()
});

print('✅ MongoDB initialization completed successfully');
print('📊 Created collections:');
print('   - users (with new schema: name field, activist role)');
print('   - conversations');
print('   - prompts');
print('   - analytics');
print('   - apikeys');
print('   - legalqueries (NEW)');
print('   - activismposts (NEW)');
print('   - seekerprofiles (NEW)');
print('   - lawyerprofiles (NEW)');
print('   - activistprofiles (NEW)');
print('👥 Created sample users:');
print('   - Admin: admin@wisal.com');
print('   - Lawyer: james.lawyer@example.com');
print('   - Seeker: sarah.seeker@example.com');
print('   - Activist: maya.activist@example.com');
print('📝 Created sample activism post');
print('🔐 Note: Update passwords in production!');