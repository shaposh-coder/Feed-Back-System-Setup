import { NextResponse } from 'next/server'
import { getAdminSessionFromCookies } from '@/lib/adminSession'
import { FEEDBACK_LIST_PAGE_SIZE } from '@/lib/feedbackPaging'
import { FEEDBACK_SELECT, type FeedbackStatus } from '@/lib/feedbackTypes'
import { getSupabaseAdmin } from '@/lib/supabase-server'

export const runtime = 'nodejs'

const PAGE_SIZE = FEEDBACK_LIST_PAGE_SIZE

export async function GET(request: Request) {
  const session = await getAdminSessionFromCookies()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const page = Math.max(1, Number(searchParams.get('page') || '1') || 1)
  const status = (searchParams.get('status') || 'all').trim()
  const q = (searchParams.get('q') || '').trim()

  try {
    const admin = getSupabaseAdmin()
    let query = admin
      .from('feedback_entries')
      .select(FEEDBACK_SELECT, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1)

    if (status !== 'all') {
      query = query.eq('status', status as FeedbackStatus)
    }

    if (q) {
      const like = `%${q}%`
      query = query.or(
        `full_name.ilike.${like},email.ilike.${like},phone.ilike.${like},location.ilike.${like}`
      )
    }

    const { data, error, count } = await query
    if (error) {
      console.error('admin feedback list:', error.message)
      return NextResponse.json({ error: 'Unable to load feedback entries.' }, { status: 500 })
    }

    return NextResponse.json({
      entries: data ?? [],
      page,
      pageSize: PAGE_SIZE,
      total: count ?? 0,
      totalPages: Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE)),
    })
  } catch (err) {
    console.error('admin feedback route:', err)
    return NextResponse.json({ error: 'Server configuration error.' }, { status: 500 })
  }
}
