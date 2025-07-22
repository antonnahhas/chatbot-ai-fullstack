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
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} my-2 animate-slide-in`}>
      <div className="relative max-w-xs lg:max-w-md">
        {!isUser && (
          <div className="absolute -left-2 -top-2 w-8 h-8 bg-gradient-to-br from-teal-400 to-cyan-400 rounded-full flex items-center justify-center shadow-lg">
            <span className="text-white text-xs font-bold">AI</span>
          </div>
        )}
        <div
          className={`px-5 py-3 rounded-2xl shadow-xl backdrop-blur-lg transition-all hover:shadow-2xl ${
            isUser 
              ? "bg-gradient-to-r from-teal-500 to-cyan-500 text-white ml-8" 
              : "bg-white/90 text-gray-800 border border-white/20 mr-8"
          }`}
        >
          <p className="whitespace-pre-wrap leading-relaxed">{content}</p>
          {timestamp && (
            <span className={`text-xs block mt-2 ${isUser ? "text-teal-100" : "text-gray-500"}`}>
              {timestamp}
            </span>
          )}
        </div>
        {isUser && (
          <div className="absolute -right-2 -top-2 w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center shadow-lg">
            <span className="text-white text-xs font-bold">U</span>
          </div>
        )}
      </div>
    </div>
  )
}