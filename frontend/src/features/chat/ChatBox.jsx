import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MessageCircle,
    Send,
    X,
    Minimize2,
    Star,
    Smile,
    CheckCircle2,
    User,
    Headphones,
    GraduationCap,
    ArrowUp
} from 'lucide-react';
import { useSelector } from 'react-redux';
import axios from '@/utils/axiosCustomize.jsx';
import { io } from "socket.io-client";

const ChatBox = ({ apiUrl = 'http://localhost:4000' }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [sessionId, setSessionId] = useState(null);
    const [isTyping, setIsTyping] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState('connecting');
    const [showRating, setShowRating] = useState(false);
    const [rating, setRating] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    // Redux state
    const user = useSelector(state => state.user.account);
    const isAuthenticated = useSelector(state => state.user.isAuthenticated);

    const socketRef = useRef(null);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);
    const typingTimeoutRef = useRef(null);

    // Initialize Socket.IO connection
    const initializeSocket = () => {
        if (socketRef.current) return;

        console.log('Initializing Socket.IO connection...');

        socketRef.current = io(apiUrl, {
            transports: ["websocket", "polling"],
            withCredentials: true,
            auth: {
                token: user?.accessToken || null
            }
        });

        socketRef.current.on("connect", () => {
            setConnectionStatus("connected");
            console.log("Socket.IO connected successfully");

            // Join session if available
            if (sessionId) {
                socketRef.current.emit("join_chat", sessionId);
            }
        });

        socketRef.current.on("new_message", (messageData) => {
            console.log('New message received via Socket.IO:', messageData);
            setMessages(prev => [...prev, messageData]);
            setIsTyping(false);

            if (!isOpen || isMinimized) {
                setUnreadCount(prev => prev + 1);
            }

            setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
        });

        socketRef.current.on("user_typing", (data) => {
            if (data.userId !== user?.id) {
                setIsTyping(data.isTyping);
            }
        });

        socketRef.current.on("disconnect", (reason) => {
            console.log("Socket.IO disconnected:", reason);
            setConnectionStatus("disconnected");
        });

        socketRef.current.on("connect_error", (error) => {
            console.error("Socket.IO connection error:", error);
            setConnectionStatus("disconnected");
        });
    };

    // Cleanup socket connection
    const cleanupSocket = () => {
        if (socketRef.current) {
            socketRef.current.disconnect();
            socketRef.current = null;
        }
    };

    // Initialize socket when chat opens
    useEffect(() => {
        if (isOpen) {
            initializeSocket();
        } else {
            cleanupSocket();
        }

        return () => {
            cleanupSocket();
        };
    }, [isOpen, user?.accessToken]);

    // Create session when chat opens
    useEffect(() => {
        if (isOpen && !sessionId) {
            createChatSession();
        }
    }, [isOpen]);

    // Join session when sessionId is available
    useEffect(() => {
        if (sessionId && socketRef.current?.connected) {
            socketRef.current.emit("join_chat", sessionId);
        }
    }, [sessionId]);

    const createChatSession = async () => {
        try {
            const payload = {
                guestInfo: !isAuthenticated ? { name: 'UTE Student' } : null
            };

            const response = await axios.post('api/chat/sessions', payload);
            console.log('Create session response:', response);

            if (response.success) {
                setSessionId(response.data.session_id);
                loadMessages(response.data.session_id);
            }
        } catch (error) {
            console.error('Failed to create session:', error);
        }
    };

    const loadMessages = async (sessionId) => {
        try {
            const response = await axios.get(`api/chat/messages/${sessionId}`);
            console.log('Load messages response:', response);

            if (response.success) {
                setMessages(response.data);
            }
        } catch (error) {
            console.error('Failed to load messages:', error);
        }
    };

    const sendMessage = async () => {
        if (!inputMessage.trim() || !sessionId || isLoading) return;

        const messageText = inputMessage.trim();

        // TẠO TIN NHẮN TẠM ĐỂ HIỂN THỊ NGAY
        const tempMessage = {
            id: `temp-${Date.now()}`,
            session_id: sessionId,
            message: messageText,
            sender_type: 'user',
            user_id: user?.id,
            created_at: new Date().toISOString(),
            user: user ? {
                id: user.id,
                first_name: user.first_name,
                last_name: user.last_name,
                image: user.image
            } : null
        };

        // THÊM TIN NHẮN TẠM VÀO UI NGAY
        setMessages(prev => [...prev, tempMessage]);
        setInputMessage('');
        setIsLoading(true);
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);

        try {
            // GỬI QUA SOCKET THAY VÌ HTTP API
            if (socketRef.current?.connected) {
                socketRef.current.emit('send_message', {
                    sessionId,
                    message: messageText
                });

                // Tin nhắn thật sẽ được thêm qua event 'new_message'
            } else {
                // Fallback: gửi qua HTTP API nếu socket không kết nối
                const response = await axios.post('api/chat/messages', {
                    sessionId,
                    message: messageText
                });

                if (!response.success) {
                    throw new Error(response.error || 'Failed to send message');
                }
            }

        } catch (error) {
            console.error('Failed to send message:', error);
            // XÓA TIN NHẮN TẠM NẾU LỖI
            setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id));
            setInputMessage(messageText); // Khôi phục tin nhắn
        } finally {
            setIsLoading(false);
        }
    };

    const handleTyping = () => {
        if (socketRef.current?.connected) {
            socketRef.current.emit('typing', {
                sessionId,
                isTyping: true
            });
        }

        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
            if (socketRef.current?.connected) {
                socketRef.current.emit('typing', {
                    sessionId,
                    isTyping: false
                });
            }
        }, 1000);
    };

    const handleQuickReply = (payload) => {
        setInputMessage(payload);
        setTimeout(() => sendMessage(), 100);
    };

    const handleRating = async (ratingValue) => {
        setRating(ratingValue);
        try {
            await axios.put(`api/chat/sessions/${sessionId}/rating`, { rating: ratingValue });
            setShowRating(false);
        } catch (error) {
            console.error('Failed to submit rating:', error);
        }
    };

    const toggleChat = () => {
        setIsOpen(!isOpen);
        setIsMinimized(false);
        if (!isOpen) {
            setUnreadCount(0);
        }
    };

    const minimizeChat = () => {
        setIsMinimized(!isMinimized);
    };

    const closeChat = () => {
        setIsOpen(false);
        if (messages.length > 0) {
            setShowRating(true);
        }
    };

    const formatTime = (timestamp) => {
        return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const MessageBubble = ({ message, isOwn, timestamp }) => (
        <motion.div
            className={`flex gap-3 mb-4 ${isOwn ? 'flex-row-reverse' : ''}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <div className="flex-shrink-0">
                {isOwn ? (
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        {user?.image ? (
                            <img src={user.image} alt="You" className="w-8 h-8 rounded-full object-cover" />
                        ) : (
                            <User className="w-4 h-4 text-white" />
                        )}
                    </div>
                ) : (
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${message.sender_type === 'bot'
                            ? 'bg-gradient-to-r from-orange-500 to-red-500'
                            : 'bg-gradient-to-r from-slate-700 to-slate-900'
                        }`}>
                        {message.sender_type === 'bot' ? (
                            <GraduationCap className="w-4 h-4 text-white" />
                        ) : (
                            <Headphones className="w-4 h-4 text-white" />
                        )}
                    </div>
                )}
            </div>

            <div className={`max-w-[70%] ${isOwn ? 'items-end' : ''}`}>
                <div className={`rounded-2xl px-4 py-2 shadow-sm ${isOwn
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                        : message.sender_type === 'bot'
                            ? 'bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 text-gray-800'
                            : 'bg-white border border-gray-200 text-gray-800'
                    }`}>
                    {message.sender_type === 'bot' && (
                        <div className="flex items-center gap-2 text-xs text-orange-600 mb-1">
                            <GraduationCap className="w-3 h-3" />
                            <span>UTE Shop Assistant</span>
                        </div>
                    )}

                    <p className={`text-sm leading-relaxed ${isOwn ? 'text-white' : 'text-gray-800'}`}>
                        {message.message}
                    </p>

                    {/* Quick Replies */}
                    {message.metadata?.quick_replies && (
                        <div className="mt-3 flex flex-wrap gap-2">
                            {message.metadata.quick_replies.map((reply, index) => (
                                <motion.button
                                    key={index}
                                    onClick={() => handleQuickReply(reply.title)}
                                    className="px-3 py-1 text-xs bg-white/20 hover:bg-white/30 rounded-full border border-white/30 transition-colors"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    {reply.title}
                                </motion.button>
                            ))}
                        </div>
                    )}
                </div>

                <div className={`flex items-center gap-2 mt-1 text-xs text-gray-500 ${isOwn ? 'justify-end' : ''}`}>
                    <span>{formatTime(timestamp)}</span>
                    {isOwn && (
                        <CheckCircle2 className="w-3 h-3 text-green-500" />
                    )}
                </div>
            </div>
        </motion.div>
    );

    if (!isOpen) {
        return (
            <div className="fixed bottom-6 right-6 z-50">
                <motion.button
                    onClick={toggleChat}
                    className="group relative bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 hover:from-slate-800 hover:via-blue-800 hover:to-slate-800 text-white rounded-full p-4 shadow-2xl border border-blue-500/20 animate-glow"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                >
                    <MessageCircle className="w-6 h-6" />

                    {unreadCount > 0 && (
                        <motion.div
                            className="absolute -top-2 -right-2 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold animate-glow"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        >
                            {unreadCount}
                        </motion.div>
                    )}

                    <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-slate-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap glass border border-blue-500/20">
                        <div className="flex items-center gap-2">
                            <GraduationCap className="w-4 h-4" />
                            <span>Hỗ trợ sinh viên UTE 24/7</span>
                        </div>
                        <div className="absolute top-full right-4 border-4 border-transparent border-t-slate-800"></div>
                    </div>
                </motion.button>
            </div>
        );
    }

    return (
        <div className="fixed bottom-6 right-6 z-50">
            {/* Rating Modal */}
            <AnimatePresence>
                {showRating && (
                    <motion.div
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            className="bg-white rounded-2xl p-6 mx-4 max-w-sm w-full shadow-2xl border border-blue-500/20"
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                        >
                            <div className="text-center mb-4">
                                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <GraduationCap className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900">
                                    Đánh giá dịch vụ hỗ trợ UTE
                                </h3>
                                <p className="text-sm text-gray-600 mt-1">
                                    Trải nghiệm chat có hữu ích không?
                                </p>
                            </div>

                            <div className="flex justify-center gap-2 mb-6">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <motion.button
                                        key={star}
                                        onClick={() => handleRating(star)}
                                        className="p-1"
                                        whileHover={{ scale: 1.2 }}
                                        whileTap={{ scale: 0.9 }}
                                    >
                                        <Star
                                            className={`w-8 h-8 ${star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'} hover:text-yellow-400 transition-colors`}
                                        />
                                    </motion.button>
                                ))}
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowRating(false)}
                                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors"
                                >
                                    Bỏ qua
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Chat Window */}
            <motion.div
                className={`glass rounded-2xl shadow-2xl border border-blue-500/20 transition-all duration-300 ${isMinimized ? 'h-16' : 'h-[600px]'
                    } w-[400px] flex flex-col overflow-hidden`}
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 text-white p-4 flex items-center justify-between grid-pattern">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center animate-glow">
                            <GraduationCap className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-sm neon-text">UTE Shop Support</h3>
                            <div className="flex items-center gap-2 text-xs text-blue-300">
                                <div className={`w-2 h-2 rounded-full ${connectionStatus === 'connected' ? 'bg-green-400' : 'bg-red-400'
                                    }`}></div>
                                <span>
                                    {connectionStatus === 'connected' ? 'Trực tuyến' : 'Đang kết nối...'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <motion.button
                            onClick={minimizeChat}
                            className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                        >
                            <Minimize2 className="w-4 h-4" />
                        </motion.button>
                        <motion.button
                            onClick={closeChat}
                            className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                        >
                            <X className="w-4 h-4" />
                        </motion.button>
                    </div>
                </div>

                {!isMinimized && (
                    <>
                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-4 bg-gradient-to-b from-slate-50 to-blue-50">
                            {messages.length === 0 && (
                                <motion.div
                                    className="text-center py-12"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.3 }}
                                >
                                    <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <GraduationCap className="w-8 h-8 text-blue-600" />
                                    </div>
                                    <h3 className="font-semibold text-gray-700 mb-2">Chào mừng đến UTE Shop!</h3>
                                    <p className="text-sm text-gray-500 px-4">
                                        Đội ngũ hỗ trợ sinh viên luôn sẵn sàng giúp bạn 24/7. Hãy nhắn tin để bắt đầu!
                                    </p>
                                </motion.div>
                            )}

                            {messages.map((message) => (
                                <MessageBubble
                                    key={message.id}
                                    message={message}
                                    isOwn={message.user_id === user?.id && message.sender_type === 'user'}
                                    timestamp={message.created_at}
                                />
                            ))}

                            {isTyping && (
                                <motion.div
                                    className="flex gap-3 mb-4"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                >
                                    <div className="w-8 h-8 bg-gradient-to-r from-slate-700 to-slate-900 rounded-full flex items-center justify-center">
                                        <Headphones className="w-4 h-4 text-white" />
                                    </div>
                                    <div className="bg-white border border-gray-200 rounded-2xl px-4 py-2">
                                        <div className="flex gap-1">
                                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-4 bg-white border-t border-gray-100">
                            <div className="flex items-end gap-3">
                                <div className="flex-1 relative">
                                    <textarea
                                        ref={inputRef}
                                        value={inputMessage}
                                        onChange={(e) => {
                                            setInputMessage(e.target.value);
                                            handleTyping();
                                        }}
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                sendMessage();
                                            }
                                        }}
                                        placeholder="Nhập câu hỏi về sản phẩm, đơn hàng..."
                                        className="w-full min-h-[44px] max-h-32 resize-none border border-gray-200 rounded-2xl px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        rows={1}
                                    />

                                    <div className="absolute right-3 bottom-3 flex items-center gap-1">
                                        <button className="p-1 text-gray-400 hover:text-blue-500 transition-colors">
                                            <Smile className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                <motion.button
                                    onClick={sendMessage}
                                    disabled={!inputMessage.trim() || isLoading}
                                    className="bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 hover:from-slate-800 hover:via-blue-800 hover:to-slate-800 disabled:from-gray-300 disabled:to-gray-400 text-white p-3 rounded-2xl transition-all duration-200 disabled:cursor-not-allowed shadow-lg hover:shadow-xl animate-glow"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    {isLoading ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <ArrowUp className="w-5 h-5" />
                                    )}
                                </motion.button>
                            </div>

                            {/* Quick Actions */}
                            <div className="flex gap-2 mt-3 overflow-x-auto scrollbar-hide">
                                {['Thông tin sản phẩm', 'Vận chuyển', 'Đổi trả', 'Hỗ trợ thanh toán'].map((action, index) => (
                                    <motion.button
                                        key={index}
                                        onClick={() => handleQuickReply(action)}
                                        className={`text-xs px-3 py-1.5 rounded-full transition-colors whitespace-nowrap flex items-center gap-1 ${index === 0 ? 'bg-blue-100 hover:bg-blue-200 text-blue-700' :
                                                index === 1 ? 'bg-orange-100 hover:bg-orange-200 text-orange-700' :
                                                    index === 2 ? 'bg-green-100 hover:bg-green-200 text-green-700' :
                                                        'bg-purple-100 hover:bg-purple-200 text-purple-700'
                                            }`}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        {index === 0 ? '🎓' : index === 1 ? '🚚' : index === 2 ? '🔄' : '💳'} {action}
                                    </motion.button>
                                ))}
                            </div>
                        </div>
                    </>
                )}
            </motion.div>
        </div>
    );
};

export default ChatBox;