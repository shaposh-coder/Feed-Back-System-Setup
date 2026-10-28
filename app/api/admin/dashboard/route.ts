import { NextResponse } from 'next/server'
import { getAdminSessionFromCookies } from '@/lib/adminSession'
import { shapeDashboardStats } from '@/lib/dashboardStats'
import { getSupabaseAdmin } from '@/lib/supabase-server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  const session = await getAdminSessionFromCookies()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const admin = getSupabaseAdmin()
    const { data, error } = await admin.rpc('rpc_admin_dashboard_stats')

    if (error) {
      console.error('dashboard stats rpc:', error.message)
      return NextResponse.json({ error: 'Unable to load dashboard stats.' }, { status: 500 })
    }

    const stats = shapeDashboardStats(data)
    return NextResponse.json(
      { stats },
      {
        headers: {
          'Cache-Control': 'private, max-age=30',
        },
      }
    )
  } catch (err) {
    console.error('dashboard route:', err)
    return NextResponse.json({ error: 'Unable to load dashboard right now.' }, { status: 500 })
  }
}
