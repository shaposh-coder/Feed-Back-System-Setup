'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { PUBLIC_SANDBOX_USER_ID, STORE_CHANGED_EVENT, getBrand } from '@/lib/demoStore'
import { SESSION_EVENT, getSession } from '@/lib/demoAuth'

const DEFAULT_FAVICON = '/favicon.png'

function upsertIconLink(rel: string, href: string) {
  let link = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`)
  if (!link) {
    link = document.createElement('link')
    link.rel = rel
    document.head.appendChild(link)
  }
  link.removeAttribute('type')
  link.href = href
}

/** Applies the configured favicon and tab title (replaces the API-driven BrandFavicon in production). */
export default function BrandIdentity() {
  const pathname = usePathname()

  useEffect(() => {
    function apply() {
      const inAdmin = pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')
      const session = getSession()
      const userId = inAdmin && session ? session.userId : PUBLIC_SANDBOX_USER_ID
      const brand = getBrand(userId)

      const favicon = brand.faviconUrl || DEFAULT_FAVICON
      upsertIconLink('icon', favicon)
      upsertIconLink('shortcut icon', favicon)
      upsertIconLink('apple-touch-icon', favicon)

      const name = brand.brandName
      if (inAdmin) {
        document.title = `Admin · ${name || 'Store Feedback System'} · Demo Mode`
      } else if (pathname.startsWith('/admin/login')) {
        document.title = 'Admin sign in · Store Feedback System · Demo Mode'
      } else {
        document.title = `${name ? `${name} · ` : ''}Store Visit Feedback · Demo Mode`
      }
    }

    apply()
    window.addEventListener(STORE_CHANGED_EVENT, apply)
    window.addEventListener(SESSION_EVENT, apply)
    return () => {
      window.removeEventListener(STORE_CHANGED_EVENT, apply)
      window.removeEventListener(SESSION_EVENT, apply)
    }
  }, [pathname])

  return null
}
