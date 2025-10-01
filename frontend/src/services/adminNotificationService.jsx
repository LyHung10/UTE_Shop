// frontend/src/services/adminNotificationService.js
import axios from "@/utils/axiosCustomize";

class AdminNotificationService {
  // Gửi thông báo đến user cụ thể
  async sendToUser(notificationData) {
    try {
      const response = await axios.post('api/notifications/create', notificationData);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to send notification');
    }
  }

  // Gửi thông báo đến nhiều users
  async sendToUsers(userIds, notificationData) {
    try {
      // SỬA: Gọi API broadcast với user_ids
      const response = await axios.post('api/notifications/broadcast', {
        ...notificationData,
        user_ids: userIds
      });
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to send notifications to users');
    }
  }

  // Gửi thông báo đến tất cả users (broadcast)
  async broadcast(notificationData) {
    try {
      // SỬA: Cần API để lấy tất cả user IDs hoặc broadcast thực sự
      // Tạm thời gửi đến một danh sách user cố định hoặc để trống
      console.warn('Broadcast to all users - need implementation');

      // Nếu backend hỗ trợ broadcast thực sự:
      const response = await axios.post('api/notifications/broadcast', {
        ...notificationData,
        user_ids: [] // hoặc null để chỉ định broadcast to all
      });
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to broadcast notification');
    }
  }

  // Lấy danh sách users (cho dropdown)
  async getUsers(search = '') {
    try {
      const response = await axios.get('api/users', {
        params: { search, limit: 50 }
      });
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch users');
    }
  }
}

export default new AdminNotificationService();