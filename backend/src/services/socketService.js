import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import chatService from './chatService.js';
import dotenv from 'dotenv';

dotenv.config();

class SocketService {
    init(server) {
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
                    console.log(`User authenticated via socket: ${payload.sub}`);
                } else {
                    socket.user = null; // Guest user
                }
                next();
            } catch (err) {
                console.error('Socket auth error:', err);
                socket.user = null; // Allow guest connection
                next();
            }
        });

        this.io.on('connection', (socket) => {
            console.log(`User connected: ${socket.id}, User ID: ${socket.user?.sub || 'Guest'}`);

            // Join chat room
            socket.on('join_chat', (sessionId) => {
                socket.join(sessionId);
                console.log(`User ${socket.id} joined chat room: ${sessionId}`);
            });

            // Admin join admin room
            socket.on('join_admin', () => {
                socket.join('admin_room');
                console.log(`Admin ${socket.id} joined admin room`);
            });

            // Real-time message (Socket.IO based sending)
            socket.on('send_message', async (data) => {
                try {
                    const { sessionId, message, messageType = 'text' } = data;
                    const userId = socket.user?.sub || null;

                    console.log('Received message via socket:', { sessionId, message, userId });

                    const chatMessage = await chatService.sendMessage({
                        sessionId,
                        userId,
                        message,
                        senderType: socket.user?.role === 'admin' ? 'admin' : 'user',
                        messageType
                    });

                    console.log('Created message:', chatMessage);

                    // Emit to all users in the session room
                    this.io.to(sessionId).emit('new_message', chatMessage);

                    // QUAN TRỌNG: Thêm dòng này để gửi đến admin room
                    this.io.to('admin_room').emit('new_message', chatMessage);

                    // Notify admin room if user message
                    if (chatMessage.sender_type === 'user') {
                        this.io.to('admin_room').emit('new_user_message', {
                            sessionId,
                            message: chatMessage
                        });
                    }

                } catch (err) {
                    console.error('Send message error:', err);
                    socket.emit('error', { message: err.message });
                }
            });

            // Typing indicator
            socket.on('typing', (data) => {
                const { sessionId, isTyping } = data;
                socket.to(sessionId).emit('user_typing', {
                    userId: socket.user?.sub,
                    name: socket.user?.name || 'Guest',
                    isTyping
                });
            });

            // Mark messages as read
            socket.on('mark_read', async (data) => {
                try {
                    socket.to(data.sessionId).emit('messages_read', {
                        userId: socket.user?.sub
                    });
                } catch (err) {
                    console.error('Mark read error:', err);
                }
            });

            socket.on('disconnect', () => {
                console.log(`User disconnected: ${socket.id}`);
            });
        });

        return this.io;
    }

    getIO() {
        return this.io;
    }
}

export default new SocketService();