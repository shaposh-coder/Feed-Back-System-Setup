'use client'

import type { ReactNode } from 'react'

/** Full reload to `/` so the thank-you form state resets. */
export default function BrandHomeLink({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <a
      href="/"
      className={className}
      aria-label="Back to feedback form"
      title="Back to feedback form"
      onClick={(e) => {
        e.preventDefault()
        window.location.assign('/')
      }}
    >
      {children}
    </a>
  )
}
