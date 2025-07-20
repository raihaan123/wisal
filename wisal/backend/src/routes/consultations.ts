import express from 'express';
import { consultationController } from '../controllers/consultationController';
import { authenticate } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Create a new consultation request
router.post('/', consultationController.createConsultation);

// Get user's consultations
router.get('/my', consultationController.getMyConsultations);

// Get consultation statistics
router.get('/statistics', consultationController.getStatistics);

// Get consultation by ID
router.get('/:id', consultationController.getConsultationById);

// Update consultation status
router.put('/:id/status', consultationController.updateConsultationStatus);

// Get consultation messages
router.get('/:id/messages', consultationController.getMessages);

// Send a message (with file upload support)
router.post(
  '/:id/messages',
  upload.array('attachments', 5),
  consultationController.sendMessage
);

// Mark message as read
router.put('/:id/messages/:messageId/read', consultationController.markMessageAsRead);

// Rate and review consultation
router.post('/:id/review', consultationController.rateConsultation);

export default router;