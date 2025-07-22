// components/sidebar/SidebarHeader.tsx
import React from "react"

export const SidebarHeader: React.FC = () => {
  return (
    <div className="mb-8 pb-6 border-b border-white/10">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 bg-gradient-to-br from-teal-400 to-cyan-400 rounded-xl flex items-center justify-center shadow-lg animate-pulse">
          <span className="text-white font-bold text-lg">S</span>
        </div>
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-teal-200 to-cyan-200 bg-clip-text text-transparent">
            SumerAI
          </h1>
          <p className="text-xs text-gray-400">by Sumeria LTD</p>
        </div>
      </div>
    </div>
  )
}