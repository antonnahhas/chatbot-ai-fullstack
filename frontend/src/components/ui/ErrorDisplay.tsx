// components/ui/ErrorDisplay.tsx
import React from "react"

interface ErrorDisplayProps {
  error: string
  onRetry?: () => void
  onDismiss?: () => void
  type?: "banner" | "modal" | "inline"
  className?: string
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  error,
  onRetry,
  onDismiss,
  type = "banner",
  className = ""
}) => {
  if (type === "banner") {
    return (
      <div className={`bg-red-600/20 border border-red-500/50 backdrop-blur-lg rounded-lg p-4 mb-4 animate-slide-in ${className}`}>
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <svg className="w-5 h-5 text-red-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          
          <div className="flex-1">
            <h4 className="text-red-300 font-medium mb-1">Something went wrong</h4>
            <p className="text-red-200 text-sm leading-relaxed">{error}</p>
          </div>
          
          <div className="flex gap-2">
            {onRetry && (
              <button
                onClick={onRetry}
                className="px-4 py-2 bg-red-500/30 hover:bg-red-500/40 text-red-200 hover:text-white text-sm rounded-lg transition-all transform hover:scale-105 font-medium"
              >
                Try Again
              </button>
            )}
            {onDismiss && (
              <button
                onClick={onDismiss}
                className="text-red-400 hover:text-red-300 transition-colors p-1"
                title="Dismiss"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (type === "inline") {
    return (
      <div className={`flex items-center gap-2 text-red-400 text-sm ${className}`}>
        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className="flex-1">{error}</span>
        {onRetry && (
          <button
            onClick={onRetry}
            className="text-red-300 hover:text-red-200 underline transition-colors whitespace-nowrap"
          >
            Try again
          </button>
        )}
      </div>
    )
  }

  // Modal type
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-slate-800/90 backdrop-blur-xl border border-red-500/30 rounded-2xl p-6 max-w-md w-full shadow-2xl animate-slide-in">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-white font-semibold text-lg">Connection Error</h3>
        </div>
        
        <p className="text-gray-300 mb-6 leading-relaxed">{error}</p>
        
        <div className="flex gap-3 justify-end">
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
            >
              Dismiss
            </button>
          )}
          {onRetry && (
            <button
              onClick={onRetry}
              className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all transform hover:scale-105 font-medium"
            >
              Try Again
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// Toast notification component for temporary errors
interface ToastProps {
  message: string
  type?: "error" | "success" | "info"
  onClose: () => void
  duration?: number
}

export const Toast: React.FC<ToastProps> = ({ 
  message, 
  type = "error", 
  onClose, 
  duration = 5000 
}) => {
  React.useEffect(() => {
    const timer = setTimeout(onClose, duration)
    return () => clearTimeout(timer)
  }, [duration, onClose])

  const bgColor = {
    error: "bg-red-600/90",
    success: "bg-green-600/90", 
    info: "bg-blue-600/90"
  }

  const textColor = {
    error: "text-red-100",
    success: "text-green-100",
    info: "text-blue-100"
  }

  const borderColor = {
    error: "border-red-500/50",
    success: "border-green-500/50",
    info: "border-blue-500/50"
  }

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in">
      <div className={`${bgColor[type]} backdrop-blur-lg rounded-lg p-4 shadow-2xl border ${borderColor[type]} max-w-sm`}>
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5">
            {type === "success" && (
              <svg className="w-5 h-5 text-green-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            )}
            {type === "error" && (
              <svg className="w-5 h-5 text-red-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            {type === "info" && (
              <svg className="w-5 h-5 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
          </div>
          <div className="flex-1">
            <p className={`${textColor[type]} text-sm font-medium leading-relaxed`}>{message}</p>
          </div>
          <button
            onClick={onClose}
            className={`${textColor[type]} hover:text-white transition-colors`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}