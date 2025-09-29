import { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Loader2, Smile, Image as ImageIcon } from 'lucide-react';
import { io } from 'socket.io-client';
import axios from 'axios';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';

const ChatBox = ({ apiUrl = 'http://localhost:4000' }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isConnected, setIsConnected] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [sessionId, setSessionId] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const socketRef = useRef(null);
    const messagesEndRef = useRef(null);
    const typingTimeoutRef = useRef(null);

    const user = useSelector((state) => state.user?.account);
    const accessToken = user?.accessToken;

    // Scroll to bottom
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Initialize chat session
    const initializeChat = async () => {
        try {
            setIsLoading(true);
            const response = await axios.post(
                `${apiUrl}/api/chat/sessions`,
                {
                    guestInfo: user ? null : {
                        name: 'Guest User',
                        timestamp: new Date().toISOString()
                    }
                },
                {
                    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {}
                }
            );

            if (response.data.success) {
                const session = response.data.data;
                setSessionId(session.session_id);

                // Load previous messages
                if (session.messages && session.messages.length > 0) {
                    setMessages(session.messages.reverse());
                }

                return session.session_id;
            }
        } catch (error) {
            console.error('Failed to initialize chat:', error);
            toast.error('Không thể khởi tạo chat. Vui lòng thử lại!');
        } finally {
            setIsLoading(false);
        }
    };

    // Initialize socket connection
    useEffect(() => {
        if (isOpen && !socketRef.current) {
            socketRef.current = io(apiUrl, {
                auth: { token: accessToken || null },
                transports: ['websocket', 'polling']
            });

            const socket = socketRef.current;

            socket.on('connect', () => {
                console.log('Socket connected');
                setIsConnected(true);
            });

            socket.on('disconnect', () => {
                console.log('Socket disconnected');
                setIsConnected(false);
            });

            socket.on('new_message', (message) => {
                console.log('User received new message:', message);

                // QUAN TRỌNG: Bỏ qua tin nhắn của chính user
                if (message.sender_type === 'user') {
                    console.log('Ignoring own message via socket');
                    return;
                }

                setMessages((prev) => {
                    const messageExists = prev.some(m => m.id === message.id);
                    if (messageExists) return prev;
                    return [...prev, message];
                });

                // Stop typing indicator when bot/admin responds
                if (message.sender_type !== 'user') {
                    setIsTyping(false);
                }
            });

            socket.on('user_typing', (data) => {
                if (data.userId !== user?.id) {
                    setIsTyping(data.isTyping);
                }
            });

            socket.on('error', (error) => {
                console.error('Socket error:', error);
                toast.error('Lỗi kết nối. Vui lòng thử lại!');
            });
        }

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
            }
        };
    }, [isOpen, apiUrl, accessToken, user?.id]);

    // Join chat room when session is ready
    useEffect(() => {
        if (sessionId && socketRef.current?.connected) {
            socketRef.current.emit('join_chat', sessionId);
            console.log('Joined chat room:', sessionId);
        }
    }, [sessionId, socketRef.current?.connected]);

    // Open chat
    const handleOpen = async () => {
        setIsOpen(true);
        if (!sessionId) {
            await initializeChat();
        }
    };

    // Send message - CHỈ DÙNG HTTP
    const handleSendMessage = async () => {
        if (!inputMessage.trim() || !sessionId) return;

        const messageText = inputMessage.trim();
        setInputMessage('');

        try {
            // Optimistic update với thời gian frontend
            const tempId = `temp-${Date.now()}`;
            const now = new Date(); // 👈 DÙNG THỜI GIAN FRONTEND

            const tempMessage = {
                id: tempId,
                message: messageText,
                sender_type: 'user',
                created_at: now.toISOString(), // ISO string
                display_time: formatTime(now), // 👈 THÊM display_time đã format sẵn
                user: user ? {
                    first_name: user.first_name,
                    last_name: user.last_name,
                    image: user.image
                } : null
            };

            setMessages((prev) => [...prev, tempMessage]);

            // Gửi HTTP
            const response = await axios.post(
                `${apiUrl}/api/chat/messages`,
                {
                    sessionId,
                    message: messageText,
                    messageType: 'text'
                },
                {
                    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {}
                }
            );

            // Replace với data từ server
            if (response.data.success) {
                setMessages((prev) =>
                    prev.map(msg =>
                        msg.id === tempId ? {
                            ...response.data.data,
                            display_time: formatTime(response.data.data.created_at) // Format server time
                        } : msg
                    )
                );
            }

        } catch (error) {
            console.error('Failed to send message:', error);
            toast.error('Không thể gửi tin nhắn. Vui lòng thử lại!');
            setMessages((prev) => prev.filter((m) => m.id !== tempId));
        }
    };
    // Handle typing indicator
    const handleTyping = () => {
        if (socketRef.current && sessionId) {
            socketRef.current.emit('typing', { sessionId, isTyping: true });

            clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = setTimeout(() => {
                socketRef.current.emit('typing', { sessionId, isTyping: false });
            }, 1000);
        }
    };

    // Handle quick reply
    const handleQuickReply = (payload) => {
        setInputMessage(payload);
    };

    // Format time
    const formatTime = (date) => {
        try {
            const validDate = date ? new Date(date) : new Date();
            return validDate.toLocaleTimeString('vi-VN', {
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return new Date().toLocaleTimeString('vi-VN', {
                hour: '2-digit',
                minute: '2-digit'
            });
        }
    };

    if (!isOpen) {
        return (
            <button
                onClick={handleOpen}
                className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg transition-all duration-300 hover:scale-110 z-50"
            >
                <MessageCircle size={28} />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    !
                </span>
            </button>
        );
    }

    return (
        <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col z-50 border border-gray-200">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-t-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                            <MessageCircle className="text-blue-600" size={24} />
                        </div>
                        {isConnected && (
                            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></span>
                        )}
                    </div>
                    <div>
                        <h3 className="font-semibold">UTE Shop Support</h3>
                        <p className="text-xs text-blue-100">
                            {isConnected ? 'Đang hoạt động' : 'Đang kết nối...'}
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => setIsOpen(false)}
                    className="hover:bg-blue-800 rounded-full p-1 transition-colors"
                >
                    <X size={24} />
                </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                {isLoading ? (
                    <div className="flex items-center justify-center h-full">
                        <Loader2 className="animate-spin text-blue-600" size={32} />
                    </div>
                ) : messages.length === 0 ? (
                    <div className="text-center text-gray-500 mt-8">
                        <MessageCircle size={48} className="mx-auto mb-4 text-gray-300" />
                        <p className="text-sm">Xin chào! Chúng tôi có thể giúp gì cho bạn?</p>
                    </div>
                ) : (
                    messages.map((msg, index) => (
                        <div key={msg.id || index}>
                            <div
                                className={`flex ${msg.sender_type === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[75%] rounded-2xl px-4 py-2 ${msg.sender_type === 'user'
                                        ? 'bg-blue-600 text-white rounded-br-none'
                                        : msg.sender_type === 'bot'
                                            ? 'bg-gray-200 text-gray-800 rounded-bl-none'
                                            : 'bg-green-100 text-gray-800 rounded-bl-none'
                                        }`}
                                >
                                    {msg.sender_type === 'admin' && (
                                        <p className="text-xs font-semibold text-green-700 mb-1">
                                            Admin
                                        </p>
                                    )}
                                    <p className="text-sm whitespace-pre-wrap break-words">{msg.message}</p>
                                    <p
                                        className={`text-xs mt-1 ${msg.sender_type === 'user' ? 'text-blue-100' : 'text-gray-500'
                                            }`}
                                    >
                                        {msg.display_time || formatTime(msg.created_at)}
                                    </p>
                                </div>
                            </div>

                            {/* Quick replies */}
                            {msg.metadata?.quick_replies && (
                                <div className="flex flex-wrap gap-2 mt-2 ml-2">
                                    {msg.metadata.quick_replies.map((reply, i) => (
                                        <button
                                            key={i}
                                            onClick={() => handleQuickReply(reply.title)}
                                            className="bg-white border border-blue-300 text-blue-600 text-xs px-3 py-1 rounded-full hover:bg-blue-50 transition-colors"
                                        >
                                            {reply.title}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))
                )}

                {isTyping && (
                    <div className="flex justify-start">
                        <div className="bg-gray-200 rounded-2xl rounded-bl-none px-4 py-3">
                            <div className="flex gap-1">
                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></span>
                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></span>
                            </div>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 bg-white border-t border-gray-200 rounded-b-2xl">
                <div className="flex items-end gap-2">
                    <div className="flex-1 relative">
                        <input
                            type="text"
                            value={inputMessage}
                            onChange={(e) => {
                                setInputMessage(e.target.value);
                                handleTyping();
                            }}
                            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                            placeholder="Nhập tin nhắn..."
                            className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            disabled={!isConnected || !sessionId}
                        />
                        <button className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
                            <Smile size={20} />
                        </button>
                    </div>
                    <button
                        onClick={handleSendMessage}
                        disabled={!inputMessage.trim() || !isConnected || !sessionId}
                        className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-xl transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                        <Send size={20} />
                    </button>
                </div>
                <p className="text-xs text-gray-400 mt-2 text-center">
                    Powered by UTE Shop Support
                </p>
            </div>
        </div>
    );
};

export default ChatBox;