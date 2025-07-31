// App.tsx
import React, { useEffect, useState } from "react"
import { ChatInput } from "./components/chat/ChatInput"
import { MessageList } from "./components/chat/MessageList"
import { Sidebar } from "./components/sidebar/Sidebar"
import { AnimatedBackground } from "./components/ui/AnimatedBackground"
import { ToggleSidebarButton } from "./components/ui/ToggleSidebarButton"
import { useChat } from "./hooks/useChat"
import { useSidebar } from "./hooks/useSidebar"
import { authService } from "./services/auth"
import { api } from "./services/api"

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
  const [isAuthReady, setIsAuthReady] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)
  
  // Set the document title
  useEffect(() => {
    document.title = "SummerAI";
  }, []);

  // Initialize authentication
  useEffect(() => {
    const initAuth = async () => {
      try {
        await authService.initializeAuth()
        setIsAuthReady(true)
      } catch (error) {
        console.error("Failed to initialize auth:", error)
        setAuthError("Failed to initialize authentication")
      }
    }
    
    initAuth()
  }, [])

  // Initialize chat after auth is ready
  useEffect(() => {
    if (!isAuthReady) return
    
    const initializeChat = async () => {
      try {
        const data = await api.getAllChats()
        
        if (data.sessions && data.sessions.length > 0) {
          setCurrentSessionId(data.sessions[0].id)
        } else {
          const newChat = await api.createChat()
          setCurrentSessionId(newChat.session_id)
        }
      } catch (error) {
        console.error("Failed to initialize chat:", error)
      }
    }
    
    initializeChat()
  }, [isAuthReady]) // Remove createNewChat and setCurrentSessionId from dependencies

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

  // Show loading state while auth is initializing
  if (!isAuthReady && !authError) {
    return (
      <div className="flex h-screen bg-gradient-to-br from-slate-900 via-teal-900 to-cyan-900 items-center justify-center">
        <div className="text-white text-xl">Initializing...</div>
      </div>
    )
  }

  // Show error if auth failed
  if (authError) {
    return (
      <div className="flex h-screen bg-gradient-to-br from-slate-900 via-teal-900 to-cyan-900 items-center justify-center">
        <div className="text-red-400 text-xl">{authError}</div>
      </div>
    )
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