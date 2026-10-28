import { NextResponse } from 'next/server'
import { getAdminSessionFromCookies } from '@/lib/adminSession'
import { buildDashboardStats } from '@/lib/dashboardStats'
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
    const { data, error } = await admin
      .from('feedback_entries')
      .select('gender, age_group, challenges, purchase_categories, overall_satisfaction, status')

    if (error) {
      console.error('dashboard stats:', error.message)
      return NextResponse.json({ error: 'Unable to load dashboard stats.' }, { status: 500 })
    }

    const stats = buildDashboardStats(data ?? [])
    return NextResponse.json({ stats })
  } catch (err) {
    console.error('dashboard route:', err)
    return NextResponse.json({ error: 'Unable to load dashboard right now.' }, { status: 500 })
  }
}
