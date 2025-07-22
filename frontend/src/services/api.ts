// src/services/api.ts
import { authService } from './auth'

const API_BASE_URL = "http://localhost:8000"

export const api = {
  // Chat sessions
  async createChat() {
    const res = await fetch(`${API_BASE_URL}/chats`, {
      method: "POST",
      headers: authService.getAuthHeaders()
    })
    if (!res.ok) throw new Error('Failed to create chat')
    return res.json()
  },

  async getAllChats() {
    const res = await fetch(`${API_BASE_URL}/chats`, {
      headers: authService.getAuthHeaders()
    })
    if (!res.ok) throw new Error('Failed to fetch chats')
    return res.json()
  },

  async deleteChat(id: string) {
    const res = await fetch(`${API_BASE_URL}/chats/${id}`, {
      method: "DELETE",
      headers: authService.getAuthHeaders()
    })
    if (!res.ok) throw new Error('Failed to delete chat')
    return res
  },

  async getChatMessages(sessionId: string) {
    const res = await fetch(`${API_BASE_URL}/chats/${sessionId}/messages`, {
      headers: authService.getAuthHeaders()
    })
    if (!res.ok) throw new Error('Failed to fetch messages')
    return res.json()
  },

  // Create streaming URL with auth token
  createStreamUrl(sessionId: string, userInput: string) {
    const url = new URL(`${API_BASE_URL}/chat/stream`)
    url.searchParams.append("session_id", sessionId)
    url.searchParams.append("user_input", userInput)
    // Add token to URL for SSE (since we can't send headers with EventSource)
    const token = authService.getToken()
    if (token) {
      url.searchParams.append("token", token)
    }
    return url.toString()
  }
}