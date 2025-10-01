// backend/src/controllers/notificationController.js
import notificationService from '../services/notificationService.js';
import { sendNotificationToUser, sendNotificationToUsers } from '../socket/notificationHandlers.js';

class NotificationController {
    // Tạo notification mới (cho admin) - THÊM REAL-TIME
    // Tạo notification mới (cho admin) - THÊM REAL-TIME
    async createNotification(req, res) {
        try {
            const notificationData = req.body;
            const notificationNamespace = req.notificationNamespace; // LẤY TỪ REQ

            // Validate
            if (!notificationData.user_id) {
                return res.status(400).json({
                    success: false,
                    message: 'user_id is required'
                });
            }

            const notification = await notificationService.createNotification(notificationData);

            // GỬI REAL-TIME ĐẾN USER
            try {
                // Lấy unread count mới
                const unreadCount = await notificationService.getUnreadCount(notificationData.user_id);

                // Gửi real-time qua WebSocket
                sendNotificationToUser(notificationNamespace, notificationData.user_id, {
                    ...notification.toJSON(),
                    unread_count: unreadCount
                });

                console.log(`✅ Real-time notification sent to user ${notificationData.user_id}`);
            } catch (socketError) {
                console.error('WebSocket send error:', socketError);
                // Vẫn trả về response thành công dù socket lỗi
            }

            res.json({
                success: true,
                data: notification
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    // Broadcast notification - THÊM REAL-TIME
    async broadcastNotification(req, res) {
        try {
            const { user_ids, title, message, type, related_entity, entity_id } = req.body;
            const notificationNamespace = req.notificationNamespace; // LẤY TỪ REQ

            // Validate
            if (!user_ids || !Array.isArray(user_ids)) {
                return res.status(400).json({
                    success: false,
                    message: 'user_ids array is required'
                });
            }

            if (!title || !message) {
                return res.status(400).json({
                    success: false,
                    message: 'Title and message are required'
                });
            }

            const results = [];

            // Tạo notification cho từng user
            for (const userId of user_ids) {
                try {
                    const notification = await notificationService.createNotification({
                        user_id: userId,
                        title,
                        message,
                        type: type || 'info',
                        related_entity: related_entity || null,
                        entity_id: entity_id || null
                    });
                    results.push(notification);

                    // GỬI REAL-TIME ĐẾN TỪNG USER
                    try {
                        const unreadCount = await notificationService.getUnreadCount(userId);
                        sendNotificationToUser(notificationNamespace, userId, {
                            ...notification.toJSON(),
                            unread_count: unreadCount
                        });
                        console.log(`✅ Real-time broadcast sent to user ${userId}`);
                    } catch (socketError) {
                        console.error(`WebSocket send error for user ${userId}:`, socketError);
                    }

                } catch (error) {
                    console.error(`Error creating notification for user ${userId}:`, error);
                }
            }

            res.json({
                success: true,
                message: `Notifications sent to ${results.length} users`,
                data: {
                    sent_count: results.length,
                    failed_count: user_ids.length - results.length,
                    notifications: results
                }
            });

        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }


    // Các methods khác giữ nguyên...
    async getUserNotifications(req, res) {
        try {
            const userId = req.user.sub;
            const { page = 1, limit = 20 } = req.query;

            const result = await notificationService.getUserNotifications(
                userId,
                parseInt(page),
                parseInt(limit)
            );

            res.json({
                success: true,
                data: result
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    async markAsRead(req, res) {
        try {
            const userId = req.user.sub;
            const { notificationId } = req.params;

            const notification = await notificationService.markAsRead(notificationId, userId);

            res.json({
                success: true,
                data: notification
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    async markAllAsRead(req, res) {
        try {
            const userId = req.user.sub;
            const result = await notificationService.markAllAsRead(userId);

            res.json({
                success: true,
                data: result
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    async getUnreadCount(req, res) {
        try {
            const userId = req.user.sub;
            const count = await notificationService.getUnreadCount(userId);

            res.json({
                success: true,
                data: { unread_count: count }
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
}

export default new NotificationController();