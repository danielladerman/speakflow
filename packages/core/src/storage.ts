/**
 * Storage abstraction for cross-platform token management
 */

export interface StorageAdapter {
  getItem(key: string): string | null | Promise<string | null>
  setItem(key: string, value: string): void | Promise<void>
  removeItem(key: string): void | Promise<void>
}

// Default storage adapter (localStorage for web)
let storageAdapter: StorageAdapter = {
  getItem: (key: string) => {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(key)
  },
  setItem: (key: string, value: string) => {
    if (typeof window === 'undefined') return
    localStorage.setItem(key, value)
  },
  removeItem: (key: string) => {
    if (typeof window === 'undefined') return
    localStorage.removeItem(key)
  },
}

/**
 * Configure the storage adapter (e.g., for React Native AsyncStorage)
 */
export function setStorageAdapter(adapter: StorageAdapter): void {
  storageAdapter = adapter
}

/**
 * Get the current storage adapter
 */
export function getStorageAdapter(): StorageAdapter {
  return storageAdapter
}

const TOKEN_KEY = 'speakflow_token'

/**
 * Get the stored auth token
 */
export async function getAuthToken(): Promise<string | null> {
  const result = storageAdapter.getItem(TOKEN_KEY)
  return result instanceof Promise ? result : result
}

/**
 * Set the auth token
 */
export async function setAuthToken(token: string): Promise<void> {
  const result = storageAdapter.setItem(TOKEN_KEY, token)
  if (result instanceof Promise) await result
}

/**
 * Clear the auth token
 */
export async function clearAuthToken(): Promise<void> {
  const result = storageAdapter.removeItem(TOKEN_KEY)
  if (result instanceof Promise) await result
}
