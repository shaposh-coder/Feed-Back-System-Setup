import { NextResponse } from 'next/server'
import { getAdminSessionFromCookies } from '@/lib/adminSession'
import { getSupabaseAuthClient } from '@/lib/supabase-auth'
import { getSupabaseAdmin } from '@/lib/supabase-server'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  const session = await getAdminSessionFromCookies()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: { currentPassword?: string; newPassword?: string; confirmPassword?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 })
  }

  const currentPassword = body.currentPassword || ''
  const newPassword = body.newPassword || ''
  const confirmPassword = body.confirmPassword || ''

  if (!currentPassword || !newPassword || !confirmPassword) {
    return NextResponse.json({ error: 'All password fields are required.' }, { status: 400 })
  }
  if (newPassword.length < 8) {
    return NextResponse.json(
      { error: 'New password must be at least 8 characters.' },
      { status: 400 }
    )
  }
  if (newPassword !== confirmPassword) {
    return NextResponse.json({ error: 'New password and confirmation do not match.' }, { status: 400 })
  }
  if (currentPassword === newPassword) {
    return NextResponse.json(
      { error: 'New password must be different from the current password.' },
      { status: 400 }
    )
  }

  try {
    const authClient = getSupabaseAuthClient()
    const { error: verifyError } = await authClient.auth.signInWithPassword({
      email: session.email,
      password: currentPassword,
    })
    if (verifyError) {
      return NextResponse.json({ error: 'Current password is incorrect.' }, { status: 401 })
    }

    const admin = getSupabaseAdmin()
    const { error } = await admin.auth.admin.updateUserById(session.userId, {
      password: newPassword,
    })
    if (error) {
      console.error('password update:', error.message)
      return NextResponse.json({ error: error.message || 'Unable to update password.' }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('password route:', err)
    return NextResponse.json({ error: 'Server configuration error.' }, { status: 500 })
  }
}
