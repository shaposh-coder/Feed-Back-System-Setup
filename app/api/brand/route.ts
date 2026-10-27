import { NextResponse } from 'next/server'
import { getBrandSettings } from '@/lib/brandSettings'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/** Public brand assets for customer form + site favicon/logo. */
export async function GET() {
  const brand = await getBrandSettings()
  return NextResponse.json(brand, {
    headers: {
      'Cache-Control': 'public, max-age=30, stale-while-revalidate=120',
    },
  })
}
