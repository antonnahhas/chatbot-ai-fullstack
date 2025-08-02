import React, { useState } from "react"

interface ChatInputProps {
  onSend: (text: string) => void
  disabled?: boolean
  onNewChat?: () => Promise<string | null>
  isSending?: boolean
  isWaitingForResponse?: boolean
}

export const ChatInput: React.FC<ChatInputProps> = ({ 
  onSend, 
  disabled = false, 
  onNewChat, 
  isSending = false,
  isWaitingForResponse = false
}) => {
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim() && !disabled && !isSending && !isWaitingForResponse) {
      onSend(input)
      setInput("")
      setIsTyping(false)
    }
  }

  const isDisabled = disabled || isSending || isWaitingForResponse

  // Show "New Chat" button when disabled
  if (disabled) {
    return (
      <div className="p-4 relative z-10">
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6 shadow-2xl text-center">
          <p className="text-gray-300 mb-4">No chat selected. Start a new conversation!</p>
          <button
            onClick={async () => {
              if (onNewChat) {
                await onNewChat()
              }
            }}
            className="px-8 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-xl hover:from-teal-600 hover:to-cyan-600 transition-all transform hover:scale-105 shadow-lg font-medium"
          >
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Start New Chat
            </div>
          </button>
        </div>
      </div>
    )
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
              placeholder={
                isSending 
                  ? "Sending message..." 
                  : isWaitingForResponse 
                    ? "AI is thinking..." 
                    : "Type your message..."
              }
              className="w-full px-5 py-3 bg-transparent text-white placeholder-gray-400 focus:outline-none disabled:opacity-50"
              disabled={isDisabled}
              autoFocus
            />
            {/* Show loading indicator when sending, waiting for response, or typing */}
            {(isSending || isWaitingForResponse || (isTyping && !isSending && !isWaitingForResponse)) && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                {isSending ? (
                  <div className="flex items-center gap-2 text-teal-400">
                    <div className="w-4 h-4 border-2 border-teal-400/30 border-t-teal-400 rounded-full animate-spin"></div>
                    <span className="text-xs">Sending...</span>
                  </div>
                ) : isWaitingForResponse ? (
                  <div className="flex items-center gap-2 text-cyan-400">
                    <div className="w-4 h-4 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin"></div>
                    <span className="text-xs">Thinking...</span>
                  </div>
                ) : (
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-teal-400 rounded-full animate-bounce"></span>
                    <span className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                    <span className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                  </div>
                )}
              </div>
            )}
          </div>
          <button
            type="submit"
            disabled={!input.trim() || isDisabled}
            className="px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-xl hover:from-teal-600 hover:to-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 shadow-lg disabled:transform-none"
          >
            {isSending || isWaitingForResponse ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </form>
  )
}