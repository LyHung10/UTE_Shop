import express from 'express';
import ChatController from '../controllers/chatController.js';
import { authAdmin, authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Public routes (guest có thể sử dụng)
router.post('/sessions', ChatController.createSession);
router.post('/messages', ChatController.sendMessage);
router.get('/messages/:sessionId', ChatController.getMessages);
router.put('/sessions/:sessionId/rating', ChatController.rateSatisfaction);

// Admin routes
router.get('/admin/sessions', authAdmin, ChatController.getSessions);
router.get('/admin/stats', authAdmin, ChatController.getStats);
router.put('/admin/sessions/:sessionId', authAdmin, ChatController.updateSession);
router.post('/admin/messages', authAdmin, ChatController.sendAdminMessage);
router.post('/sessions/:sessionId/read', authAdmin, ChatController.markMessagesAsRead);
export default router;