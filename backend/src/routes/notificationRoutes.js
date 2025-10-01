// backend/src/routes/notificationRoutes.js
import express from 'express';
import notificationController from '../controllers/notificationController.js';
import {authenticateToken} from '../middleware/auth.js';

const router = express.Router();

// Tất cả routes cần authentication
router.use(authenticateToken);

// User routes
router.get('/my-notifications', notificationController.getUserNotifications);
router.get('/unread-count', notificationController.getUnreadCount);
router.patch('/mark-as-read/:notificationId', notificationController.markAsRead);
router.patch('/mark-all-read', notificationController.markAllAsRead);

// Admin routes (thêm authorization middleware nếu cần)
router.post('/create', notificationController.createNotification);
router.post('/broadcast', notificationController.broadcastNotification);

export default router;