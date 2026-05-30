import { Conversation } from "../../hooks/useChat";
import { MessageCircle } from "lucide-react";

interface ConversationListProps {
  conversations: Conversation[];
  selectedConversation: Conversation | null;
  onSelectConversation: (conversation: Conversation) => void;
  unreadCount: number;
}

export default function ConversationList({
  conversations,
  selectedConversation,
  onSelectConversation,
  unreadCount,
}: ConversationListProps) {
  const truncateText = (text: string, length: number) => {
    return text.length > length ? text.substring(0, length) + "..." : text;
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-lg border border-gray-200">
      {/* Header */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center gap-2 mb-2">
          <MessageCircle className="w-5 h-5 text-blue-500" />
          <h2 className="text-lg font-bold text-gray-900">Tin nhắn</h2>
        </div>
        {unreadCount > 0 && (
          <p className="text-sm text-blue-600">
            {unreadCount} tin nhắn chưa đọc
          </p>
        )}
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-400 p-4">
            <p className="text-center">Chưa có hội thoại nào</p>
          </div>
        ) : (
          conversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => onSelectConversation(conv)}
              className={`w-full text-left border-b border-gray-100 p-3 hover:bg-gray-50 transition ${
                selectedConversation?.id === conv.id ? "bg-blue-50" : ""
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-900 truncate">
                      {conv.partner.fullName}
                    </p>
                    {conv.unreadCount > 0 && (
                      <span className="bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 truncate">
                    {conv.lastMessage
                      ? truncateText(conv.lastMessage.content, 40)
                      : "Chưa có tin nhắn"}
                  </p>
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
