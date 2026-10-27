import { NextResponse } from 'next/server'
import { getAdminSessionFromCookies } from '@/lib/adminSession'
import { FEEDBACK_SELECT, type FeedbackStatus } from '@/lib/feedbackTypes'
import { getSupabaseAdmin } from '@/lib/supabase-server'

export const runtime = 'nodejs'

const STATUSES: FeedbackStatus[] = ['new', 'reviewed', 'archived']

type Ctx = { params: { id: string } }

export async function GET(_request: Request, { params }: Ctx) {
  const session = await getAdminSessionFromCookies()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const admin = getSupabaseAdmin()
    const { data, error } = await admin
      .from('feedback_entries')
      .select(FEEDBACK_SELECT)
      .eq('id', params.id)
      .maybeSingle()

    if (error) {
      console.error('admin feedback get:', error.message)
      return NextResponse.json({ error: 'Unable to load entry.' }, { status: 500 })
    }
    if (!data) {
      return NextResponse.json({ error: 'Entry not found.' }, { status: 404 })
    }
    return NextResponse.json({ entry: data })
  } catch (err) {
    console.error('admin feedback get route:', err)
    return NextResponse.json({ error: 'Server configuration error.' }, { status: 500 })
  }
}

export async function PATCH(request: Request, { params }: Ctx) {
  const session = await getAdminSessionFromCookies()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: { status?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 })
  }

  const status = (body.status || '').trim() as FeedbackStatus
  if (!STATUSES.includes(status)) {
    return NextResponse.json({ error: 'Invalid status.' }, { status: 400 })
  }

  try {
    const admin = getSupabaseAdmin()
    const { data, error } = await admin
      .from('feedback_entries')
      .update({ status })
      .eq('id', params.id)
      .select(FEEDBACK_SELECT)
      .maybeSingle()

    if (error) {
      console.error('admin feedback patch:', error.message)
      return NextResponse.json({ error: 'Unable to update entry.' }, { status: 500 })
    }
    if (!data) {
      return NextResponse.json({ error: 'Entry not found.' }, { status: 404 })
    }
    return NextResponse.json({ entry: data })
  } catch (err) {
    console.error('admin feedback patch route:', err)
    return NextResponse.json({ error: 'Server configuration error.' }, { status: 500 })
  }
}
