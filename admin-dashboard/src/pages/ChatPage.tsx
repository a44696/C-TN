import { useEffect, useState } from "react";
import { Send, Loader, AlertCircle, Search, X } from "lucide-react";
import AdminLayout from "../layouts/AdminLayout";
import { useChat } from "../hooks/useChat";
import { apiClient } from "../utils/apiClient";
import type { User } from "../types/api";

export default function ChatPage() {
  const [messageInput, setMessageInput] = useState("");
  const [searchText, setSearchText] = useState("");
  const [allStudents, setAllStudents] = useState<User[]>([]);
  const [studentLoading, setStudentLoading] = useState(false);
  const chatHook = useChat();

  // Load conversations on mount
  useEffect(() => {
    // Hook automatically fetches conversations on mount
  }, []);

  // Fetch all students for selection
  useEffect(() => {
    if (!searchText) {
      setAllStudents([]);
      return;
    }

    const fetchStudents = async () => {
      try {
        setStudentLoading(true);
        const students = await apiClient.searchStudents(searchText, 20);
        setAllStudents(students);
        console.log("Fetched students:", students);
      } catch (err) {
        console.error("Failed to fetch students:", err);
        if (err instanceof Error) {
          console.error("Error message:", err.message);
        }
        if (err && typeof err === "object" && "response" in err) {
          const axiosErr = err as any;
          console.error("API response status:", axiosErr.response?.status);
          console.error("API response data:", axiosErr.response?.data);
        }
        setAllStudents([]);
      } finally {
        setStudentLoading(false);
      }
    };

    // Fetch immediately without debounce
    fetchStudents();
  }, [searchText]);

  // Mark as read when conversation changes
  useEffect(() => {
    if (
      chatHook?.currentConversation?.unreadCount &&
      chatHook.currentConversation.unreadCount > 0 &&
      chatHook.markAsRead
    ) {
      chatHook.markAsRead();
    }
  }, [chatHook?.currentConversation?.id]);

  // Guard: ensure hook is ready and conversations is array
  if (!chatHook || !Array.isArray(chatHook.conversations)) {
    return (
      <AdminLayout>
        <div className="p-6">
          <div className="flex items-center justify-center h-64">
            <Loader className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        </div>
      </AdminLayout>
    );
  }

  const {
    conversations = [],
    currentConversation,
    messages = [],
    unreadCount = 0,
    isTyping = false,
    loading = false,
    error,
    openConversation = () => {},
    sendMessage = () => {},
    handleTyping = () => {},
    markAsRead = () => {},
  } = chatHook || {};

  const handleSendClick = () => {
    if (!currentConversation || !messageInput.trim()) return;
    sendMessage(messageInput);
    setMessageInput("");
  };

  const handleTypingChange = (value: string) => {
    setMessageInput(value);
    if (value.trim()) {
      handleTyping(true);
    }
  };

  // Filter students - exclude those already in conversations and match search
  const existingConversationStudentIds = new Set(
    conversations.map((c) => c.partner.id),
  );
  const filteredStudents = allStudents.filter(
    (s) => !existingConversationStudentIds.has((s.userId || s.id).toString()),
  );

  const handleSelectStudent = async (studentId: string) => {
    if (chatHook?.openConversation) {
      await chatHook.openConversation(studentId);
      setSearchText(""); // Clear search after selection
    }
  };

  return (
    <AdminLayout topbarTitle="Chat Sinh Viên">
      <div className="p-6 h-[calc(100vh-80px)] flex flex-col">
        <h1 className="text-2xl font-bold mb-4">Chat Sinh viên</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 min-h-0">
          {/* Left: Conversations & Student Search */}
          <div className="md:col-span-1 bg-white rounded shadow flex flex-col">
            <div className="p-3 border-b">
              <div className="font-semibold mb-2">
                Hội thoại {unreadCount > 0 && `(${unreadCount})`}
              </div>
              {/* Search Input */}
              <div className="relative">
                <Search className="absolute left-2 top-2.5 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Tìm sinh viên..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="w-full pl-8 pr-8 py-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {searchText && (
                  <button
                    onClick={() => setSearchText("")}
                    className="absolute right-2 top-2.5 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {/* Show Students List if searching */}
              {searchText ? (
                <>
                  {studentLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <Loader className="w-5 h-5 animate-spin text-blue-500" />
                    </div>
                  ) : filteredStudents.length === 0 ? (
                    <div className="p-4 text-gray-500 text-center text-sm">
                      {allStudents.length === 0
                        ? "Không tìm thấy sinh viên"
                        : "Không có sinh viên nào phù hợp"}
                    </div>
                  ) : (
                    filteredStudents.map((student) => (
                      <button
                        key={student.userId || student.id}
                        onClick={() =>
                          handleSelectStudent(
                            (student.userId || student.id).toString(),
                          )
                        }
                        className="w-full text-left p-3 border-b hover:bg-blue-50 transition flex flex-col gap-1"
                      >
                        <p className="font-semibold text-sm">
                          {student.fullName ||
                            student.full_name ||
                            student.username}
                        </p>
                        <p className="text-xs text-gray-600">
                          {student.studentCode || student.student_code || ""}
                        </p>
                      </button>
                    ))
                  )}
                </>
              ) : (
                /* Show Conversations List */
                <>
                  {loading && conversations.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                      <Loader className="w-5 h-5 animate-spin text-blue-500" />
                    </div>
                  ) : conversations.length === 0 ? (
                    <div className="p-4 text-gray-500 text-center text-sm">
                      <div>Chưa có hội thoại</div>
                      <div className="text-xs mt-2">
                        Gõ tên sinh viên ở trên để bắt đầu
                      </div>
                    </div>
                  ) : (
                    conversations.map((conv) => (
                      <button
                        key={conv.id}
                        onClick={() => {
                          // Just set current conversation, don't need to re-fetch
                          // since we want to show cached messages
                          chatHook.openConversation?.(conv.partner.id);
                        }}
                        className={`w-full text-left p-3 border-b hover:bg-gray-50 transition flex items-center justify-between gap-2 ${
                          currentConversation?.id === conv.id
                            ? "bg-blue-50"
                            : ""
                        }`}
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm truncate">
                            {conv.partner.fullName}
                          </p>
                          <p className="text-xs text-gray-600 truncate">
                            {conv.lastMessage?.content || "..."}
                          </p>
                        </div>
                        {conv.unreadCount > 0 && (
                          <span className="bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
                            {conv.unreadCount}
                          </span>
                        )}
                      </button>
                    ))
                  )}
                </>
              )}
            </div>
          </div>

          {/* Right: Chat */}
          <div className="md:col-span-2 bg-white rounded shadow flex flex-col">
            {currentConversation && currentConversation.partner ? (
              <>
                <div className="p-3 border-b font-semibold">
                  <div>
                    {currentConversation.partner.fullName ||
                      currentConversation.partner.username}
                  </div>
                  <div className="text-xs text-gray-600 font-normal">
                    {currentConversation.partner.code || ""}
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-3 space-y-2 text-sm">
                  {messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-gray-400">
                      Chưa có tin nhắn
                    </div>
                  ) : (
                    messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${
                          msg.isMe ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-xs px-3 py-2 rounded ${
                            msg.isMe
                              ? "bg-blue-500 text-white"
                              : "bg-gray-200 text-black"
                          }`}
                        >
                          <p className="break-words">{msg.content}</p>
                          <p className="text-xs opacity-70 mt-1">
                            {new Date(msg.createdAt).toLocaleTimeString(
                              "vi-VN",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              },
                            )}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                  {isTyping && (
                    <div className="flex items-center gap-2 text-gray-500">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" />
                        <div
                          className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        />
                        <div
                          className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
                          style={{ animationDelay: "0.4s" }}
                        />
                      </div>
                      <span>Đang gõ...</span>
                    </div>
                  )}
                </div>
                <div className="p-3 border-t flex gap-2">
                  <input
                    type="text"
                    value={messageInput}
                    onChange={(e) => handleTypingChange(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendClick();
                      }
                    }}
                    placeholder="Gõ tin..."
                    className="flex-1 border px-2 py-1 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={loading}
                  />
                  <button
                    onClick={handleSendClick}
                    disabled={!messageInput.trim() || loading}
                    className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:bg-gray-400 flex items-center justify-center"
                  >
                    {loading ? (
                      <Loader className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                Chọn hội thoại để bắt đầu
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
