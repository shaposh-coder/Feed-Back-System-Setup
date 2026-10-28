'use client'

import { createContext, useContext, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import AdminShell from '@/components/admin/AdminShell'
import DemoBanner from '@/components/demo/DemoBanner'
import type { DemoSession } from '@/lib/demoAuth'
import { useDemoSession } from '@/lib/useDemoSession'

const AdminSessionContext = createContext<DemoSession | null>(null)

/** Session of the signed-in demo user. Only usable inside the admin panel (after the guard passes). */
export function useAdminSession(): DemoSession {
  const session = useContext(AdminSessionContext)
  if (!session) throw new Error('useAdminSession must be used inside AdminGuard')
  return session
}

/**
 * Client-side replacement for production middleware + cookie check.
 * Redirects to /admin/login when no localStorage demo session exists.
 */
export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { session, ready } = useDemoSession()

  useEffect(() => {
    if (ready && !session) {
      const target = pathname && pathname !== '/admin' ? `?redirect=${encodeURIComponent(pathname)}` : ''
      router.replace(`/admin/login${target}`)
    }
  }, [ready, session, pathname, router])

  if (!ready || !session) {
    return (
      <div className="flex min-h-screen flex-col">
        <DemoBanner />
        <p className="p-10 text-center text-sm text-ink-700">Loading…</p>
      </div>
    )
  }

  return (
    <AdminSessionContext.Provider value={session}>
      <AdminShell session={session}>{children}</AdminShell>
    </AdminSessionContext.Provider>
  )
}
