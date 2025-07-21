// src/components/ui/Sidebar.tsx
import React from "react"

interface SidebarProps {
  children?: React.ReactNode
}

export const Sidebar: React.FC<SidebarProps> = ({ children }) => {
  return (
    <aside className="w-64 h-screen bg-gray-900 text-white p-4 flex flex-col gap-4 border-r border-gray-800">
      <h2 className="text-xl font-semibold mb-4">Chats</h2>
      {children}
    </aside>
  )
}
