import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import chatService from './chatService.js';
import dotenv from 'dotenv';

dotenv.config();

class SocketService {
    init(server) {
        if (this.io) return this.io;
        this.io = new Server(server, {
            cors: {
                origin: process.env.CLIENT_URL || "http://localhost:5173",
                credentials: true
            },
            transports: ['websocket', 'polling']
        });

        // Middleware xác thực socket
        this.io.use((socket, next) => {
            try {
                const token = socket.handshake.auth?.token;
                if (token) {
                    const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
                    socket.user = payload;
                } else {
                    socket.user = null; // Guest user
                }
                next();
            } catch (err) {
                socket.user = null; // Allow guest connection
                next();
            }
        });

        this.io.on('connection', (socket) => {

            // Join chat room với flag để tránh duplicate
            socket.on('join_chat', (sessionId) => {
                if (socket.rooms.has(sessionId)) {
                    return;
                }
                socket.join(sessionId);

                // Thêm: User cũng join vào user room để nhận thông báo
                if (!socket.user?.role || socket.user.role === 'user') {
                    const userRoom = `user_${socket.user?.sub || 'guest'}`;
                    if (!socket.rooms.has(userRoom)) {
                        socket.join(userRoom);
                    }
                }
            });

            // Admin join admin room
            socket.on('join_admin', () => {
                if (socket.user?.role === 'admin') {
                    if (socket.rooms.has('admin_room')) {
                        return;
                    }
                    socket.join('admin_room');

                    // Send welcome message
                    socket.emit('admin_connected', {
                        message: 'Successfully connected to admin panel'
                    });
                } else {
                    socket.emit('error', {
                        message: 'Unauthorized: Admin access required'
                    });
                }
            });

            // Real-time message (Socket.IO based sending) - FIXED
            socket.on('send_message', async (data) => {
                try {
                    const { sessionId, message, messageType = 'text' } = data;
                    const userId = socket.user?.sub || null;

                    // Determine sender type
                    let senderType = 'user';
                    if (socket.user?.role === 'admin') {
                        senderType = 'admin';
                    }

                    const chatMessage = await chatService.sendMessage({
                        sessionId,
                        userId: userId,
                        message,
                        senderType,
                        messageType
                    });

                    // Emit đến tất cả user trong session room (EXCLUDING sender)
                    socket.to(sessionId).emit('new_message', chatMessage);

                    // Emit đến sender để xác nhận (với flag riêng)
                    socket.emit('new_message', { ...chatMessage, isOwnMessage: true });

                    // THÊM MỚI: Logic thông báo realtime cho cả user và admin
                    if (chatMessage.sender_type === 'user') {
                        // User gửi -> thông báo cho admin room
                        socket.to('admin_room').emit('new_user_message', {
                            sessionId,
                            message: chatMessage
                        });

                        // THÊM: Cập nhật session list cho admin
                        socket.to('admin_room').emit('session_updated', {
                            sessionId,
                            action: 'new_message'
                        });
                    } else if (chatMessage.sender_type === 'admin') {
                        // Admin gửi -> thông báo cho admin room để cập nhật UI
                        socket.to('admin_room').emit('admin_message_sent', {
                            sessionId,
                            message: chatMessage
                        });

                        // THÊM QUAN TRỌNG: Gửi thông báo đến user room để cập nhật cả panel và chat
                        // Lấy thông tin session để tìm user id
                        try {
                            const session = await chatService.getSession(sessionId);
                            if (session && session.user_id) {
                                const userRoom = `user_${session.user_id}`;
                                // Emit đến user room để cập nhật cả panel (nếu có) và chat
                                socket.to(userRoom).emit('admin_replied', {
                                    sessionId,
                                    message: chatMessage
                                });

                                // THÊM: Gửi đến session room để đảm bảo chat box nhận được
                                socket.to(sessionId).emit('new_message', chatMessage);
                            }
                        } catch (err) {
                            console.error('Error getting session for user room:', err);
                        }
                    }

                } catch (err) {
                    socket.emit('error', { message: err.message });
                }
            });

            // THÊM MỚI: User join user room để nhận thông báo admin reply
            socket.on('join_user_room', (userId) => {
                const userRoom = `user_${userId}`;
                if (socket.rooms.has(userRoom)) {
                    return;
                }
                socket.join(userRoom);
            });

            // Typing indicator
            socket.on('typing', (data) => {
                const { sessionId, isTyping } = data;
                // Broadcast to others in the room
                socket.to(sessionId).emit('user_typing', {
                    userId: socket.user?.sub,
                    name: socket.user?.first_name || 'Guest',
                    isTyping
                });
            });

            // Mark messages as read
            socket.on('mark_read', async (data) => {
                try {
                    const { sessionId } = data;
                    socket.to(sessionId).emit('messages_read', {
                        userId: socket.user?.sub,
                        sessionId
                    });
                } catch (err) {
                    console.error('Mark read error:', err);
                }
            });

            // Admin requests session list update
            socket.on('request_sessions_update', () => {
                if (socket.user?.role === 'admin') {
                    socket.emit('sessions_update_requested');
                }
            });

            socket.on('disconnect', () => {
                console.log(`User disconnected: ${socket.id}`);
            });

            // Handle errors
            socket.on('error', (error) => {
                console.error(`Socket error for ${socket.id}:`, error);
            });

            // Trong backend socket handler
            socket.on('test_connection', (data) => {
                socket.emit('test_response', { message: 'Server is working', timestamp: new Date() });
            });
        });

        return this.io;
    }
    // cho phan chat
    getIO() {
        if (!this.io) {
            throw new Error('Socket.io not initialized! Call init() first.');
        }
        return this.io;
    }

    // Helper method to emit to specific room
    emitToRoom(room, event, data) {
        if (this.io) {
            this.io.to(room).emit(event, data);
        }
    }

    // Helper method to emit to specific socket
    emitToSocket(socketId, event, data) {
        if (this.io) {
            this.io.to(socketId).emit(event, data);
        }
    }



    // THÊM METHOD MỚI ĐỂ LẤY NOTIFICATION NAMESPACE
    getNotificationNamespace() {
        if (!this.io) {
            throw new Error('Socket.io not initialized! Call init() first.');
        }
        return this.io.of('/notifications');
    }
}

export default new SocketService();