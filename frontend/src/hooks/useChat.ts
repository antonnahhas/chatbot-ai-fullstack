// hooks/useChat.ts
import { useState, useEffect } from "react"
import { ChatMessage } from "../types"
import { api } from "../services/api"

export const useChat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null)
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [isWaitingForResponse, setIsWaitingForResponse] = useState(false)
  const [chatError, setChatError] = useState<string | null>(null)

  const loadChatHistory = async (sessionId: string) => {
    setIsLoadingHistory(true)
    setChatError(null)
    try {
      const data = await api.getChatMessages(sessionId)
      const formattedMessages: ChatMessage[] = data.messages.map((msg: any) => ({
        role: msg.role,
        content: msg.content,
        timestamp: new Date().toLocaleTimeString(),
      }))
      setMessages(formattedMessages)
    } catch (error) {
      console.error("Failed to load chat history:", error)
      setChatError("Failed to load chat history. Please try again.")
    } finally {
      setIsLoadingHistory(false)
    }
  }

  useEffect(() => {
    if (currentSessionId) {
      loadChatHistory(currentSessionId)
    } else {
      setMessages([])
      setChatError(null)
    }
  }, [currentSessionId])

  const sendMessage = async (text: string) => {
    if (!currentSessionId) {
      setChatError("No session selected")
      return
    }

    setIsSending(true)
    setIsWaitingForResponse(false)
    setChatError(null)

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

    try {
      const streamUrl = api.createStreamUrl(currentSessionId, text)
      const eventSource = new EventSource(streamUrl)

      // Connection timeout handler
      const connectionTimeout = setTimeout(() => {
        eventSource.close()
        setIsSending(false)
        setIsWaitingForResponse(false)
        setChatError("Connection timeout. Please check your internet connection and try again.")
        // Remove the empty assistant message on timeout
        setMessages(prev => prev.slice(0, -1))
      }, 30000) // 30 second timeout

      eventSource.onopen = () => {
        console.log("✅ SSE connection opened")
        clearTimeout(connectionTimeout)
        setIsSending(false) // Connection established, stop sending indicator
        setIsWaitingForResponse(true) // Start waiting for response indicator
      }

      eventSource.onmessage = (event: MessageEvent) => {
        const token = event.data
        if (token === "[DONE]") {
          console.log("✅ SSE completed")
          eventSource.close()
          setIsWaitingForResponse(false) // Response complete
          clearTimeout(connectionTimeout)
          return
        }

        // First token received, stop waiting indicator
        if (isWaitingForResponse) {
          setIsWaitingForResponse(false)
        }

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
        clearTimeout(connectionTimeout)
        setIsSending(false)
        setIsWaitingForResponse(false)
        
        // Determine error message based on error type
        let errorMessage = "Connection lost. Please try sending your message again."
        
        // Check if it's a network error or server error
        if (!navigator.onLine) {
          errorMessage = "No internet connection. Please check your network and try again."
        } else {
          // Try to determine if server is unreachable
          fetch(streamUrl.split('?')[0], { method: 'HEAD' })
            .catch(() => {
              setChatError("Unable to connect to the server. Please check if the service is running and try again.")
              return
            })
        }
        
        setChatError(errorMessage)
        
        // Remove the empty assistant message on error
        setMessages(prev => prev.slice(0, -1))
      }
    } catch (error) {
      setIsSending(false)
      setIsWaitingForResponse(false)
      console.error("Error starting SSE:", error)
      
      let errorMessage = "Failed to send message. Please try again."
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        errorMessage = "Unable to connect to the server. Please check if the service is running."
      }
      
      setChatError(errorMessage)
      // Remove both user and assistant messages on error
      setMessages(prev => prev.slice(0, -2))
    }
  }

  const createNewChat = async () => {
    try {
      const data = await api.createChat()
      setCurrentSessionId(data.session_id)
      setMessages([])
      setChatError(null)
      return data.session_id
    } catch (error) {
      console.error("Failed to create new chat:", error)
      setChatError("Failed to create new chat. Please try again.")
      return null
    }
  }

  const retryLoadHistory = () => {
    if (currentSessionId) {
      loadChatHistory(currentSessionId)
    }
  }

  const retrySendMessage = () => {
    setChatError(null)
    // Get the last user message and resend it
    const lastUserMessage = messages.filter(msg => msg.role === 'user').pop()
    if (lastUserMessage) {
      // Remove the last assistant message if it exists and is empty
      const lastMessage = messages[messages.length - 1]
      if (lastMessage && lastMessage.role === 'assistant' && lastMessage.content === '') {
        setMessages(prev => prev.slice(0, -1))
      }
      sendMessage(lastUserMessage.content)
    }
  }

  return {
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
    setChatError,
    retryLoadHistory,
    retrySendMessage
  }
}