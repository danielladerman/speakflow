'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/app')
  }, [router])

  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="flex gap-2">
        <span className="processing-dot" />
        <span className="processing-dot" />
        <span className="processing-dot" />
      </div>
    </main>
  )
}
