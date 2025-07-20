import { Router } from 'express';
import { body, param, query } from 'express-validator';
import * as postController from '../controllers/postController';
import { authenticate, optionalAuth } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { upload } from '../middleware/upload';

const router = Router();

// Get posts (public)
router.get(
  '/',
  optionalAuth,
  [
    query('category').optional(),
    query('tags').optional(),
    query('authorId').optional().isMongoId(),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
  ],
  validate,
  postController.getPosts
);

// Search posts
router.get(
  '/search',
  optionalAuth,
  [
    query('q').trim().notEmpty(),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
  ],
  validate,
  postController.searchPosts
);

// Get trending posts
router.get(
  '/trending',
  optionalAuth,
  validate,
  postController.getTrendingPosts
);

// Get single post
router.get(
  '/:postId',
  optionalAuth,
  param('postId').isMongoId(),
  validate,
  postController.getPost
);

// Create post
router.post(
  '/',
  authenticate,
  [
    body('title').trim().isLength({ min: 10, max: 200 }),
    body('content').trim().isLength({ min: 100, max: 10000 }),
    body('category').trim().notEmpty(),
    body('tags').optional().isArray(),
  ],
  validate,
  postController.createPost
);

// Update post
router.put(
  '/:postId',
  authenticate,
  param('postId').isMongoId(),
  validate,
  postController.updatePost
);

// Delete post
router.delete(
  '/:postId',
  authenticate,
  param('postId').isMongoId(),
  validate,
  postController.deletePost
);

// Upload images
router.post(
  '/:postId/images',
  authenticate,
  param('postId').isMongoId(),
  upload.array('images', 5),
  validate,
  postController.uploadImages
);

// Like post
router.post(
  '/:postId/like',
  authenticate,
  param('postId').isMongoId(),
  validate,
  postController.likePost
);

// Unlike post
router.delete(
  '/:postId/like',
  authenticate,
  param('postId').isMongoId(),
  validate,
  postController.unlikePost
);

// Share post
router.post(
  '/:postId/share',
  authenticate,
  param('postId').isMongoId(),
  validate,
  postController.sharePost
);

// Get comments
router.get(
  '/:postId/comments',
  optionalAuth,
  param('postId').isMongoId(),
  validate,
  postController.getComments
);

// Add comment
router.post(
  '/:postId/comments',
  authenticate,
  param('postId').isMongoId(),
  body('content').trim().notEmpty().isLength({ max: 1000 }),
  validate,
  postController.addComment
);

// Delete comment
router.delete(
  '/:postId/comments/:commentId',
  authenticate,
  [
    param('postId').isMongoId(),
    param('commentId').isMongoId(),
  ],
  validate,
  postController.deleteComment
);

export default router;