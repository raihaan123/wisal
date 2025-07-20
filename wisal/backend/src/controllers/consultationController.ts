import { Request, Response } from 'express';
import { Types } from 'mongoose';
import Conversation from '../models/Conversation';
import Message from '../models/Message';
import User from '../models/User';
import logger from '../utils/logger';

interface AuthRequest extends Request {
  user?: any;
}

export const consultationController = {
  // Create a new consultation request
  createConsultation: async (req: AuthRequest, res: Response) => {
    try {
      const { lawyerId, type, scheduledAt, price } = req.body;
      const seekerId = req.user._id;

      // Check if lawyer exists
      const lawyer = await User.findOne({ _id: lawyerId, role: 'lawyer' });
      if (!lawyer) {
        return res.status(404).json({ message: 'Lawyer not found' });
      }

      // Create new conversation
      const conversation = new Conversation({
        lawyerId,
        seekerId,
        type: type || 'consultation',
        status: 'active',
        startTime: scheduledAt || new Date(),
        price: price || 0,
      });

      await conversation.save();

      // Populate participants info
      await conversation.populate('seekerId lawyerId', 'name email avatar role');
      
      // Emit socket event to notify lawyer
      const io = req.app.get('io');
      io.to(`user:${lawyerId}`).emit('new-consultation-request', conversation);

      return res.status(201).json(conversation);
    } catch (error) {
      logger.error('Error creating consultation:', error);
      return res.status(500).json({ message: 'Failed to create consultation' });
    }
  },

  // Get user's consultations
  getMyConsultations: async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user._id;
      const { status, role } = req.query;

      let query: any = {
        $or: [{ seekerId: userId }, { lawyerId: userId }]
      };

      if (status) {
        query.status = status;
      }

      const consultations = await Conversation.find(query)
        .populate('seekerId lawyerId', 'name email avatar role lawyerProfile seekerProfile')
        .sort({ createdAt: -1 });

      // Map consultations to include lawyer and seeker info
      const mappedConsultations = consultations.map(conv => {
        const convObj = conv.toObject();
        
        // Return with populated fields already in seekerId and lawyerId
        return {
          ...convObj,
          lawyer: convObj.lawyerId,
          seeker: convObj.seekerId
        };
      });

      return res.json(mappedConsultations);
    } catch (error) {
      logger.error('Error fetching consultations:', error);
      return res.status(500).json({ message: 'Failed to fetch consultations' });
    }
  },

  // Get consultation by ID
  getConsultationById: async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      const userId = req.user._id;

      const consultation = await Conversation.findOne({
        _id: id,
        $or: [{ seekerId: userId }, { lawyerId: userId }]
      }).populate('seekerId lawyerId', 'name email avatar role lawyerProfile seekerProfile');

      if (!consultation) {
        return res.status(404).json({ message: 'Consultation not found' });
      }

      // Map consultation to include lawyer and seeker info
      const convObj = consultation.toObject();
      
      // Return with lawyer and seeker fields
      return res.json({
        ...convObj,
        lawyer: convObj.lawyerId,
        seeker: convObj.seekerId
      });
    } catch (error) {
      logger.error('Error fetching consultation:', error);
      return res.status(500).json({ message: 'Failed to fetch consultation' });
    }
  },

  // Update consultation status
  updateConsultationStatus: async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const userId = req.user._id;

      const consultation = await Conversation.findOne({
        _id: id,
        $or: [{ seekerId: userId }, { lawyerId: userId }]
      });

      if (!consultation) {
        return res.status(404).json({ message: 'Consultation not found' });
      }

      // Only lawyers can accept/decline, seekers can close
      if (req.user.role === 'lawyer' && ['active', 'closed'].includes(status)) {
        consultation.status = status;
        if (status === 'active') {
          consultation.startTime = new Date();
        }
      } else if (req.user.role === 'activist' && status === 'closed') {
        consultation.status = status;
      } else {
        return res.status(403).json({ message: 'Unauthorized to update status' });
      }

      await consultation.save();
      await consultation.populate('seekerId lawyerId', 'name email avatar role');

      // Emit socket event
      const io = req.app.get('io');
      io.to(`user:${consultation.seekerId}`).emit('consultation-status-updated', consultation);
      io.to(`user:${consultation.lawyerId}`).emit('consultation-status-updated', consultation);

      return res.json(consultation);
    } catch (error) {
      logger.error('Error updating consultation status:', error);
      return res.status(500).json({ message: 'Failed to update consultation status' });
    }
  },

  // Get consultation messages
  getMessages: async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      const userId = req.user._id;

      // Verify user is participant
      const consultation = await Conversation.findOne({
        _id: id,
        $or: [{ seekerId: userId }, { lawyerId: userId }]
      });

      if (!consultation) {
        return res.status(404).json({ message: 'Consultation not found' });
      }

      const messages = await Message.find({ conversationId: id })
        .populate('sender', 'name avatar')
        .sort({ createdAt: 1 });

      return res.json(messages);
    } catch (error) {
      logger.error('Error fetching messages:', error);
      return res.status(500).json({ message: 'Failed to fetch messages' });
    }
  },

  // Send a message
  sendMessage: async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      const { content } = req.body;
      const senderId = req.user._id;

      // Verify user is participant
      const consultation = await Conversation.findOne({
        _id: id,
        $or: [{ seekerId: senderId }, { lawyerId: senderId }]
      });

      if (!consultation) {
        return res.status(404).json({ message: 'Consultation not found' });
      }

      // Create message
      const message = new Message({
        conversationId: id,
        sender: senderId,
        senderId: senderId,
        content,
        attachments: req.files ? (req.files as any[]).map((file: any) => ({
          name: file.originalname,
          url: `/uploads/${file.filename}`,
          type: file.mimetype,
        })) : [],
      });

      await message.save();
      await message.populate('sender', 'name avatar');

      // Update conversation last message
      consultation.lastMessageAt = new Date();
      await consultation.save();

      // Emit socket event
      const io = req.app.get('io');
      io.to(`conversation:${id}`).emit('new-message', message);

      return res.status(201).json(message);
    } catch (error) {
      logger.error('Error sending message:', error);
      return res.status(500).json({ message: 'Failed to send message' });
    }
  },

  // Mark message as read
  markMessageAsRead: async (req: AuthRequest, res: Response) => {
    try {
      const { id, messageId } = req.params;
      const userId = req.user._id;

      // Verify user is participant
      const consultation = await Conversation.findOne({
        _id: id,
        $or: [{ seekerId: userId }, { lawyerId: userId }]
      });

      if (!consultation) {
        return res.status(404).json({ message: 'Consultation not found' });
      }

      const message = await Message.findOneAndUpdate(
        {
          _id: messageId,
          conversationId: id,
          sender: { $ne: userId }, // Can't mark own messages as read
        },
        {
          readAt: new Date(),
        },
        { new: true }
      );

      if (!message) {
        return res.status(404).json({ message: 'Message not found' });
      }

      // Emit socket event
      const io = req.app.get('io');
      io.to(`conversation:${id}`).emit('message-read', {
        messageId: message._id,
        userId,
      });

      return res.json({ message: 'Message marked as read' });
    } catch (error) {
      logger.error('Error marking message as read:', error);
      return res.status(500).json({ message: 'Failed to mark message as read' });
    }
  },

  // Rate and review consultation
  rateConsultation: async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      const { rating, review } = req.body;
      const userId = req.user._id;

      const consultation = await Conversation.findOne({
        _id: id,
        seekerId: userId,
        status: 'closed',
      });

      if (!consultation) {
        return res.status(404).json({ message: 'Consultation not found or not completed' });
      }

      consultation.rating = rating;
      consultation.review = review;
      await consultation.save();

      return res.json(consultation);
    } catch (error) {
      logger.error('Error rating consultation:', error);
      return res.status(500).json({ message: 'Failed to rate consultation' });
    }
  },

  // Get consultation statistics
  getStatistics: async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user._id;
      const userRole = req.user.role;

      const query = userRole === 'lawyer' 
        ? { lawyerId: userId }
        : { seekerId: userId };

      const [total, active, closed, archived] = await Promise.all([
        Conversation.countDocuments(query),
        Conversation.countDocuments({ ...query, status: 'active' }),
        Conversation.countDocuments({ ...query, status: 'closed' }),
        Conversation.countDocuments({ ...query, status: 'archived' }),
      ]);

      const consultationsWithRatings = await Conversation.find({
        ...query,
        status: 'closed',
        rating: { $exists: true },
      });

      const averageRating = consultationsWithRatings.length > 0
        ? consultationsWithRatings.reduce((sum, c) => sum + (c.rating || 0), 0) / consultationsWithRatings.length
        : 0;

      return res.json({
        total,
        active,
        closed,
        archived,
        averageRating,
      });
    } catch (error) {
      logger.error('Error fetching statistics:', error);
      return res.status(500).json({ message: 'Failed to fetch statistics' });
    }
  },
};