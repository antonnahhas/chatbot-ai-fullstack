// src/services/api.ts
import { authService } from './auth'
import { API_BASE_URL } from '../utils/constants'

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
      throw new Error("Authentication failed. Please refresh the page.")
    }
  }

  return res
}

export const api = {
  async createChat() {
    try {
      const res = await fetchWithAuthRetry(`${API_BASE_URL}/chats`, { method: "POST" })
      if (!res.ok) {
        if (res.status >= 500) {
          throw new Error('Server error. Please try again later.')
        } else if (res.status === 404) {
          throw new Error('Service not found. Please check if the server is running.')
        } else {
          throw new Error(`Failed to create chat (${res.status})`)
        }
      }
      return res.json()
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Unable to connect to the server. Please check your internet connection.')
      }
      throw error
    }
  },

  async getAllChats() {
    try {
      const res = await fetchWithAuthRetry(`${API_BASE_URL}/chats`)
      if (!res.ok) {
        if (res.status >= 500) {
          throw new Error('Server error. Please try again later.')
        } else if (res.status === 404) {
          throw new Error('Service not found. Please check if the server is running.')
        } else {
          throw new Error(`Failed to fetch chats (${res.status})`)
        }
      }
      return res.json()
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Unable to connect to the server. Please check your internet connection.')
      }
      throw error
    }
  },

  async deleteChat(id: string) {
    try {
      const res = await fetchWithAuthRetry(`${API_BASE_URL}/chats/${id}`, { method: "DELETE" })
      if (!res.ok) {
        if (res.status >= 500) {
          throw new Error('Server error. Please try again later.')
        } else if (res.status === 404) {
          throw new Error('Chat not found or already deleted.')
        } else {
          throw new Error(`Failed to delete chat (${res.status})`)
        }
      }
      return res
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Unable to connect to the server. Please check your internet connection.')
      }
      throw error
    }
  },

  async getChatMessages(sessionId: string) {
    try {
      const res = await fetchWithAuthRetry(`${API_BASE_URL}/chats/${sessionId}/messages`)
      if (!res.ok) {
        if (res.status >= 500) {
          throw new Error('Server error. Please try again later.')
        } else if (res.status === 404) {
          throw new Error('Chat session not found.')
        } else {
          throw new Error(`Failed to fetch messages (${res.status})`)
        }
      }
      return res.json()
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Unable to connect to the server. Please check your internet connection.')
      }
      throw error
    }
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