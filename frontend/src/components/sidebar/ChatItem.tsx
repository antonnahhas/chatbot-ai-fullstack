// components/sidebar/ChatItem.tsx
import React from "react"
import { TrashIcon } from "@radix-ui/react-icons"
import { ChatSession } from "../../types"

interface ChatItemProps {
  session: ChatSession
  isActive: boolean
  onSelect: () => void
  onDelete: () => void
  animationDelay: number
}

export const ChatItem: React.FC<ChatItemProps> = ({
  session,
  isActive,
  onSelect,
  onDelete,
  animationDelay
}) => {
  return (
    <li
      className={`group flex items-center justify-between px-4 py-3 rounded-xl cursor-pointer transition-all animate-fade-in hover:bg-white/10 ${
        isActive 
          ? "bg-gradient-to-r from-teal-600/30 to-cyan-600/30 shadow-lg border border-white/20" 
          : "hover:bg-white/5"
      }`}
      style={{ animationDelay: `${animationDelay}ms` }}
    >
      <span 
        onClick={onSelect} 
        className="flex-1 truncate text-sm text-gray-200 group-hover:text-white transition-colors"
      >
        {session.title}
      </span>
      <button
        onClick={(e) => {
          e.stopPropagation()
          onDelete()
        }}
        className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-400 bg-transparent p-1.5 rounded-lg hover:bg-red-500/20 transition-all"
      >
        <TrashIcon className="w-4 h-4" />
      </button>
    </li>
  )
}