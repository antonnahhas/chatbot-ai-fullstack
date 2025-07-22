import React from "react"

interface ChatMessage {
  role: "user" | "assistant"
  content: string
  timestamp: string
}

interface MessageBubbleProps {
  message: ChatMessage
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const { role, content, timestamp } = message
  const isUser = role === "user"
  
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} my-2`}>
      <div
        className={`max-w-xs px-4 py-2 rounded-lg shadow ${
          isUser ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-900"
        }`}
      >
        <p>{content}</p>
        {timestamp && <span className="text-xs block mt-1 opacity-60">{timestamp}</span>}
      </div>
    </div>
  )
}