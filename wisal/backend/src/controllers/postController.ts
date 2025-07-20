import { Request, Response } from 'express';
import ActivismPost from '../models/ActivismPost';
import { AuthRequest, IActivismPost } from '../types';
import logger from '../utils/logger';
import ElasticsearchService from '../services/elasticsearch';

// Stub implementations
export const getPosts = async (req: Request, res: Response): Promise<void> => {
  try {
    const { category, tags, authorId, page = 1, limit = 20 } = req.query;
    
    const filter: any = { isPublished: true };
    if (category) filter.category = category;
    if (tags) filter.tags = { $in: tags };
    if (authorId) filter.authorId = authorId;

    const posts = await ActivismPost.find(filter)
      .populate('authorId', 'name profilePicture')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await ActivismPost.countDocuments(filter);

    res.json({
      posts,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    logger.error('Get posts error:', error);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
};

export const searchPosts = async (req: Request, res: Response): Promise<void> => {
  try {
    const { 
      q, 
      category,
      tags,
      authorId,
      page = 1, 
      limit = 20 
    } = req.query;
    
    // Use Elasticsearch for advanced search
    const searchResults = await ElasticsearchService.searchActivismPosts({
      query: q as string,
      category: category as string,
      tags: tags ? (Array.isArray(tags) ? tags : [tags]) as string[] : undefined,
      authorId: authorId as string,
      from: (Number(page) - 1) * Number(limit),
      size: Number(limit)
    });

    // Fetch full documents from MongoDB using IDs from Elasticsearch
    const postIds = searchResults.hits.map((hit: any) => hit._id);
    const posts = await ActivismPost.find({ _id: { $in: postIds } })
      .populate('authorId', 'name profilePicture');

    // Maintain Elasticsearch result order
    const orderedPosts = postIds.map(id => 
      posts.find(p => p._id.toString() === id)
    ).filter(Boolean);

    res.json({ 
      posts: orderedPosts,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: searchResults.total.value || searchResults.total,
        pages: Math.ceil((searchResults.total.value || searchResults.total) / Number(limit))
      },
      took: searchResults.took,
      highlights: searchResults.hits.map((hit: any) => hit.highlight)
    });
  } catch (error) {
    logger.error('Search posts error:', error);
    // Fallback to MongoDB search if Elasticsearch fails
    try {
      const { q, page = 1, limit = 20 } = req.query;
      const posts = await ActivismPost.find({
        isPublished: true,
        $text: { $search: q as string }
      })
        .populate('authorId', 'name profilePicture')
        .sort({ score: { $meta: 'textScore' } })
        .limit(Number(limit))
        .skip((Number(page) - 1) * Number(limit));
      
      res.json({ posts });
    } catch (mongoError) {
      res.status(500).json({ error: 'Failed to search posts' });
    }
  }
};

export const getTrendingPosts = async (req: Request, res: Response): Promise<void> => {
  try {
    const posts = await ActivismPost.find({ isPublished: true })
      .populate('authorId', 'name profilePicture')
      .sort({ viewCount: -1, likes: -1, shares: -1 })
      .limit(10);

    res.json(posts);
  } catch (error) {
    logger.error('Get trending posts error:', error);
    res.status(500).json({ error: 'Failed to fetch trending posts' });
  }
};

export const getPost = async (req: Request, res: Response): Promise<void> => {
  try {
    const { postId } = req.params;
    
    const post = await ActivismPost.findById(postId)
      .populate('authorId', 'name profilePicture');

    if (!post || !post.isPublished) {
      res.status(404).json({ error: 'Post not found' });
      return;
    }

    // Increment view count
    post.viewCount += 1;
    await post.save();

    res.json(post);
  } catch (error) {
    logger.error('Get post error:', error);
    res.status(500).json({ error: 'Failed to fetch post' });
  }
};

export const createPost = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const post = await ActivismPost.create({
      authorId: req.user!._id,
      ...req.body,
    });

    // Index in Elasticsearch if published
    if (post.isPublished) {
      try {
        await ElasticsearchService.indexActivismPost(post.toObject() as IActivismPost & { _id: string });
      } catch (esError) {
        logger.error('Failed to index post in Elasticsearch:', esError);
        // Continue even if indexing fails
      }
    }

    res.status(201).json(post);
  } catch (error) {
    logger.error('Create post error:', error);
    res.status(500).json({ error: 'Failed to create post' });
  }
};

export const updatePost = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { postId } = req.params;
    
    const post = await ActivismPost.findOneAndUpdate(
      { _id: postId, authorId: req.user!._id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!post) {
      res.status(404).json({ error: 'Post not found' });
      return;
    }

    // Update in Elasticsearch
    try {
      if (post.isPublished) {
        await ElasticsearchService.updateDocument('activism_posts', postId, {
          ...req.body,
          updatedAt: new Date()
        });
      } else {
        // If unpublished, remove from Elasticsearch
        await ElasticsearchService.deleteDocument('activism_posts', postId);
      }
    } catch (esError) {
      logger.error('Failed to update post in Elasticsearch:', esError);
    }

    res.json(post);
  } catch (error) {
    logger.error('Update post error:', error);
    res.status(500).json({ error: 'Failed to update post' });
  }
};

export const deletePost = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { postId } = req.params;
    
    const post = await ActivismPost.findOneAndDelete({
      _id: postId,
      authorId: req.user!._id,
    });

    if (!post) {
      res.status(404).json({ error: 'Post not found' });
      return;
    }

    // Delete from Elasticsearch
    try {
      await ElasticsearchService.deleteDocument('activism_posts', postId);
    } catch (esError) {
      logger.error('Failed to delete post from Elasticsearch:', esError);
    }

    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    logger.error('Delete post error:', error);
    res.status(500).json({ error: 'Failed to delete post' });
  }
};

export const uploadImages = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { postId } = req.params;
    
    if (!req.files || !Array.isArray(req.files)) {
      res.status(400).json({ error: 'No files uploaded' });
      return;
    }

    const images = req.files.map(file => `/uploads/images/${file.filename}`);
    
    const post = await ActivismPost.findOneAndUpdate(
      { _id: postId, authorId: req.user!._id },
      { $push: { images: { $each: images } } },
      { new: true }
    );

    if (!post) {
      res.status(404).json({ error: 'Post not found' });
      return;
    }

    res.json({ images });
  } catch (error) {
    logger.error('Upload images error:', error);
    res.status(500).json({ error: 'Failed to upload images' });
  }
};

export const likePost = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { postId } = req.params;
    const userId = req.user!._id;

    const post = await ActivismPost.findByIdAndUpdate(
      postId,
      { $addToSet: { likes: userId } },
      { new: true }
    );

    if (!post) {
      res.status(404).json({ error: 'Post not found' });
      return;
    }

    res.json({ likes: post.likes.length });
  } catch (error) {
    logger.error('Like post error:', error);
    res.status(500).json({ error: 'Failed to like post' });
  }
};

export const unlikePost = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { postId } = req.params;
    const userId = req.user!._id;

    const post = await ActivismPost.findByIdAndUpdate(
      postId,
      { $pull: { likes: userId } },
      { new: true }
    );

    if (!post) {
      res.status(404).json({ error: 'Post not found' });
      return;
    }

    res.json({ likes: post.likes.length });
  } catch (error) {
    logger.error('Unlike post error:', error);
    res.status(500).json({ error: 'Failed to unlike post' });
  }
};

export const sharePost = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { postId } = req.params;

    const post = await ActivismPost.findByIdAndUpdate(
      postId,
      { $inc: { shares: 1 } },
      { new: true }
    );

    if (!post) {
      res.status(404).json({ error: 'Post not found' });
      return;
    }

    res.json({ shares: post.shares });
  } catch (error) {
    logger.error('Share post error:', error);
    res.status(500).json({ error: 'Failed to share post' });
  }
};

export const getComments = async (req: Request, res: Response): Promise<void> => {
  try {
    const { postId } = req.params;

    const post = await ActivismPost.findById(postId)
      .populate('comments.userId', 'name profilePicture');

    if (!post) {
      res.status(404).json({ error: 'Post not found' });
      return;
    }

    res.json(post.comments);
  } catch (error) {
    logger.error('Get comments error:', error);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
};

export const addComment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { postId } = req.params;
    const { content } = req.body;

    const post = await ActivismPost.findByIdAndUpdate(
      postId,
      {
        $push: {
          comments: {
            userId: req.user!._id,
            content,
            createdAt: new Date(),
          },
        },
      },
      { new: true }
    );

    if (!post) {
      res.status(404).json({ error: 'Post not found' });
      return;
    }

    const newComment = post.comments[post.comments.length - 1];
    res.status(201).json(newComment);
  } catch (error) {
    logger.error('Add comment error:', error);
    res.status(500).json({ error: 'Failed to add comment' });
  }
};

export const deleteComment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { postId, commentId } = req.params;

    const post = await ActivismPost.findByIdAndUpdate(
      postId,
      {
        $pull: {
          comments: { _id: commentId, userId: req.user!._id },
        },
      },
      { new: true }
    );

    if (!post) {
      res.status(404).json({ error: 'Post or comment not found' });
      return;
    }

    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    logger.error('Delete comment error:', error);
    res.status(500).json({ error: 'Failed to delete comment' });
  }
};