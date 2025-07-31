// src/services/api.ts
import { authService } from './auth'

const API_BASE_URL = "http://localhost:8000"

async function fetchWithAuthRetry(input: RequestInfo, init: RequestInit = {}) {
  // Add auth headers
  init.headers = {
    ...authService.getAuthHeaders(),
    ...(init.headers || {})
  }

  let res = await fetch(input, init)

  if (res.status === 401) {
    // Token might be expired — try refreshing anonymous user
    try {
      await authService.createAnonymousUser()
      init.headers = {
        ...authService.getAuthHeaders(),
        ...(init.headers || {})
      }
      res = await fetch(input, init)
    } catch (err) {
      console.error("Token refresh failed:", err)
    }
  }

  return res
}

export const api = {
  async createChat() {
    const res = await fetchWithAuthRetry(`${API_BASE_URL}/chats`, { method: "POST" })
    if (!res.ok) throw new Error('Failed to create chat')
    return res.json()
  },

  async getAllChats() {
    const res = await fetchWithAuthRetry(`${API_BASE_URL}/chats`)
    if (!res.ok) throw new Error('Failed to fetch chats')
    return res.json()
  },

  async deleteChat(id: string) {
    const res = await fetchWithAuthRetry(`${API_BASE_URL}/chats/${id}`, { method: "DELETE" })
    if (!res.ok) throw new Error('Failed to delete chat')
    return res
  },

  async getChatMessages(sessionId: string) {
    const res = await fetchWithAuthRetry(`${API_BASE_URL}/chats/${sessionId}/messages`)
    if (!res.ok) throw new Error('Failed to fetch messages')
    return res.json()
  },

  createStreamUrl(sessionId: string, userInput: string) {
    const url = new URL(`${API_BASE_URL}/chat/stream`)
    url.searchParams.append("session_id", sessionId)
    url.searchParams.append("user_input", userInput)

    const token = authService.getToken()
    if (token) {
      url.searchParams.append("token", token)
    }
    return url.toString()
  }
}
