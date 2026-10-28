import { NextResponse } from 'next/server'
import { getAdminSessionFromCookies } from '@/lib/adminSession'
import type { StoreLocation } from '@/lib/storeLocations'
import { getSupabaseAdmin } from '@/lib/supabase-server'

export const runtime = 'nodejs'

async function loadCatalog(): Promise<StoreLocation[]> {
  const admin = getSupabaseAdmin()
  const [locsRes, branchesRes] = await Promise.all([
    admin
      .from('store_locations')
      .select('id, name, sort_order, is_active')
      .order('sort_order', { ascending: true })
      .order('name', { ascending: true }),
    admin
      .from('store_branches')
      .select('id, location_id, name, sort_order, is_active')
      .order('sort_order', { ascending: true })
      .order('name', { ascending: true }),
  ])

  if (locsRes.error) throw new Error(locsRes.error.message)
  if (branchesRes.error) throw new Error(branchesRes.error.message)

  const byLoc = new Map<string, StoreLocation['branches']>()
  for (const br of branchesRes.data ?? []) {
    const list = byLoc.get(br.location_id) ?? []
    list.push({
      id: br.id,
      name: br.name,
      sortOrder: br.sort_order,
      isActive: br.is_active,
    })
    byLoc.set(br.location_id, list)
  }

  return (locsRes.data ?? []).map((loc) => ({
    id: loc.id,
    name: loc.name,
    sortOrder: loc.sort_order,
    isActive: loc.is_active,
    branches: byLoc.get(loc.id) ?? [],
  }))
}

export async function GET() {
  const session = await getAdminSessionFromCookies()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const locations = await loadCatalog()
    return NextResponse.json({ locations })
  } catch (err) {
    console.error('locations get:', err)
    return NextResponse.json(
      {
        error:
          'Unable to load locations. Run database/patch-locations-branches.sql in Supabase.',
      },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  const session = await getAdminSessionFromCookies()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: { name?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 })
  }

  const name = (body.name ?? '').trim()
  if (!name) {
    return NextResponse.json({ error: 'Location name is required.' }, { status: 400 })
  }
  if (name.length > 120) {
    return NextResponse.json({ error: 'Location name is too long (max 120 characters).' }, { status: 400 })
  }

  try {
    const admin = getSupabaseAdmin()
    const { data: maxRow } = await admin
      .from('store_locations')
      .select('sort_order')
      .order('sort_order', { ascending: false })
      .limit(1)
      .maybeSingle()

    const { data, error } = await admin
      .from('store_locations')
      .insert({
        name,
        sort_order: (maxRow?.sort_order ?? 0) + 1,
        is_active: true,
      })
      .select('id, name, sort_order, is_active')
      .single()

    if (error) {
      if (/unique|duplicate/i.test(error.message)) {
        return NextResponse.json({ error: 'A location with this name already exists.' }, { status: 409 })
      }
      console.error('location create:', error.message)
      return NextResponse.json({ error: 'Unable to add location.' }, { status: 500 })
    }

    return NextResponse.json({
      location: {
        id: data.id,
        name: data.name,
        sortOrder: data.sort_order,
        isActive: data.is_active,
        branches: [],
      },
    })
  } catch (err) {
    console.error('location create route:', err)
    return NextResponse.json({ error: 'Unable to add location right now.' }, { status: 500 })
  }
}
