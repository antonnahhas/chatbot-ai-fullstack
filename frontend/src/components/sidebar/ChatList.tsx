// components/sidebar/ChatList.tsx
import React from "react"
import { ChatSession } from "../../types"
import { ChatItem } from "./ChatItem"

interface ChatListProps {
  sessions: ChatSession[]
  currentSessionId: string | null
  onSelect: (id: string) => void
  onDelete: (id: string) => void
}

export const ChatList: React.FC<ChatListProps> = ({
  sessions,
  currentSessionId,
  onSelect,
  onDelete
}) => {
  if (sessions.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-3">
          <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <p className="text-gray-500 text-sm">No conversations yet</p>
      </div>
    )
  }

  return (
    <ul className="space-y-2 max-h-[calc(100vh-380px)] overflow-y-auto custom-scrollbar">
      {sessions.map((session, index) => (
        <ChatItem
          key={session.id}
          session={session}
          isActive={currentSessionId === session.id}
          onSelect={() => onSelect(session.id)}
          onDelete={() => onDelete(session.id)}
          animationDelay={index * 50}
        />
      ))}
    </ul>
  )
}