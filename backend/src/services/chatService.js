import { ChatSession, ChatMessage, User } from '../models/index.js';
import { Op } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';

class ChatService {
    // Tạo session mới hoặc lấy session hiện tại
    async createOrGetSession(userId = null, guestInfo = null) {
        let session;

        if (userId) {
            // Tìm session active của user
            session = await ChatSession.findOne({
                where: {
                    user_id: userId,
                    status: ['active', 'waiting']
                },
                include: [{
                    model: ChatMessage,
                    as: 'messages',
                    limit: 50,
                    order: [['created_at', 'DESC']]
                }]
            });
        }

        if (!session) {
            const sessionId = `chat_${uuidv4()}`;
            session = await ChatSession.create({
                session_id: sessionId,
                user_id: userId,
                guest_info: guestInfo,
                status: 'active'
            });
        }

        return session;
    }

    // Gửi tin nhắn
    // chatService.js - sendMessage method
    async sendMessage({ sessionId, userId, message, senderType = 'user', messageType = 'text', metadata = null }) {
        console.log('💬 Creating message with user_id:', userId);

        const chatMessage = await ChatMessage.create({
            user_id: userId,
            session_id: sessionId,
            message,
            sender_type: senderType,
            message_type: messageType,
            metadata
        });

        // Cập nhật last_message_at của session
        await ChatSession.update(
            { last_message_at: new Date() },
            { where: { session_id: sessionId } }
        );

        // 👇 XỬ LÝ SPECIAL: Load message với user info (chỉ nếu có user_id)
        let messageWithUser;
        if (userId) {
            // Có user_id -> join với bảng users
            messageWithUser = await ChatMessage.findByPk(chatMessage.id, {
                include: [{
                    model: User,
                    as: 'user',
                    attributes: ['id', 'first_name', 'last_name', 'image']
                }]
            });
        } else {
            // Guest user -> chỉ lấy message không có user
            messageWithUser = await ChatMessage.findByPk(chatMessage.id);
        }

        const result = messageWithUser.toJSON();

        // 👇 THÊM FALLBACK USER OBJECT CHO GUEST USERS
        if (!result.user && result.sender_type === 'user') {
            result.user = {
                id: null,
                first_name: 'Khách',
                last_name: '',
                image: null,
                is_guest: true
            };
        }

        // Format dates
        if (result.created_at instanceof Date) {
            result.created_at = result.created_at.toISOString();
        } else if (result.created_at) {
            result.created_at = new Date(result.created_at).toISOString();
        }

        console.log('📦 Final message data:', {
            id: result.id,
            user_id: result.user_id,
            has_user_object: !!result.user,
            user: result.user
        });

        return result;
    }

    // Lấy tin nhắn theo session - THÊM format dates
    async getMessages(sessionId, page = 1, limit = 50) {
        const offset = (page - 1) * limit;

        const messages = await ChatMessage.findAll({
            where: { session_id: sessionId },
            include: [{
                model: User,
                as: 'user',
                attributes: ['id', 'first_name', 'last_name', 'image']
            }],
            order: [['created_at', 'ASC']],
            limit,
            offset
        });

        // QUAN TRỌNG: Format tất cả dates thành ISO string
        return messages.map(msg => {
            const messageData = msg.toJSON();

            // Format created_at
            if (messageData.created_at instanceof Date) {
                messageData.created_at = messageData.created_at.toISOString();
            } else if (messageData.created_at) {
                messageData.created_at = new Date(messageData.created_at).toISOString();
            }

            return messageData;
        });
    }

    // Lấy danh sách sessions (cho admin)
    async getSessions({ status = null, page = 1, limit = 20, assignedTo = null }) {
        const where = {};
        if (status) where.status = status;
        if (assignedTo) where.assigned_to = assignedTo;

        const offset = (page - 1) * limit;

        const { rows, count } = await ChatSession.findAndCountAll({
            where,
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'first_name', 'last_name', 'image'],
                    required: false
                },
                {
                    model: ChatMessage,
                    as: 'messages',
                    limit: 1,
                    order: [['created_at', 'DESC']],
                    separate: true,
                    include: [ // 👈 THÊM INCLUDE USER CHO MESSAGES
                        {
                            model: User,
                            as: 'user', // 👈 QUAN TRỌNG: alias phải khớp với association trong ChatMessage
                            attributes: ['id', 'first_name', 'last_name', 'image'],
                            required: false
                        }
                    ]
                }
            ],
            order: [['last_message_at', 'DESC']],
            limit,
            offset
        });

        // 👇 TRANSFORM DATA: Ưu tiên user từ message nếu session không có user
        const transformedSessions = rows.map(session => {
            const sessionData = session.toJSON();

            const lastMessage = sessionData.messages?.[0];
            const messageUser = lastMessage?.user;

            // QUY TẮC HIỂN THỊ:
            // 1. Nếu session có user -> hiển thị user đó (khách hàng)
            // 2. Nếu không có user, nhưng message có user -> hiển thị user của message
            // 3. Nếu là admin message -> vẫn hiển thị khách hàng (vì session thuộc về khách hàng)

            let display_user = sessionData.user || messageUser || null;

            // Nếu display_user là admin và đây là session của khách hàng, 
            // thì vẫn hiển thị là Guest (vì session thuộc về khách hàng)
            if (display_user?.is_admin && !sessionData.user) {
                display_user = { is_guest: true }; // Hiển thị là Guest
            }

            return {
                ...sessionData,
                display_user
            };
        });

        return { sessions: transformedSessions, total: count };
    }

    // Cập nhật trạng thái session
    async updateSessionStatus(sessionId, status, assignedTo = null) {
        const updateData = { status };
        if (assignedTo) updateData.assigned_to = assignedTo;

        await ChatSession.update(updateData, {
            where: { session_id: sessionId }
        });

        return await ChatSession.findOne({
            where: { session_id: sessionId },
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'first_name', 'last_name', 'image'],
                    required: false
                }
            ]
        });
    }

    // Get stats for admin dashboard
    async getStats() {
        const [total, active, waiting, closed] = await Promise.all([
            ChatSession.count(),
            ChatSession.count({ where: { status: 'active' } }),
            ChatSession.count({ where: { status: 'waiting' } }),
            ChatSession.count({ where: { status: 'closed' } })
        ]);

        return { total, active, waiting, closed };
    }

    // Đánh giá cuối chat
    async rateSatisfaction(sessionId, rating) {
        await ChatSession.update(
            { customer_satisfaction: rating },
            { where: { session_id: sessionId } }
        );
    }
}

export default new ChatService();