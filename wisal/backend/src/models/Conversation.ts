import mongoose, { Schema } from 'mongoose';
import { IConversation } from '../types';

const conversationSchema = new Schema<IConversation>(
  {
    queryId: {
      type: String,
      ref: 'LegalQuery',
    },
    seekerId: {
      type: String,
      required: true,
      ref: 'User',
    },
    lawyerId: {
      type: String,
      required: true,
      ref: 'User',
    },
    status: {
      type: String,
      enum: ['active', 'closed', 'archived'],
      default: 'active',
      required: true,
    },
    type: {
      type: String,
      enum: ['consultation', 'general'],
      required: true,
    },
    startTime: {
      type: Date,
      required: true,
      default: Date.now,
    },
    endTime: {
      type: Date,
    },
    duration: {
      type: Number, // in minutes
    },
    price: {
      type: Number,
      min: 0,
    },
    totalCost: {
      type: Number,
      min: 0,
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
    messages: [{
      type: String,
      ref: 'Message',
    }],
    lastMessageAt: {
      type: Date,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    review: {
      type: String,
      maxLength: 1000,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
conversationSchema.index({ seekerId: 1, status: 1 });
conversationSchema.index({ lawyerId: 1, status: 1 });
conversationSchema.index({ queryId: 1 });
conversationSchema.index({ status: 1, createdAt: -1 });
conversationSchema.index({ isPaid: 1, status: 1 });

// Compound index for user conversations
conversationSchema.index({ seekerId: 1, lawyerId: 1, status: 1 });

const Conversation = mongoose.model<IConversation>('Conversation', conversationSchema);

export default Conversation;