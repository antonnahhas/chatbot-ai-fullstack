import React from "react"
import { MessageBubble } from "./MessageBubble"

export interface ChatMessage {
  role: "user" | "assistant"
  content: string
  timestamp?: string
}

interface MessageListProps {
  messages: ChatMessage[]
}

export const MessageList: React.FC<MessageListProps> = ({ messages }) => {
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-2">
      {messages.map((msg, idx) => (
        <MessageBubble key={idx} role={msg.role} content={msg.content} timestamp={msg.timestamp} />
      ))}
    </div>
  )
}
