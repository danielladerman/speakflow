'use client'

import { useState, useCallback, type FormEvent } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/auth/AuthProvider'

export default function LoginPage() {
  const { login, error, clearError, isLoading } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [localError, setLocalError] = useState<string | null>(null)

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault()
      setLocalError(null)
      clearError()

      if (!email || !password) {
        setLocalError('Please enter both email and password')
        return
      }

      try {
        await login(email, password)
      } catch {
        // Error is handled by auth context
      }
    },
    [email, password, login, clearError]
  )

  const displayError = localError || error

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-12 bg-cloud-50">
      <div className="w-full max-w-sm">
        {/* Logo/Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-medium text-cloud-800 mb-2">
            SpeakFlow
          </h1>
          <p className="text-cloud-500">
            Welcome back
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Error message */}
          {displayError && (
            <div className="p-4 bg-warmth-50 rounded-xl text-warmth-700 text-sm animate-fade-in">
              {displayError}
            </div>
          )}

          {/* Email field */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-cloud-700 mb-2"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              className="w-full px-4 py-3 bg-white rounded-xl border border-cloud-200
                         text-cloud-800 placeholder:text-cloud-400
                         transition-all duration-200
                         focus:outline-none focus:ring-2 focus:ring-sage-300 focus:border-transparent"
            />
          </div>

          {/* Password field */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-cloud-700 mb-2"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              autoComplete="current-password"
              className="w-full px-4 py-3 bg-white rounded-xl border border-cloud-200
                         text-cloud-800 placeholder:text-cloud-400
                         transition-all duration-200
                         focus:outline-none focus:ring-2 focus:ring-sage-300 focus:border-transparent"
            />
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 px-6 bg-sage-500 text-white
                       rounded-xl font-medium text-lg
                       transition-all duration-300 ease-gentle
                       hover:bg-sage-600 active:scale-[0.98]
                       disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        {/* Register link */}
        <p className="mt-8 text-center text-cloud-500">
          Don&apos;t have an account?{' '}
          <Link
            href="/register"
            className="text-sage-600 font-medium hover:text-sage-700 transition-colors"
          >
            Create one
          </Link>
        </p>

        {/* Back to home */}
        <p className="mt-4 text-center">
          <Link
            href="/"
            className="text-sm text-cloud-400 hover:text-cloud-600 transition-colors"
          >
            Back to home
          </Link>
        </p>
      </div>
    </main>
  )
}
