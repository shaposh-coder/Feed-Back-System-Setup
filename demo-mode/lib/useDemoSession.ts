'use client'

import { useEffect, useState } from 'react'
import { SESSION_EVENT, getSession, type DemoSession } from '@/lib/demoAuth'

/** Reads the localStorage demo session on the client (SSR-safe: `ready` is false until mounted). */
export function useDemoSession(): { session: DemoSession | null; ready: boolean } {
  const [session, setSession] = useState<DemoSession | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const sync = () => {
      setSession(getSession())
      setReady(true)
    }
    sync()
    window.addEventListener(SESSION_EVENT, sync)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener(SESSION_EVENT, sync)
      window.removeEventListener('storage', sync)
    }
  }, [])

  return { session, ready }
}
