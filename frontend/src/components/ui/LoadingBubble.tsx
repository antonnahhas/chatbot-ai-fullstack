// Create this as a separate component if you want more control
import React from "react"

export const LoadingBubble: React.FC = () => {
  return (
    <div className="flex justify-start my-2 animate-fade-in">
      <div className="relative max-w-xs lg:max-w-md">
        <div className="absolute -left-2 -top-2 w-8 h-8 bg-gradient-to-br from-teal-400 to-cyan-400 rounded-full flex items-center justify-center shadow-lg animate-pulse">
          <span className="text-white text-xs font-bold">AI</span>
        </div>
        <div className="px-5 py-4 rounded-2xl shadow-xl backdrop-blur-lg bg-white/90 border border-white/20 mr-8">
          <div className="flex flex-col items-center">
            <video 
              src="/robot-loading.mp4" 
              autoPlay 
              loop 
              muted 
              playsInline
              className="w-24 h-24 rounded-lg"
              style={{ filter: 'drop-shadow(0 0 20px rgba(20, 184, 166, 0.5))' }}
            />
            <div className="mt-3 flex items-center gap-2">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-teal-500 rounded-full animate-bounce"></span>
                <span className="w-2 h-2 bg-teal-500 rounded-full animate-bounce animation-delay-200"></span>
                <span className="w-2 h-2 bg-teal-500 rounded-full animate-bounce animation-delay-400"></span>
              </div>
              <p className="text-sm text-gray-600 animate-pulse">SumerAI is thinking</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}