// App.tsx
import React, { useEffect } from "react"
import { ChatInput } from "./components/chat/ChatInput"
import { MessageList } from "./components/chat/MessageList"
import { Sidebar } from "./components/sidebar/Sidebar"
import { AnimatedBackground } from "./components/ui/AnimatedBackground"
import { ToggleSidebarButton } from "./components/ui/ToggleSidebarButton"
import { useChat } from "./hooks/useChat"
import { useSidebar } from "./hooks/useSidebar"

function App() {
  const {
    messages,
    currentSessionId,
    setCurrentSessionId,
    sendMessage,
    createNewChat,
    setMessages
  } = useChat()
  
  const { isOpen: isSidebarOpen, toggle: toggleSidebar } = useSidebar()

  // Initialize chat on app load
  useEffect(() => {
    const initializeChat = async () => {
      try {
        const res = await fetch("http://localhost:8000/chats")
        const data = await res.json()
        
        if (data.sessions && data.sessions.length > 0) {
          setCurrentSessionId(data.sessions[0].id)
        } else {
          await createNewChat()
        }
      } catch (error) {
        console.error("Failed to initialize chat:", error)
      }
    }
    
    initializeChat()
  }, [])

  const handleNewChat = async (id: string) => {
    if (!id) {
      await createNewChat()
    } else {
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
      <div className={`${isSidebarOpen ? 'w-72' : 'w-0'} transition-all duration-300 overflow-hidden`}>
        <Sidebar
          currentSessionId={currentSessionId}
          onSelect={setCurrentSessionId}
          onNewChat={handleNewChat}
          onDelete={handleDeleteChat}
        />
      </div>
      
      <main className="flex flex-col flex-1 relative overflow-hidden">
        <ToggleSidebarButton 
          isOpen={isSidebarOpen} 
          onClick={toggleSidebar} 
        />
        <AnimatedBackground />
        <MessageList messages={messages} />
        <ChatInput 
          onSend={sendMessage} 
          disabled={!currentSessionId}
          onNewChat={createNewChat}
        />
      </main>
    </div>
  )
}

export default App