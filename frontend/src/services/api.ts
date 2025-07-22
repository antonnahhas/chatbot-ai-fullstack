// src/services/api.ts
const API_BASE_URL = "http://localhost:8000"

export const api = {
  // Chat sessions
  async createChat() {
    const res = await fetch(`${API_BASE_URL}/chats`, {
      method: "POST",
    })
    return res.json()
  },

  async getAllChats() {
    const res = await fetch(`${API_BASE_URL}/chats`)
    return res.json()
  },

  async deleteChat(id: string) {
    return fetch(`${API_BASE_URL}/chats/${id}`, {
      method: "DELETE",
    })
  },

  async getChatMessages(sessionId: string) {
    const res = await fetch(`${API_BASE_URL}/chats/${sessionId}/messages`)
    return res.json()
  },

  // Create streaming URL
  createStreamUrl(sessionId: string, userInput: string) {
    const url = new URL(`${API_BASE_URL}/chat/stream`)
    url.searchParams.append("session_id", sessionId)
    url.searchParams.append("user_input", userInput)
    return url.toString()
  }
}