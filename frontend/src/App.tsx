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
    setMessages((prev) => [...prev, userMessage])

    try {
      const res = await fetch("http://localhost:8000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sessionId,
          user_input: text,
          history: [...messages, userMessage],
        }),
      })

      const data = await res.json()
      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: data.response,
        timestamp: new Date().toLocaleTimeString(),
      }
      setMessages((prev) => [...prev, assistantMessage])
    } catch (err) {
      console.error("Error:", err)
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
