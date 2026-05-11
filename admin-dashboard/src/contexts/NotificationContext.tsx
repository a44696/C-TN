import React, { createContext, useContext, useEffect, useState } from "react";
import { useNotifications } from "../hooks/useNotifications";
import type { NotificationItem } from "../hooks/useNotifications";

interface NotificationContextType {
  notifications: NotificationItem[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  markAsRead: (id: string) => void;
  newNotificationAlert: NotificationItem | null;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined,
);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { notifications, unreadCount, isLoading, error, refetch, markAsRead } =
    useNotifications();
  const [newNotificationAlert, setNewNotificationAlert] =
    useState<NotificationItem | null>(null);
  const [previousCount, setPreviousCount] = useState(0);

  // Trigger toast/alert when new notification arrives
  useEffect(() => {
    if (unreadCount > previousCount) {
      // New notification arrived
      const newNotif = notifications[0]; // Most recent is usually first
      if (newNotif) {
        setNewNotificationAlert(newNotif);
        // Auto dismiss after 5 seconds
        const timer = setTimeout(() => {
          setNewNotificationAlert(null);
        }, 5000);
        return () => clearTimeout(timer);
      }
    }
    setPreviousCount(unreadCount);
  }, [unreadCount, notifications, previousCount]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        isLoading,
        error,
        refetch,
        markAsRead,
        newNotificationAlert,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotificationContext = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotificationContext must be used within NotificationProvider",
    );
  }
  return context;
};
