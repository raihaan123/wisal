import mongoose, { Schema } from 'mongoose';
import { ISeekerProfile } from '../types';

const seekerProfileSchema = new Schema<ISeekerProfile>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      unique: true,
      ref: 'User',
    },
    demographics: {
      age: {
        type: Number,
        min: 18,
      },
      gender: {
        type: String,
      },
      location: {
        type: String,
      },
      incomeLevel: {
        type: String,
        enum: ['low', 'medium', 'high', 'prefer_not_to_say'],
      },
    },
    legalHistory: {
      previousConsultations: {
        type: Number,
        default: 0,
      },
      areasOfInterest: [{
        type: String,
      }],
    },
    preferences: {
      communicationMethod: {
        type: String,
        enum: ['chat', 'video', 'phone'],
        default: 'chat',
      },
      languagePreference: {
        type: String,
        default: 'English',
      },
      budgetRange: {
        min: {
          type: Number,
          default: 0,
        },
        max: {
          type: Number,
          default: 500,
        },
      },
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
seekerProfileSchema.index({ userId: 1 });
seekerProfileSchema.index({ 'demographics.location': 1 });
seekerProfileSchema.index({ 'preferences.languagePreference': 1 });

const SeekerProfile = mongoose.model<ISeekerProfile>('SeekerProfile', seekerProfileSchema);

export default SeekerProfile;