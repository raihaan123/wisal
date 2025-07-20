import { Request, Response } from 'express';
import LegalQuery from '../models/LegalQuery';
import { AuthRequest, ILegalQuery } from '../types';
import logger from '../utils/logger';
import ElasticsearchService from '../services/elasticsearch';

// Stub implementations
export const getQueries = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 20, category, status, urgencyLevel } = req.query;
    
    const filter: any = {};
    if (category) filter.category = category;
    if (status) filter.status = status;
    if (urgencyLevel) filter.urgencyLevel = urgencyLevel;

    const queries = await LegalQuery.find(filter)
      .populate('seekerId', 'name')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await LegalQuery.countDocuments(filter);

    res.json({
      queries,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    logger.error('Get queries error:', error);
    res.status(500).json({ error: 'Failed to fetch queries' });
  }
};

export const searchQueries = async (req: Request, res: Response): Promise<void> => {
  try {
    const { 
      q, 
      category, 
      urgencyLevel, 
      status, 
      minBudget, 
      maxBudget, 
      page = 1, 
      limit = 20,
      sortBy = 'relevance'
    } = req.query;
    
    // Use Elasticsearch for advanced search
    const searchResults = await ElasticsearchService.searchLegalQueries({
      query: q as string,
      category: category as string,
      urgencyLevel: urgencyLevel as string,
      status: status as string,
      minBudget: minBudget ? Number(minBudget) : undefined,
      maxBudget: maxBudget ? Number(maxBudget) : undefined,
      from: (Number(page) - 1) * Number(limit),
      size: Number(limit),
      sortBy: sortBy as any
    });

    // Fetch full documents from MongoDB using IDs from Elasticsearch
    const queryIds = searchResults.hits.map((hit: any) => hit._id);
    const queries = await LegalQuery.find({ _id: { $in: queryIds } })
      .populate('seekerId', 'name');

    // Maintain Elasticsearch result order
    const orderedQueries = queryIds.map(id => 
      queries.find(q => q._id.toString() === id)
    ).filter(Boolean);

    res.json({ 
      queries: orderedQueries,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: searchResults.total.value || searchResults.total,
        pages: Math.ceil((searchResults.total.value || searchResults.total) / Number(limit))
      },
      took: searchResults.took
    });
  } catch (error) {
    logger.error('Search queries error:', error);
    // Fallback to MongoDB search if Elasticsearch fails
    try {
      const { q, page = 1, limit = 20 } = req.query;
      const queries = await LegalQuery.find({
        $text: { $search: q as string }
      })
        .populate('seekerId', 'name')
        .sort({ score: { $meta: 'textScore' } })
        .limit(Number(limit))
        .skip((Number(page) - 1) * Number(limit));
      
      res.json({ queries });
    } catch (mongoError) {
      res.status(500).json({ error: 'Failed to search queries' });
    }
  }
};

export const getQuery = async (req: Request, res: Response): Promise<void> => {
  try {
    const { queryId } = req.params;
    
    const query = await LegalQuery.findById(queryId)
      .populate('seekerId', 'name profilePicture')
      .populate('assignedLawyers', 'name profilePicture');

    if (!query) {
      res.status(404).json({ error: 'Query not found' });
      return;
    }

    // Increment view count
    query.viewCount += 1;
    await query.save();

    res.json(query);
  } catch (error) {
    logger.error('Get query error:', error);
    res.status(500).json({ error: 'Failed to fetch query' });
  }
};

export const createQuery = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const query = await LegalQuery.create({
      seekerId: req.user!._id,
      ...req.body,
    });

    // Index in Elasticsearch
    try {
      await ElasticsearchService.indexLegalQuery(query.toObject() as ILegalQuery & { _id: string });
    } catch (esError) {
      logger.error('Failed to index query in Elasticsearch:', esError);
      // Continue even if indexing fails
    }

    res.status(201).json(query);
  } catch (error) {
    logger.error('Create query error:', error);
    res.status(500).json({ error: 'Failed to create query' });
  }
};

export const updateQuery = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { queryId } = req.params;
    
    const query = await LegalQuery.findOneAndUpdate(
      { _id: queryId, seekerId: req.user!._id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!query) {
      res.status(404).json({ error: 'Query not found' });
      return;
    }

    // Update in Elasticsearch
    try {
      await ElasticsearchService.updateDocument('legal_queries', queryId, {
        ...req.body,
        updatedAt: new Date()
      });
    } catch (esError) {
      logger.error('Failed to update query in Elasticsearch:', esError);
    }

    res.json(query);
  } catch (error) {
    logger.error('Update query error:', error);
    res.status(500).json({ error: 'Failed to update query' });
  }
};

export const deleteQuery = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { queryId } = req.params;
    
    const query = await LegalQuery.findOneAndDelete({
      _id: queryId,
      seekerId: req.user!._id,
    });

    if (!query) {
      res.status(404).json({ error: 'Query not found' });
      return;
    }

    // Delete from Elasticsearch
    try {
      await ElasticsearchService.deleteDocument('legal_queries', queryId);
    } catch (esError) {
      logger.error('Failed to delete query from Elasticsearch:', esError);
    }

    res.json({ message: 'Query deleted successfully' });
  } catch (error) {
    logger.error('Delete query error:', error);
    res.status(500).json({ error: 'Failed to delete query' });
  }
};

export const uploadAttachments = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { queryId } = req.params;
    
    if (!req.files || !Array.isArray(req.files)) {
      res.status(400).json({ error: 'No files uploaded' });
      return;
    }

    const attachments = req.files.map(file => `/uploads/files/${file.filename}`);
    
    const query = await LegalQuery.findOneAndUpdate(
      { _id: queryId, seekerId: req.user!._id },
      { $push: { attachments: { $each: attachments } } },
      { new: true }
    );

    if (!query) {
      res.status(404).json({ error: 'Query not found' });
      return;
    }

    res.json({ attachments });
  } catch (error) {
    logger.error('Upload attachments error:', error);
    res.status(500).json({ error: 'Failed to upload attachments' });
  }
};

export const assignLawyer = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { queryId } = req.params;
    const { lawyerId } = req.body;

    const query = await LegalQuery.findOneAndUpdate(
      { _id: queryId, seekerId: req.user!._id },
      { 
        $addToSet: { assignedLawyers: lawyerId },
        status: 'in_progress'
      },
      { new: true }
    );

    if (!query) {
      res.status(404).json({ error: 'Query not found' });
      return;
    }

    res.json(query);
  } catch (error) {
    logger.error('Assign lawyer error:', error);
    res.status(500).json({ error: 'Failed to assign lawyer' });
  }
};

export const getQueryResponses = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Implementation would fetch responses from Response model
    res.json({ responses: [] });
  } catch (error) {
    logger.error('Get query responses error:', error);
    res.status(500).json({ error: 'Failed to fetch responses' });
  }
};

export const respondToQuery = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Implementation would create a response
    res.status(201).json({ message: 'Response sent successfully' });
  } catch (error) {
    logger.error('Respond to query error:', error);
    res.status(500).json({ error: 'Failed to respond to query' });
  }
};