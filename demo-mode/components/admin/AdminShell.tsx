'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Menu, MessageSquareText } from 'lucide-react'
import AdminSidebar from '@/components/admin/AdminSidebar'
import DemoBanner from '@/components/demo/DemoBanner'
import ScrollToTopButton from '@/components/ScrollToTopButton'
import { signOut, type DemoSession } from '@/lib/demoAuth'
import { resetUserData } from '@/lib/demoStore'

export default function AdminShell({
  session,
  children,
}: {
  session: DemoSession
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [dataVersion, setDataVersion] = useState(0)
  const [navOpen, setNavOpen] = useState(false)
  const mainScrollRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    setNavOpen(false)
  }, [pathname])

  function logout() {
    setNavOpen(false)
    signOut()
    router.replace('/admin/login')
  }

  function resetDemoData() {
    const confirmed = window.confirm(
      'Reset demo data? This restores the original sample entries and brand settings for your account only.'
    )
    if (!confirmed) return
    resetUserData(session.userId)
    setNavOpen(false)
    // Remount the current page so it reloads the restored data.
    setDataVersion((v) => v + 1)
  }

  return (
    <div className="flex h-screen flex-col bg-[var(--bg-top)]">
      <DemoBanner link="form" />
      <AdminSidebar
        open={navOpen}
        onClose={() => setNavOpen(false)}
        name={session.name}
        email={session.email}
        roleLabel={session.roleLabel}
        onLogout={logout}
        onResetData={resetDemoData}
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
        <div key={dataVersion} className="mx-auto w-full max-w-6xl">
          {children}
        </div>
      </main>

      <ScrollToTopButton scrollRef={mainScrollRef} />
    </div>
  )
}
