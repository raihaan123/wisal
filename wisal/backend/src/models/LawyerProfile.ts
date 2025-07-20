import mongoose, { Schema } from 'mongoose';
import { ILawyerProfile } from '../types';

const lawyerProfileSchema = new Schema<ILawyerProfile>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      unique: true,
      ref: 'User',
    },
    // MongoDB validation required fields
    location: {
      postcode: {
        type: String,
        required: false,
        default: '',
      },
      city: {
        type: String,
        required: false,
        default: '',
      },
      country: {
        type: String,
        required: false,
        default: '',
      },
    },
    specialisms: [{
      type: String,
      required: true,
    }],
    qualifiedSince: {
      type: Number,
      required: true,
      default: () => new Date().getFullYear(),
    },
    currentRole: {
      type: String,
      required: false,
      default: '',
    },
    employer: {
      type: String,
      required: false,
      default: '',
    },
    barNumber: {
      type: String,
      required: false,
      unique: true,
      sparse: true, // Allow multiple null values
    },
    licenseState: {
      type: String,
      required: false,
    },
    practiceAreas: [{
      type: String,
      required: true,
    }],
    yearsOfExperience: {
      type: Number,
      required: true,
      min: 0,
    },
    education: [{
      degree: {
        type: String,
        required: true,
      },
      institution: {
        type: String,
        required: true,
      },
      year: {
        type: Number,
        required: true,
      },
    }],
    certifications: [{
      type: String,
    }],
    languages: [{
      type: String,
      required: true,
    }],
    bio: {
      type: String,
      required: false,
      maxLength: 2000,
      default: '',
    },
    hourlyRate: {
      type: Number,
      required: true,
      min: 0,
    },
    consultationFee: {
      type: Number,
      required: true,
      min: 0,
    },
    availability: {
      days: [{
        type: String,
      }],
      hours: [{
        day: {
          type: String,
          required: true,
        },
        start: {
          type: String,
          required: true,
        },
        end: {
          type: String,
          required: true,
        },
      }],
    },
    rating: {
      average: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
      },
      count: {
        type: Number,
        default: 0,
      },
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
    completedConsultations: {
      type: Number,
      default: 0,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    verificationDocuments: [{
      type: String,
    }],
    verifiedAt: {
      type: Date,
    },
    verifiedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    verificationNotes: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for search
lawyerProfileSchema.index({ practiceAreas: 1 });
lawyerProfileSchema.index({ licenseState: 1 });
lawyerProfileSchema.index({ languages: 1 });
lawyerProfileSchema.index({ hourlyRate: 1 });
lawyerProfileSchema.index({ 'rating.average': -1 });
lawyerProfileSchema.index({ verified: 1 });

// Compound index for complex searches
lawyerProfileSchema.index({
  practiceAreas: 1,
  licenseState: 1,
  'rating.average': -1,
  hourlyRate: 1,
});

const LawyerProfile = mongoose.model<ILawyerProfile>('LawyerProfile', lawyerProfileSchema);

export default LawyerProfile;