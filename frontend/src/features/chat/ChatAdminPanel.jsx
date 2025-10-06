import { useState, useEffect, useRef, useCallback } from 'react';
import {
    MessageCircle, Send, Search, Clock, CheckCircle, XCircle,
    User, Filter, RefreshCw, Loader2, ArrowLeft, Settings
} from 'lucide-react';
import { io } from 'socket.io-client';
import axios from 'axios';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import UserAvatar from './UserAvatar';
const ChatAdminPanel = ({ apiUrl = 'http://localhost:4000' }) => {
    const [sessions, setSessions] = useState([]);
    const [selectedSession, setSelectedSession] = useState(null);
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isConnected, setIsConnected] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [stats, setStats] = useState({ total: 0, active: 0, waiting: 0, closed: 0 });
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    const socketRef = useRef(null);
    const messagesEndRef = useRef(null);
    const hasJoinedRoomRef = useRef(false);

    const user = useSelector((state) => state.user);
    const authStatus = useSelector((state) => state.authStatus);
    const accessToken = authStatus?.accessToken;

    // Scroll to bottom
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // THÊM useEffect để tự động join room khi selectedSession thay đổi
    useEffect(() => {
        if (selectedSession && socketRef.current?.connected) {
            socketRef.current.emit('join_chat', selectedSession.session_id);
            hasJoinedRoomRef.current = true;
            console.log('Auto-joined room:', selectedSession.session_id);
        }
    }, [selectedSession]);

    // Load sessions với useCallback để tránh recreate function
    const loadSessions = useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await axios.get(`${apiUrl}/api/chat/admin/sessions`, {
                headers: { Authorization: `Bearer ${accessToken}` },
                params: { status: filter === 'all' ? null : filter }
            });

            if (response.data.success) {
                setSessions(response.data.data);
            }
        } catch (error) {
            console.error('Failed to load sessions:', error);
            toast.error('Không thể tải danh sách chat!');
        } finally {
            setIsLoading(false);
        }
    }, [apiUrl, accessToken, filter]);

    // Load stats
    const loadStats = useCallback(async () => {
        try {
            const response = await axios.get(`${apiUrl}/api/chat/admin/stats`, {
                headers: { Authorization: `Bearer ${accessToken}` }
            });

            if (response.data.success) {
                setStats(response.data.data);
            }
        } catch (error) {
            console.error('Failed to load stats:', error);
        }
    }, [apiUrl, accessToken]);

    // Load messages
    // Load messages - DEBUG createdAt
    const loadMessages = useCallback(async (sessionId) => {
        try {
            const response = await axios.get(`${apiUrl}/api/chat/messages/${sessionId}`, {
                headers: { Authorization: `Bearer ${accessToken}` }
            });

            if (response.data.success) {
                // DEBUG: Kiểm tra messages từ backend
                console.log('Messages loaded from backend:', response.data.data);
                if (response.data.data && response.data.data.length > 0) {
                    response.data.data.forEach((msg, index) => {
                        console.log(`Message ${index}:`, {
                            id: msg.id,
                            createdAt: msg.createdAt, // 👈 THÊM createdAt
                            created_at: msg.created_at, // 👈 VÀ created_at
                            type: typeof msg.createdAt
                        });
                    });
                }

                setMessages(response.data.data);
            }
        } catch (error) {
            console.error('Failed to load messages:', error);
            toast.error('Không thể tải tin nhắn!');
        }
    }, [apiUrl, accessToken]);

    // Initialize socket connection - FIXED
    useEffect(() => {
        if (!accessToken) {
            toast.error('Vui lòng đăng nhập với tài khoản admin!');
            return;
        }

        // Clean up existing socket
        if (socketRef.current) {
            socketRef.current.disconnect();
            socketRef.current = null;
        }

        socketRef.current = io(apiUrl, {
            auth: { token: accessToken },
            transports: ['websocket', 'polling']
        });

        const socket = socketRef.current;

        const handleConnect = () => {
            console.log('✅ Admin socket connected');
            setIsConnected(true);
            socket.emit('join_admin');
            console.log('📢 Emitted join_admin event');

            // Test socket connection
            socket.emit('test_connection', { message: 'Admin connected' });
        };

        // THÊM EVENT TEST
        socket.on('test_response', (data) => {
            console.log('✅ Socket test response:', data);
        });

        const handleDisconnect = () => {
            console.log('Admin socket disconnected');
            setIsConnected(false);
        };

        const handleNewMessage = (message) => {
            if (message.sender_type === 'admin') {
                return;
            }
            // Only update if this is the selected session AND message doesn't exist
            if (selectedSession && message.session_id === selectedSession.session_id) {
                setMessages((prev) => {
                    const messageExists = prev.some(m => m.id === message.id);
                    if (messageExists) return prev;
                    return [...prev, message];
                });
            }
        };

        // Trong handleNewUserMessage
        const handleNewUserMessage = (data) => {
            // KIỂM TRA DỮ LIỆU NHẬN ĐƯỢC
            if (!data || !data.sessionId) {
                console.error('❌ Invalid new_user_message data:', data);
                return;
            }

            // 👇 KIỂM TRA: Nếu admin đang ở trong session này thì KHÔNG hiển thị unread
            const isAdminInThisSession = selectedSession && selectedSession.session_id === data.sessionId;

            if (isAdminInThisSession) {
                console.log('👁️ Admin is in this session, skipping unread update');
                return; // Không cập nhật unread count
            }

            // Cập nhật sessions list với unread count mới
            setSessions(prev => {
                const updated = prev.map(session =>
                    session.session_id === data.sessionId
                        ? {
                            ...session,
                            unread_count: data.unread_count || (session.unread_count + 1),
                            has_unread: true,
                            last_message_at: new Date().toISOString()
                        }
                        : session
                );
                console.log('🔄 Updated sessions with new message (admin not in session)');
                return updated;
            });

            toast.success('Tin nhắn mới từ khách hàng!', {
                icon: '💬',
                duration: 3000
            });
        };

        const handleSessionUpdated = (data) => {
            // Nếu là update unread count
            if (data.action === 'unread_updated') {
                setSessions(prev => prev.map(session =>
                    session.session_id === data.sessionId
                        ? {
                            ...session,
                            unread_count: data.unread_count,
                            has_unread: data.unread_count > 0
                        }
                        : session
                ));
            } else {
                // Load lại toàn bộ sessions
                loadSessions();
            }
        };

        const handleError = (error) => {
            console.error('Admin socket error:', error);
            toast.error('Lỗi kết nối. Vui lòng thử lại!');
        };

        // Add event listeners
        socket.on('connect', handleConnect);
        socket.on('disconnect', handleDisconnect);
        socket.on('new_message', handleNewMessage);
        socket.on('new_user_message', handleNewUserMessage);
        socket.on('session_updated', handleSessionUpdated);
        socket.on('error', handleError);
        // Load initial data
        loadSessions();
        loadStats();

        return () => {
            // Remove all event listeners
            socket.off('connect', handleConnect);
            socket.off('disconnect', handleDisconnect);
            socket.off('new_message', handleNewMessage);
            socket.off('new_user_message', handleNewUserMessage);
            socket.off('session_updated', handleSessionUpdated);
            socket.off('error', handleError);

            socket.disconnect();
            socketRef.current = null;
            hasJoinedRoomRef.current = false;
        };
    }, [accessToken, apiUrl, loadSessions, loadStats, selectedSession]);
    // THÊM HÀM markMessagesAsRead Ở NGOÀI useEffect
    const markMessagesAsRead = async (sessionId) => {
        try {

            const response = await axios.post(
                `${apiUrl}/api/chat/sessions/${sessionId}/read`, // 👈 SỬA THIẾU ${apiUrl}
                {},
                {
                    headers: { Authorization: `Bearer ${accessToken}` }
                }
            );
            // Cập nhật local state
            setSessions(prev => prev.map(session =>
                session.session_id === sessionId
                    ? { ...session, unread_count: 0, has_unread: false }
                    : session
            ));

        } catch (error) {
            console.error('❌ Failed to mark messages as read:', error);
            toast.error('Không thể đánh dấu tin nhắn đã đọc!');
        }
    };


    // Handle session selection
    const handleSelectSession = useCallback(async (session) => {
        setSelectedSession(session);
        await loadMessages(session.session_id);

        // Đánh dấu đã đọc nếu có tin nhắn chưa đọc
        if (session.has_unread) {
            await markMessagesAsRead(session.session_id);
        }

        // Reset join room flag
        hasJoinedRoomRef.current = false;

        // Join socket room
        if (socketRef.current && !hasJoinedRoomRef.current) {
            socketRef.current.emit('join_chat', session.session_id);
            hasJoinedRoomRef.current = true;
            console.log('Joined room:', session.session_id);
        }
    }, [loadMessages, markMessagesAsRead]); // 👈 THÊM markMessagesAsRead VÀO DEPENDENCY

    // Send message
    // ChatAdminPanel.jsx - Sửa handleSendMessage
    const handleSendMessage = async () => {
        if (!inputMessage.trim() || !selectedSession) return;

        const messageText = inputMessage.trim();
        setInputMessage('');

        try {
            // Optimistic update với ID tạm thời
            const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            const now = new Date();

            const tempMessage = {
                id: tempId,
                message: messageText,
                sender_type: 'admin',
                created_at: now.toISOString(),
                display_time: formatTime(now),
                user: {
                    id: authStatus?.id || 'admin',
                    first_name: user?.first_name || 'Admin',
                    last_name: user?.last_name || '',
                    image: user?.image || null,
                    is_admin: true
                }
            };

            setMessages((prev) => [...prev, tempMessage]);

            // Send via socket ONLY
            socketRef.current?.emit('send_message', {
                sessionId: selectedSession.session_id,
                message: messageText,
                messageType: 'text'
            });

            console.log('✅ Admin message sent via socket:', messageText);

        } catch (error) {
            console.error('Failed to send message:', error);
            toast.error('Không thể gửi tin nhắn!');
            // Remove optimistic message on error
            setMessages((prev) => prev.filter((m) => m.id === tempId));
        }
    };

    // Update session status
    const handleUpdateStatus = async (sessionId, status) => {
        try {
            await axios.put(
                `${apiUrl}/api/chat/admin/sessions/${sessionId}`,
                { status },
                {
                    headers: { Authorization: `Bearer ${accessToken}` }
                }
            );

            toast.success(`Đã ${status === 'closed' ? 'đóng' : 'cập nhật'} phiên chat!`);
            loadSessions();

            if (selectedSession?.session_id === sessionId) {
                setSelectedSession((prev) => ({ ...prev, status }));
            }
        } catch (error) {
            console.error('Failed to update status:', error);
            toast.error('Không thể cập nhật trạng thái!');
        }
    };

    // Format time - ULTRA SAFE VERSION
    const formatTime = (date) => {
        try {
            console.log('Formatting date:', date, 'Type:', typeof date); // DEBUG

            if (!date) {
                return '--:--';
            }

            // Xử lý nhiều định dạng
            let dateObj;

            if (date instanceof Date) {
                dateObj = date;
            } else if (typeof date === 'string') {
                dateObj = new Date(date);

                // Nếu không được, thử parse timestamp
                if (isNaN(dateObj.getTime()) && !isNaN(date)) {
                    dateObj = new Date(parseInt(date));
                }
            } else if (typeof date === 'number') {
                dateObj = new Date(date);
            } else {
                return '--:--';
            }

            if (isNaN(dateObj.getTime())) {
                console.warn('Invalid date:', date);
                return '--:--';
            }

            return dateObj.toLocaleTimeString('vi-VN', {
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            console.error('Date formatting error:', error, 'Date:', date);
            return '--:--';
        }
    };

    // Filter sessions
    const filteredSessions = sessions.filter((session) => {
        const matchesSearch = searchTerm
            ? (session.display_user?.first_name + ' ' + session.display_user?.last_name)
                .toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
            session.session_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (session.has_unread && 'chưa đọc'.includes(searchTerm.toLowerCase()))
            : true;
        return matchesSearch;
    });

    return (

        <div className="h-screen bg-gray-100 flex">
            {/* Sidebar - Sessions List */}
            <div className="w-96 bg-white border-r border-gray-200 flex flex-col">
                {/* Header */}
                <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                        <h1 className="text-xl font-bold text-gray-800">Admin Chat Panel</h1>

                        <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                            <span className="text-xs text-gray-500">
                                {isConnected ? 'Connected' : 'Disconnected'}
                            </span>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-4 gap-2 mb-4">
                        <div className="bg-blue-50 p-2 rounded-lg text-center">
                            <p className="text-xs text-gray-600">Tổng</p>
                            <p className="text-lg font-bold text-blue-600">{stats.total}</p>
                        </div>
                        <div className="bg-green-50 p-2 rounded-lg text-center">
                            <p className="text-xs text-gray-600">Active</p>
                            <p className="text-lg font-bold text-green-600">{stats.active}</p>
                        </div>
                        <div className="bg-yellow-50 p-2 rounded-lg text-center">
                            <p className="text-xs text-gray-600">Waiting</p>
                            <p className="text-lg font-bold text-yellow-600">{stats.waiting}</p>
                        </div>
                        <div className="bg-gray-50 p-2 rounded-lg text-center">
                            <p className="text-xs text-gray-600">Closed</p>
                            <p className="text-lg font-bold text-gray-600">{stats.closed}</p>
                        </div>
                    </div>

                    {/* Search */}
                    <div className="relative mb-3">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Tìm kiếm..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* Filter */}
                    <div className="flex gap-2">
                        {['all', 'active', 'waiting', 'closed'].map((status) => (
                            <button
                                key={status}
                                onClick={() => setFilter(status)}
                                className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-medium transition-colors ${filter === status
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                {status === 'all' ? 'Tất cả' : status.charAt(0).toUpperCase() + status.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Sessions List */}
                <div className="flex-1 overflow-y-auto">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-full">
                            <Loader2 className="animate-spin text-blue-600" size={32} />
                        </div>
                    ) : filteredSessions.length === 0 ? (
                        <div className="text-center text-gray-500 mt-8 px-4">
                            <MessageCircle size={48} className="mx-auto mb-4 text-gray-300" />
                            <p className="text-sm">Không có phiên chat nào</p>
                        </div>
                    ) : (

                        filteredSessions.map((session) => {
                            // 👇 KIỂM TRA: Nếu admin đang ở trong session này thì ẩn unread
                            const isCurrentSession = selectedSession && selectedSession.session_id === session.session_id;
                            const showUnread = session.has_unread && !isCurrentSession;

                            return (
                                <div
                                    key={session.id}
                                    onClick={() => handleSelectSession(session)}
                                    className={`p-4 border-b border-gray-100 cursor-pointer transition-all duration-200 ${selectedSession?.id === session.id ? 'bg-blue-50 border-l-4 border-l-blue-500' :
                                        showUnread ? 'bg-yellow-50 border-l-4 border-l-yellow-400 hover:bg-yellow-100' :
                                            'hover:bg-gray-50'
                                        }`}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="relative">
                                            <UserAvatar
                                                user={session.display_user || { is_guest: true }}
                                                senderType={session.display_user?.is_admin ? 'admin' : 'user'}
                                                size={10}
                                            />
                                            {/* UNREAD BADGE - CHỈ HIỆN KHI KHÔNG PHẢI SESSION HIỆN TẠI */}
                                            {showUnread && (
                                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                                                    {session.unread_count > 9 ? '9+' : session.unread_count}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-1">
                                                <div className="flex items-center gap-2">
                                                    <h3 className={`font-semibold text-sm truncate ${showUnread ? 'text-gray-900 font-bold' : 'text-gray-800'
                                                        }`}>
                                                        {session.display_user
                                                            ? `${session.display_user.first_name || ''} ${session.display_user.last_name || ''}`
                                                            : 'Guest User'}
                                                    </h3>
                                                    {/* ONLINE INDICATOR (tuỳ chọn) */}
                                                    {session.status === 'active' && (
                                                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                                    )}
                                                </div>
                                                <span className="text-xs text-gray-500">
                                                    {session.last_message_at ? formatTime(session.last_message_at) : '--:--'}
                                                </span>
                                            </div>
                                            <p className={`text-xs truncate mb-1 ${showUnread ? 'text-gray-800 font-medium' : 'text-gray-500'
                                                }`}>
                                                {session.messages?.[0]?.message || 'Không có tin nhắn'}
                                            </p>
                                            <div className="flex items-center gap-2">
                                                <span
                                                    className={`text-xs px-2 py-0.5 rounded-full ${session.status === 'active'
                                                        ? 'bg-green-100 text-green-700'
                                                        : session.status === 'waiting'
                                                            ? 'bg-yellow-100 text-yellow-700'
                                                            : 'bg-gray-100 text-gray-700'
                                                        }`}
                                                >
                                                    {session.status}
                                                </span>
                                                {/* UNREAD TEXT BADGE - CHỈ HIỆN KHI KHÔNG PHẢI SESSION HIỆN TẠI */}
                                                {showUnread && (
                                                    <span className="text-xs px-2 py-0.5 bg-red-100 text-red-700 rounded-full">
                                                        {session.unread_count} tin nhắn mới
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })

                    )}
                </div>

                {/* Refresh Button */}
                <div className="p-3 border-t border-gray-200">
                    <button
                        onClick={() => {
                            loadSessions();
                            loadStats();
                        }}
                        className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center gap-2 transition-colors"
                    >
                        <RefreshCw size={16} />
                        <span className="text-sm font-medium">Làm mới</span>
                    </button>
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col">
                {selectedSession ? (
                    <>
                        {/* Chat Header */}
                        <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setSelectedSession(null)}
                                    className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
                                >
                                    <ArrowLeft size={20} />
                                </button>

                                {/* SỬA Ở ĐÂY - DÙNG display_user */}
                                <UserAvatar
                                    user={selectedSession.display_user || { is_guest: true }}
                                    senderType={selectedSession.display_user?.is_admin ? 'admin' : 'user'}
                                    size={10}
                                />

                                <div>
                                    <h2 className="font-semibold text-gray-800">
                                        {selectedSession.display_user
                                            ? `${selectedSession.display_user.first_name || ''} ${selectedSession.display_user.last_name || ''}`
                                            : 'Guest User'}
                                    </h2>
                                    <p className="text-xs text-gray-500">
                                        Session: {selectedSession.session_id.slice(0, 12)}...
                                        {!selectedSession.display_user && " • Guest"}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <span
                                    className={`text-xs px-3 py-1 rounded-full font-medium ${selectedSession.status === 'active'
                                        ? 'bg-green-100 text-green-700'
                                        : selectedSession.status === 'waiting'
                                            ? 'bg-yellow-100 text-yellow-700'
                                            : 'bg-gray-100 text-gray-700'
                                        }`}
                                >
                                    {selectedSession.status}
                                </span>
                                {selectedSession.status !== 'closed' && (
                                    <button
                                        onClick={() => handleUpdateStatus(selectedSession.session_id, 'closed')}
                                        className="px-3 py-1 bg-red-100 text-red-700 text-xs rounded-full hover:bg-red-200 transition-colors"
                                    >
                                        Đóng chat
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                            {messages.length === 0 ? (
                                <div className="text-center text-gray-500 mt-8">
                                    <MessageCircle size={48} className="mx-auto mb-4 text-gray-300" />
                                    <p className="text-sm">Chưa có tin nhắn nào</p>
                                </div>
                            ) : (
                                messages.map((msg, index) => (
                                    <div key={msg.id || index}>
                                        <div
                                            className={`flex ${msg.sender_type === 'admin' ? 'justify-end' : 'justify-start'
                                                }`}
                                        >
                                            {/* THÊM AVATAR CHO USER MESSAGES */}
                                            {msg.sender_type !== 'admin' && (
                                                <UserAvatar
                                                    user={msg.user}
                                                    senderType={msg.sender_type}
                                                    size={8}
                                                    className="mr-2"
                                                />
                                            )}

                                            <div
                                                className={`max-w-[70%] rounded-2xl px-4 py-2 ${msg.sender_type === 'admin'
                                                    ? 'bg-blue-600 text-white rounded-br-none'
                                                    : msg.sender_type === 'bot'
                                                        ? 'bg-gray-200 text-gray-800 rounded-bl-none'
                                                        : 'bg-white text-gray-800 rounded-bl-none shadow-sm'
                                                    }`}
                                            >
                                                {msg.sender_type === 'user' && msg.user && (
                                                    <p className="text-xs font-semibold text-blue-600 mb-1">
                                                        {msg.user.first_name} {msg.user.last_name}
                                                    </p>
                                                )}
                                                {msg.sender_type === 'admin' && msg.user && (
                                                    <p className="text-xs font-semibold text-blue-100 mb-1">
                                                        You
                                                    </p>
                                                )}
                                                <p className="text-sm whitespace-pre-wrap break-words">
                                                    {msg.message}
                                                </p>
                                                <p
                                                    className={`text-xs mt-1 ${msg.sender_type === 'admin' ? 'text-blue-100' : 'text-gray-500'
                                                        }`}
                                                >
                                                    {msg.display_time || formatTime(msg.createdAt)}
                                                </p>
                                            </div>

                                            {/* THÊM AVATAR CHO ADMIN MESSAGES */}
                                            {msg.sender_type === 'admin' && (
                                                <UserAvatar
                                                    user={msg.user}
                                                    senderType={msg.sender_type}
                                                    size={8}
                                                    className="ml-2"
                                                />
                                            )}
                                        </div>

                                        {/* Quick replies */}
                                        {msg.metadata?.quick_replies && msg.sender_type !== 'admin' && (
                                            <div className="flex flex-wrap gap-2 mt-2 ml-2">
                                                {msg.metadata.quick_replies.map((reply, i) => (
                                                    <button
                                                        key={i}
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
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <div className="bg-white border-t border-gray-200 p-4">
                            {selectedSession.status === 'closed' ? (
                                <div className="text-center py-4">
                                    <p className="text-sm text-gray-500 mb-2">
                                        Phiên chat này đã được đóng
                                    </p>
                                    <button
                                        onClick={() => handleUpdateStatus(selectedSession.session_id, 'active')}
                                        className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                        Mở lại phiên chat
                                    </button>
                                </div>
                            ) : (
                                <div className="flex items-end gap-2">
                                    <div className="flex-1">
                                        <textarea
                                            value={inputMessage}
                                            onChange={(e) => setInputMessage(e.target.value)}
                                            onKeyPress={(e) => {
                                                if (e.key === 'Enter' && !e.shiftKey) {
                                                    e.preventDefault();
                                                    handleSendMessage();
                                                }
                                            }}
                                            placeholder="Nhập tin nhắn... (Shift + Enter để xuống dòng)"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                            rows="2"
                                            disabled={!isConnected}
                                        />
                                    </div>
                                    <button
                                        onClick={handleSendMessage}
                                        disabled={!inputMessage.trim() || !isConnected}
                                        className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-xl transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex-shrink-0"
                                    >
                                        <Send size={20} />
                                    </button>
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center bg-gray-50">
                        <div className="text-center text-gray-400">
                            <MessageCircle size={64} className="mx-auto mb-4" />
                            <h3 className="text-lg font-semibold mb-2">Chọn một phiên chat</h3>
                            <p className="text-sm">
                                Chọn một phiên chat từ danh sách bên trái để bắt đầu
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChatAdminPanel;