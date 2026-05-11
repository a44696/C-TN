import { useState, useEffect, useCallback } from "react";
import { apiClient } from "../utils/apiClient";
import type { ServiceRequest } from "../types/api";

export interface NotificationItem {
  id: string;
  student_name: string;
  student_code: string;
  document_name: string;
  reason: string;
  status: 1 | 2 | 3 | 4;
  created_at: string;
  attachment_url: string;
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch pending service requests only (status = 1)
  const fetchNotifications = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      console.log("📢 Fetching pending notifications (status = 1)...");

      // Fetch only PENDING service requests (status = 1: Đang chờ)
      const response = await apiClient.getServiceRequests({
        page: 1,
        limit: 100,
        status: 1 as any, // PENDING ONLY
      });

      const allRequests = response.data;
      console.log("📋 Pending requests:", allRequests);

      // Transform to notification items with error handling
      const notificationItems: NotificationItem[] = allRequests
        .map((request: any) => {
          console.log(
            "🔍 Full request object:",
            JSON.stringify(request, null, 2),
          );

          try {
            // Extract data from correct paths
            const studentCode = request.user?.student?.student_code || "N/A";
            const documentName =
              request.documentType?.document_name || "Unknown";

            // For display purposes, use student_code as student_name in dropdown
            const studentName = studentCode; // Just use the student_code

            console.log("✨ Mapped data:", {
              studentCode,
              documentName,
            });

            return {
              id: request.id || String(Math.random()),
              student_name: studentName, // Will display student_code
              student_code: studentCode,
              document_name: documentName,
              reason: request.reason || "No reason",
              status: 1, // Always 1 since we only fetch pending
              created_at: request.created_at || new Date().toISOString(),
              attachment_url: request.attachment_url || "",
            };
          } catch (mapErr) {
            console.error("❌ Error mapping request:", request, mapErr);
            return null;
          }
        })
        .filter((item): item is NotificationItem => item !== null);

      console.log(
        `✅ Notifications loaded: ${notificationItems.length} items`,
        notificationItems,
      );

      setNotifications(notificationItems);
      setUnreadCount(notificationItems.length);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Lỗi khi tải thông báo";
      setError(errorMessage);
      console.error("❌ Error fetching notifications:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial fetch and set up polling interval
  useEffect(() => {
    console.log("🔔 NotificationProvider mounted - starting polling");
    fetchNotifications();

    // Poll for new notifications every 30 seconds
    const pollInterval = setInterval(() => {
      console.log("⏰ Polling notifications...");
      fetchNotifications();
    }, 30000);

    return () => {
      console.log("🔔 NotificationProvider unmounted - clearing polling");
      clearInterval(pollInterval);
    };
  }, [fetchNotifications]);

  // Mark notification as read (optional - for future implementation)
  const markAsRead = useCallback((notificationId: string) => {
    setNotifications((prev) =>
      prev.filter((notif) => notif.id !== notificationId),
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  }, []);

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    refetch: fetchNotifications,
    markAsRead,
  };
};
