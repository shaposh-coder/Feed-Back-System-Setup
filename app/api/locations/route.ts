import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-server'

export const runtime = 'nodejs'

/** Public catalog for the customer feedback form (active locations + branches only). */
export async function GET() {
  try {
    const admin = getSupabaseAdmin()
    const { data, error } = await admin.rpc('rpc_admin_locations_catalog')
    if (error) {
      console.error('public locations rpc:', error.message)
      return NextResponse.json(
        {
          error:
            'Unable to load locations. Run database/patch-locations-branches.sql in Supabase.',
        },
        { status: 500 }
      )
    }

    const rows = Array.isArray(data) ? data : []
    const locations = rows
      .map((loc: {
        id?: string
        name?: string
        branches?: Array<{ id?: string; name?: string }>
      }) => ({
        id: String(loc.id ?? ''),
        name: String(loc.name ?? '').trim(),
        branches: (loc.branches ?? [])
          .map((br) => ({
            id: String(br.id ?? ''),
            name: String(br.name ?? '').trim(),
          }))
          .filter((br) => br.id && br.name),
      }))
      .filter((loc) => loc.id && loc.name)

    return NextResponse.json({ locations })
  } catch (err) {
    console.error('public locations route:', err)
    return NextResponse.json({ error: 'Unable to load locations right now.' }, { status: 500 })
  }
}
