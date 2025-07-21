// src/components/ui/ChatInput.tsx
import React, { useState } from "react"
import { Button } from "./Button"

interface ChatInputProps {
  onSend: (message: string) => void
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSend }) => {
  const [message, setMessage] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (message.trim()) {
      onSend(message.trim())
      setMessage("")
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2 p-4 border-t border-gray-200 bg-white">
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type a message..."
        className="flex-1 px-4 py-2 border rounded shadow-sm outline-none focus:ring-2 focus:ring-blue-500"
      />
      <Button type="submit">Send</Button>
    </form>
  )
}
