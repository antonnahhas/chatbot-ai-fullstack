// App.tsx
import React, { useEffect, useState } from "react"
import { ChatInput } from "./components/chat/ChatInput"
import { MessageList } from "./components/chat/MessageList"
import { Sidebar } from "./components/sidebar/Sidebar"
import { AnimatedBackground } from "./components/ui/AnimatedBackground"
import { ToggleSidebarButton } from "./components/ui/ToggleSidebarButton"
import { LoadingSpinner } from "./components/ui/LoadingSpinner"
import { ErrorDisplay, Toast } from "./components/ui/ErrorDisplay"
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
    setMessages,
    isLoadingHistory,
    isSending,
    isWaitingForResponse,
    chatError,
    retryLoadHistory,
    retrySendMessage
  } = useChat()
  
  const { isOpen: isSidebarOpen, toggle: toggleSidebar } = useSidebar()
  const [isAuthReady, setIsAuthReady] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)
  const [isLoadingChats, setIsLoadingChats] = useState(false)
  const [appError, setAppError] = useState<string | null>(null)
  const [toast, setToast] = useState<{ message: string; type: "error" | "success" | "info" } | null>(null)
  
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
        setAuthError("Failed to initialize authentication. Please refresh the page.")
      }
    }
    
    initAuth()
  }, [])

  // Initialize chat after auth is ready
  useEffect(() => {
    if (!isAuthReady) return
    
    const initializeChat = async () => {
      setIsLoadingChats(true)
      try {
        const data = await api.getAllChats()
        
        if (data.sessions && data.sessions.length > 0) {
          setCurrentSessionId(data.sessions[0].id)
        } else {
          // Don't automatically create a chat on page load
          // Let the user create one when they're ready
          setCurrentSessionId(null)
        }
      } catch (error) {
        console.error("Failed to initialize chat:", error)
        setAppError("Failed to load your conversations. Please check your connection and try again.")
      } finally {
        setIsLoadingChats(false)
      }
    }
    
    initializeChat()
  }, [isAuthReady, setCurrentSessionId])

  const handleNewChat = async () => {
    try {
      // Creating a new chat from sidebar
      const data = await api.createChat()
      setCurrentSessionId(data.session_id)
      setMessages([])
      setToast({ message: "New chat created successfully!", type: "success" })
      return data.session_id
    } catch (error) {
      console.error("Failed to create new chat:", error)
      setToast({ message: "Failed to create new chat. Please try again.", type: "error" })
      return null
    }
  }

  const handleSelectChat = (id: string) => {
    // Selecting an existing chat
    setCurrentSessionId(id)
    setMessages([])
  }

  const handleDeleteChat = async (id: string) => {
    try {
      // Delete the chat first
      await api.deleteChat(id)
      
      // Get updated sessions list
      const data = await api.getAllChats()
      const remainingSessions = data.sessions || []
      
      if (id === currentSessionId) {
        if (remainingSessions.length > 0) {
          // Select the first remaining session
          setCurrentSessionId(remainingSessions[0].id)
        } else {
          // No sessions left, clear current session
          setCurrentSessionId(null)
          setMessages([])
        }
      }
      
      setToast({ message: "Chat deleted successfully", type: "info" })
    } catch (error) {
      console.error("Error handling chat deletion:", error)
      setToast({ message: "Failed to delete chat. Please try again.", type: "error" })
    }
  }

  const retryInitialization = async () => {
    setAppError(null)
    setIsLoadingChats(true)
    try {
      const data = await api.getAllChats()
      
      if (data.sessions && data.sessions.length > 0) {
        setCurrentSessionId(data.sessions[0].id)
      } else {
        // Don't automatically create a chat, just clear current session
        setCurrentSessionId(null)
      }
      setToast({ message: "Successfully reconnected!", type: "success" })
    } catch (error) {
      console.error("Failed to initialize chat:", error)
      setAppError("Failed to load your conversations. Please check your connection and try again.")
    } finally {
      setIsLoadingChats(false)
    }
  }

  const handleRetryError = () => {
    if (chatError && chatError.includes("send")) {
      // This is a send error, retry sending
      retrySendMessage()
    } else {
      // This is a history loading error, retry loading
      retryLoadHistory()
    }
  }

  // Show loading state while auth is initializing
  if (!isAuthReady && !authError) {
    return (
      <div className="flex h-screen bg-gradient-to-br from-slate-900 via-teal-900 to-cyan-900 items-center justify-center">
        <LoadingSpinner size="lg" text="Initializing authentication..." />
      </div>
    )
  }

  // Show error if auth failed
  if (authError) {
    return (
      <div className="flex h-screen bg-gradient-to-br from-slate-900 via-teal-900 to-cyan-900 items-center justify-center">
        <ErrorDisplay 
          error={authError}
          type="modal"
          onRetry={() => window.location.reload()}
          onDismiss={() => setAuthError(null)}
        />
      </div>
    )
  }

  // Show loading during chat initialization
  if (isLoadingChats) {
    return (
      <div className="flex h-screen bg-gradient-to-br from-slate-900 via-teal-900 to-cyan-900">
        <LoadingSpinner size="lg" text="Loading your conversations..." className="m-auto" />
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-900 via-teal-900 to-cyan-900">
      {/* Show app-level errors */}
      {appError && (
        <ErrorDisplay 
          error={appError}
          type="modal"
          onRetry={retryInitialization}
          onDismiss={() => setAppError(null)}
        />
      )}

      {/* Toast notifications */}
      {toast && (
        <Toast 
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className={`${isSidebarOpen ? 'w-72' : 'w-0'} transition-all duration-300 overflow-hidden`}>
        <Sidebar
          currentSessionId={currentSessionId}
          onSelect={handleSelectChat}
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
        <MessageList 
          messages={messages} 
          isLoading={isLoadingHistory}
          isWaitingForResponse={isWaitingForResponse}
          error={chatError}
          onRetryError={handleRetryError}
        />
        <ChatInput 
          onSend={sendMessage} 
          disabled={!currentSessionId}
          onNewChat={handleNewChat}
          isSending={isSending}
          isWaitingForResponse={isWaitingForResponse}
        />
      </main>
    </div>
  )
}

export default App