import { useEffect, useRef } from "react";
import { ChatMessage } from "../../hooks/useChat";
import MessageItem from "./MessageItem";
import ChatInput from "./ChatInput";
import { ChevronDown } from "lucide-react";

interface ChatWindowProps {
  conversationId: string;
  partnerName: string;
  partnerAvatar?: string | null;
  messages: ChatMessage[];
  onSendMessage: (content: string) => void;
  onTyping?: (isTyping: boolean) => void;
  onLoadMore?: () => void;
  isTyping?: boolean;
  typingUserName?: string;
  isLoading?: boolean;
  hasMore?: boolean;
}

export default function ChatWindow({
  conversationId,
  partnerName,
  partnerAvatar,
  messages,
  onSendMessage,
  onTyping,
  onLoadMore,
  isTyping,
  isLoading,
  hasMore,
}: ChatWindowProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const shouldAutoScroll = useRef(true);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    if (shouldAutoScroll.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleScroll = () => {
    if (!messagesContainerRef.current) return;
    const { scrollTop } = messagesContainerRef.current;
    shouldAutoScroll.current = scrollTop < -100;
  };

  const handleLoadMoreClick = () => {
    shouldAutoScroll.current = false;
    onLoadMore?.();
  };

  return (
    <div
      className="flex flex-col h-full bg-white rounded-lg shadow-lg"
      key={conversationId}
    >
      {/* Header */}
      <div className="border-b border-gray-200 p-4 flex items-center gap-3">
        {partnerAvatar ? (
          <img
            src={partnerAvatar}
            alt={partnerName}
            className="w-10 h-10 rounded-full"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
            {partnerName.charAt(0)}
          </div>
        )}
        <div>
          <h3 className="font-semibold text-gray-900">{partnerName}</h3>
          <p className="text-xs text-gray-500">Online</p>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 space-y-2"
      >
        {hasMore && messages.length > 0 && (
          <button
            onClick={handleLoadMoreClick}
            className="w-full py-2 text-center text-sm text-blue-500 hover:bg-blue-50 rounded"
          >
            <ChevronDown className="w-4 h-4 inline mr-2" />
            Tải tin nhắn cũ hơn
          </button>
        )}

        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-400">
            <p>Chưa có tin nhắn</p>
          </div>
        ) : (
          messages.map((msg) => <MessageItem key={msg.id} message={msg} />)
        )}

        {isTyping && (
          <div className="flex items-center gap-2 text-gray-500 text-sm">
            <div className="flex gap-1">
              <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"></div>
              <div
                className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
                style={{ animationDelay: "0.2s" }}
              ></div>
              <div
                className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
                style={{ animationDelay: "0.4s" }}
              ></div>
            </div>
            <span>Đang gõ...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <ChatInput
        onSendMessage={onSendMessage}
        onTyping={onTyping}
        isLoading={isLoading}
      />
    </div>
  );
}
