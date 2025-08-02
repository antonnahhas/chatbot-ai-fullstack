// components/ui/LoadingSpinner.tsx
import React from "react"

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg"
  text?: string
  className?: string
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = "md", 
  text,
  className = "" 
}) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8", 
    lg: "w-12 h-12"
  }

  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <div className="relative">
        {/* Outer rotating ring */}
        <div className={`${sizeClasses[size]} border-4 border-white/20 border-t-teal-400 rounded-full animate-spin`}></div>
        
        {/* Inner pulsing dot */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
        </div>
      </div>
      
      {text && (
        <p className="text-gray-300 text-sm animate-pulse">{text}</p>
      )}
    </div>
  )
}

// Alternative inline loading component for buttons
export const InlineLoader: React.FC<{ className?: string }> = ({ className = "" }) => {
  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
      <span className="text-sm">Loading...</span>
    </div>
  )
}

// Skeleton loader for chat messages
export const MessageSkeleton: React.FC = () => {
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