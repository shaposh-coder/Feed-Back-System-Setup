import { NextResponse } from 'next/server'
import { getAdminSessionFromCookies } from '@/lib/adminSession'
import { getSupabaseAdmin } from '@/lib/supabase-server'

export const runtime = 'nodejs'

type Ctx = { params: { id: string } }

export async function POST(request: Request, { params }: Ctx) {
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
    return NextResponse.json({ error: 'Branch name is required.' }, { status: 400 })
  }
  if (name.length > 120) {
    return NextResponse.json({ error: 'Branch name is too long (max 120 characters).' }, { status: 400 })
  }

  try {
    const admin = getSupabaseAdmin()
    const { data: location, error: locErr } = await admin
      .from('store_locations')
      .select('id')
      .eq('id', params.id)
      .maybeSingle()

    if (locErr || !location) {
      return NextResponse.json({ error: 'Location not found.' }, { status: 404 })
    }

    const { data: maxRow } = await admin
      .from('store_branches')
      .select('sort_order')
      .eq('location_id', params.id)
      .order('sort_order', { ascending: false })
      .limit(1)
      .maybeSingle()

    const { data, error } = await admin
      .from('store_branches')
      .insert({
        location_id: params.id,
        name,
        sort_order: (maxRow?.sort_order ?? 0) + 1,
        is_active: true,
      })
      .select('id, location_id, name, sort_order, is_active')
      .single()

    if (error) {
      if (/unique|duplicate/i.test(error.message)) {
        return NextResponse.json(
          { error: 'A branch with this name already exists in this location.' },
          { status: 409 }
        )
      }
      console.error('branch create:', error.message)
      return NextResponse.json({ error: 'Unable to add branch.' }, { status: 500 })
    }

    return NextResponse.json({
      branch: {
        id: data.id,
        locationId: data.location_id,
        name: data.name,
        sortOrder: data.sort_order,
        isActive: data.is_active,
      },
    })
  } catch (err) {
    console.error('branch create route:', err)
    return NextResponse.json({ error: 'Unable to add branch right now.' }, { status: 500 })
  }
}
