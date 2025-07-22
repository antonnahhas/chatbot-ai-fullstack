import React, { useEffect, useState } from "react"
import { Button } from "./Button"
import { TrashIcon, PlusIcon } from "@radix-ui/react-icons"

interface ChatSession {
  id: string
  title: string
}

interface SidebarProps {
  currentSessionId: string | null
  onSelect: (id: string) => void
  onNewChat: (id: string) => void
  onDelete: (id: string) => void
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentSessionId,
  onSelect,
  onNewChat,
  onDelete,
}) => {
  const [sessions, setSessions] = useState<ChatSession[]>([])

  const fetchSessions = async () => {
    try {
      const res = await fetch("http://localhost:8000/chats")
      const data = await res.json()
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
      const res = await fetch("http://localhost:8000/chats", {
        method: "POST",
      })
      const data = await res.json()
      
      await fetchSessions()
      onNewChat(data.session_id)
    } catch (error) {
      console.error("Failed to create new chat:", error)
    }
  }

  const handleDelete = async (id: string) => {
    await fetch(`http://localhost:8000/chats/${id}`, {
        method: "DELETE",
    })

    await fetchSessions()

    if (id === currentSessionId) {
        onNewChat("")
    }

    onDelete(id)
    }

  return (
    <div className="w-72 bg-black/40 backdrop-blur-xl border-r border-white/10 p-6 text-white relative overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-teal-600/20 to-cyan-600/20"></div>
      
      <div className="relative z-10">
        <div className="mb-8 pb-6 border-b border-white/10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-teal-400 to-cyan-400 rounded-xl flex items-center justify-center shadow-lg animate-pulse">
              <span className="text-white font-bold text-lg">S</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-teal-200 to-cyan-200 bg-clip-text text-transparent">
                SumerAI
              </h1>
              <p className="text-xs text-gray-400">by Sumeria LTD</p>
            </div>
          </div>
        </div>
        
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Conversations</h2>
          <Button 
            onClick={handleNewChat} 
            className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white py-3 px-4 rounded-xl transition-all transform hover:scale-105 shadow-lg group"
            data-new-chat-btn
          >
            <PlusIcon className="h-5 w-5 group-hover:rotate-90 transition-transform" />
            <span className="font-medium">New Chat</span>
          </Button>
        </div>
        
        <div className="border-t border-white/10 pt-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs text-gray-400 uppercase tracking-wider">Recent Chats</span>
            <span className="text-xs text-gray-500">{sessions.length}</span>
          </div>
          
          {sessions.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <p className="text-gray-500 text-sm">No conversations yet</p>
            </div>
          ) : (
            <ul className="space-y-2 max-h-[calc(100vh-380px)] overflow-y-auto custom-scrollbar">
              {sessions.map((s, index) => (
                <li
                  key={s.id}
                  className={`group flex items-center justify-between px-4 py-3 rounded-xl cursor-pointer transition-all animate-fade-in hover:bg-white/10 ${
                    currentSessionId === s.id 
                      ? "bg-gradient-to-r from-teal-600/30 to-cyan-600/30 shadow-lg border border-white/20" 
                      : "hover:bg-white/5"
                  }`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <span 
                    onClick={() => onSelect(s.id)} 
                    className="flex-1 truncate text-sm text-gray-200 group-hover:text-white transition-colors"
                  >
                    {s.title}
                  </span>
                  <Button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDelete(s.id)
                    }}
                    className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-400 bg-transparent p-1.5 rounded-lg hover:bg-red-500/20 transition-all"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}