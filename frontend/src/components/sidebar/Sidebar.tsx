// components/sidebar/Sidebar.tsx
import React, { useEffect, useState } from "react"
import { PlusIcon } from "@radix-ui/react-icons"
import { ChatSession, SidebarProps } from "../../types"
import { api } from "../../services/api"
import { SidebarHeader } from "./SidebarHeader"
import { ChatList } from "./ChatList"
import { ErrorDisplay } from "../ui/ErrorDisplay"

// Inline loader component for buttons
const InlineLoader: React.FC<{ className?: string }> = ({ className = "" }) => {
  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
      <span className="text-sm">Loading...</span>
    </div>
  )
}

// Small loading spinner
const LoadingSpinner: React.FC<{ text?: string }> = ({ text }) => {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-8">
      <div className="relative">
        <div className="w-6 h-6 border-2 border-white/20 border-t-teal-400 rounded-full animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-1 h-1 bg-cyan-400 rounded-full animate-pulse"></div>
        </div>
      </div>
      {text && <p className="text-gray-300 text-xs animate-pulse">{text}</p>}
    </div>
  )
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentSessionId,
  onSelect,
  onNewChat,
  onDelete,
}) => {
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [isLoadingSessions, setIsLoadingSessions] = useState(false)
  const [isCreatingChat, setIsCreatingChat] = useState(false)
  const [sidebarError, setSidebarError] = useState<string | null>(null)

  const fetchSessions = async () => {
    setIsLoadingSessions(true)
    setSidebarError(null)
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
      setSidebarError("Failed to load conversations")
      setSessions([])
    } finally {
      setIsLoadingSessions(false)
    }
  }

  useEffect(() => {
    fetchSessions()
  }, [])

  const handleNewChat = async () => {
    setIsCreatingChat(true)
    setSidebarError(null)
    try {
      await fetchSessions()
      onNewChat()
    } catch (error) {
      console.error("Failed to create new chat:", error)
      setSidebarError("Failed to create new chat")
    } finally {
      setIsCreatingChat(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await api.deleteChat(id)
      await fetchSessions()
      onDelete(id)
    } catch (error) {
      console.error("Failed to delete chat:", error)
      setSidebarError("Failed to delete chat")
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
            disabled={isCreatingChat}
            className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white py-3 px-4 rounded-xl transition-all transform hover:scale-105 shadow-lg group disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            data-new-chat-btn
          >
            {isCreatingChat ? (
              <InlineLoader />
            ) : (
              <>
                <PlusIcon className="h-5 w-5 group-hover:rotate-90 transition-transform" />
                <span className="font-medium">New Chat</span>
              </>
            )}
          </button>
        </div>
        
        <div className="border-t border-white/10 pt-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs text-gray-400 uppercase tracking-wider">Recent Chats</span>
            <span className="text-xs text-gray-500">{sessions.length}</span>
          </div>
          
          {sidebarError && (
            <ErrorDisplay 
              error={sidebarError}
              type="inline"
              onRetry={fetchSessions}
              onDismiss={() => setSidebarError(null)}
              className="mb-4"
            />
          )}
          
          {isLoadingSessions ? (
            <LoadingSpinner text="Loading chats..." />
          ) : (
            <ChatList
              sessions={sessions}
              currentSessionId={currentSessionId}
              onSelect={onSelect}
              onDelete={handleDelete}
            />
          )}
        </div>
      </div>
    </div>
  )
}