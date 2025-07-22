// hooks/useChat.ts
import { useState, useEffect } from "react"
import { ChatMessage } from "../types"
import { api } from "../services/api"

export const useChat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null)

  const loadChatHistory = async (sessionId: string) => {
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
    }
  }

  useEffect(() => {
    if (currentSessionId) {
      loadChatHistory(currentSessionId)
    } else {
      setMessages([])
    }
  }, [currentSessionId])

  const sendMessage = async (text: string) => {
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

    const streamUrl = api.createStreamUrl(currentSessionId, text)
    const eventSource = new EventSource(streamUrl)

    eventSource.onopen = () => {
      console.log("✅ SSE connection opened")
    }

    eventSource.onmessage = (event: MessageEvent) => {
      const token = event.data
      if (token === "[DONE]") {
        console.log("✅ SSE completed")
        eventSource.close()
        return
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
    }
  }

  const createNewChat = async () => {
    try {
      const data = await api.createChat()
      setCurrentSessionId(data.session_id)
      setMessages([])
      return data.session_id
    } catch (error) {
      console.error("Failed to create new chat:", error)
      return null
    }
  }

  return {
    messages,
    currentSessionId,
    setCurrentSessionId,
    sendMessage,
    createNewChat,
    setMessages
  }
}