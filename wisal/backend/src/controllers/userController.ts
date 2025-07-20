import { Response } from 'express';
import User from '../models/User';
import SeekerProfile from '../models/SeekerProfile';
import LawyerProfile from '../models/LawyerProfile';
import Conversation from '../models/Conversation';
import LegalQuery from '../models/LegalQuery';
import ActivismPost from '../models/ActivismPost';
import { AuthRequest } from '../types';
import logger from '../utils/logger';

export const getUserProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    
    const user = await User.findById(userId).select('-password');
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    let profile = null;
    if (user.role === 'lawyer') {
      profile = await LawyerProfile.findOne({ userId });
    } else if (user.role === 'seeker') {
      profile = await SeekerProfile.findOne({ userId });
    }

    res.json({ user, profile });
  } catch (error) {
    logger.error('Get user profile error:', error);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
};

export const updateUserProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    
    // Check if user can update this profile
    if (req.user!._id.toString() !== userId && req.user!.role !== 'admin') {
      res.status(403).json({ error: 'Unauthorized' });
      return;
    }

    const updates = req.body;
    const user = await User.findByIdAndUpdate(
      userId,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json(user);
  } catch (error) {
    logger.error('Update user profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

export const uploadAvatar = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    
    if (req.user!._id.toString() !== userId) {
      res.status(403).json({ error: 'Unauthorized' });
      return;
    }

    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }

    const profilePicture = `/uploads/images/${req.file.filename}`;
    
    const user = await User.findByIdAndUpdate(
      userId,
      { profilePicture },
      { new: true }
    ).select('-password');

    res.json({ profilePicture: user?.profilePicture });
  } catch (error) {
    logger.error('Upload avatar error:', error);
    res.status(500).json({ error: 'Failed to upload avatar' });
  }
};

export const deleteAccount = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    
    if (req.user!._id.toString() !== userId && req.user!.role !== 'admin') {
      res.status(403).json({ error: 'Unauthorized' });
      return;
    }

    // Soft delete - just deactivate
    await User.findByIdAndUpdate(userId, { isActive: false });

    res.json({ message: 'Account deactivated successfully' });
  } catch (error) {
    logger.error('Delete account error:', error);
    res.status(500).json({ error: 'Failed to delete account' });
  }
};

export const getUserConversations = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    
    if (req.user!._id.toString() !== userId && req.user!.role !== 'admin') {
      res.status(403).json({ error: 'Unauthorized' });
      return;
    }

    const conversations = await Conversation.find({
      $or: [{ seekerId: userId }, { lawyerId: userId }]
    })
      .populate('seekerId', 'name profilePicture')
      .populate('lawyerId', 'name profilePicture')
      .sort({ updatedAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await Conversation.countDocuments({
      $or: [{ seekerId: userId }, { lawyerId: userId }]
    });

    res.json({
      conversations,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    logger.error('Get user conversations error:', error);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
};

export const getUserQueries = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    
    if (req.user!._id.toString() !== userId && req.user!.role !== 'admin') {
      res.status(403).json({ error: 'Unauthorized' });
      return;
    }

    const queries = await LegalQuery.find({ seekerId: userId })
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await LegalQuery.countDocuments({ seekerId: userId });

    res.json({
      queries,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    logger.error('Get user queries error:', error);
    res.status(500).json({ error: 'Failed to fetch queries' });
  }
};

export const getUserPosts = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const posts = await ActivismPost.find({ 
      authorId: userId,
      isPublished: true 
    })
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await ActivismPost.countDocuments({ 
      authorId: userId,
      isPublished: true 
    });

    res.json({
      posts,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    logger.error('Get user posts error:', error);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
};

export const getAllUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 50, role, isActive } = req.query;
    
    const filter: any = {};
    if (role) filter.role = role;
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await User.countDocuments(filter);

    res.json({
      users,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    logger.error('Get all users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

export const updateUserStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const { isActive } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      { isActive },
      { new: true }
    ).select('-password');

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json(user);
  } catch (error) {
    logger.error('Update user status error:', error);
    res.status(500).json({ error: 'Failed to update user status' });
  }
};