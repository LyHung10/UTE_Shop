// frontend/src/services/adminNotificationService.js
import axios from "@/utils/axiosCustomize";

class AdminNotificationService {
  // Gửi thông báo đến user cụ thể
  async sendToUser(notificationData) {
    try {
      console.log('📤 Sending to single user:', notificationData);
      const response = await axios.post('api/notifications/create', notificationData);
      console.log('✅ Single user response:', response);
      return response;
    } catch (error) {
      console.error('❌ Error sending to single user:', error);
      throw new Error(error.message || 'Failed to send notification');
    }
  }

  // Gửi thông báo đến nhiều users
  async sendToUsers(userIds, notificationData) {
    try {
      console.log('📤 Sending to multiple users:', userIds);
      
      // ĐẢM BẢO user_ids là mảng số
      const payload = {
        ...notificationData,
        user_ids: Array.isArray(userIds) ? userIds : [userIds]
      };
      
      console.log('📦 Payload for broadcast:', payload);
      
      const response = await axios.post('api/notifications/broadcast', payload);
      console.log('✅ Multiple users response:', response);
      return response;
    } catch (error) {
      console.error('❌ Error sending to multiple users:', error);
      throw new Error(error.message || 'Failed to send notifications to users');
    }
  }

  // Gửi thông báo đến tất cả users (broadcast)
  async broadcast(notificationData) {
    try {
      console.log('📢 Starting broadcast to all users...');
      
      // LẤY DANH SÁCH USERS THỰC TẾ
      const usersResponse = await this.getUsers('');
      const allUsers = usersResponse.data?.users || usersResponse.data || [];
      
      console.log('👥 Found users for broadcast:', allUsers.length);
      
      if (allUsers.length === 0) {
        throw new Error('Không tìm thấy users nào trong hệ thống');
      }

      const userIds = allUsers.map(user => user.id);
      console.log('📋 User IDs for broadcast:', userIds);
      
      if (userIds.length === 0) {
        throw new Error('Không có user IDs hợp lệ để gửi');
      }
      
      // Gửi đến tất cả users
      const response = await this.sendToUsers(userIds, notificationData);
      return response;
    } catch (error) {
      console.error('❌ Error in broadcast:', error);
      throw new Error(error.message || 'Failed to broadcast notification: ' + error.message);
    }
  }

  // Lấy danh sách users (cho dropdown)
  async getUsers(search = '') {
    try {
      console.log('🔍 Fetching users with search:', search);
      const response = await axios.get('api/admin/users', {
        params: { search, limit: 100 } // Tăng limit để lấy nhiều users hơn
      });
      console.log('✅ Users found:', response.data?.users?.length || response.data?.length || 0);
      return response;
    } catch (error) {
      console.error('❌ Error fetching users:', error);
      throw new Error(error.message || 'Failed to fetch users');
    }
  }
}

export default new AdminNotificationService();