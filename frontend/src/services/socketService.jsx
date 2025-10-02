// frontend/src/services/socketService.js
import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.notificationSocket = null;
    this.isConnected = false;
    this.isNotificationConnected = false;
    this.notificationListeners = new Map(); // Lưu trữ listeners
  }

  // Kết nối chat socket (giữ nguyên)
  connect(token, userId) {
    if (this.isConnected && this.socket) return this.socket;

    this.socket = io('http://localhost:4000', {
      auth: { token },
      transports: ['websocket', 'polling']
    });

    this.socket.on('connect', () => {
      console.log('Connected to chat server');
      this.isConnected = true;
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from chat server');
      this.isConnected = false;
    });

    return this.socket;
  }

  // Kết nối notification socket - SỬA LẠI
  connectNotification(token, userId) {
    // Nếu đã kết nối, trả về socket hiện tại
    if (this.isNotificationConnected && this.notificationSocket) {
      console.log('✅ Notification socket already connected, reusing...');
      return this.notificationSocket;
    }

    console.log('🔄 Creating new notification socket connection...');
    
    this.notificationSocket = io('http://localhost:4000/notifications', {
      auth: { token },
      transports: ['websocket', 'polling']
    });

    this.notificationSocket.on('connect', () => {
      console.log('✅ Connected to notifications server');
      this.isNotificationConnected = true;
      
      // Gửi thông tin user khi kết nối
      this.notificationSocket.emit('user_connected', { userId });
    });

    this.notificationSocket.on('disconnect', (reason) => {
      console.log('❌ Disconnected from notifications server:', reason);
      this.isNotificationConnected = false;
    });

    this.notificationSocket.on('connect_error', (error) => {
      console.error('❌ Notification connection error:', error);
      this.isNotificationConnected = false;
    });

    this.notificationSocket.on('reconnect_attempt', (attemptNumber) => {
      console.log(`🔄 Notification socket reconnect attempt: ${attemptNumber}`);
    });

    this.notificationSocket.on('reconnect', (attemptNumber) => {
      console.log('✅ Notification socket reconnected');
      this.isNotificationConnected = true;
      // Gửi lại user_connected sau khi reconnect
      this.notificationSocket.emit('user_connected', { userId });
    });

    return this.notificationSocket;
  }

  // Thêm listener cho notification socket
  addNotificationListener(event, callback) {
    if (!this.notificationSocket) {
      console.warn('⚠️ Notification socket not available for adding listener');
      return;
    }
    
    this.notificationSocket.on(event, callback);
    this.notificationListeners.set(event, callback);
  }

  // Remove listener
  removeNotificationListener(event) {
    if (!this.notificationSocket) return;
    
    const callback = this.notificationListeners.get(event);
    if (callback) {
      this.notificationSocket.off(event, callback);
      this.notificationListeners.delete(event);
    }
  }

  // Get notification socket (dùng cho emit)
  getNotificationSocket() {
    return this.notificationSocket;
  }

  // Check if notification socket is connected
  isNotificationSocketConnected() {
    return this.isNotificationConnected && this.notificationSocket;
  }

  // Disconnect chỉ khi cần thiết
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  // Disconnect notification socket (chỉ dùng khi logout)
  disconnectNotification() {
    if (this.notificationSocket) {
      this.notificationSocket.disconnect();
      this.notificationSocket = null;
      this.isNotificationConnected = false;
      this.notificationListeners.clear();
    }
  }
}

export default new SocketService();