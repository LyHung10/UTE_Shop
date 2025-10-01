// backend/src/services/notificationService.js
import { Notification, User } from '../models/index.js';

class NotificationService {
  // Tạo notification mới
  async createNotification(notificationData) {
    try {
      const notification = await Notification.create(notificationData);
      return await Notification.findByPk(notification.id, {
        include: [{
          model: User,
          as: 'user',
          attributes: ['id', 'first_name', 'last_name', 'email', 'image']
        }]
      });
    } catch (error) {
      throw new Error(`Could not create notification: ${error.message}`);
    }
  }

  // Lấy notifications của user
  async getUserNotifications(userId, page = 1, limit = 20) {
    try {
      const offset = (page - 1) * limit;
      
      const { count, rows } = await Notification.findAndCountAll({
        where: { user_id: userId },
        include: [{
          model: User,
          as: 'user',
          attributes: ['id', 'first_name', 'last_name', 'email', 'image']
        }],
        order: [['created_at', 'DESC']],
        limit: parseInt(limit),
        offset: offset
      });

      return {
        notifications: rows,
        total: count,
        page: parseInt(page),
        totalPages: Math.ceil(count / limit)
      };
    } catch (error) {
      throw new Error(`Could not fetch notifications: ${error.message}`);
    }
  }

  // Đánh dấu đã đọc
  async markAsRead(notificationId, userId) {
    try {
      const notification = await Notification.findOne({
        where: { 
          id: notificationId,
          user_id: userId 
        }
      });

      if (!notification) {
        throw new Error('Notification not found');
      }

      await notification.update({ is_read: true });
      return notification;
    } catch (error) {
      throw new Error(`Could not mark as read: ${error.message}`);
    }
  }

  // Đánh dấu tất cả đã đọc
  async markAllAsRead(userId) {
    try {
      const result = await Notification.update(
        { is_read: true },
        { 
          where: { 
            user_id: userId,
            is_read: false 
          } 
        }
      );
      
      return { updated: result[0] };
    } catch (error) {
      throw new Error(`Could not mark all as read: ${error.message}`);
    }
  }

  // Đếm số notification chưa đọc
  async getUnreadCount(userId) {
    try {
      return await Notification.count({
        where: { 
          user_id: userId,
          is_read: false 
        }
      });
    } catch (error) {
      throw new Error(`Could not get unread count: ${error.message}`);
    }
  }
}

export default new NotificationService();