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
    const res = await fetch("http://localhost:8000/chats", {
        method: "POST",
    })
    const data = await res.json()

    await fetchSessions() 

    onNewChat(data.session_id)
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
    <div className="w-64 bg-gray-100 p-4 border-r border-gray-200">
      <div className="items-center mb-4">
        <h2 className="text-lg font-semibold">Chats</h2>
        <Button onClick={handleNewChat} className="w-full flex items-center gap-2 mb-4">
            <PlusIcon className="h-4 w-4" />
            New Chat
        </Button>
      </div>
      {sessions.length === 0 ? (
        <p className="text-gray-500 text-sm">No chats yet.</p>
        ) : (
        <ul className="space-y-2">
            {sessions.map((s) => (
            <li
                key={s.id}
                className={`flex items-center justify-between px-2 py-1 rounded cursor-pointer hover:bg-gray-200 ${
                currentSessionId === s.id ? "bg-gray-300 font-bold" : ""
                }`}
            >
                <span onClick={() => onSelect(s.id)} className="flex-1 truncate">
                {s.title}
                </span>
                <Button
                    onClick={() => handleDelete(s.id)}
                    className="text-red-500 hover:text-red-700 bg-transparent p-0"
                    >
                    <TrashIcon className="w-4 h-4" />
                </Button>
            </li>
            ))}
        </ul>
        )}
    </div>
  )
}