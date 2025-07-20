import mongoose, { Schema } from 'mongoose';
import { IActivismPost } from '../types';

const activismPostSchema = new Schema<IActivismPost>(
  {
    authorId: {
      type: String,
      required: true,
      ref: 'User',
    },
    title: {
      type: String,
      required: true,
      maxLength: 200,
    },
    content: {
      type: String,
      required: true,
      maxLength: 10000,
    },
    category: {
      type: String,
      required: true,
    },
    tags: [{
      type: String,
    }],
    images: [{
      type: String,
    }],
    likes: [{
      type: String,
      ref: 'User',
    }],
    shares: {
      type: Number,
      default: 0,
    },
    comments: [{
      userId: {
        type: String,
        required: true,
        ref: 'User',
      },
      content: {
        type: String,
        required: true,
        maxLength: 1000,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
    }],
    isPublished: {
      type: Boolean,
      default: true,
    },
    publishedAt: {
      type: Date,
    },
    viewCount: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'draft',
    },
    // Fields not in IActivismPost interface - commented out
    // moderatedBy: {
    //   type: String,
    //   ref: 'User',
    // },
    // moderatedAt: {
    //   type: Date,
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
activismPostSchema.index({ authorId: 1, status: 1 });
activismPostSchema.index({ category: 1, status: 1 });
activismPostSchema.index({ tags: 1 });
activismPostSchema.index({ status: 1, createdAt: -1 });
activismPostSchema.index({ likes: 1 });

// Text index for search
activismPostSchema.index({ title: 'text', content: 'text', tags: 'text' });

// Set publishedAt when publishing
activismPostSchema.pre('save', function (next) {
  if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  next();
});

const ActivismPost = mongoose.model<IActivismPost>('ActivismPost', activismPostSchema);

export default ActivismPost;