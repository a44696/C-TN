import React from "react";
import { useNotifications } from "../../hooks/useNotifications";

/**
 * Debug component - hiển thị thông tin notifications
 * Chỉ dùng để debug, có thể xóa khi deploy production
 */
export const NotificationDebugInfo: React.FC = () => {
  const { notifications, unreadCount, isLoading, error } = useNotifications();

  return (
    <div className="fixed bottom-4 right-4 max-w-xs bg-gray-900 text-white text-xs rounded-lg p-3 z-40 font-mono">
      <div className="font-bold mb-2">🔍 Debug Info</div>
      <div className="space-y-1">
        <div>
          <strong>Unread:</strong> {unreadCount}
        </div>
        <div>
          <strong>Count:</strong> {notifications.length}
        </div>
        <div>
          <strong>Loading:</strong> {isLoading ? "Yes" : "No"}
        </div>
        {error && (
          <div className="text-red-400">
            <strong>Error:</strong> {error}
          </div>
        )}
        <div className="mt-2 pt-2 border-t border-gray-700">
          <strong>Items:</strong>
          {notifications.length === 0 ? (
            <div className="text-gray-400">No notifications</div>
          ) : (
            notifications.map((n, i) => (
              <div key={i} className="text-xs mt-1 text-blue-300">
                {i + 1}. {n.student_code} - {n.document_name}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationDebugInfo;
