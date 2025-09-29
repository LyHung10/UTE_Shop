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
    async sendMessage({ sessionId, userId = null, message, senderType = 'user', messageType = 'text', metadata = null }) {
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
        
        // Load message với thông tin user
        const messageWithUser = await ChatMessage.findByPk(chatMessage.id, {
            include: [{
                model: User,
                as: 'user',
                attributes: ['id', 'first_name', 'last_name', 'image']
            }]
        });
        
        return messageWithUser;
    }
    
    // Lấy tin nhắn theo session
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
        
        return messages;
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
                    separate: true // Important for proper ordering
                }
            ],
            order: [['last_message_at', 'DESC']],
            limit,
            offset
        });
        
        return { sessions: rows, total: count };
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
    
    // Bot responses logic với context UTE Shop
    // getBotResponse(userMessage) {
    //     const message = userMessage.toLowerCase();
        
    //     // UTE Shop specific responses
    //     if (message.includes('ute') || message.includes('trường') || message.includes('sinh viên')) {
    //         return [{
    //             message: "🎓 Chào mừng sinh viên UTE! Tôi là trợ lý hỗ trợ chuyên biệt cho sinh viên Đại học Sư phạm Kỹ thuật TP.HCM. Tôi có thể giúp bạn về các sản phẩm dành riêng cho sinh viên với giá ưu đãi đặc biệt!",
    //             type: 'quick_reply',
    //             metadata: {
    //                 quick_replies: [
    //                     { title: "Ưu đãi sinh viên", payload: "student_discount" },
    //                     { title: "Sản phẩm học tập", payload: "study_products" },
    //                     { title: "Thời trang sinh viên", payload: "student_fashion" }
    //                 ]
    //             }
    //         }];
    //     }

    //     // Pricing questions
    //     if (message.includes('giá') || message.includes('price') || message.includes('bao nhiêu')) {
    //         return [{
    //             message: "💰 Thông tin giá sản phẩm UTE Shop:\n- Giá đã bao gồm VAT\n- Sinh viên UTE được giảm 25% đơn hàng đầu tiên\n- Miễn phí ship đơn từ 500k\n- Thanh toán COD hoặc chuyển khoản",
    //             type: 'text'
    //         }];
    //     }
        
    //     // Shipping information
    //     if (message.includes('ship') || message.includes('giao hàng') || message.includes('vận chuyển')) {
    //         return [{
    //             message: "🚚 Thông tin vận chuyển UTE Shop:\n- Nội thành HCM: 1-2 ngày\n- Các tỉnh khác: 3-5 ngày\n- Giao hàng tận tay tại KTX UTE\n- Miễn phí ship đơn từ 500k\n- COD toàn quốc",
    //             type: 'text'
    //         }];
    //     }
        
    //     // Return/exchange policy
    //     if (message.includes('trả hàng') || message.includes('đổi') || message.includes('return')) {
    //         return [{
    //             message: "📦 Chính sách đổi trả UTE Shop:\n- 7 ngày đổi trả miễn phí\n- Sản phẩm còn nguyên tem mác\n- Hỗ trợ đổi size, màu sắc\n- Chi phí ship đổi trả: 30k\n- Đặc biệt: Miễn phí đổi trả cho sinh viên UTE",
    //             type: 'text'
    //         }];
    //     }
        
    //     // Payment methods
    //     if (message.includes('thanh toán') || message.includes('payment')) {
    //         return [{
    //             message: "💳 Các phương thức thanh toán:\n- COD (thanh toán khi nhận hàng)\n- VNPay (ATM/Internet Banking)\n- Chuyển khoản ngân hàng\n- Thanh toán tại cửa hàng (gần UTE)\n- Trả góp qua thẻ tín dụng",
    //             type: 'text'
    //         }];
    //     }
        
    //     // Size guide
    //     if (message.includes('size') || message.includes('kích thước') || message.includes('cỡ')) {
    //         return [{
    //             message: "📏 Hướng dẫn chọn size UTE Shop:\n- Xem bảng size chi tiết tại mỗi sản phẩm\n- Tư vấn size miễn phí qua chat\n- Đổi size miễn phí trong 7 ngày\n- Size chart chuẩn châu Á",
    //             type: 'text'
    //         }, {
    //             message: "Bạn cần tư vấn size cho sản phẩm nào?",
    //             type: 'quick_reply',
    //             metadata: {
    //                 quick_replies: [
    //                     { title: "Áo thun", payload: "tshirt_size" },
    //                     { title: "Quần jeans", payload: "jeans_size" },
    //                     { title: "Giày dép", payload: "shoes_size" },
    //                     { title: "Áo khoác", payload: "jacket_size" }
    //                 ]
    //             }
    //         }];
    //     }
        
    //     // Greeting responses
    //     if (message.includes('xin chào') || message.includes('hello') || message.includes('hi') || message.includes('chào')) {
    //         return [{
    //             message: "Xin chào! 👋 Chào mừng bạn đến với UTE Shop - cửa hàng thời trang dành riêng cho sinh viên UTE! Tôi có thể hỗ trợ gì cho bạn hôm nay?",
    //             type: 'quick_reply',
    //             metadata: {
    //                 quick_replies: [
    //                     { title: "Ưu đãi sinh viên", payload: "student_offers" },
    //                     { title: "Sản phẩm mới", payload: "new_products" },
    //                     { title: "Thông tin ship", payload: "shipping_info" },
    //                     { title: "Chính sách đổi trả", payload: "return_policy" }
    //                 ]
    //             }
    //         }];
    //     }

    //     // Product questions
    //     if (message.includes('sản phẩm') || message.includes('hàng')) {
    //         return [{
    //             message: "🛍️ UTE Shop chuyên cung cấp:\n- Thời trang sinh viên: áo thun, hoodie, quần jeans\n- Phụ kiện học tập: túi xách, balo, cặp laptop\n- Đồ lưu niệm UTE: áo kỷ niệm, cốc, móc khóa\n- Đồ thể thao: giày sneaker, áo thể thao\n\nTất cả đều có giá ưu đãi đặc biệt cho sinh viên!",
    //             type: 'quick_reply',
    //             metadata: {
    //                 quick_replies: [
    //                     { title: "Xem áo thun", payload: "view_tshirts" },
    //                     { title: "Xem balo", payload: "view_backpacks" },
    //                     { title: "Đồ kỷ niệm UTE", payload: "ute_merchandise" }
    //                 ]
    //             }
    //         }];
    //     }
        
    //     // Default response with UTE context
    //     return [{
    //         message: "Cảm ơn bạn đã liên hệ UTE Shop! 🎓 Tôi đã ghi nhận câu hỏi của bạn. Nhân viên tư vấn sẽ phản hồi trong vài phút nữa. Trong lúc chờ đợi, bạn có thể xem các thông tin hữu ích bên dưới:",
    //         type: 'quick_reply',
    //         metadata: {
    //             quick_replies: [
    //                 { title: "Ưu đãi 25% sinh viên", payload: "student_discount" },
    //                 { title: "Thông tin ship", payload: "shipping" },
    //                 { title: "Chính sách đổi trả", payload: "return_policy" },
    //                 { title: "Liên hệ admin", payload: "contact_admin" }
    //             ]
    //         }
    //     }];
    // }
    
    // Đánh giá cuối chat
    async rateSatisfaction(sessionId, rating) {
        await ChatSession.update(
            { customer_satisfaction: rating },
            { where: { session_id: sessionId } }
        );
    }
}

export default new ChatService();