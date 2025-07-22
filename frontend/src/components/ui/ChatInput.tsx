import React, { useState } from "react"
import { Button } from "./Button"

interface ChatInputProps {
  onSend: (text: string) => void
  disabled?: boolean
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSend, disabled = false }) => {
  const [input, setInput] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim() && !disabled) {
      onSend(input)
      setInput("")
    }
  }

  return (
    <form onSubmit={handleSubmit} className="p-4 border-t bg-white">
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={disabled ? "Select or create a chat to start" : "Type a message..."}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          disabled={disabled}
        />
        <Button
          type="submit"
          disabled={disabled || !input.trim()}
          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          Send
        </Button>
      </div>
    </form>
  )
}