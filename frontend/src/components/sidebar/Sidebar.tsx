// components/sidebar/Sidebar.tsx
import React, { useEffect, useState } from "react"
import { PlusIcon } from "@radix-ui/react-icons"
import { ChatSession, SidebarProps } from "../../types"
import { api } from "../../services/api"
import { SidebarHeader } from "./SidebarHeader"
import { ChatList } from "./ChatList"

export const Sidebar: React.FC<SidebarProps> = ({
  currentSessionId,
  onSelect,
  onNewChat,
  onDelete,
}) => {
  const [sessions, setSessions] = useState<ChatSession[]>([])

  const fetchSessions = async () => {
    try {
      const data = await api.getAllChats()
      if (Array.isArray(data.sessions)) {
        setSessions(data.sessions)
      } else {
        console.warn("Unexpected response:", data)
        setSessions([])
      }
    } catch (error) {
      console.error("Failed to fetch sessions:", error)
      setSessions([])
    }
  }

  useEffect(() => {
    fetchSessions()
  }, [])

  const handleNewChat = async () => {
    try {
      const data = await api.createChat()
      await fetchSessions()
      onNewChat(data.session_id)
    } catch (error) {
      console.error("Failed to create new chat:", error)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await api.deleteChat(id)
      await fetchSessions()
      if (id === currentSessionId) {
        onNewChat("")
      }
      onDelete(id)
    } catch (error) {
      console.error("Failed to delete chat:", error)
    }
  }

  return (
    <div className="w-72 bg-black/40 backdrop-blur-xl border-r border-white/10 p-6 text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-teal-600/20 to-cyan-600/20"></div>
      
      <div className="relative z-10">
        <SidebarHeader />
        
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Conversations</h2>
          <button 
            onClick={handleNewChat} 
            className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white py-3 px-4 rounded-xl transition-all transform hover:scale-105 shadow-lg group"
            data-new-chat-btn
          >
            <PlusIcon className="h-5 w-5 group-hover:rotate-90 transition-transform" />
            <span className="font-medium">New Chat</span>
          </button>
        </div>
        
        <div className="border-t border-white/10 pt-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs text-gray-400 uppercase tracking-wider">Recent Chats</span>
            <span className="text-xs text-gray-500">{sessions.length}</span>
          </div>
          
          <ChatList
            sessions={sessions}
            currentSessionId={currentSessionId}
            onSelect={onSelect}
            onDelete={handleDelete}
          />
        </div>
      </div>
    </div>
  )
}