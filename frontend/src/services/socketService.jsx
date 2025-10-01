// frontend/src/services/socketService.js
import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.notificationSocket = null;
    this.isConnected = false;
    this.isNotificationConnected = false;
  }

  connect(token, userId) {
    if (this.isConnected) return;

    this.socket = io('http://localhost:4000/notifications', {
      auth: {
        token: token
      },
      transports: ['websocket', 'polling']
    });

    this.socket.on('connect', () => {
      console.log('Connected to notifications server');
      this.isConnected = true;

      // Gửi thông tin user khi kết nối
      this.socket.emit('user_connected', { userId });
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from notifications server');
      this.isConnected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      this.isConnected = false;
    });

    return this.socket;
  }
  // THÊM METHOD KẾT NỐI NOTIFICATION SOCKET
  connectNotification(token, userId) {
    if (this.isNotificationConnected) return;

    // KẾT NỐI ĐẾN NOTIFICATION NAMESPACE
    this.notificationSocket = io('http://localhost:4000/notifications', {
      auth: {
        token: token
      },
      transports: ['websocket', 'polling']
    });

    this.notificationSocket.on('connect', () => {
      console.log('✅ Connected to notifications server');
      this.isNotificationConnected = true;

      // Gửi thông tin user khi kết nối
      this.notificationSocket.emit('user_connected', { userId });
    });

    this.notificationSocket.on('disconnect', () => {
      console.log('❌ Disconnected from notifications server');
      this.isNotificationConnected = false;
    });

    this.notificationSocket.on('connect_error', (error) => {
      console.error('❌ Notification connection error:', error);
      this.isNotificationConnected = false;
    });

    return this.notificationSocket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  getSocket() {
    return this.socket;
  }
}

export default new SocketService();