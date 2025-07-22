// Add this to your MessageList.tsx component

import React from "react"
import { MessageBubble } from "./MessageBubble"

export interface ChatMessage {
  role: "user" | "assistant"
  content: string
  timestamp: string
}

interface MessageListProps {
  messages: ChatMessage[]
}

export const MessageList: React.FC<MessageListProps> = ({ messages }) => {
  return (
    <div className="flex-1 overflow-y-auto p-4 relative z-10">
      {messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full animate-fade-in">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-teal-400 to-cyan-400 rounded-full blur-2xl opacity-50 group-hover:opacity-70 transition-opacity animate-pulse"></div>
            <img 
              src="/logo.png" 
              alt="Chatbot Logo" 
              className="w-40 h-40 mb-6 relative z-10 transform transition-transform group-hover:scale-110"
            />
          </div>
          <h3 className="text-2xl font-bold bg-gradient-to-r from-teal-200 to-cyan-200 bg-clip-text text-transparent mb-2">
            Welcome to SumerAI
          </h3>
          <p className="text-gray-300 text-lg">Start a conversation by typing a message below</p>
          <div className="mt-8 flex gap-4">
            <div className="px-4 py-2 bg-white/10 backdrop-blur-lg rounded-lg border border-white/20 text-gray-200 text-sm">
              💡 Ask me anything
            </div>
            <div className="px-4 py-2 bg-white/10 backdrop-blur-lg rounded-lg border border-white/20 text-gray-200 text-sm">
              🚀 Powered by AI
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4 animate-fade-in">
          {messages.map((message, index) => (
            <MessageBubble
              key={index}
              message={message}
            />
          ))}
        </div>
      )}
    </div>
  )
}