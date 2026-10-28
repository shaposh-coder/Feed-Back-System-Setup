import { cache } from 'react'
import { unstable_cache } from 'next/cache'
import { getSupabaseAdmin } from '@/lib/supabase-server'

export type BrandSettings = {
  brandName: string
  logoUrl: string
  faviconUrl: string
}

const EMPTY_BRAND: BrandSettings = {
  brandName: '',
  logoUrl: '',
  faviconUrl: '',
}

async function fetchBrandSettings(): Promise<BrandSettings> {
  try {
    const admin = getSupabaseAdmin()
    const { data, error } = await admin
      .from('brand_settings')
      .select('brand_name, logo_url, favicon_url')
      .eq('id', 1)
      .maybeSingle()

    if (error || !data) return EMPTY_BRAND

    return {
      brandName: (data.brand_name ?? '').trim(),
      logoUrl: (data.logo_url ?? '').trim(),
      faviconUrl: (data.favicon_url ?? '').trim(),
    }
  } catch {
    return EMPTY_BRAND
  }
}

const getCachedBrandSettings = unstable_cache(fetchBrandSettings, ['brand-settings'], {
  revalidate: 60,
  tags: ['brand'],
})

/** Request-deduped + short-lived cached brand row (avoids 2–3 identical reads per page). */
export const getBrandSettings = cache(async (): Promise<BrandSettings> => getCachedBrandSettings())
