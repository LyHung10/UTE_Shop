import chatService from '../services/chatService.js';

class ChatController {
    // Tạo hoặc lấy session
    async createSession(req, res) {
        try {
            const userId = req.user?.sub || null;
            const { guestInfo } = req.body;

            const session = await chatService.createOrGetSession(userId, guestInfo);

            res.json({
                success: true,
                data: session
            });
        } catch (err) {
            console.error('Create session error:', err);
            res.status(500).json({ success: false, error: err.message });
        }
    }

    // Gửi tin nhắn
    async sendMessage(req, res) {
        try {
            const { sessionId, message, messageType = 'text', metadata } = req.body;

            // 👇 QUAN TRỌNG: Lấy user_id từ JWT token
            const userId = req.user?.sub || null;

            console.log('🔐 API user data:', req.user);
            console.log('🔐 User ID from JWT:', userId);

            if (!sessionId || !message) {
                return res.status(400).json({
                    success: false,
                    error: 'Session ID and message are required'
                });
            }

            const chatMessage = await chatService.sendMessage({
                sessionId,
                userId: userId, // 👈 TRUYỀN user_id
                message,
                senderType: 'user',
                messageType,
                metadata
            });
            const unreadCount = await chatService.getUnreadCount(sessionId);

            // Emit socket events
            req.io.to(sessionId).emit('new_message', chatMessage);
            req.io.to('admin_room').emit('new_message', chatMessage);
            req.io.to('admin_room').emit('new_user_message', {
                sessionId,
                message: chatMessage,
                unread_count: unreadCount
            });

            res.json({
                success: true,
                data: chatMessage
            });
        } catch (err) {
            console.error('Send message error:', err);
            res.status(500).json({ success: false, error: err.message });
        }
    }

    // Lấy tin nhắn
    async getMessages(req, res) {
        try {
            const { sessionId } = req.params;
            const { page = 1, limit = 50 } = req.query;

            const messages = await chatService.getMessages(sessionId, parseInt(page), parseInt(limit));

            res.json({
                success: true,
                data: messages
            });
        } catch (err) {
            console.error('Get messages error:', err);
            res.status(500).json({ success: false, error: err.message });
        }
    }

    // Lấy danh sách sessions (admin)
    async getSessions(req, res) {
        try {
            const { status, page = 1, limit = 20, assignedTo } = req.query;

            const result = await chatService.getSessions({
                status,
                page: parseInt(page),
                limit: parseInt(limit),
                assignedTo: assignedTo ? parseInt(assignedTo) : null
            });

            res.json({
                success: true,
                data: result.sessions,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: result.total
                }
            });
        } catch (err) {
            console.error('Get sessions error:', err);
            res.status(500).json({ success: false, error: err.message });
        }
    }

    async markMessagesAsRead(req, res) {
        try {
            const { sessionId } = req.params;
            const adminId = req.user?.sub;

            await chatService.markMessagesAsRead(sessionId, adminId);

            res.json({
                success: true,
                message: 'Messages marked as read'
            });
        } catch (err) {
            console.error('Mark messages as read error:', err);
            res.status(500).json({ success: false, error: err.message });
        }
    }
    // Cập nhật trạng thái session
    async updateSession(req, res) {
        try {
            const { sessionId } = req.params;
            const { status, assignedTo } = req.body;

            const session = await chatService.updateSessionStatus(sessionId, status, assignedTo);

            // Emit to admin panel
            req.io.to('admin_room').emit('session_updated', { session });

            res.json({
                success: true,
                data: session
            });
        } catch (err) {
            console.error('Update session error:', err);
            res.status(500).json({ success: false, error: err.message });
        }
    }

    // Admin gửi tin nhắn
    async sendAdminMessage(req, res) {
        try {
            const { sessionId, message, messageType = 'text' } = req.body;
            const adminId = req.user?.sub;

            if (!sessionId || !message) {
                return res.status(400).json({ success: false, error: 'Session ID and message are required' });
            }

            const chatMessage = await chatService.sendMessage({
                sessionId,
                userId: adminId,
                message,
                senderType: 'admin',
                messageType
            });
            const unreadCount = await chatService.getUnreadCount(sessionId);

            // THAY ĐỔI: Gửi 'new_message' cho cả user và admin
            req.io.to(sessionId).emit('new_message', chatMessage);
            req.io.to('admin_room').emit('new_message', chatMessage);

            // req.io.to('admin_room').emit('new_message', chatMessage);
            req.io.to('admin_room').emit('admin_message_sent', {
                sessionId,
                message: chatMessage,
                unread_count: unreadCount

            });

            res.json({
                success: true,
                data: chatMessage
            });
        } catch (err) {
            console.error('Send admin message error:', err);
            res.status(500).json({ success: false, error: err.message });
        }
    }

    // Đánh giá satisfaction
    async rateSatisfaction(req, res) {
        try {
            const { sessionId } = req.params;
            const { rating } = req.body;

            await chatService.rateSatisfaction(sessionId, rating);

            res.json({
                success: true,
                message: 'Rating saved successfully'
            });
        } catch (err) {
            console.error('Rate satisfaction error:', err);
            res.status(500).json({ success: false, error: err.message });
        }
    }

    // Get stats for admin dashboard
    async getStats(req, res) {
        try {
            const stats = await chatService.getStats();
            res.json({
                success: true,
                data: stats
            });
        } catch (err) {
            console.error('Get stats error:', err);
            res.status(500).json({ success: false, error: err.message });
        }
    }
}

export default new ChatController();