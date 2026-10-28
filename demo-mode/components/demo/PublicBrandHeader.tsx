'use client'

import { useEffect, useState } from 'react'
import FeedbackBrandHeader from '@/components/feedback/FeedbackBrandHeader'
import { PUBLIC_SANDBOX_USER_ID, STORE_CHANGED_EVENT, getBrand, type BrandSettings } from '@/lib/demoStore'

/** Loads the public brand from the demo sandbox (production reads brand_settings from Supabase). */
export default function PublicBrandHeader() {
  const [brand, setBrand] = useState<BrandSettings | null>(null)

  useEffect(() => {
    const load = () => setBrand(getBrand(PUBLIC_SANDBOX_USER_ID))
    load()
    window.addEventListener(STORE_CHANGED_EVENT, load)
    return () => window.removeEventListener(STORE_CHANGED_EVENT, load)
  }, [])

  return <FeedbackBrandHeader brand={brand ?? { brandName: '', logoUrl: '', faviconUrl: '' }} loading={!brand} />
}
