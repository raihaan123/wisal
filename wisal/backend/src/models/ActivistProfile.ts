import mongoose, { Schema } from 'mongoose';
import { IActivistProfile } from '../types';

const activistProfileSchema = new Schema<IActivistProfile>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    organization: {
      type: String,
      trim: true,
    },
    causes: [{
      type: String,
      trim: true,
    }],
    verificationStatus: {
      type: String,
      enum: ['pending', 'verified', 'rejected'],
      default: 'pending',
      required: true,
    },
    verifiedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    verifiedAt: {
      type: Date,
    },
    postsCount: {
      type: Number,
      default: 0,
    },
    followers: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
    }],
  },
  {
    timestamps: true,
  }
);

// Index for userId lookup
activistProfileSchema.index({ userId: 1 });
activistProfileSchema.index({ causes: 1 });
activistProfileSchema.index({ verificationStatus: 1 });

const ActivistProfile = mongoose.model<IActivistProfile>('ActivistProfile', activistProfileSchema);

export default ActivistProfile;