// frontend/src/components/admin/AdminNotificationSender.jsx
"use client"
import React, { useState, useEffect } from "react"
import { Send, Users, Globe, User, Loader2, CheckCircle, AlertCircle } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import adminNotificationService from "@/services/adminNotificationService"

const AdminNotificationSender = () => {
  const [formData, setFormData] = useState({
    user_id: '', // empty for broadcast
    title: '',
    message: '',
    type: 'info',
    related_entity: '',
    entity_id: ''
  })

  const [users, setUsers] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [sendOption, setSendOption] = useState('broadcast') // 'user', 'multiple', 'broadcast'
  const [selectedUsers, setSelectedUsers] = useState([])
  const [message, setMessage] = useState({ type: '', text: '' })

  // Fetch users khi search term thay đổi
  useEffect(() => {
    const fetchUsers = async () => {
      if (searchTerm.length < 2) {
        setUsers([])
        return
      }

      setIsLoading(true)
      try {
        const response = await adminNotificationService.getUsers(searchTerm)
        if (response.success) {
          setUsers(response.data.users || response.data || [])
        }
      } catch (error) {
        console.error('Error fetching users:', error)
        setMessage({ type: 'error', text: 'Lỗi khi tải danh sách users' })
      } finally {
        setIsLoading(false)
      }
    }

    const debounceTimer = setTimeout(fetchUsers, 300)
    return () => clearTimeout(debounceTimer)
  }, [searchTerm])

  // Handle form change
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Handle user selection
  const handleUserSelect = (user) => {
    if (sendOption === 'user') {
      // QUAN TRỌNG: set user_id là number, không phải object
      setFormData(prev => ({
        ...prev,
        user_id: user.id // Đây phải là number (ví dụ: 1, 2, 3...)
      }));
      setSearchTerm(`${user.first_name} ${user.last_name} (${user.email})`);
      setUsers([]);

      console.log('✅ User selected:', { id: user.id, name: `${user.first_name} ${user.last_name}` });
    } else if (sendOption === 'multiple') {
      if (!selectedUsers.find(u => u.id === user.id)) {
        setSelectedUsers(prev => [...prev, user]);
      }
      setSearchTerm('');
      setUsers([]);
    }
  };

  // Remove selected user (multiple mode)
  const removeSelectedUser = (userId) => {
    setSelectedUsers(prev => prev.filter(user => user.id !== userId))
  }

  // Trong handleSend function - THÊM DEBUG LOGS
  // Trong handleSend function - SỬA PHẦN GỬI ĐẾN 1 USER
  const handleSend = async (e) => {
    e.preventDefault()

    if (!formData.title.trim() || !formData.message.trim()) {
      setMessage({ type: 'error', text: 'Vui lòng nhập tiêu đề và nội dung' })
      return
    }

    if (sendOption === 'user' && !formData.user_id) {
      setMessage({ type: 'error', text: 'Vui lòng chọn user' })
      return
    }

    if (sendOption === 'multiple' && selectedUsers.length === 0) {
      setMessage({ type: 'error', text: 'Vui lòng chọn ít nhất một user' })
      return
    }

    setIsSending(true)
    setMessage({ type: '', text: '' })

    try {
      console.log('🔄 Sending notification...', {
        sendOption,
        formData,
        selectedUsers: selectedUsers.map(u => ({ id: u.id, name: u.first_name }))
      });

      let result

      // CHUẨN BỊ DỮ LIỆU CHUNG
      const baseData = {
        title: formData.title.trim(),
        message: formData.message.trim(),
        type: formData.type,
        related_entity: formData.related_entity || null,
        entity_id: formData.entity_id ? parseInt(formData.entity_id) : null
      };

      console.log('📦 Base data to send:', baseData);

      if (sendOption === 'broadcast') {
        // Gửi đến tất cả users
        console.log('📢 Broadcasting to all users');
        result = await adminNotificationService.broadcast(baseData);
      } else if (sendOption === 'user') {
        // Gửi đến user cụ thể - SỬA QUAN TRỌNG
        console.log('👤 Sending to single user:', formData.user_id);

        // ĐẢM BẢO user_id là NUMBER
        const userId = parseInt(formData.user_id);
        if (isNaN(userId)) {
          throw new Error('User ID không hợp lệ');
        }

        result = await adminNotificationService.sendToUser({
          ...baseData,
          user_id: userId // PHẢI CÓ user_id và phải là number
        });
      } else if (sendOption === 'multiple') {
        // Gửi đến nhiều users
        const userIds = selectedUsers.map(user => user.id);
        console.log('👥 Sending to multiple users:', userIds);
        result = await adminNotificationService.sendToUsers(userIds, baseData);
      }

      console.log('✅ Send notification result:', result);

      if (result && result.success) {
        setMessage({
          type: 'success',
          text: `Đã gửi thông báo thành công đến ${getRecipientCount()} người nhận`
        });

        // Reset form
        setFormData({
          user_id: '',
          title: '',
          message: '',
          type: 'info',
          related_entity: '',
          entity_id: ''
        });
        setSelectedUsers([]);
        setSearchTerm('');
      } else {
        throw new Error(result?.message || 'Failed to send notification');
      }

    } catch (error) {
      console.error('❌ Error sending notification:', error);
      setMessage({
        type: 'error',
        text: `Lỗi khi gửi thông báo: ${error.message}`
      });
    } finally {
      setIsSending(false);
    }
  }

  const getRecipientCount = () => {
    switch (sendOption) {
      case 'broadcast': return 'tất cả'
      case 'user': return '1'
      case 'multiple': return selectedUsers.length
      default: return '0'
    }
  }

  const notificationTypes = [
    { value: 'info', label: 'Thông tin', color: 'bg-blue-100 text-blue-800' },
    { value: 'success', label: 'Thành công', color: 'bg-green-100 text-green-800' },
    { value: 'warning', label: 'Cảnh báo', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'error', label: 'Lỗi', color: 'bg-red-100 text-red-800' }
  ]

  const sendOptions = [
    { value: 'broadcast', label: 'Gửi đến tất cả', icon: Globe },
    { value: 'user', label: 'Gửi đến user cụ thể', icon: User },
    { value: 'multiple', label: 'Gửi đến nhiều users', icon: Users }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Send className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Gửi Thông Báo</h1>
                <p className="text-blue-100 text-sm">
                  Gửi thông báo real-time đến users
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <AnimatePresence>
              {message.text && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`p-4 rounded-lg mb-6 flex items-center gap-3 ${message.type === 'success'
                    ? 'bg-green-50 border border-green-200 text-green-800'
                    : 'bg-red-50 border border-red-200 text-red-800'
                    }`}
                >
                  {message.type === 'success' ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <AlertCircle className="w-5 h-5" />
                  )}
                  <span className="font-medium">{message.text}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSend} className="space-y-6">
              {/* Send Options */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Chọn phương thức gửi
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {sendOptions.map((option) => {
                    const Icon = option.icon
                    return (
                      <motion.button
                        key={option.value}
                        type="button"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSendOption(option.value)}
                        className={`p-4 rounded-xl border-2 transition-all duration-200 text-left ${sendOption === option.value
                          ? 'border-blue-500 bg-blue-50 shadow-md'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                          }`}
                      >
                        <Icon className={`w-5 h-5 mb-2 ${sendOption === option.value ? 'text-blue-600' : 'text-gray-400'
                          }`} />
                        <div className="font-medium text-gray-900">{option.label}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {option.value === 'broadcast' && 'Gửi đến tất cả users'}
                          {option.value === 'user' && 'Gửi đến một user cụ thể'}
                          {option.value === 'multiple' && 'Gửi đến nhiều users được chọn'}
                        </div>
                      </motion.button>
                    )
                  })}
                </div>
              </div>

              {/* User Selection */}
              {(sendOption === 'user' || sendOption === 'multiple') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {sendOption === 'user' ? 'Chọn user' : 'Chọn users'}
                  </label>

                  {/* Selected Users (multiple mode) */}
                  {sendOption === 'multiple' && selectedUsers.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {selectedUsers.map(user => (
                        <motion.span
                          key={user.id}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                        >
                          {user.first_name} {user.last_name}
                          <button
                            type="button"
                            onClick={() => removeSelectedUser(user.id)}
                            className="hover:text-blue-900 transition-colors"
                          >
                            ×
                          </button>
                        </motion.span>
                      ))}
                    </div>
                  )}

                  {/* Search Input */}
                  <div className="relative">
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder={
                        sendOption === 'user'
                          ? "Tìm user theo tên hoặc email..."
                          : "Tìm và chọn nhiều users..."
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    />

                    {/* User Suggestions */}
                    <AnimatePresence>
                      {users.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto"
                        >
                          {users.map(user => (
                            <button
                              key={user.id}
                              type="button"
                              onClick={() => handleUserSelect(user)}
                              className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
                            >
                              <div className="font-medium text-gray-900">
                                {user.first_name} {user.last_name}
                              </div>
                              <div className="text-sm text-gray-500">{user.email}</div>
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {isLoading && (
                      <div className="absolute right-3 top-3">
                        <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Notification Form */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Title */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tiêu đề thông báo *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Nhập tiêu đề thông báo..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    required
                  />
                </div>

                {/* Message */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nội dung thông báo *
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows="4"
                    placeholder="Nhập nội dung thông báo chi tiết..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-vertical"
                    required
                  />
                </div>

                {/* Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Loại thông báo
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  >
                    {notificationTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Related Entity */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Liên kết đến (tùy chọn)
                  </label>
                  <select
                    name="related_entity"
                    value={formData.related_entity}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  >
                    <option value="">Không liên kết</option>
                    <option value="order">Đơn hàng</option>
                    <option value="promotion">Khuyến mãi</option>
                    <option value="system">Hệ thống</option>
                    <option value="review">Đánh giá</option>
                  </select>
                </div>

                {/* Entity ID */}
                {formData.related_entity && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ID {formData.related_entity} (tùy chọn)
                    </label>
                    <input
                      type="number"
                      name="entity_id"
                      value={formData.entity_id}
                      onChange={handleChange}
                      placeholder={`Nhập ID ${formData.related_entity}...`}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    />
                  </div>
                )}
              </div>

              {/* Preview */}
              {formData.title && formData.message && (
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <h4 className="font-medium text-gray-700 mb-3">Xem trước thông báo:</h4>
                  <div className={`p-4 rounded-lg border-l-4 ${formData.type === 'info' ? 'bg-blue-50 border-blue-400' :
                    formData.type === 'success' ? 'bg-green-50 border-green-400' :
                      formData.type === 'warning' ? 'bg-yellow-50 border-yellow-400' :
                        'bg-red-50 border-red-400'
                    }`}>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-lg">
                        {formData.type === 'info' ? '🔔' :
                          formData.type === 'success' ? '✅' :
                            formData.type === 'warning' ? '⚠️' : '❌'}
                      </span>
                      <h5 className="font-semibold text-gray-900">{formData.title}</h5>
                    </div>
                    <p className="text-gray-700 text-sm">{formData.message}</p>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex justify-end pt-4">
                <motion.button
                  type="submit"
                  disabled={isSending}
                  whileHover={{ scale: isSending ? 1 : 1.02 }}
                  whileTap={{ scale: isSending ? 1 : 0.98 }}
                  className={`px-8 py-3 rounded-lg font-medium text-white transition-all flex items-center gap-2 ${isSending
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg'
                    }`}
                >
                  {isSending ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Đang gửi...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Gửi đến {getRecipientCount()} người nhận
                    </>
                  )}
                </motion.button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default AdminNotificationSender