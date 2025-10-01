// frontend/src/services/notificationService.js
import axiosCustomize from "@/utils/axiosCustomize";

class NotificationService {
  // Lấy danh sách thông báo
  async getNotifications(page = 1, limit = 10) {
    try {
      const response = await axiosCustomize.get(`api/notifications/my-notifications`, {
        params: { page, limit }
      });
      // XÓA .data VÌ AXIOS CUSTOMIZE ĐÃ TRẢ VỀ DATA RỒI
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch notifications');
    }
  }

  // Đánh dấu đã đọc
  async markAsRead(notificationId) {
    try {
      const response = await axiosCustomize.patch(`api/notifications/mark-as-read/${notificationId}`);
      // XÓA .data
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to mark as read');
    }
  }

  // Đánh dấu tất cả đã đọc
  async markAllAsRead() {
    try {
      const response = await axiosCustomize.patch('api/notifications/mark-all-read');
      // XÓA .data
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to mark all as read');
    }
  }

  // Lấy số lượng chưa đọc
  async getUnreadCount() {
    try {
      const response = await axiosCustomize.get('api/notifications/unread-count');
      // XÓA .data
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to get unread count');
    }
  }
}

export default new NotificationService();