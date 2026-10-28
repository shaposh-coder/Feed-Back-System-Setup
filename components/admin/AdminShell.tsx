'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, MessageSquareText } from 'lucide-react'
import AdminSidebar from '@/components/admin/AdminSidebar'
import ScrollToTopButton from '@/components/ScrollToTopButton'

export default function AdminShell({
  name,
  email,
  children,
}: {
  name: string
  email: string
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [navOpen, setNavOpen] = useState(false)
  const mainScrollRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    setNavOpen(false)
  }, [pathname])

  async function logout() {
    setNavOpen(false)
    await fetch('/api/admin/logout', { method: 'POST', credentials: 'same-origin' })
    window.location.assign('/admin/login')
  }

  return (
    <div className="flex h-screen flex-col bg-[var(--bg-top)]">
      <AdminSidebar
        open={navOpen}
        onClose={() => setNavOpen(false)}
        name={name}
        email={email}
        onLogout={() => void logout()}
      />

      <header className="flex shrink-0 items-center gap-3 border-b border-brand-200/80 bg-white/90 px-4 py-3 shadow-sm backdrop-blur">
        <button
          type="button"
          onClick={() => setNavOpen(true)}
          className="-ml-2 shrink-0 rounded-md p-2 text-ink-800 hover:bg-brand-50 hover:text-brand-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
          aria-label="Open menu"
        >
          <Menu className="h-6 w-6" />
        </button>

        <Link
          href="/admin"
          className="flex min-w-0 flex-1 items-center gap-2 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
          aria-label="Go to admin home"
          title="Home"
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-brand-700 text-white">
            <MessageSquareText className="h-4 w-4" />
          </span>
          <span className="truncate text-base font-bold text-brand-700 hover:text-brand-800">
            Feedback Admin
          </span>
        </Link>
      </header>

      <main
        ref={mainScrollRef}
        className="min-h-0 flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8"
      >
        <div className="mx-auto w-full max-w-6xl">{children}</div>
      </main>

      <ScrollToTopButton scrollRef={mainScrollRef} />
    </div>
  )
}
