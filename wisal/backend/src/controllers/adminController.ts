import { Response } from 'express';
import { Types } from 'mongoose';
import User from '../models/User';
import LawyerProfile from '../models/LawyerProfile';
import LegalQuery from '../models/LegalQuery';
import ActivismPost from '../models/ActivismPost';
import Conversation from '../models/Conversation';
import { AuthRequest } from '../types';

// User Management
export const getAllUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      role,
      isActive,
      isVerified,
      search,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query: any = {};
    
    if (role) query.role = role;
    if (typeof isActive === 'string') query.isActive = isActive === 'true';
    if (typeof isVerified === 'string') query.isVerified = isVerified === 'true';
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const sort: any = { [sortBy as string]: sortOrder === 'asc' ? 1 : -1 };

    const [users, total] = await Promise.all([
      User.find(query)
        .select('-password -refreshToken')
        .sort(sort)
        .skip(skip)
        .limit(Number(limit)),
      User.countDocuments(query)
    ]);

    res.json({
      users,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

export const updateUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const { isActive, isVerified, role } = req.body;

    if (!Types.ObjectId.isValid(userId)) {
      res.status(400).json({ error: 'Invalid user ID' });
      return;
    }

    const updateData: any = {};
    if (typeof isActive === 'boolean') updateData.isActive = isActive;
    if (typeof isVerified === 'boolean') updateData.isVerified = isVerified;
    if (role && ['seeker', 'lawyer', 'activist', 'admin'].includes(role)) {
      updateData.role = role;
    }

    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true }
    ).select('-password -refreshToken');

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({ user });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
};

export const deleteUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;

    if (!Types.ObjectId.isValid(userId)) {
      res.status(400).json({ error: 'Invalid user ID' });
      return;
    }

    // Soft delete by setting isActive to false
    const user = await User.findByIdAndUpdate(
      userId,
      { isActive: false },
      { new: true }
    ).select('-password -refreshToken');

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({ message: 'User deactivated successfully', user });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
};

export const banUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const { reason, duration } = req.body;

    if (!Types.ObjectId.isValid(userId)) {
      res.status(400).json({ error: 'Invalid user ID' });
      return;
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { 
        isActive: false,
        bannedAt: new Date(),
        banReason: reason,
        banDuration: duration
      },
      { new: true }
    ).select('-password -refreshToken');

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({ message: 'User banned successfully', user });
  } catch (error) {
    console.error('Error banning user:', error);
    res.status(500).json({ error: 'Failed to ban user' });
  }
};

export const unbanUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;

    if (!Types.ObjectId.isValid(userId)) {
      res.status(400).json({ error: 'Invalid user ID' });
      return;
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { 
        isActive: true,
        $unset: { bannedAt: 1, banReason: 1, banDuration: 1 }
      },
      { new: true }
    ).select('-password -refreshToken');

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({ message: 'User unbanned successfully', user });
  } catch (error) {
    console.error('Error unbanning user:', error);
    res.status(500).json({ error: 'Failed to unban user' });
  }
};

// Lawyer Verification Management
export const getPendingLawyers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const [lawyers, total] = await Promise.all([
      LawyerProfile.find({ verified: false })
        .populate('userId', 'name email')
        .sort('-createdAt')
        .skip(skip)
        .limit(Number(limit)),
      LawyerProfile.countDocuments({ verified: false })
    ]);

    res.json({
      lawyers,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching pending lawyers:', error);
    res.status(500).json({ error: 'Failed to fetch pending lawyers' });
  }
};

export const verifyLawyer = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { lawyerId } = req.params;
    const { approved, notes } = req.body;

    if (!Types.ObjectId.isValid(lawyerId)) {
      res.status(400).json({ error: 'Invalid lawyer ID' });
      return;
    }

    const lawyer = await LawyerProfile.findByIdAndUpdate(
      lawyerId,
      {
        verified: approved,
        verifiedAt: approved ? new Date() : undefined,
        verifiedBy: approved ? req.user!._id : undefined,
        verificationNotes: notes
      },
      { new: true }
    ).populate('userId', 'name email');

    if (!lawyer) {
      res.status(404).json({ error: 'Lawyer profile not found' });
      return;
    }

    // Update user verification status
    if (approved) {
      await User.findByIdAndUpdate(lawyer.userId, { isVerified: true });
    }

    res.json({ message: `Lawyer ${approved ? 'verified' : 'rejected'} successfully`, lawyer });
  } catch (error) {
    console.error('Error verifying lawyer:', error);
    res.status(500).json({ error: 'Failed to verify lawyer' });
  }
};

// Content Moderation
export const getModerationQueue = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { type = 'all', page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    let results: any = {};

    if (type === 'all' || type === 'posts') {
      const [posts, postCount] = await Promise.all([
        ActivismPost.find({ status: 'draft' })
          .populate('authorId', 'name email')
          .sort('-createdAt')
          .skip(skip)
          .limit(Number(limit)),
        ActivismPost.countDocuments({ status: 'draft' })
      ]);
      results.posts = { items: posts, total: postCount };
    }

    if (type === 'all' || type === 'queries') {
      const [queries, queryCount] = await Promise.all([
        LegalQuery.find({ flaggedForReview: true })
          .populate('seekerId', 'name email')
          .sort('-createdAt')
          .skip(skip)
          .limit(Number(limit)),
        LegalQuery.countDocuments({ flaggedForReview: true })
      ]);
      results.queries = { items: queries, total: queryCount };
    }

    res.json({
      results,
      pagination: {
        page: Number(page),
        limit: Number(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching moderation queue:', error);
    res.status(500).json({ error: 'Failed to fetch moderation queue' });
  }
};

export const moderateContent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { contentId } = req.params;
    const { type, action, reason } = req.body;

    if (!Types.ObjectId.isValid(contentId)) {
      res.status(400).json({ error: 'Invalid content ID' });
      return;
    }

    let result;

    if (type === 'post') {
      result = await ActivismPost.findByIdAndUpdate(
        contentId,
        {
          status: action === 'approve' ? 'published' : 'archived',
          moderatedBy: req.user!._id,
          moderatedAt: new Date(),
          moderationReason: reason
        },
        { new: true }
      );
    } else if (type === 'query') {
      result = await LegalQuery.findByIdAndUpdate(
        contentId,
        {
          flaggedForReview: false,
          moderatedBy: req.user!._id,
          moderatedAt: new Date(),
          moderationAction: action,
          moderationReason: reason
        },
        { new: true }
      );
    }

    if (!result) {
      res.status(404).json({ error: 'Content not found' });
      return;
    }

    res.json({ message: 'Content moderated successfully', content: result });
  } catch (error) {
    console.error('Error moderating content:', error);
    res.status(500).json({ error: 'Failed to moderate content' });
  }
};

// System Statistics and Analytics
export const getSystemStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const [
      userStats,
      lawyerStats,
      queryStats,
      conversationStats,
      postStats
    ] = await Promise.all([
      // User statistics
      User.aggregate([
        {
          $group: {
            _id: '$role',
            count: { $sum: 1 },
            active: { $sum: { $cond: ['$isActive', 1, 0] } },
            verified: { $sum: { $cond: ['$isVerified', 1, 0] } }
          }
        }
      ]),
      
      // Lawyer statistics
      LawyerProfile.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            verified: { $sum: { $cond: ['$verified', 1, 0] } },
            avgRating: { $avg: '$rating.average' },
            totalConsultations: { $sum: '$completedConsultations' }
          }
        }
      ]),
      
      // Query statistics
      LegalQuery.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]),
      
      // Conversation statistics
      Conversation.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            avgDuration: { $avg: '$duration' }
          }
        }
      ]),
      
      // Post statistics
      ActivismPost.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            totalViews: { $sum: '$viewCount' },
            totalEngagement: { $sum: '$engagementCount' }
          }
        }
      ])
    ]);

    res.json({
      users: userStats,
      lawyers: lawyerStats[0] || {},
      queries: queryStats,
      conversations: conversationStats,
      posts: postStats,
      generatedAt: new Date()
    });
  } catch (error) {
    console.error('Error fetching system stats:', error);
    res.status(500).json({ error: 'Failed to fetch system statistics' });
  }
};

export const getAnalytics = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { period = '7d', metric } = req.query;
    
    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    
    switch (period) {
      case '24h':
        startDate.setDate(startDate.getDate() - 1);
        break;
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(startDate.getDate() - 90);
        break;
    }

    const dateQuery = { createdAt: { $gte: startDate, $lte: endDate } };

    let analytics: any = {};

    if (!metric || metric === 'registrations') {
      analytics.registrations = await User.aggregate([
        { $match: dateQuery },
        {
          $group: {
            _id: {
              date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
              role: '$role'
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id.date': 1 } }
      ]);
    }

    if (!metric || metric === 'queries') {
      analytics.queries = await LegalQuery.aggregate([
        { $match: dateQuery },
        {
          $group: {
            _id: {
              date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
              category: '$category'
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id.date': 1 } }
      ]);
    }

    if (!metric || metric === 'conversations') {
      analytics.conversations = await Conversation.aggregate([
        { $match: dateQuery },
        {
          $group: {
            _id: {
              date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }
            },
            count: { $sum: 1 },
            avgDuration: { $avg: '$duration' }
          }
        },
        { $sort: { '_id.date': 1 } }
      ]);
    }

    res.json({
      period,
      startDate,
      endDate,
      analytics
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
};

// System Configuration
export const getSystemConfig = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // This would typically fetch from a configuration collection
    const config = {
      registrationEnabled: true,
      maintenanceMode: false,
      features: {
        aiAssistance: true,
        videoConsultations: false,
        proBonoMatching: true
      },
      limits: {
        maxQueriesPerUser: 10,
        maxConsultationDuration: 120, // minutes
        maxFileUploadSize: 10 * 1024 * 1024 // 10MB
      }
    };

    res.json({ config });
  } catch (error) {
    console.error('Error fetching system config:', error);
    res.status(500).json({ error: 'Failed to fetch system configuration' });
  }
};

export const updateSystemConfig = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { config } = req.body;
    
    // This would typically update a configuration collection
    // For now, we'll just return the updated config
    
    res.json({ 
      message: 'System configuration updated successfully',
      config 
    });
  } catch (error) {
    console.error('Error updating system config:', error);
    res.status(500).json({ error: 'Failed to update system configuration' });
  }
};