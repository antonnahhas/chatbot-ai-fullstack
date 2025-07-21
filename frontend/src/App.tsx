import React, { useState } from "react"
import { ChatInput } from "./components/ui/ChatInput"
import { MessageList, ChatMessage } from "./components/ui/MessageList"
import { Sidebar } from "./components/ui/Sidebar"
import { v4 as uuidv4 } from "uuid"

const sessionId = uuidv4()

function App() {
  const [messages, setMessages] = useState<ChatMessage[]>([])

  const handleSend = async (text: string) => {
    const userMessage: ChatMessage = {
      role: "user",
      content: text,
      timestamp: new Date().toLocaleTimeString(),
    }
    const updatedHistory = [...messages, userMessage]
    setMessages(updatedHistory)

    const assistantMessage: ChatMessage = {
      role: "assistant",
      content: "",
      timestamp: new Date().toLocaleTimeString(),
    }
    setMessages((prev) => [...prev, assistantMessage])

    const url = new URL("http://localhost:8000/chat/stream")
    url.searchParams.append("session_id", sessionId)
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

  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex flex-col flex-1 bg-white">
        <MessageList messages={messages} />
        <ChatInput onSend={handleSend} />
      </main>
    </div>
  )
}

export default App
