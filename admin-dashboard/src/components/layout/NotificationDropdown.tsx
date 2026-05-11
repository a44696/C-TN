import React, { useState, useRef, useEffect } from "react";
import {
  Bell,
  X,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { useNotifications } from "../../hooks/useNotifications";
import { cn } from "../../utils/cn";

interface NotificationDropdownProps {
  className?: string;
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { notifications, unreadCount, isLoading, refetch, error } =
    useNotifications();

  console.log("🔔 NotificationDropdown:", {
    unreadCount,
    notificationsCount: notifications.length,
    isLoading,
    error,
  });

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  const getStatusIcon = (status: 1 | 2 | 3 | 4) => {
    switch (status) {
      case 1: // PENDING
        return <Clock size={14} className="text-yellow-600" />;
      case 2: // PROCESSING
        return <AlertCircle size={14} className="text-blue-600" />;
      case 3: // COMPLETED
        return <CheckCircle size={14} className="text-green-600" />;
      case 4: // REJECTED
        return <XCircle size={14} className="text-red-600" />;
    }
  };

  const getStatusLabel = (status: 1 | 2 | 3 | 4) => {
    switch (status) {
      case 1:
        return "Đang chờ";
      case 2:
        return "Đang xử lý";
      case 3:
        return "Hoàn thành";
      case 4:
        return "Từ chối";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Vừa xong";
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;

    return date.toLocaleDateString("vi-VN");
  };

  return (
    <div ref={dropdownRef} className={cn("relative", className)}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-1.5 text-gray-600 hover:text-gray-900 transition-colors group"
        title="Thông báo"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white rounded-full text-xs font-bold flex items-center justify-center">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute top-12 right-0 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-96 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900">
              Yêu cầu dịch vụ ({unreadCount})
            </h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={18} />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="px-4 py-8 flex justify-center">
                <div className="animate-spin">
                  <Bell size={20} className="text-gray-400" />
                </div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <Bell size={32} className="mx-auto text-gray-300 mb-2" />
                <p className="text-sm text-gray-500">Không có yêu cầu mới</p>
                {error && (
                  <p className="text-xs text-red-500 mt-2">Lỗi: {error}</p>
                )}
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className="px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer group"
                  >
                    {/* Student & Request Type */}
                    <div className="flex items-start gap-3">
                      {/* Avatar Placeholder */}
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                        {notification.student_code.slice(0, 2).toUpperCase()}
                      </div>

                      <div className="flex-1 min-w-0">
                        {/* Name & Status */}
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-semibold text-gray-900 truncate">
                            {notification.student_name}
                          </p>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            {getStatusIcon(notification.status)}
                            <span className="text-xs text-gray-500">
                              {getStatusLabel(notification.status)}
                            </span>
                          </div>
                        </div>

                        {/* Document Type */}
                        <p className="text-xs text-gray-600 mt-1 font-medium">
                          Loại: {notification.document_name}
                        </p>

                        {/* Reason */}
                        <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                          {notification.reason}
                        </p>

                        {/* Timestamp */}
                        <p className="text-xs text-gray-400 mt-2">
                          {formatDate(notification.created_at)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer - View All Link */}
          {notifications.length > 0 && (
            <div className="px-4 py-3 border-t border-gray-100 bg-gray-50 text-center">
              <a
                href="/service-requests"
                className="text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                Xem tất cả yêu cầu
              </a>
            </div>
          )}

          {/* Refresh Button */}
          <div className="px-4 py-2 border-t border-gray-100 flex gap-2">
            <button
              onClick={refetch}
              disabled={isLoading}
              className="flex-1 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded transition-colors disabled:opacity-50"
            >
              {isLoading ? "Đang tải..." : "Làm mới"}
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="flex-1 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded transition-colors"
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
