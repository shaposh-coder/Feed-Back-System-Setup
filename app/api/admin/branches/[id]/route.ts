import { NextResponse } from 'next/server'
import { getAdminSessionFromCookies } from '@/lib/adminSession'
import { getSupabaseAdmin } from '@/lib/supabase-server'

export const runtime = 'nodejs'

type Ctx = { params: { id: string } }

export async function PATCH(request: Request, { params }: Ctx) {
  const session = await getAdminSessionFromCookies()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: { name?: string; isActive?: boolean; locationId?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 })
  }

  const payload: Record<string, unknown> = {}
  if (typeof body.name === 'string') {
    const name = body.name.trim()
    if (!name) {
      return NextResponse.json({ error: 'Branch name is required.' }, { status: 400 })
    }
    if (name.length > 120) {
      return NextResponse.json({ error: 'Branch name is too long (max 120 characters).' }, { status: 400 })
    }
    payload.name = name
  }
  if (typeof body.isActive === 'boolean') payload.is_active = body.isActive
  if (typeof body.locationId === 'string' && body.locationId.trim()) {
    payload.location_id = body.locationId.trim()
  }

  if (Object.keys(payload).length === 0) {
    return NextResponse.json({ error: 'Nothing to update.' }, { status: 400 })
  }

  try {
    const admin = getSupabaseAdmin()

    if (typeof payload.location_id === 'string') {
      const { data: loc, error: locErr } = await admin
        .from('store_locations')
        .select('id')
        .eq('id', payload.location_id)
        .maybeSingle()
      if (locErr || !loc) {
        return NextResponse.json({ error: 'Selected location was not found.' }, { status: 400 })
      }
    }

    const { data, error } = await admin
      .from('store_branches')
      .update(payload)
      .eq('id', params.id)
      .select('id, location_id, name, sort_order, is_active')
      .maybeSingle()

    if (error) {
      if (/unique|duplicate/i.test(error.message)) {
        return NextResponse.json(
          { error: 'A branch with this name already exists in this location.' },
          { status: 409 }
        )
      }
      console.error('branch update:', error.message)
      return NextResponse.json({ error: 'Unable to update branch.' }, { status: 500 })
    }
    if (!data) {
      return NextResponse.json({ error: 'Branch not found.' }, { status: 404 })
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
    console.error('branch patch route:', err)
    return NextResponse.json({ error: 'Unable to update branch right now.' }, { status: 500 })
  }
}

export async function DELETE(_request: Request, { params }: Ctx) {
  const session = await getAdminSessionFromCookies()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const admin = getSupabaseAdmin()
    const { error } = await admin.from('store_branches').delete().eq('id', params.id)
    if (error) {
      console.error('branch delete:', error.message)
      return NextResponse.json({ error: 'Unable to delete branch.' }, { status: 500 })
    }
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('branch delete route:', err)
    return NextResponse.json({ error: 'Unable to delete branch right now.' }, { status: 500 })
  }
}
