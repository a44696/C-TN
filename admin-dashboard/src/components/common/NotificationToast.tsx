import React, { useEffect, useState } from "react";
import { Clock, AlertCircle, X } from "lucide-react";
import { useNotificationContext } from "../../contexts/NotificationContext";

export const NotificationToast: React.FC = () => {
  const { newNotificationAlert } = useNotificationContext();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (newNotificationAlert) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [newNotificationAlert]);

  if (!newNotificationAlert || !isVisible) {
    return null;
  }

  const getStatusColor = (status: 1 | 2 | 3 | 4) => {
    switch (status) {
      case 1:
        return "border-yellow-500 bg-yellow-50";
      case 2:
        return "border-blue-500 bg-blue-50";
      case 3:
        return "border-green-500 bg-green-50";
      case 4:
        return "border-red-500 bg-red-50";
    }
  };

  const getStatusIcon = (status: 1 | 2 | 3 | 4) => {
    switch (status) {
      case 1:
        return <Clock size={16} className="text-yellow-600" />;
      case 2:
        return <AlertCircle size={16} className="text-blue-600" />;
      case 3:
        return <AlertCircle size={16} className="text-green-600" />;
      case 4:
        return <AlertCircle size={16} className="text-red-600" />;
    }
  };

  const getStatusLabel = (status: 1 | 2 | 3 | 4) => {
    switch (status) {
      case 1:
        return "Yêu cầu mới";
      case 2:
        return "Đang xử lý";
      case 3:
        return "Hoàn thành";
      case 4:
        return "Từ chối";
    }
  };

  return (
    <div
      className={`fixed top-24 right-8 w-96 p-4 rounded-lg border-l-4 shadow-lg ${getStatusColor(newNotificationAlert.status)} animate-slideIn transition-all duration-300`}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 pt-0.5">
          {getStatusIcon(newNotificationAlert.status)}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <p className="font-semibold text-gray-900 text-sm">
              {getStatusLabel(newNotificationAlert.status)}
            </p>
            <button
              onClick={() => setIsVisible(false)}
              className="text-gray-400 hover:text-gray-600 flex-shrink-0"
            >
              <X size={16} />
            </button>
          </div>

          <p className="text-xs text-gray-600 mt-1">
            <strong>{newNotificationAlert.student_name}</strong> (
            {newNotificationAlert.student_code})
          </p>

          <p className="text-xs text-gray-600 mt-0.5">
            Loại tài liệu: <strong>{newNotificationAlert.document_name}</strong>
          </p>

          <p className="text-xs text-gray-700 mt-1 line-clamp-2">
            {newNotificationAlert.reason}
          </p>

          <p className="text-xs text-gray-400 mt-2">
            Click vào chuông để xem thêm chi tiết
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotificationToast;
