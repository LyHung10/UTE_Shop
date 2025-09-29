import React, { useState, useEffect, useRef } from 'react';
import {
    MessageSquare,
    Send,
    Search,
    MoreVertical,
    User,
    CheckCircle,
    Activity,
    MessageCircle,
    Phone
} from 'lucide-react';
import { io } from "socket.io-client";
import axios from '../../utils/axiosCustomize';

const ChatAdminPanel = ({ adminUser, apiUrl = 'http://localhost:4000' }) => {
    const [sessions, setSessions] = useState([]);
    const [selectedSession, setSelectedSession] = useState(null);
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState({ total: 0, active: 0, waiting: 0, closed: 0 });

    const socketRef = useRef(null);
    const messagesEndRef = useRef(null);

    // Thiết lập axios với accessToken admin
    useEffect(() => {
        loadSessions();
        loadStats();
        connectWebSocket();
    }, [adminUser?.accessToken, statusFilter]);

    // Load sessions
    const loadSessions = async () => {
        try {
            setLoading(true);
            // Chỉ gửi status nếu khác 'all'
            const params = {};
            if (statusFilter !== 'all') params.status = statusFilter;

            const response = await axios.get('api/chat/admin/sessions', { params });

            if (response.success) setSessions(response.data); // nhớ dùng data.data vì API trả { success, data, pagination }
        } catch (error) {
            console.error('Failed to load sessions:', error);
        } finally {
            setLoading(false);
        }
    };


    // Load stats
    const loadStats = async () => {
        try {
            const response = await axios.get('api/chat/admin/stats');
            if (response.data.success) setStats(response.data);
        } catch (error) {
            console.error('Failed to load stats:', error);
        }
    };

    // Kết nối WebSocket
    const connectWebSocket = () => {
        if (!adminUser?.accessToken) return;

        socketRef.current = io(apiUrl, {
            transports: ["websocket"],
            auth: { accessToken: adminUser.accessToken },
        });

        socketRef.current.on("connect", async () => {
            console.log("Socket.IO connected");
            await loadSessions();
            await loadStats();
        });

        // THÊM: Listener cho tin nhắn từ cả user và admin
        socketRef.current.on("new_message", (messageData) => {
            console.log('Admin received message:', messageData);

            // Cập nhật session list
            loadSessions();

            // Nếu đang xem session này, thêm vào danh sách tin nhắn
            if (selectedSession?.session_id === messageData.session_id) {
                setMessages(prev => [...prev, messageData]);
                setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
            }
        });

        // SỬA: data.sessionId thay vì data.session_id
        socketRef.current.on("new_user_message", (data) => {
            console.log('Admin received user message:', data);

            // Cập nhật session list
            loadSessions();

            // SỬA: data.sessionId và data.message
            if (selectedSession?.session_id === data.sessionId) {
                setMessages(prev => [...prev, data.message]);
                setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
            }
        });

        socketRef.current.on("session_updated", (data) => {
            setSessions(prev =>
                prev.map(s => s.session_id === data.session.session_id ? data.session : s)
            );
        });

        socketRef.current.on("disconnect", () => {
            console.log("Socket.IO disconnected");
        });
    };

    useEffect(() => {
        connectWebSocket();
        return () => {
            socketRef.current?.disconnect();
        };
    }, [adminUser?.accessToken, statusFilter, selectedSession?.session_id]);

    // Chọn session
    const selectSession = async (session) => {
        setSelectedSession(session);
        try {
            const response = await axios.get(`api/chat/messages/${session.session_id}`);
            console.log(response)
            if (response.success) {
                setMessages(response.data);
                setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
            }
        } catch (error) {
            console.error('Failed to load messages:', error);
        }
    };

    // Gửi tin nhắn
    const sendMessage = async () => {
        if (!inputMessage.trim() || !selectedSession) return;
        try {
            const response = await axios.post('api/chat/admin/messages', {
                sessionId: selectedSession.session_id,
                message: inputMessage.trim()
            });
            console.log(response);
            if (response.success) {
                setInputMessage('');
                setMessages(prev => [...prev, response.data]);
            }
        } catch (error) {
            console.error('Failed to send message:', error);
        }
    };

    // Cập nhật trạng thái session
    const updateSessionStatus = async (sessionId, status, assignedTo = null) => {
        try {
            const response = await axios.put(`api/chat/admin/sessions/${sessionId}`, { status, assignedTo });
            if (response.success) loadSessions();
        } catch (error) {
            console.error('Failed to update session:', error);
        }
    };

    // Lọc sessions
    const filteredSessions = sessions.filter(session => {
        const matchesSearch = !searchQuery ||
            session.user?.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            session.user?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            session.guest_info?.name?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'all' || session.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const getStatusColor = (status) => {
        switch (status) {
            case 'active': return 'text-green-600 bg-green-100';
            case 'waiting': return 'text-yellow-600 bg-yellow-100';
            case 'closed': return 'text-gray-600 bg-gray-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    const formatTime = (timestamp) => new Date(timestamp).toLocaleString();

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Sidebar */}
            <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
                <div className="p-4 border-b border-gray-200">
                    <h1 className="text-lg font-semibold text-gray-900 mb-4">Chat Support Admin</h1>
                    <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="bg-blue-50 p-3 rounded-lg">
                            <div className="flex items-center justify-between">
                                <MessageCircle className="w-5 h-5 text-blue-600" />
                                <span className="text-xs text-blue-600 font-medium">Tổng</span>
                            </div>
                            <div className="text-xl font-bold text-blue-600">{stats.total}</div>
                        </div>
                        <div className="bg-green-50 p-3 rounded-lg">
                            <div className="flex items-center justify-between">
                                <Activity className="w-5 h-5 text-green-600" />
                                <span className="text-xs text-green-600 font-medium">Hoạt động</span>
                            </div>
                            <div className="text-xl font-bold text-green-600">{stats.active}</div>
                        </div>
                    </div>
                    <div className="relative mb-3">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm khách hàng..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="all">Tất cả trạng thái</option>
                        <option value="active">Đang hoạt động</option>
                        <option value="waiting">Chờ phản hồi</option>
                        <option value="closed">Đã đóng</option>
                    </select>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {loading ? (
                        <div className="p-4 text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                        </div>
                    ) : filteredSessions.length === 0 ? (
                        <div className="p-4 text-center text-gray-500">Không có phiên chat nào</div>
                    ) : (
                        filteredSessions.map((session) => (
                            <div
                                key={session.id}
                                onClick={() => selectSession(session)}
                                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${selectedSession?.id === session.id ? 'bg-blue-50 border-blue-200' : ''}`}
                            >
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium">
                                            {session.user ? (
                                                session.user.image ? (
                                                    <img src={session.user.image} alt="" className="w-full h-full rounded-full object-cover" />
                                                ) : (
                                                    `${session.user.first_name?.[0] || ''}${session.user.last_name?.[0] || ''}`
                                                )
                                            ) : (
                                                <User className="w-5 h-5" />
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="font-medium text-gray-900 text-sm">
                                                {session.user
                                                    ? `${session.user.first_name || ''} ${session.user.last_name || ''}`.trim()
                                                    : session.guest_info?.name || 'Guest User'}
                                            </h3>
                                            <p className="text-xs text-gray-500">
                                                {session.user?.email || 'Guest'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-end gap-1">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(session.status)}`}>
                                            {session.status === 'active' ? 'Hoạt động' :
                                                session.status === 'waiting' ? 'Chờ' : 'Đóng'}
                                        </span>
                                        <span className="text-xs text-gray-400">
                                            {formatTime(session.last_message_at)}
                                        </span>
                                    </div>
                                </div>
                                {session.messages?.[0] && (
                                    <p className="text-sm text-gray-600 truncate">{session.messages[0].message}</p>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col">
                {selectedSession ? (
                    <>
                        {/* Chat Header */}
                        <div className="bg-white border-b border-gray-200 p-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium">
                                        {selectedSession.user ? (
                                            selectedSession.user.image ? (
                                                <img src={selectedSession.user.image} alt="" className="w-full h-full rounded-full object-cover" />
                                            ) : (
                                                `${selectedSession.user.first_name?.[0] || ''}${selectedSession.user.last_name?.[0] || ''}`
                                            )
                                        ) : (
                                            <User className="w-5 h-5" />
                                        )}
                                    </div>
                                    <div>
                                        <h2 className="font-semibold text-gray-900">
                                            {selectedSession.user
                                                ? `${selectedSession.user.first_name || ''} ${selectedSession.user.last_name || ''}`.trim()
                                                : selectedSession.guest_info?.name || 'Guest User'}
                                        </h2>
                                        <div className="flex items-center gap-2 text-sm text-gray-500">
                                            <span className={`w-2 h-2 rounded-full ${selectedSession.status === 'active' ? 'bg-green-400' : 'bg-gray-400'}`}></span>
                                            <span>{selectedSession.user?.email || 'Guest'}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <select
                                        value={selectedSession.status}
                                        onChange={(e) => updateSessionStatus(selectedSession.session_id, e.target.value)}
                                        className="px-3 py-1 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="active">Hoạt động</option>
                                        <option value="waiting">Chờ</option>
                                        <option value="closed">Đóng</option>
                                    </select>

                                    <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                                        <Phone className="w-4 h-4" />
                                    </button>
                                    <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                                        <MoreVertical className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                            {messages.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                                    <MessageSquare className="w-12 h-12 mb-4" />
                                    <p>Chưa có tin nhắn nào trong phiên chat này</p>
                                </div>
                            ) : (
                                messages.map((message) => (
                                    <div key={message.id} className={`mb-4 ${message.sender_type === 'admin' ? 'flex justify-end' : 'flex justify-start'}`}>
                                        <div className={`max-w-[70%] ${message.sender_type === 'admin' ? 'order-2' : ''}`}>
                                            <div className={`rounded-2xl px-4 py-2 ${message.sender_type === 'admin'
                                                ? 'bg-blue-600 text-white'
                                                : message.sender_type === 'bot'
                                                    ? 'bg-purple-100 text-purple-800 border border-purple-200'
                                                    : 'bg-white text-gray-800 border border-gray-200'
                                                }`}>
                                                {message.sender_type === 'bot' && (
                                                    <div className="flex items-center gap-2 text-xs text-purple-600 mb-1">
                                                        <Activity className="w-3 h-3" />
                                                        <span>Bot tự động</span>
                                                    </div>
                                                )}
                                                <p className="text-sm leading-relaxed">{message.message}</p>
                                                {message.metadata?.quick_replies && (
                                                    <div className="mt-2 flex flex-wrap gap-2">
                                                        {message.metadata.quick_replies.map((reply, index) => (
                                                            <span key={index} className="px-2 py-1 bg-purple-200 text-purple-700 text-xs rounded-full">
                                                                {reply.title}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                            <div className={`text-xs text-gray-500 mt-1 ${message.sender_type === 'admin' ? 'text-right' : ''}`}>
                                                {formatTime(message.created_at)}
                                                {message.sender_type === 'admin' && (
                                                    <CheckCircle className="inline w-3 h-3 ml-1 text-green-500" />
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Message Input */}
                        <div className="bg-white border-t border-gray-200 p-4">
                            <div className="flex items-end gap-3">
                                <div className="flex-1">
                                    <textarea
                                        value={inputMessage}
                                        onChange={(e) => setInputMessage(e.target.value)}
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                sendMessage();
                                            }
                                        }}
                                        placeholder="Nhập tin nhắn phản hồi..."
                                        className="w-full resize-none border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        rows={3}
                                    />
                                </div>
                                <button
                                    onClick={sendMessage}
                                    disabled={!inputMessage.trim()}
                                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white px-6 py-3 rounded-lg transition-colors disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    <Send className="w-4 h-4" />
                                    Gửi
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-gray-500">
                        <div className="text-center">
                            <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                            <h2 className="text-lg font-medium text-gray-700 mb-2">Chọn một phiên chat để bắt đầu</h2>
                            <p className="text-sm">Chọn một khách hàng từ danh sách bên trái để xem và trả lời tin nhắn</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChatAdminPanel;
