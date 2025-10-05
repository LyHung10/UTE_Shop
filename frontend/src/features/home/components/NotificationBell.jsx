import React, { useState, useEffect, useRef } from "react";
import { Bell, Check, Loader2 } from "lucide-react";
import { Menu, MenuButton, MenuItems, MenuItem } from "@headlessui/react";
import { motion, AnimatePresence } from "framer-motion";
import { useSelector } from "react-redux";
import notificationService from "@/services/notificationService";
import socketService from "@/services/socketService";

const NotificationBell = () => {
  const authStatus = useSelector((state) => state.authStatus);

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Giữ socket instance
  const socketRef = useRef(null);
  const hasSetupSocketRef = useRef(false);

  // Format thời gian
  const formatTime = (dateString) => {
    if (!dateString) return "Vừa xong";
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInMs = now - date;
      if (isNaN(date.getTime())) return "Vừa xong";

      const diffInSeconds = Math.floor(diffInMs / 1000);
      const diffInMinutes = Math.floor(diffInSeconds / 60);
      const diffInHours = Math.floor(diffInMinutes / 60);
      const diffInDays = Math.floor(diffInHours / 24);
      const diffInWeeks = Math.floor(diffInDays / 7);
      const diffInMonths = Math.floor(diffInDays / 30);

      if (diffInSeconds < 60) return "Vừa xong";
      if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
      if (diffInHours < 24) return `${diffInHours} giờ trước`;
      if (diffInDays === 1) return "Hôm qua";
      if (diffInDays < 7) return `${diffInDays} ngày trước`;
      if (diffInWeeks < 4) return `${diffInWeeks} tuần trước`;
      if (diffInMonths < 12) return `${diffInMonths} tháng trước`;

      return date.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      console.error("Error formatting date:", error, dateString);
      return "Vừa xong";
    }
  };

  // Màu theo type
  const getTypeColor = (type) => {
    const colors = {
      info: "bg-blue-100 text-blue-800 border-blue-200",
      success: "bg-green-100 text-green-800 border-green-200",
      warning: "bg-yellow-100 text-yellow-800 border-yellow-200",
      error: "bg-red-100 text-red-800 border-red-200",
    };
    return colors[type] || colors.info;
  };

  // Icon theo type
  const getTypeIcon = (type) => {
    const icons = { info: "🔔", success: "✅", warning: "⚠️", error: "❌" };
    return icons[type] || icons.info;
  };

  // Fetch notifications
  const fetchNotifications = async () => {
    if (!authStatus.isAuthenticated) return;
    try {
      setIsLoading(true);
      const response = await notificationService.getNotifications(1, 10);
      if (response && response.success) {
        setNotifications(response.data.notifications || []);
      } else {
        setNotifications([]);
      }
    } catch (error) {
      console.error("❌ Error fetching notifications:", error);
      setNotifications([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch unread count
  const fetchUnreadCount = async () => {
    if (!authStatus.isAuthenticated) return;
    try {
      const response = await notificationService.getUnreadCount();
      if (response && response.success) {
        setUnreadCount(response.data.unread_count || 0);
      } else {
        setUnreadCount(0);
      }
    } catch (error) {
      console.error("❌ Error fetching unread count:", error);
      setUnreadCount(0);
    }
  };

  // Mark as read
  const handleMarkAsRead = async (notificationId) => {
    try {
      const response = await notificationService.markAsRead(notificationId);
      if (response && response.success) {
        setNotifications((prev) =>
            prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));

        if (socketRef.current?.connected) {
          socketRef.current.emit("mark_as_read", { notificationId });
        }
      }
    } catch (error) {
      console.error("❌ Error marking as read:", error);
    }
  };

  // Mark all as read
  const handleMarkAllAsRead = async () => {
    try {
      const response = await notificationService.markAllAsRead();
      if (response && response.success) {
        setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
        setUnreadCount(0);

        if (socketRef.current?.connected) {
          socketRef.current.emit("mark_all_read");
        }
      }
    } catch (error) {
      console.error("❌ Error marking all as read:", error);
    }
  };

  // Setup socket + listeners (chỉ thêm phần cần thiết)
  useEffect(() => {
    const token = authStatus?.accessToken;
    const userId = authStatus?.id || authStatus?.sub;

    if (!authStatus.isAuthenticated || !token || !userId) {
      // Nếu thiếu auth → ngắt kết nối cũ nếu có
      if (socketRef.current) {
        socketRef.current.disconnect?.();
        socketRef.current = null;
      }
      return;
    }

    // Nếu đã có socket và đang connected thì không cần setup lại
    if (socketRef.current?.connected) {
      return;
    }

    // Kết nối (singleton theo service)
    const socket = socketService.connectNotification(token, userId);
    if (!socket) {
      console.error("❌ Failed to connect notification socket");
      return;
    }
    socketRef.current = socket;

    // Listeners đính TRỰC TIẾP vào socket instance
    const onNewNotification = (data) => {
      setNotifications((prev) => {
        if (prev.some((n) => n.id === data.id)) return prev;
        return [data, ...prev];
      });
      setUnreadCount((prev) => prev + 1);
    };

    const onUnreadCountUpdate = (data) => {
      setUnreadCount(data?.unread_count ?? 0);
    };

    const onConnectError = (error) => {
      console.error("❌ Notification socket error:", error);
    };

    socket.on("new_notification", onNewNotification);
    socket.on("unread_count_update", onUnreadCountUpdate);
    socket.on("connect_error", onConnectError);

    // Tải dữ liệu ban đầu
    fetchNotifications();
    fetchUnreadCount();

    hasSetupSocketRef.current = true;

    // Cleanup: tháo listeners (không disconnect để giữ kết nối giữa các route)
    return () => {
      if (!socketRef.current) return;
      socketRef.current.off("new_notification", onNewNotification);
      socketRef.current.off("unread_count_update", onUnreadCountUpdate);
      socketRef.current.off("connect_error", onConnectError);
    };
  }, [
    authStatus.isAuthenticated,
    authStatus?.accessToken,
    authStatus?.id,
    authStatus?.sub,
  ]);

  // Reset khi logout (giữ nguyên ý tưởng, chỉ đảm bảo disconnect đúng instance)
  useEffect(() => {
    if (authStatus.isAuthenticated) {
      fetchNotifications();
      fetchUnreadCount();
    } else {
      setNotifications([]);
      setUnreadCount(0);
      hasSetupSocketRef.current = false;
      socketRef.current?.disconnect?.();
      socketRef.current = null;
    }
  }, [authStatus.isAuthenticated]);

  if (!authStatus.isAuthenticated) return null;

  return (
      <Menu as="div" className="relative">
        {({ open }) => (
            <>
              <MenuButton className="relative p-2 rounded-full hover:bg-white/10 transition-all duration-200 group">
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                  <Bell
                      className={`w-6 h-6 transition-colors ${
                          open ? "text-orange-400" : "text-white group-hover:text-orange-300"
                      }`}
                  />
                  {unreadCount > 0 && (
                      <motion.span
                          className="absolute -top-1 -right-1 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold border-2 border-slate-900"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      >
                        {unreadCount > 9 ? "9+" : unreadCount}
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
                                                active ? "bg-gray-50" : "bg-white"
                                            } ${
                                                !notification.is_read
                                                    ? "bg-blue-50 border-l-4 border-l-blue-500"
                                                    : ""
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
                                                <h4
                                                    className={`text-sm font-medium ${
                                                        notification.is_read
                                                            ? "text-gray-700"
                                                            : "text-gray-900"
                                                    }`}
                                                >
                                                  {notification.title}
                                                </h4>
                                                <span className="flex-shrink-0 text-xs text-gray-500 mt-0.5">
                                      {formatTime(notification.createdAt)}
                                    </span>
                                              </div>

                                              <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                                                {notification.message}
                                              </p>

                                              <div className="flex items-center justify-between mt-2">
                                    <span
                                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getTypeColor(
                                            notification.type
                                        )}`}
                                    >
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
                                  console.log("Navigate to all notifications");
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
  );
};

export default NotificationBell;
