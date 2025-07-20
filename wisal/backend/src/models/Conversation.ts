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
      enum: ['active', 'completed', 'cancelled'],
      default: 'active',
    },
    type: {
      type: String,
      enum: ['consultation', 'general'],
      default: 'consultation',
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
      required: true,
      min: 0,
    },
    isPaid: {
      type: Boolean,
      default: false,
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