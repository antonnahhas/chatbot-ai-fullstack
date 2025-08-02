// types/index.ts
export interface ChatMessage {
  role: "user" | "assistant"
  content: string
  timestamp: string
}

export interface ChatSession {
  id: string
  title: string
  created_at: string
  updated_at: string
}

export interface ChatInputProps {
  onSend: (text: string) => void
  disabled?: boolean
  onNewChat?: () => void
}

export interface SidebarProps {
  currentSessionId: string | null
  onSelect: (id: string) => void
  onNewChat: () => Promise<string | null>  
  onDelete: (id: string) => Promise<void>  
}