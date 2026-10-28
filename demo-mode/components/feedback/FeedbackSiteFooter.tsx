'use client'

import { useEffect, useState } from 'react'
import { PUBLIC_SANDBOX_USER_ID, STORE_CHANGED_EVENT, getBrand } from '@/lib/demoStore'

export default function FeedbackSiteFooter() {
  const [brandName, setBrandName] = useState('')
  const year = new Date().getFullYear()

  useEffect(() => {
    const load = () => setBrandName(getBrand(PUBLIC_SANDBOX_USER_ID).brandName.trim())
    load()
    window.addEventListener(STORE_CHANGED_EVENT, load)
    return () => window.removeEventListener(STORE_CHANGED_EVENT, load)
  }, [])

  const rightsName = brandName || 'Store Feedback'

  return (
    <footer className="mt-10 space-y-1.5 text-center text-xs text-brand-500">
      <p>One response per visit · Thank you for your time</p>
      <p>
        © {year} {rightsName}. All rights reserved.
      </p>
    </footer>
  )
}
