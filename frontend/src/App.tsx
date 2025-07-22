import React, { useState, useEffect } from "react"
import { ChatInput } from "./components/ui/ChatInput"
import { MessageList, ChatMessage } from "./components/ui/MessageList"
import { Sidebar } from "./components/ui/Sidebar"

function App() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  // Load messages when session changes
  useEffect(() => {
    if (currentSessionId) {
      loadChatHistory(currentSessionId)
    } else {
      setMessages([])
    }
  }, [currentSessionId])

  const loadChatHistory = async (sessionId: string) => {
    try {
      const res = await fetch(`http://localhost:8000/chats/${sessionId}/messages`)
      if (res.ok) {
        const data = await res.json()
        const formattedMessages: ChatMessage[] = data.messages.map((msg: any) => ({
          role: msg.role,
          content: msg.content,
          timestamp: new Date().toLocaleTimeString(),
        }))
        setMessages(formattedMessages)
      }
    } catch (error) {
      console.error("Failed to load chat history:", error)
    }
  }

  const handleSend = async (text: string) => {
    if (!currentSessionId) {
      console.error("No session selected")
      return
    }

    const userMessage: ChatMessage = {
      role: "user",
      content: text,
      timestamp: new Date().toLocaleTimeString(),
    }
    setMessages(prev => [...prev, userMessage])

    const assistantMessage: ChatMessage = {
      role: "assistant",
      content: "",
      timestamp: new Date().toLocaleTimeString(),
    }
    setMessages((prev) => [...prev, assistantMessage])

    const url = new URL("http://localhost:8000/chat/stream")
    url.searchParams.append("session_id", currentSessionId)
    url.searchParams.append("user_input", text)

    const eventSource = new EventSource(url.toString())

    eventSource.onopen = () => {
      console.log("✅ SSE connection opened")
    }

    eventSource.onmessage = (event: MessageEvent) => {
      const token = event.data
      if (token === "[DONE]") {
        console.log("✅ SSE completed")
        eventSource.close()
        // Optionally refresh the sidebar to update chat titles
        return
      }

      // Append token to last assistant message
      setMessages((prev) =>
        prev.map((msg, idx) =>
          idx === prev.length - 1
            ? { ...msg, content: msg.content + token }
            : msg
        )
      )
    }

    eventSource.onerror = (err: Event) => {
      console.error("SSE error:", err)
      eventSource.close()
    }
  }

  const handleSelectSession = (id: string) => {
    setCurrentSessionId(id)
  }

  const handleNewChat = async (id: string) => {
    if (!id) {
      // Create a new chat if no ID provided
      try {
        const res = await fetch("http://localhost:8000/chats", {
          method: "POST",
        })
        const data = await res.json()
        setCurrentSessionId(data.session_id)
        setMessages([])
      } catch (error) {
        console.error("Failed to create new chat:", error)
      }
    } else {
      // Use the provided ID
      setCurrentSessionId(id)
      setMessages([])
    }
  }

  const handleDeleteChat = (id: string) => {
    if (id === currentSessionId) {
      setCurrentSessionId(null)
      setMessages([])
    }
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-900 via-teal-900 to-cyan-900">
      {/* Sidebar */}
      <div className={`${isSidebarOpen ? 'w-72' : 'w-0'} transition-all duration-300 overflow-hidden`}>
        <Sidebar
          currentSessionId={currentSessionId}
          onSelect={handleSelectSession}
          onNewChat={handleNewChat}
          onDelete={handleDeleteChat}
        />
      </div>
      
      <main className="flex flex-col flex-1 relative overflow-hidden">
        {/* Toggle Sidebar Button */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="absolute top-4 left-4 z-20 p-2 bg-white/10 backdrop-blur-lg rounded-lg hover:bg-white/20 transition-all group"
          title={`${isSidebarOpen ? 'Hide' : 'Show'} sidebar (Ctrl+B)`}
        >
          <svg 
            className="w-6 h-6 text-white" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            {isSidebarOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
          <span className="absolute left-full ml-2 px-2 py-1 bg-black/80 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            {isSidebarOpen ? 'Hide' : 'Show'} sidebar (Ctrl+B)
          </span>
        </button>
        
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-teal-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-emerald-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>
        
        <MessageList messages={messages} />
        <ChatInput 
          onSend={handleSend} 
          disabled={!currentSessionId}
          onNewChat={() => {
            // Create new chat directly
            handleNewChat("")
          }}
        />
      </main>
    </div>
  )
}

export default App