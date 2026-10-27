'use client'

import { useEffect } from 'react'

function upsertIconLink(rel: string, href: string, type?: string) {
  const selector = type
    ? `link[rel="${rel}"][type="${type}"]`
    : `link[rel="${rel}"]:not([type])`
  let link = document.head.querySelector<HTMLLinkElement>(selector)
  if (!link) {
    link = document.createElement('link')
    link.rel = rel
    if (type) link.type = type
    document.head.appendChild(link)
  }
  link.href = href
}

function applyFavicon(url: string) {
  if (!url) return

  // Cover common browser / device icon slots
  upsertIconLink('icon', url)
  upsertIconLink('shortcut icon', url)
  upsertIconLink('apple-touch-icon', url)

  if (url.toLowerCase().endsWith('.avif') || url.includes('image/avif')) {
    upsertIconLink('icon', url, 'image/avif')
  } else if (url.toLowerCase().endsWith('.svg')) {
    upsertIconLink('icon', url, 'image/svg+xml')
  } else if (url.toLowerCase().endsWith('.png')) {
    upsertIconLink('icon', url, 'image/png')
  } else if (url.toLowerCase().endsWith('.ico')) {
    upsertIconLink('icon', url, 'image/x-icon')
  }
}

export const BRAND_FAVICON_UPDATED_EVENT = 'brand-favicon-updated'

export default function BrandFavicon() {
  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const res = await fetch('/api/brand', { cache: 'no-store' })
        if (!res.ok) return
        const data = (await res.json()) as { faviconUrl?: string }
        if (cancelled) return
        if (data.faviconUrl) applyFavicon(data.faviconUrl)
      } catch {
        // Keep default / previous favicon
      }
    }

    function onUpdated(event: Event) {
      const custom = event as CustomEvent<{ faviconUrl?: string }>
      const url = custom.detail?.faviconUrl
      if (url) applyFavicon(url)
      else void load()
    }

    void load()
    window.addEventListener(BRAND_FAVICON_UPDATED_EVENT, onUpdated)
    return () => {
      cancelled = true
      window.removeEventListener(BRAND_FAVICON_UPDATED_EVENT, onUpdated)
    }
  }, [])

  return null
}
