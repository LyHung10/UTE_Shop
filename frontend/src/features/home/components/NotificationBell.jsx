// frontend/src/components/NotificationBell.jsx
"use client"
import React, { useState, useEffect, useRef } from "react"
import { Bell, Check, CheckCheck, Loader2 } from "lucide-react"
import { Menu, MenuButton, MenuItems, MenuItem } from "@headlessui/react"
import { motion, AnimatePresence } from "framer-motion"
import { useSelector } from "react-redux"
import notificationService from "@/services/notificationService"
import socketService from "@/services/socketService"

const NotificationBell = () => {
  const user = useSelector((state) => state.user.account)
  const isAuthenticated = useSelector((state) => state.user.isAuthenticated)
  
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  
  const notificationSocketRef = useRef(null) // ĐỔI TÊN CHO RÕ

  // Format thời gian
  const formatTime = (dateString) => {
    if (!dateString) return 'Vừa xong';
    
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60))
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now - date) / (1000 * 60))
      return diffInMinutes < 1 ? 'Vừa xong' : `${diffInMinutes} phút trước`
    } else if (diffInHours < 24) {
      return `${diffInHours} giờ trước`
    } else {
      return date.toLocaleDateString('vi-VN')
    }
  }

  // Lấy màu sắc theo type
  const getTypeColor = (type) => {
    const colors = {
      info: 'bg-blue-100 text-blue-800 border-blue-200',
      success: 'bg-green-100 text-green-800 border-green-200',
      warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      error: 'bg-red-100 text-red-800 border-red-200'
    }
    return colors[type] || colors.info
  }

  // Lấy icon theo type
  const getTypeIcon = (type) => {
    const icons = {
      info: '🔔',
      success: '✅',
      warning: '⚠️',
      error: '❌'
    }
    return icons[type] || icons.info
  }

  // Fetch notifications
  const fetchNotifications = async () => {
    if (!isAuthenticated) {
      console.log('Not authenticated, skipping fetch');
      return;
    }
    
    try {
      console.log('🔄 Fetching notifications...');
      setIsLoading(true);
      const response = await notificationService.getNotifications(1, 10);
      console.log('📨 Notifications response:', response);
      
      if (response && response.success) {
        setNotifications(response.data.notifications || []);
        console.log('✅ Notifications loaded:', response.data.notifications?.length);
      } else {
        console.log('❌ No notifications or failed response');
        setNotifications([]);
      }
    } catch (error) {
      console.error('❌ Error fetching notifications:', error);
      setNotifications([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch unread count
  const fetchUnreadCount = async () => {
    if (!isAuthenticated) return
    
    try {
      console.log('🔄 Fetching unread count...');
      const response = await notificationService.getUnreadCount();
      console.log('📊 Unread count response:', response);
      
      if (response && response.success) {
        setUnreadCount(response.data.unread_count || 0);
        console.log('✅ Unread count:', response.data.unread_count);
      } else {
        console.log('❌ Failed to get unread count');
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('❌ Error fetching unread count:', error);
      setUnreadCount(0);
    }
  };

  // Mark as read
  const handleMarkAsRead = async (notificationId) => {
    try {
      console.log('📝 Marking as read:', notificationId);
      const response = await notificationService.markAsRead(notificationId);
      console.log('✅ Mark as read response:', response);
      
      if (response && response.success) {
        // Update local state
        setNotifications(prev => 
          prev.map(notif => 
            notif.id === notificationId 
              ? { ...notif, is_read: true }
              : notif
          )
        );
        
        // Update unread count
        setUnreadCount(prev => Math.max(0, prev - 1));
        
        // Emit qua NOTIFICATION socket (SỬA TÊN)
        if (notificationSocketRef.current) {
          notificationSocketRef.current.emit('mark_as_read', { notificationId });
        }
      }
    } catch (error) {
      console.error('❌ Error marking as read:', error);
    }
  };

  // Mark all as read
  const handleMarkAllAsRead = async () => {
    try {
      console.log('📝 Marking all as read');
      const response = await notificationService.markAllAsRead();
      console.log('✅ Mark all read response:', response);
      
      if (response && response.success) {
        // Update local state
        setNotifications(prev => 
          prev.map(notif => ({ ...notif, is_read: true }))
        );
        
        // Reset unread count
        setUnreadCount(0);
        
        // Emit qua NOTIFICATION socket (SỬA TÊN)
        if (notificationSocketRef.current) {
          notificationSocketRef.current.emit('mark_all_read');
        }
      }
    } catch (error) {
      console.error('❌ Error marking all as read:', error);
    }
  };

  // Initialize NOTIFICATION socket - SỬA LẠI QUAN TRỌNG
  useEffect(() => {
    if (!isAuthenticated || !user?.accessToken) {
      console.log('❌ Not authenticated or no token, skipping notification socket');
      return;
    }

    console.log('🔄 Initializing NOTIFICATION socket connection...');
    
    // QUAN TRỌNG: Dùng connectNotification() thay vì connect()
    const notificationSocket = socketService.connectNotification(user.accessToken, user.id || user.sub);
    notificationSocketRef.current = notificationSocket;

    // Listen for new notifications
    notificationSocket.on('new_notification', (data) => {
      console.log('🎉 NEW REAL-TIME NOTIFICATION:', data);
      // THÊM KIỂM TRA TRÙNG LẶP
      setNotifications(prev => {
        const exists = prev.find(notif => notif.id === data.id);
        if (exists) return prev;
        return [data, ...prev];
      });
      setUnreadCount(prev => prev + 1);
    });

    // Listen for unread count updates
    notificationSocket.on('unread_count_update', (data) => {
      console.log('📊 Unread count updated:', data);
      setUnreadCount(data.unread_count || 0);
    });

    // Listen for socket errors
    notificationSocket.on('connect_error', (error) => {
      console.error('❌ Notification socket connection error:', error);
    });

    // Fetch initial data
    console.log('📥 Fetching initial notification data...');
    fetchNotifications();
    fetchUnreadCount();

    return () => {
      console.log('🧹 Cleaning up notification socket...');
      if (notificationSocketRef.current) {
        notificationSocketRef.current.off('new_notification');
        notificationSocketRef.current.off('unread_count_update');
        notificationSocketRef.current.off('connect_error');
        // KHÔNG gọi socketService.disconnect() vì nó sẽ disconnect cả chat
      }
    };
  }, [isAuthenticated, user]);

  // Reset khi logout
  useEffect(() => {
    if (!isAuthenticated) {
      setNotifications([]);
      setUnreadCount(0);
      // Cleanup socket reference
      notificationSocketRef.current = null;
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return null;
  }

  console.log('🔔 Rendering NotificationBell:', { 
    notificationsCount: notifications.length, 
    unreadCount,
    isLoading 
  });

  return (
    <Menu as="div" className="relative">
      {({ open }) => (
        <>
          <MenuButton 
            className="relative p-2 rounded-full hover:bg-white/10 transition-all duration-200 group"
          >
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Bell className={`w-6 h-6 transition-colors ${
                open 
                  ? "text-orange-400" 
                  : "text-white group-hover:text-orange-300"
              }`} />
              
              {unreadCount > 0 && (
                <motion.span
                  className="absolute -top-1 -right-1 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold border-2 border-slate-900"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                >
                  {unreadCount > 9 ? '9+' : unreadCount}
                </motion.span>
              )}
            </motion.div>
          </MenuButton>

          <AnimatePresence>
            {open && (
              <MenuItems 
                static
                as={motion.div}
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                transition={{ duration: 0.2 }}
                className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-50"
              >
                <div className="p-4 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Thông báo {unreadCount > 0 && `(${unreadCount} mới)`}
                    </h3>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllAsRead}
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
                      >
                        Đánh dấu tất cả đã đọc
                      </button>
                    )}
                  </div>
                </div>

                <div className="max-h-96 overflow-y-auto">
                  {isLoading ? (
                    <div className="flex justify-center items-center py-8">
                      <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
                      <span className="ml-2 text-gray-600">Đang tải thông báo...</span>
                    </div>
                  ) : notifications.length > 0 ? (
                    <div className="divide-y divide-gray-100">
                      {notifications.map((notification) => (
                        <MenuItem key={notification.id} as="div">
                          {({ active }) => (
                            <div
                              className={`p-4 transition-colors ${
                                active ? 'bg-gray-50' : 'bg-white'
                              } ${
                                !notification.is_read ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                              }`}
                            >
                              <div className="flex gap-3">
                                <div className="flex-shrink-0">
                                  <span className="text-lg">
                                    {getTypeIcon(notification.type)}
                                  </span>
                                </div>
                                
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between gap-2">
                                    <h4 className={`text-sm font-medium ${
                                      notification.is_read ? 'text-gray-700' : 'text-gray-900'
                                    }`}>
                                      {notification.title}
                                    </h4>
                                    <span className="flex-shrink-0 text-xs text-gray-500 mt-0.5">
                                      {formatTime(notification.created_at)}
                                    </span>
                                  </div>
                                  
                                  <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                                    {notification.message}
                                  </p>
                                  
                                  <div className="flex items-center justify-between mt-2">
                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getTypeColor(notification.type)}`}>
                                      {notification.type}
                                    </span>
                                    
                                    {!notification.is_read && (
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleMarkAsRead(notification.id);
                                        }}
                                        className="text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors flex items-center gap-1"
                                      >
                                        <Check className="w-3 h-3" />
                                        Đánh dấu đã đọc
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </MenuItem>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500 text-sm">Không có thông báo nào</p>
                      <p className="text-gray-400 text-xs mt-1">
                        Các thông báo mới sẽ xuất hiện ở đây
                      </p>
                    </div>
                  )}
                </div>

                {notifications.length > 0 && (
                  <div className="p-3 border-t border-gray-100 bg-gray-50">
                    <button
                      onClick={() => {
                        // Navigate to notifications page
                        console.log('Navigate to all notifications');
                      }}
                      className="w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
                    >
                      Xem tất cả thông báo
                    </button>
                  </div>
                )}
              </MenuItems>
            )}
          </AnimatePresence>
        </>
      )}
    </Menu>
  )
}

export default NotificationBell;