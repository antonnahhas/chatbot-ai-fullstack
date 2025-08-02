// components/chat/MessageList.tsx
import React from "react"
import { ChatMessage } from "../../types"
import { MessageBubble } from "./MessageBubble"
import { EmptyState } from "./EmptyState"
import { ErrorDisplay } from "../ui/ErrorDisplay"

// Message skeleton component for loading state
const MessageSkeleton: React.FC = () => {
  return (
    <div className="flex justify-start my-2 animate-pulse">
      <div className="relative max-w-xs lg:max-w-md">
        <div className="absolute -left-2 -top-2 w-8 h-8 bg-gray-600 rounded-full"></div>
        <div className="bg-white/20 rounded-2xl p-5 mr-8">
          <div className="space-y-2">
            <div className="h-4 bg-gray-500 rounded w-3/4"></div>
            <div className="h-4 bg-gray-500 rounded w-1/2"></div>
            <div className="h-3 bg-gray-600 rounded w-1/4 mt-3"></div>
          </div>
        </div>
      </div>
    </div>
  )
}

// AI thinking indicator component
const AIThinkingIndicator: React.FC = () => {
  return (
    <div className="flex justify-start my-2 animate-slide-in">
      <div className="relative max-w-xs lg:max-w-md">
        <div className="absolute -left-2 -top-2 w-8 h-8 bg-gradient-to-br from-teal-400 to-cyan-400 rounded-full flex items-center justify-center shadow-lg">
          <span className="text-white text-xs font-bold">AI</span>
        </div>
        <div className="bg-white/90 text-gray-800 border border-white/20 rounded-2xl px-5 py-4 mr-8 shadow-xl backdrop-blur-lg">
          <div className="flex items-center gap-3">
            <div className="flex gap-1">
              <span className="w-2 h-2 bg-teal-500 rounded-full animate-bounce"></span>
              <span className="w-2 h-2 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
              <span className="w-2 h-2 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
            </div>
            <span className="text-gray-600 text-sm">AI is thinking...</span>
          </div>
        </div>
      </div>
    </div>
  )
}

interface MessageListProps {
  messages: ChatMessage[]
  isLoading?: boolean
  isWaitingForResponse?: boolean
  error?: string | null
  onRetryError?: () => void
}

export const MessageList: React.FC<MessageListProps> = ({ 
  messages, 
  isLoading = false,
  isWaitingForResponse = false,
  error = null, 
  onRetryError 
}) => {
  return (
    <div className="flex-1 overflow-y-auto p-4 pt-20 relative z-10">
      {error && (
        <ErrorDisplay 
          error={error}
          type="banner"
          onRetry={onRetryError}
          onDismiss={() => {}} // Error will be cleared by retry or component unmount
          className="mb-4"
        />
      )}
      
      {isLoading ? (
        <div className="space-y-4 animate-fade-in">
          <MessageSkeleton />
          <MessageSkeleton />
          <MessageSkeleton />
        </div>
      ) : messages.length === 0 && !error ? (
        <EmptyState />
      ) : (
        <div className="space-y-4 animate-fade-in">
          {messages.map((message, index) => (
            <MessageBubble
              key={index}
              message={message}
            />
          ))}
          {isWaitingForResponse && <AIThinkingIndicator />}
        </div>
      )}
    </div>
  )
}