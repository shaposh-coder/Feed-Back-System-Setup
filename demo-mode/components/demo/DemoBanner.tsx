'use client'

import Link from 'next/link'
import { FlaskConical } from 'lucide-react'

type DemoBannerProps = {
  /** Which cross-link to show on the right-hand side. */
  link?: 'admin' | 'form' | 'none'
}

/** Slim, tasteful indicator so nobody confuses the demo with a live production system. */
export default function DemoBanner({ link = 'none' }: DemoBannerProps) {
  return (
    <div
      role="status"
      className="flex shrink-0 flex-wrap items-center justify-center gap-x-3 gap-y-1 bg-ink-900 px-4 py-2 text-center text-xs text-brand-100"
    >
      <span className="inline-flex items-center gap-1.5 font-semibold uppercase tracking-[0.14em] text-brand-200">
        <FlaskConical className="h-3.5 w-3.5" aria-hidden />
        Demo Mode
      </span>
      <span className="text-brand-100/90">
        Sample data is stored only in this browser. Nothing is sent to a server.
      </span>
      {link === 'admin' ? (
        <Link href="/admin/login" className="font-semibold text-white underline-offset-2 hover:underline">
          Open admin panel →
        </Link>
      ) : null}
      {link === 'form' ? (
        <Link href="/" className="font-semibold text-white underline-offset-2 hover:underline">
          ← Customer feedback form
        </Link>
      ) : null}
    </div>
  )
}
