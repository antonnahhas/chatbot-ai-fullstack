import { API_BASE_URL } from '../utils/constants'
interface AuthResponse {
  user_id: string
  access_token: string
  token_type: string
}

class AuthService {
  private token: string | null = null
  private userId: string | null = null

  constructor() {
    // Load token from localStorage on init
    this.loadToken()
  }

  private loadToken() {
    this.token = localStorage.getItem('auth_token')
    this.userId = localStorage.getItem('user_id')
  }

  private saveToken(token: string, userId: string) {
    this.token = token
    this.userId = userId
    localStorage.setItem('auth_token', token)
    localStorage.setItem('user_id', userId)
  }

  async initializeAuth(): Promise<void> {
    // If no token exists, create anonymous user
    if (!this.token) {
      await this.createAnonymousUser()
    }
  }

  async createAnonymousUser(): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/anonymous`, {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error('Failed to create anonymous user')
      }

      const data: AuthResponse = await response.json()
      this.saveToken(data.access_token, data.user_id)
    } catch (error) {
      console.error('Error creating anonymous user:', error)
      throw error
    }
  }

  getAuthHeaders(): HeadersInit {
    if (!this.token) {
      return {
        'Content-Type': 'application/json'
      }
    }

    return {
      'Authorization': `Bearer ${this.token}`,
      'Content-Type': 'application/json'
    }
  }

  getToken(): string | null {
    return this.token
  }

  getUserId(): string | null {
    return this.userId
  }

  isAuthenticated(): boolean {
    return !!this.token
  }

  logout() {
    this.token = null
    this.userId = null
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user_id')
  }
}

export const authService = new AuthService()