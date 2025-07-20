import mongoose, { Schema } from 'mongoose';
import { IMessage } from '../types';

const messageSchema = new Schema<IMessage>(
  {
    conversationId: {
      type: String,
      required: true,
      ref: 'Conversation',
    },
    senderId: {
      type: String,
      required: true,
      ref: 'User',
    },
    content: {
      type: String,
      required: true,
      maxLength: 10000,
    },
    type: {
      type: String,
      enum: ['text', 'file', 'image', 'system'],
      default: 'text',
    },
    attachments: [{
      url: {
        type: String,
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
      size: {
        type: Number,
        required: true,
      },
      type: {
        type: String,
        required: true,
      },
    }],
    // isRead not in IMessage interface - using readBy array instead
    // isRead: {
    //   type: Boolean,
    //   default: false,
    // },
    // readAt: {
    //   type: Date,
    // },
    readBy: [{
      userId: {
        type: String,
        ref: 'User',
      },
      readAt: {
        type: Date,
        default: Date.now,
      },
    }],
    // isEdited: {
    //   type: Boolean,
    //   default: false,
    // },
    editedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
messageSchema.index({ conversationId: 1, createdAt: 1 });
messageSchema.index({ senderId: 1 });
messageSchema.index({ isRead: 1, conversationId: 1 });

// Compound index for conversation messages
messageSchema.index({ conversationId: 1, senderId: 1, createdAt: -1 });

const Message = mongoose.model<IMessage>('Message', messageSchema);

export default Message;