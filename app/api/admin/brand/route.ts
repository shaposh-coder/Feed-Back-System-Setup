import { NextResponse } from 'next/server'
import { getAdminSessionFromCookies } from '@/lib/adminSession'
import { getSupabaseAdmin } from '@/lib/supabase-server'

export const runtime = 'nodejs'

const BRAND_SELECT = 'brand_name, logo_url, favicon_url, updated_at'

function mapBrand(data: {
  brand_name?: string | null
  logo_url?: string | null
  favicon_url?: string | null
  updated_at?: string | null
} | null) {
  return {
    brandName: data?.brand_name ?? '',
    logoUrl: data?.logo_url ?? '',
    faviconUrl: data?.favicon_url ?? '',
    updatedAt: data?.updated_at ?? null,
  }
}

export async function GET() {
  const session = await getAdminSessionFromCookies()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const admin = getSupabaseAdmin()
    const { data, error } = await admin
      .from('brand_settings')
      .select(BRAND_SELECT)
      .eq('id', 1)
      .maybeSingle()

    if (error) {
      console.error('brand get:', error.message)
      return NextResponse.json({ error: 'Unable to load brand settings.' }, { status: 500 })
    }

    return NextResponse.json(mapBrand(data))
  } catch (err) {
    console.error('brand get route:', err)
    return NextResponse.json({ error: 'Unable to load brand settings right now.' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  const session = await getAdminSessionFromCookies()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: { brandName?: string; logoUrl?: string; faviconUrl?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 })
  }

  const brandName = (body.brandName ?? '').trim()
  if (!brandName) {
    return NextResponse.json({ error: 'Brand name is required.' }, { status: 400 })
  }
  if (brandName.length > 120) {
    return NextResponse.json({ error: 'Brand name is too long (max 120 characters).' }, { status: 400 })
  }

  const logoUrl = typeof body.logoUrl === 'string' ? body.logoUrl.trim() : undefined
  const faviconUrl = typeof body.faviconUrl === 'string' ? body.faviconUrl.trim() : undefined

  try {
    const admin = getSupabaseAdmin()
    const payload: Record<string, unknown> = {
      id: 1,
      brand_name: brandName,
      updated_at: new Date().toISOString(),
    }
    if (logoUrl !== undefined) payload.logo_url = logoUrl
    if (faviconUrl !== undefined) payload.favicon_url = faviconUrl

    const { data, error } = await admin
      .from('brand_settings')
      .upsert(payload, { onConflict: 'id' })
      .select(BRAND_SELECT)
      .single()

    if (error) {
      console.error('brand put:', error.message)
      return NextResponse.json({ error: 'Unable to save brand settings.' }, { status: 500 })
    }

    return NextResponse.json(mapBrand(data))
  } catch (err) {
    console.error('brand put route:', err)
    return NextResponse.json({ error: 'Unable to save brand settings right now.' }, { status: 500 })
  }
}
