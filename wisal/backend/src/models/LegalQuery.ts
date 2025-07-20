import mongoose, { Schema } from 'mongoose';
import { ILegalQuery } from '../types';

const legalQuerySchema = new Schema<ILegalQuery>(
  {
    seekerId: {
      type: String,
      required: true,
      ref: 'User',
    },
    title: {
      type: String,
      required: true,
      maxLength: 200,
    },
    description: {
      type: String,
      required: true,
      maxLength: 5000,
    },
    category: {
      type: String,
      required: true,
    },
    urgencyLevel: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    budget: {
      type: Number,
      required: true,
      min: 0,
    },
    isAnonymous: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ['open', 'in_progress', 'resolved', 'closed'],
      default: 'open',
    },
    attachments: [{
      type: String,
    }],
    tags: [{
      type: String,
    }],
    viewCount: {
      type: Number,
      default: 0,
    },
    responseCount: {
      type: Number,
      default: 0,
    },
    assignedLawyer: {
      type: String,
      ref: 'User',
    },
    flaggedForReview: {
      type: Boolean,
      default: false,
    },
    moderatedBy: {
      type: String,
      ref: 'User',
    },
    moderatedAt: {
      type: Date,
    },
    // moderationAction not in ILegalQuery interface - commented out
    // moderationAction: {
    //   type: String,
    //   enum: ['approve', 'reject', 'flag'],
    // },
    // moderationReason: {
    //   type: String,
    // },
  },
  {
    timestamps: true,
  }
);

// Indexes
legalQuerySchema.index({ seekerId: 1, status: 1 });
legalQuerySchema.index({ category: 1, status: 1 });
legalQuerySchema.index({ urgencyLevel: 1, status: 1 });
legalQuerySchema.index({ createdAt: -1 });
legalQuerySchema.index({ tags: 1 });
legalQuerySchema.index({ status: 1, createdAt: -1 });

// Text index for search
legalQuerySchema.index({ title: 'text', description: 'text', tags: 'text' });

const LegalQuery = mongoose.model<ILegalQuery>('LegalQuery', legalQuerySchema);

export default LegalQuery;