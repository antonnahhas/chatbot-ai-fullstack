import React, { useState } from "react"
import { ChatInput } from "./components/ui/ChatInput"
import { MessageList, ChatMessage } from "./components/ui/MessageList"
import { Sidebar } from "./components/ui/Sidebar"
import { v4 as uuidv4 } from "uuid"
import { EventSourcePolyfill } from "event-source-polyfill"


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

    const eventSource = new EventSourcePolyfill("http://localhost:8000/chat/stream", {
      headers: { "Content-Type": "application/json" },
      payload: JSON.stringify({
        session_id: sessionId,
        user_input: text,
        history: updatedHistory,
      }),
    })

    eventSource.onmessage = (event: MessageEvent) => {
      setMessages((prev) =>
        prev.map((msg, idx) =>
          idx === prev.length - 1
            ? { ...msg, content: msg.content + event.data }
            : msg
        )
      )
    }

    eventSource.onerror = (err: Event) => {
      console.error("SSE error:", err)
      eventSource.close()
    }

    eventSource.onopen = () => {
      console.log("SSE connection opened")
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
