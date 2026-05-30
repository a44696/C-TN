import { useEffect, useState, useCallback, useRef } from "react";
import { io, Socket } from "socket.io-client";
import axios from "axios";
import { apiClient } from "../utils/apiClient";

// Types
export type MessageType = "TEXT" | "IMAGE" | "FILE";
export type UserRole = "ADMIN" | "STUDENT" | "LECTURER";

export interface ChatUser {
  id: string;
  username: string;
  fullName: string;
  code: string;
  avatarUrl: string | null;
  role: UserRole;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string | null;
  senderRole: UserRole;
  content: string;
  messageType: MessageType;
  mediaUrl: string | null;
  isRead: boolean;
  isMe: boolean;
  createdAt: string;
}

export interface Conversation {
  id: string;
  partner: ChatUser;
  lastMessage: ChatMessage | null;
  unreadCount: number;
  lastMessageAt: string | null;
}

export interface MessagesResponse {
  messages: ChatMessage[];
  hasMore: boolean;
  nextCursor: string | null;
}

export interface SendMessageDto {
  content: string;
  messageType?: MessageType;
  mediaUrl?: string | null;
}

const API_BASE_URL = "http://localhost:3000";
const SOCKET_URL = "http://localhost:3000/admin-chat";

// Helper function to set isMe flag on messages
const setIsMe = (
  message: ChatMessage,
  currentUserId: string | null,
): ChatMessage => {
  if (!currentUserId) return message;
  return {
    ...message,
    isMe: message.senderId === currentUserId,
  };
};

export const useChat = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] =
    useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUserId, setTypingUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const socketRef = useRef<Socket | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("access_token") : null;

  // Get current user ID from localStorage
  const currentUserId =
    typeof window !== "undefined"
      ? (() => {
          try {
            const user = JSON.parse(localStorage.getItem("user") || "{}");
            return user.id || null;
          } catch {
            return null;
          }
        })()
      : null;

  // Fetch conversations with initial state
  const fetchConversations = useCallback(async () => {
    if (!token) {
      setConversations([]);
      return;
    }
    try {
      setLoading(true);
      const response = await axios.get<any>(
        `${API_BASE_URL}/admin-chat/conversations`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      const data = response.data.data || response.data;
      setConversations(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch conversations:", err);
      setConversations([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Fetch conversations on mount and when token changes
  useEffect(() => {
    fetchConversations();
  }, [token]);

  // Initialize WebSocket
  useEffect(() => {
    if (!token) return;

    try {
      const socket = io(SOCKET_URL, {
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5,
      });

      socketRef.current = socket;

      socket.on("connect", () => {
        console.log("Socket connected");
        socket.emit("authenticate", { token: `Bearer ${token}` });
      });

      socket.on("authenticated", () => {
        console.log("Chat authenticated");
        fetchConversations();
        socket.emit("getAdminChatUnreadCount");
      });

      socket.on("receiveAdminMessage", (message: ChatMessage) => {
        const messageWithIsMe = setIsMe(message, currentUserId);
        setMessages((prev) => [...prev, messageWithIsMe]);
        setConversations((prev) =>
          prev.map((conv) =>
            conv.id === message.conversationId
              ? {
                  ...conv,
                  lastMessage: messageWithIsMe,
                  lastMessageAt: message.createdAt,
                }
              : conv,
          ),
        );
      });

      socket.on("messageSent", (message: ChatMessage) => {
        const messageWithIsMe = setIsMe(message, currentUserId);
        setMessages((prev) => [...prev, messageWithIsMe]);
      });

      socket.on("unreadCount", (data: { totalUnread: number }) => {
        setUnreadCount(data.totalUnread);
      });

      socket.on("messagesMarkedAsRead", () => {
        if (currentConversation) {
          setCurrentConversation((prev) =>
            prev ? { ...prev, unreadCount: 0 } : null,
          );
        }
      });

      socket.on("userTyping", (data: { userId: string; isTyping: boolean }) => {
        setIsTyping(data.isTyping);
      });

      socket.on("authError", (data) => {
        setError(data.message || "Authentication failed");
      });

      socket.on("error", (data) => {
        console.error("Socket error:", data);
      });

      return () => {
        socket.disconnect();
        socketRef.current = null;
      };
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Socket error";
      console.error(msg);
      setError(msg);
    }
  }, [token, currentUserId]);

  // Open conversation
  const openConversation = useCallback(
    async (userId: string) => {
      try {
        setLoading(true);
        setError(null);

        const conversation = await apiClient.openAdminChat(userId);
        setCurrentConversation(conversation);

        // Fetch messages
        const messagesData = await apiClient.getAdminChatMessages(
          conversation.id,
        );
        const messagesWithIsMe = (messagesData.messages || []).map(
          (msg: ChatMessage) => setIsMe(msg, currentUserId),
        );
        setMessages(messagesWithIsMe);

        // Refresh conversations list to show newly created conversation
        await fetchConversations();
      } catch (err) {
        console.error("Error creating conversation:", err);
        const errorMsg =
          err instanceof Error ? err.message : "Failed to open conversation";
        setError(errorMsg);
        setMessages([]);
      } finally {
        setLoading(false);
      }
    },
    [token, fetchConversations, currentUserId],
  );

  // Load more messages (pagination)
  const loadMoreMessages = useCallback(async () => {
    if (!currentConversation || messages.length === 0) return;

    try {
      const firstMessage = messages[0];
      const response = await axios.get<ApiResponse<MessagesResponse>>(
        `${API_BASE_URL}/admin-chat/conversations/${currentConversation.id}/messages?cursor=${firstMessage.id}&limit=30`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      const data = response.data.data as MessagesResponse;
      if (data.messages) {
        const messagesWithIsMe = data.messages.map((msg: ChatMessage) =>
          setIsMe(msg, currentUserId),
        );
        setMessages((prev) => [...messagesWithIsMe, ...prev]);
      }
    } catch (err) {
      console.error("Failed to load more messages:", err);
    }
  }, [token, currentConversation, messages, currentUserId]);

  // Send message
  const sendMessage = useCallback(
    (content: string, messageType: "TEXT" | "IMAGE" | "FILE" = "TEXT") => {
      if (!currentConversation) {
        setError("No active conversation");
        return;
      }

      if (!socketRef.current?.connected) {
        setError("Not connected. Please wait...");
        return;
      }

      const payload: SendMessageDto = {
        content,
        messageType,
      };

      socketRef.current.emit("sendAdminMessage", {
        conversationId: currentConversation.id,
        ...payload,
      });
    },
    [currentConversation],
  );

  // Mark messages as read
  const markAsRead = useCallback(async () => {
    if (!currentConversation) return;

    try {
      // Use REST API first
      await apiClient.markAdminChatAsRead(currentConversation.id);

      // Also emit via WebSocket for real-time sync
      if (socketRef.current?.connected) {
        socketRef.current.emit("markAdminMessageAsRead", {
          conversationId: currentConversation.id,
        });
      }
    } catch (err) {
      console.error("Failed to mark as read:", err);
    }
  }, [currentConversation]);

  // Handle typing
  const handleTyping = useCallback(
    (isTyping: boolean) => {
      if (!currentConversation || !socketRef.current?.connected) return;

      socketRef.current.emit("adminChatUserTyping", {
        conversationId: currentConversation.id,
        isTyping,
      });

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      if (isTyping) {
        typingTimeoutRef.current = setTimeout(() => {
          if (socketRef.current?.connected) {
            socketRef.current.emit("adminChatUserTyping", {
              conversationId: currentConversation.id,
              isTyping: false,
            });
          }
        }, 1000);
      }
    },
    [currentConversation],
  );

  return {
    // State
    conversations,
    currentConversation,
    messages,
    unreadCount,
    isTyping,
    typingUserId,
    loading,
    error,

    // Methods
    fetchConversations,
    openConversation,
    sendMessage,
    loadMoreMessages,
    markAsRead,
    handleTyping,
  };
};
