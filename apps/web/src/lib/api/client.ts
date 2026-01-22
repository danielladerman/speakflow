/**
 * SpeakFlow API Client
 *
 * Typed API client for communicating with the backend.
 */

import type { ScoreContract, CoachingResponse, TranscriptSegment, Drill } from '@/types'

// API base URL - use environment variable in production
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'

// Token storage key
const TOKEN_KEY = 'speakflow_token'

/**
 * Get the stored auth token
 */
export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(TOKEN_KEY)
}

/**
 * Set the auth token
 */
export function setAuthToken(token: string): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(TOKEN_KEY, token)
}

/**
 * Clear the auth token
 */
export function clearAuthToken(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(TOKEN_KEY)
}

/**
 * Custom error class for API errors
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: unknown
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

/**
 * Base fetch wrapper with auth headers and error handling
 */
async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAuthToken()

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  })

  if (!response.ok) {
    let data: unknown
    try {
      data = await response.json()
    } catch {
      data = null
    }

    const message = (data as { detail?: string })?.detail || response.statusText
    throw new ApiError(message, response.status, data)
  }

  // Handle empty responses
  const text = await response.text()
  if (!text) {
    return {} as T
  }

  return JSON.parse(text) as T
}

// Auth types
export interface AuthUser {
  id: string
  email: string
  display_name: string | null
  is_active: boolean
  is_verified: boolean
  created_at: string
}

export interface LoginResponse {
  access_token: string
  token_type: string
}

export interface RegisterRequest {
  email: string
  password: string
  display_name?: string
}

export interface RegisterResponse {
  id: string
  email: string
  display_name: string | null
  message: string
}

// Session types
export type SessionStatus = 'pending' | 'processing' | 'completed' | 'failed'

export interface SessionResponse {
  id: string
  user_id: string | null
  status: SessionStatus
  duration_sec: number | null
  audio_url: string | null
  score_contract: ScoreContract | null
  coaching_response: CoachingResponse | null
  transcript: TranscriptSegment[] | null
  error_message: string | null
  created_at: string
  completed_at: string | null
}

export interface SessionStatusResponse {
  id: string
  status: SessionStatus
  error_message: string | null
}

export interface CreateSessionResponse {
  session_id: string
  status: SessionStatus
}

/**
 * API client object with all endpoints
 */
export const api = {
  /**
   * Authentication endpoints
   */
  auth: {
    /**
     * Register a new user
     */
    async register(data: RegisterRequest): Promise<RegisterResponse> {
      return apiFetch<RegisterResponse>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      })
    },

    /**
     * Login with email and password
     */
    async login(email: string, password: string): Promise<LoginResponse> {
      return apiFetch<LoginResponse>('/auth/login/json', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      })
    },

    /**
     * Get current user info
     */
    async me(): Promise<AuthUser> {
      return apiFetch<AuthUser>('/auth/me')
    },
  },

  /**
   * Session endpoints
   */
  sessions: {
    /**
     * Create a new session by uploading audio
     */
    async create(audio: Blob, contentType: string = 'audio/wav'): Promise<CreateSessionResponse> {
      const token = getAuthToken()

      const formData = new FormData()
      formData.append('audio', audio, 'recording.wav')

      const response = await fetch(`${API_BASE_URL}/sessions/`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      })

      if (!response.ok) {
        const data = await response.json().catch(() => null)
        throw new ApiError(data?.detail || response.statusText, response.status, data)
      }

      return response.json()
    },

    /**
     * Get session status (for polling during processing)
     */
    async getStatus(sessionId: string): Promise<SessionStatusResponse> {
      return apiFetch<SessionStatusResponse>(`/sessions/${sessionId}/status`)
    },

    /**
     * Get full session report
     */
    async get(sessionId: string): Promise<SessionResponse> {
      return apiFetch<SessionResponse>(`/sessions/${sessionId}`)
    },

    /**
     * List all sessions for current user
     */
    async list(): Promise<SessionResponse[]> {
      return apiFetch<SessionResponse[]>('/sessions/')
    },
  },

  /**
   * Drill endpoints
   */
  drills: {
    /**
     * Get today's recommended drill
     */
    async getToday(): Promise<Drill> {
      return apiFetch<Drill>('/drills/today')
    },

    /**
     * List all available drills
     */
    async list(): Promise<Drill[]> {
      return apiFetch<Drill[]>('/drills/')
    },
  },
}

/**
 * Poll session status until complete or failed
 */
export async function pollSessionStatus(
  sessionId: string,
  onProgress?: (status: SessionStatus) => void,
  interval: number = 1000,
  maxAttempts: number = 120
): Promise<SessionResponse> {
  let attempts = 0

  while (attempts < maxAttempts) {
    const status = await api.sessions.getStatus(sessionId)
    onProgress?.(status.status)

    if (status.status === 'completed') {
      return api.sessions.get(sessionId)
    }

    if (status.status === 'failed') {
      throw new ApiError(status.error_message || 'Processing failed', 500)
    }

    await new Promise((resolve) => setTimeout(resolve, interval))
    attempts++
  }

  throw new ApiError('Processing timed out', 408)
}
