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
    <div className="flex-1 overflow-y-auto p-4">
      {messages.length === 0 ? (
        <div className="flex items-center justify-center h-full text-gray-500">
          <p>Start a conversation by typing a message below</p>
        </div>
      ) : (
        <div className="space-y-4">
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