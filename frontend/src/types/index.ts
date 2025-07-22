// types/index.ts
export interface ChatMessage {
  role: "user" | "assistant"
  content: string
  timestamp: string
}

export interface ChatSession {
  id: string
  title: string
}

export interface ChatInputProps {
  onSend: (text: string) => void
  disabled?: boolean
  onNewChat?: () => void
}

export interface SidebarProps {
  currentSessionId: string | null
  onSelect: (id: string) => void
  onNewChat: (id: string) => void
  onDelete: (id: string) => void
}