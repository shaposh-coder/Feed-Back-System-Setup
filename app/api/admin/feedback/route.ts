import { NextResponse } from 'next/server'
import { getAdminSessionFromCookies } from '@/lib/adminSession'
import { FEEDBACK_LIST_PAGE_SIZE } from '@/lib/feedbackPaging'
import type { FeedbackEntry } from '@/lib/feedbackTypes'
import { getSupabaseAdmin } from '@/lib/supabase-server'

export const runtime = 'nodejs'

const PAGE_SIZE = FEEDBACK_LIST_PAGE_SIZE
const MIN_SEARCH_LEN = 2

type RpcFeedbackRow = FeedbackEntry & { total_count?: number | string | null }

export async function GET(request: Request) {
  const session = await getAdminSessionFromCookies()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const page = Math.max(1, Number(searchParams.get('page') || '1') || 1)
  const status = (searchParams.get('status') || 'all').trim()
  const qRaw = (searchParams.get('q') || '').trim()
  const q = qRaw.length >= MIN_SEARCH_LEN ? qRaw : ''

  try {
    const admin = getSupabaseAdmin()
    const { data, error } = await admin.rpc('rpc_admin_feedback_page', {
      p_status: status,
      p_search: q,
      p_page: page,
      p_page_size: PAGE_SIZE,
    })

    if (error) {
      console.error('admin feedback list rpc:', error.message)
      return NextResponse.json({ error: 'Unable to load feedback entries.' }, { status: 500 })
    }

    const rows = (data ?? []) as RpcFeedbackRow[]
    const total = Number(rows[0]?.total_count ?? 0)
    const entries: FeedbackEntry[] = rows.map(({ total_count: _tc, ...entry }) => ({
      ...entry,
      branch: entry.branch ?? '',
    }))

    return NextResponse.json({
      entries,
      page,
      pageSize: PAGE_SIZE,
      total,
      totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
    })
  } catch (err) {
    console.error('admin feedback route:', err)
    return NextResponse.json({ error: 'Server configuration error.' }, { status: 500 })
  }
}
