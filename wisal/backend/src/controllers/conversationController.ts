import { Request, Response } from 'express';
import Conversation from '../models/Conversation';
import Message from '../models/Message';
import { AuthRequest } from '../types';
import logger from '../utils/logger';

// Stub implementations
export const getUserConversations = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!._id;
    const { status, type, page = 1, limit = 20 } = req.query;
    
    const filter: any = {
      $or: [{ seekerId: userId }, { lawyerId: userId }]
    };
    
    if (status) filter.status = status;
    if (type) filter.type = type;

    const conversations = await Conversation.find(filter)
      .populate('seekerId', 'name profilePicture')
      .populate('lawyerId', 'name profilePicture')
      .sort({ updatedAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await Conversation.countDocuments(filter);

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

export const getConversation = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { conversationId } = req.params;
    const userId = req.user!._id;

    const conversation = await Conversation.findOne({
      _id: conversationId,
      $or: [{ seekerId: userId }, { lawyerId: userId }]
    })
      .populate('seekerId', 'name profilePicture')
      .populate('lawyerId', 'name profilePicture');

    if (!conversation) {
      res.status(404).json({ error: 'Conversation not found' });
      return;
    }

    res.json(conversation);
  } catch (error) {
    logger.error('Get conversation error:', error);
    res.status(500).json({ error: 'Failed to fetch conversation' });
  }
};

export const createConversation = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const seekerId = req.user!._id;
    const { lawyerId, queryId, type, price } = req.body;

    const conversation = await Conversation.create({
      seekerId,
      lawyerId,
      queryId,
      type,
      price,
    });

    await conversation.populate('seekerId lawyerId');

    res.status(201).json(conversation);
  } catch (error) {
    logger.error('Create conversation error:', error);
    res.status(500).json({ error: 'Failed to create conversation' });
  }
};

export const updateConversationStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { conversationId } = req.params;
    const { status } = req.body;
    const userId = req.user!._id;

    const conversation = await Conversation.findOneAndUpdate(
      {
        _id: conversationId,
        $or: [{ seekerId: userId }, { lawyerId: userId }]
      },
      { status },
      { new: true }
    );

    if (!conversation) {
      res.status(404).json({ error: 'Conversation not found' });
      return;
    }

    res.json(conversation);
  } catch (error) {
    logger.error('Update conversation status error:', error);
    res.status(500).json({ error: 'Failed to update conversation status' });
  }
};

export const endConversation = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { conversationId } = req.params;
    const userId = req.user!._id;

    const conversation = await Conversation.findOneAndUpdate(
      {
        _id: conversationId,
        $or: [{ seekerId: userId }, { lawyerId: userId }]
      },
      { 
        status: 'completed',
        endTime: new Date(),
        $set: { duration: 0 } // Calculate based on start/end time
      },
      { new: true }
    );

    if (!conversation) {
      res.status(404).json({ error: 'Conversation not found' });
      return;
    }

    res.json(conversation);
  } catch (error) {
    logger.error('End conversation error:', error);
    res.status(500).json({ error: 'Failed to end conversation' });
  }
};

export const rateConversation = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { conversationId } = req.params;
    const { rating, review } = req.body;
    const userId = req.user!._id;

    const conversation = await Conversation.findOneAndUpdate(
      {
        _id: conversationId,
        seekerId: userId,
        status: 'completed'
      },
      { rating, review },
      { new: true }
    );

    if (!conversation) {
      res.status(404).json({ error: 'Conversation not found or not eligible for rating' });
      return;
    }

    res.json(conversation);
  } catch (error) {
    logger.error('Rate conversation error:', error);
    res.status(500).json({ error: 'Failed to rate conversation' });
  }
};

export const getMessages = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { conversationId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const userId = req.user!._id;

    // Verify user is part of conversation
    const conversation = await Conversation.findOne({
      _id: conversationId,
      $or: [{ seekerId: userId }, { lawyerId: userId }]
    });

    if (!conversation) {
      res.status(404).json({ error: 'Conversation not found' });
      return;
    }

    const messages = await Message.find({ conversationId })
      .populate('senderId', 'name profilePicture')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await Message.countDocuments({ conversationId });

    res.json({
      messages: messages.reverse(), // Return in chronological order
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    logger.error('Get messages error:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
};

export const sendMessage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { conversationId } = req.params;
    const { content, type = 'text' } = req.body;
    const senderId = req.user!._id;

    // Verify user is part of conversation
    const conversation = await Conversation.findOne({
      _id: conversationId,
      $or: [{ seekerId: senderId }, { lawyerId: senderId }],
      status: 'active'
    });

    if (!conversation) {
      res.status(404).json({ error: 'Active conversation not found' });
      return;
    }

    const message = await Message.create({
      conversationId,
      senderId,
      content,
      type,
    });

    await message.populate('senderId', 'name profilePicture');

    // Emit socket event
    const io = req.app.get('io');
    io.to(`conversation:${conversationId}`).emit('new-message', message);

    res.status(201).json(message);
  } catch (error) {
    logger.error('Send message error:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
};

export const markMessagesAsRead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { conversationId } = req.params;
    const userId = req.user!._id;

    // Mark all unread messages as read
    await Message.updateMany(
      {
        conversationId,
        senderId: { $ne: userId },
        isRead: false,
      },
      {
        isRead: true,
        readAt: new Date(),
      }
    );

    res.json({ message: 'Messages marked as read' });
  } catch (error) {
    logger.error('Mark messages as read error:', error);
    res.status(500).json({ error: 'Failed to mark messages as read' });
  }
};