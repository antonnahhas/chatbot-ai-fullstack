// components/ui/ToggleSidebarButton.tsx
import React from "react"

interface ToggleSidebarButtonProps {
  isOpen: boolean
  onClick: () => void
}

export const ToggleSidebarButton: React.FC<ToggleSidebarButtonProps> = ({ isOpen, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="absolute top-4 left-4 z-20 p-2 bg-white/10 backdrop-blur-lg rounded-lg hover:bg-white/20 transition-all group"
      title={`${isOpen ? 'Hide' : 'Show'} sidebar (Ctrl+B)`}
    >
      <svg 
        className="w-6 h-6 text-white" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        {isOpen ? (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
        ) : (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        )}
      </svg>
      <span className="absolute left-full ml-2 px-2 py-1 bg-black/80 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
        {isOpen ? 'Hide' : 'Show'} sidebar (Ctrl+B)
      </span>
    </button>
  )
}