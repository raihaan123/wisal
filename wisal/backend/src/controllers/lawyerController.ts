import { Request, Response } from 'express';
import LawyerProfile from '../models/LawyerProfile';
import User from '../models/User';
import { AuthRequest, ILawyerProfile } from '../types';
import logger from '../utils/logger';
import ElasticsearchService from '../services/elasticsearch';
import { transformLawyerProfileForFrontend } from '../utils/transformers';

export const searchLawyers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { 
      q,
      practiceAreas,
      licenseState,
      languages,
      minRate,
      maxRate,
      minExperience,
      verified,
      page = 1, 
      limit = 20 
    } = req.query;
    
    // Use Elasticsearch for advanced search
    const searchResults = await ElasticsearchService.searchLawyerProfiles({
      query: q as string,
      practiceAreas: practiceAreas ? (Array.isArray(practiceAreas) ? practiceAreas : [practiceAreas]) as string[] : undefined,
      licenseState: licenseState as string,
      languages: languages ? (Array.isArray(languages) ? languages : [languages]) as string[] : undefined,
      minRate: minRate ? Number(minRate) : undefined,
      maxRate: maxRate ? Number(maxRate) : undefined,
      minExperience: minExperience ? Number(minExperience) : undefined,
      verified: verified === 'true' ? true : verified === 'false' ? false : undefined,
      from: (Number(page) - 1) * Number(limit),
      size: Number(limit)
    });

    // Fetch full documents from MongoDB using IDs from Elasticsearch
    const profileIds = searchResults.hits.map((hit: any) => hit._id);
    const profiles = await LawyerProfile.find({ _id: { $in: profileIds } })
      .populate('userId', 'name profilePicture email');

    // Maintain Elasticsearch result order
    const orderedProfiles = profileIds.map(id => 
      profiles.find(p => p._id.toString() === id)
    ).filter(Boolean);

    // Transform profiles to match frontend expectations
    const transformedLawyers = orderedProfiles.map(profile => 
      transformLawyerProfileForFrontend(profile)
    );

    res.json({
      lawyers: transformedLawyers,
      total: searchResults.total.value || searchResults.total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil((searchResults.total.value || searchResults.total) / Number(limit))
    });
  } catch (error) {
    logger.error('Search lawyers error:', error);
    // Fallback to MongoDB search if Elasticsearch fails
    try {
      const { page = 1, limit = 20 } = req.query;
      const lawyerProfiles = await LawyerProfile.find({ verified: true })
        .populate('userId', 'name profilePicture email')
        .sort({ 'rating.average': -1 })
        .limit(Number(limit))
        .skip((Number(page) - 1) * Number(limit));

      const total = await LawyerProfile.countDocuments({ verified: true });

      // Transform profiles to match frontend expectations
      const transformedLawyers = lawyerProfiles.map(profile => 
        transformLawyerProfileForFrontend(profile)
      );

      res.json({
        lawyers: transformedLawyers,
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit))
      });
    } catch (mongoError) {
      res.status(500).json({ error: 'Failed to search lawyers' });
    }
  }
};

export const getLawyerProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const { lawyerId } = req.params;
    
    const profile = await LawyerProfile.findById(lawyerId)
      .populate('userId', 'name profilePicture email');

    if (!profile) {
      res.status(404).json({ error: 'Lawyer profile not found' });
      return;
    }

    res.json(profile);
  } catch (error) {
    logger.error('Get lawyer profile error:', error);
    res.status(500).json({ error: 'Failed to fetch lawyer profile' });
  }
};

export const createLawyerProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!._id;
    
    // Check if profile already exists
    const existingProfile = await LawyerProfile.findOne({ userId });
    if (existingProfile) {
      res.status(400).json({ error: 'Lawyer profile already exists' });
      return;
    }

    const profile = await LawyerProfile.create({
      userId,
      ...req.body,
    });

    // Index in Elasticsearch
    try {
      await ElasticsearchService.indexLawyerProfile(profile.toObject() as ILawyerProfile & { _id: string });
    } catch (esError) {
      logger.error('Failed to index lawyer profile in Elasticsearch:', esError);
      // Continue even if indexing fails
    }

    res.status(201).json(profile);
  } catch (error) {
    logger.error('Create lawyer profile error:', error);
    res.status(500).json({ error: 'Failed to create lawyer profile' });
  }
};

export const updateLawyerProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { lawyerId } = req.params;
    
    const profile = await LawyerProfile.findOneAndUpdate(
      { _id: lawyerId, userId: req.user!._id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!profile) {
      res.status(404).json({ error: 'Lawyer profile not found' });
      return;
    }

    // Update in Elasticsearch
    try {
      await ElasticsearchService.updateDocument('lawyer_profiles', lawyerId, {
        ...req.body,
        updatedAt: new Date()
      });
    } catch (esError) {
      logger.error('Failed to update lawyer profile in Elasticsearch:', esError);
    }

    res.json(profile);
  } catch (error) {
    logger.error('Update lawyer profile error:', error);
    res.status(500).json({ error: 'Failed to update lawyer profile' });
  }
};

export const uploadVerificationDocs = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { lawyerId } = req.params;
    
    if (!req.files || !Array.isArray(req.files)) {
      res.status(400).json({ error: 'No files uploaded' });
      return;
    }

    const documents = req.files.map(file => `/uploads/documents/${file.filename}`);
    
    const profile = await LawyerProfile.findOneAndUpdate(
      { _id: lawyerId, userId: req.user!._id },
      { $push: { verificationDocuments: { $each: documents } } },
      { new: true }
    );

    if (!profile) {
      res.status(404).json({ error: 'Lawyer profile not found' });
      return;
    }

    res.json({ documents });
  } catch (error) {
    logger.error('Upload verification docs error:', error);
    res.status(500).json({ error: 'Failed to upload documents' });
  }
};

export const updateAvailability = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { lawyerId } = req.params;
    const { availability } = req.body;

    const profile = await LawyerProfile.findOneAndUpdate(
      { _id: lawyerId, userId: req.user!._id },
      { availability },
      { new: true }
    );

    if (!profile) {
      res.status(404).json({ error: 'Lawyer profile not found' });
      return;
    }

    res.json(profile);
  } catch (error) {
    logger.error('Update availability error:', error);
    res.status(500).json({ error: 'Failed to update availability' });
  }
};

export const getLawyerReviews = async (req: Request, res: Response): Promise<void> => {
  try {
    // Implementation would fetch reviews from Review model
    res.json({ reviews: [], pagination: {} });
  } catch (error) {
    logger.error('Get lawyer reviews error:', error);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
};

export const getLawyerStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Implementation would calculate lawyer statistics
    res.json({ stats: {} });
  } catch (error) {
    logger.error('Get lawyer stats error:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
};

export const verifyLawyer = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { lawyerId } = req.params;
    const { isVerified } = req.body;

    const profile = await LawyerProfile.findByIdAndUpdate(
      lawyerId,
      { verified: isVerified, verifiedAt: isVerified ? new Date() : undefined },
      { new: true }
    );

    if (!profile) {
      res.status(404).json({ error: 'Lawyer profile not found' });
      return;
    }

    // Update verification status in Elasticsearch
    try {
      await ElasticsearchService.updateDocument('lawyer_profiles', lawyerId, {
        verified: isVerified,
        verifiedAt: isVerified ? new Date() : undefined
      });
    } catch (esError) {
      logger.error('Failed to update lawyer verification in Elasticsearch:', esError);
    }

    res.json(profile);
  } catch (error) {
    logger.error('Verify lawyer error:', error);
    res.status(500).json({ error: 'Failed to verify lawyer' });
  }
};