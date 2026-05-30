import { ChatMessage } from "../../hooks/useChat";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

interface MessageItemProps {
  message: ChatMessage;
}

export default function MessageItem({ message }: MessageItemProps) {
  const formatTime = (date: string) => {
    try {
      return formatDistanceToNow(new Date(date), {
        addSuffix: true,
        locale: vi,
      });
    } catch {
      return "Vừa xong";
    }
  };

  return (
    <div
      className={`flex mb-4 ${message.isMe ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`max-w-xs px-4 py-2 rounded-lg ${
          message.isMe
            ? "bg-blue-500 text-white rounded-br-none"
            : "bg-gray-200 text-gray-900 rounded-bl-none"
        }`}
      >
        {message.messageType === "TEXT" && (
          <p className="break-words">{message.content}</p>
        )}
        {message.messageType === "IMAGE" && message.mediaUrl && (
          <img
            src={message.mediaUrl}
            alt="message attachment"
            className="max-w-xs rounded"
          />
        )}
        {message.messageType === "FILE" && message.mediaUrl && (
          <a
            href={message.mediaUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:no-underline"
          >
            📎 {message.content || "File"}
          </a>
        )}
        <div className="text-xs mt-1 opacity-70">
          {formatTime(message.createdAt)}
        </div>
      </div>
    </div>
  );
}
