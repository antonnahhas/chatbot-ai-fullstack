export const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8000/api/v1"

export const API_ENDPOINTS = {
  // Chat endpoints
  createChat: `${API_BASE_URL}/chats`,
  getAllChats: `${API_BASE_URL}/chats`,
  deleteChat: (id: string) => `${API_BASE_URL}/chats/${id}`,
  getChatMessages: (id: string) => `${API_BASE_URL}/chats/${id}/messages`,
  streamChat: `${API_BASE_URL}/chat/stream`,
  
  // Health check
  health: `${API_BASE_URL}/health`
}