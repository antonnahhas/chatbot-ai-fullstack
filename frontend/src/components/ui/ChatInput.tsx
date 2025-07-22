import React, { useState } from "react"
import { Button } from "./Button"

interface ChatInputProps {
  onSend: (text: string) => void
  disabled?: boolean
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSend, disabled = false }) => {
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim() && !disabled) {
      onSend(input)
      setInput("")
    }
  }

  return (
    <form onSubmit={handleSubmit} className="p-4 relative z-10">
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-2 shadow-2xl">
        <div className="flex gap-3 items-center">
          <div className="flex-1 relative">
            <input
              type="text"
              value={input}
              onChange={(e) => {
                setInput(e.target.value)
                setIsTyping(e.target.value.length > 0)
              }}
              placeholder={disabled ? "Select or create a chat to start" : "Type your message..."}
              className="w-full px-5 py-3 bg-transparent text-white placeholder-gray-400 focus:outline-none disabled:opacity-50"
              disabled={disabled}
            />
            {isTyping && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-teal-400 rounded-full animate-bounce"></span>
                  <span className="w-2 h-2 bg-teal-400 rounded-full animate-bounce animation-delay-200"></span>
                  <span className="w-2 h-2 bg-teal-400 rounded-full animate-bounce animation-delay-400"></span>
                </div>
              </div>
            )}
          </div>
          <Button
            type="submit"
            disabled={disabled || !input.trim()}
            className="px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-xl hover:from-teal-600 hover:to-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 shadow-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </Button>
        </div>
      </div>
    </form>
  )
}