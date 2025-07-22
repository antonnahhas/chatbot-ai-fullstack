// components/chat/MessageList.tsx
import React from "react"
import { ChatMessage } from "../../types"
import { MessageBubble } from "./MessageBubble"
import { EmptyState } from "./EmptyState"

interface MessageListProps {
  messages: ChatMessage[]
}

export const MessageList: React.FC<MessageListProps> = ({ messages }) => {
  return (
    <div className="flex-1 overflow-y-auto p-4 pt-20 relative z-10">
      {messages.length === 0 ? (
        <EmptyState />
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