// backend/src/socket/notificationHandlers.js
import notificationService from '../services/notificationService.js';

// Map để lưu trữ userID và socketID
const userSocketMap = new Map();

export const initializeNotificationSocket = (io) => {
  const notificationNamespace = io.of('/notifications');

  notificationNamespace.on('connection', (socket) => {

    // User join room riêng của họ
    socket.on('user_connected', async (userData) => {
      const userId = userData.userId;
      userSocketMap.set(userId, socket.id);
      socket.userId = userId;

      // Gửi số lượng unread count khi user connect
      try {
        const unreadCount = await notificationService.getUnreadCount(userId);
        socket.emit('unread_count_update', { unread_count: unreadCount });
      } catch (error) {
        console.error('Error getting unread count:', error);
      }
    });

    // Các event handlers khác giữ nguyên...
    socket.on('mark_as_read', async (data) => {
      try {
        const { notificationId } = data;
        await notificationService.markAsRead(notificationId, socket.userId);
        
        const unreadCount = await notificationService.getUnreadCount(socket.userId);
        socket.emit('unread_count_update', { unread_count: unreadCount });
      } catch (error) {
        socket.emit('error', { message: error.message });
      }
    });

    socket.on('mark_all_read', async () => {
      try {
        await notificationService.markAllAsRead(socket.userId);
        socket.emit('unread_count_update', { unread_count: 0 });
      } catch (error) {
        socket.emit('error', { message: error.message });
      }
    });

    socket.on('disconnect', () => {
      if (socket.userId) {
        userSocketMap.delete(socket.userId);
      }
    });
  });

  return notificationNamespace;
};

// Hàm utility để gửi notification real-time - THÊM LOG
export const sendNotificationToUser = (namespace, userId, notificationData) => {
  const socketId = userSocketMap.get(userId);
  
  if (socketId) {
    namespace.to(socketId).emit('new_notification', notificationData);
    
    // Cập nhật unread count
    namespace.to(socketId).emit('unread_count_update', { 
      unread_count: notificationData.unread_count 
    });
    
  } else {
    console.log(`User ${userId} is not connected to WebSocket`);
  }
};

// Hàm gửi notification đến nhiều users
export const sendNotificationToUsers = (namespace, userIds, notificationData) => {
  userIds.forEach(userId => {
    sendNotificationToUser(namespace, userId, notificationData);
  });
};