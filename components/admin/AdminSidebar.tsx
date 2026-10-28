'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  ChevronDown,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  MapPin,
  MessageSquareText,
  Settings,
  UserRound,
  X,
  type LucideIcon,
} from 'lucide-react'

type SubItem = {
  name: string
  path: string
  icon?: LucideIcon
  match?: (pathname: string) => boolean
}

type MenuItem = {
  name: string
  path: string
  icon: LucideIcon
  match?: (pathname: string) => boolean
  children?: SubItem[]
}

const MENU_ITEMS: MenuItem[] = [
  {
    name: 'Dashboard',
    path: '/admin',
    icon: LayoutDashboard,
    match: (pathname) => pathname === '/admin',
  },
  {
    name: 'Feedback Entries',
    path: '/admin/entries',
    icon: ClipboardList,
    match: (pathname) => pathname === '/admin/entries' || pathname.startsWith('/admin/entries/'),
  },
  {
    name: 'Brand Settings',
    path: '/admin/settings',
    icon: Settings,
    match: (pathname) => pathname === '/admin/settings' || pathname.startsWith('/admin/settings/'),
    children: [
      {
        name: 'Brand',
        path: '/admin/settings',
        icon: Settings,
        match: (pathname) => pathname === '/admin/settings',
      },
      {
        name: 'Locations & Branches',
        path: '/admin/settings/locations',
        icon: MapPin,
        match: (pathname) =>
          pathname === '/admin/settings/locations' || pathname.startsWith('/admin/settings/locations/'),
      },
    ],
  },
  {
    name: 'My Profile',
    path: '/admin/profile',
    icon: UserRound,
    match: (pathname) => pathname === '/admin/profile' || pathname.startsWith('/admin/profile/'),
  },
]

type AdminSidebarProps = {
  open: boolean
  onClose: () => void
  name: string
  email: string
  onLogout: () => void
}

function linkClass(active: boolean, nested = false) {
  return `flex items-center ${nested ? 'px-6 py-2.5 pl-12 text-sm' : 'px-6 py-3'} text-ink-700 transition-colors hover:bg-brand-50 hover:text-brand-700 ${
    active ? 'border-r-4 border-brand-700 bg-brand-50 font-medium text-brand-700' : ''
  }`
}

/** Off-canvas navigation drawer — same pattern as Courier-Dashboard Sidebar. */
export default function AdminSidebar({
  open,
  onClose,
  name,
  email,
  onLogout,
}: AdminSidebarProps) {
  const pathname = usePathname()
  const settingsOpenByPath = pathname === '/admin/settings' || pathname.startsWith('/admin/settings/')
  const [brandOpen, setBrandOpen] = useState(settingsOpenByPath)

  useEffect(() => {
    if (settingsOpenByPath) setBrandOpen(true)
  }, [settingsOpenByPath])

  useEffect(() => {
    if (!open) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = prevOverflow
    }
  }, [open, onClose])

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity duration-200 ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={onClose}
        aria-hidden
      />

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] transform flex-col bg-white shadow-xl transition-transform duration-200 ease-out ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-label="Admin navigation"
        aria-hidden={!open}
      >
        <div className="flex shrink-0 items-center justify-between gap-2 border-b border-brand-100 px-4 py-4">
          <Link
            href="/admin"
            onClick={onClose}
            className="flex min-w-0 flex-1 items-center gap-2.5 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
            aria-label="Go to admin home"
            title="Home"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-brand-700 text-white">
              <MessageSquareText className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-base font-bold tracking-tight text-brand-700">
                Feedback Admin
              </p>
            </div>
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-md p-1.5 text-ink-700 hover:bg-brand-50 hover:text-brand-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="mt-2 min-h-0 flex-1 overflow-y-auto overflow-x-hidden" aria-label="Sidebar menu">
          <ul className="space-y-0">
            {MENU_ITEMS.map((item) => {
              const Icon = item.icon
              const hasChildren = Boolean(item.children?.length)
              const childActive = item.children?.some((child) =>
                child.match
                  ? child.match(pathname)
                  : pathname === child.path || pathname.startsWith(`${child.path}/`)
              )
              const isActive = item.match
                ? item.match(pathname)
                : pathname === item.path || pathname.startsWith(`${item.path}/`)

              if (hasChildren) {
                const expanded = item.path === '/admin/settings' ? brandOpen : Boolean(childActive)
                return (
                  <li key={item.name}>
                    <button
                      type="button"
                      onClick={() => {
                        if (item.path === '/admin/settings') setBrandOpen((v) => !v)
                      }}
                      className={`flex w-full items-center px-6 py-3 text-left text-ink-700 transition-colors hover:bg-brand-50 hover:text-brand-700 ${
                        isActive || childActive
                          ? 'bg-brand-50/70 font-medium text-brand-700'
                          : ''
                      }`}
                      aria-expanded={expanded}
                    >
                      <Icon className="mr-3 h-5 w-5 shrink-0" aria-hidden />
                      <span className="min-w-0 flex-1 truncate font-medium">{item.name}</span>
                      <ChevronDown
                        className={`h-4 w-4 shrink-0 transition-transform ${expanded ? 'rotate-180' : ''}`}
                        aria-hidden
                      />
                    </button>
                    {expanded ? (
                      <ul className="pb-1">
                        {item.children!.map((child) => {
                          const ChildIcon = child.icon
                          const subActive = child.match
                            ? child.match(pathname)
                            : pathname === child.path
                          return (
                            <li key={child.path}>
                              <Link
                                href={child.path}
                                prefetch={false}
                                onClick={onClose}
                                className={linkClass(subActive, true)}
                                aria-current={subActive ? 'page' : undefined}
                              >
                                {ChildIcon ? (
                                  <ChildIcon className="mr-2.5 h-4 w-4 shrink-0" aria-hidden />
                                ) : null}
                                <span className="truncate font-medium">{child.name}</span>
                              </Link>
                            </li>
                          )
                        })}
                      </ul>
                    ) : null}
                  </li>
                )
              }

              return (
                <li key={item.name}>
                  <Link
                    href={item.path}
                    prefetch={false}
                    onClick={onClose}
                    className={linkClass(isActive)}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <Icon className="mr-3 h-5 w-5 shrink-0" aria-hidden />
                    <span className="truncate font-medium">{item.name}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        <div className="shrink-0 border-t border-brand-100 bg-brand-50/40 p-4">
          <Link
            href="/admin/profile"
            onClick={onClose}
            className="mb-3 block min-w-0 rounded-md px-2 py-1 hover:bg-white/70"
          >
            <p className="truncate text-sm font-semibold text-ink-900">{name}</p>
            <p className="truncate text-xs text-ink-700">{email}</p>
          </Link>
          <button
            type="button"
            onClick={onLogout}
            className="flex w-full items-center gap-2 rounded-md px-3 py-2.5 text-sm font-medium text-ink-700 transition hover:bg-red-50 hover:text-red-600"
            aria-label="Sign out"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            Sign out
          </button>
        </div>
      </aside>
    </>
  )
}
