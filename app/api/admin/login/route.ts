import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import {
  ADMIN_COOKIE,
  adminCookieOptions,
  displayNameFromAuthUser,
  signAdminSession,
} from '@/lib/adminAuth'
import { getSupabaseAuthClient } from '@/lib/supabase-auth'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  let body: { email?: string; password?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 })
  }

  const email = (body.email || '').trim().toLowerCase()
  const password = body.password || ''
  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 })
  }

  try {
    const supabase = getSupabaseAuthClient()
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error || !data.user) {
      return NextResponse.json(
        { error: error?.message || 'Invalid email or password.' },
        { status: 401 }
      )
    }

    const userEmail = (data.user.email || email).toLowerCase()
    const name = displayNameFromAuthUser(data.user)
    const token = await signAdminSession({
      userId: data.user.id,
      email: userEmail,
      name,
    })

    cookies().set(ADMIN_COOKIE, token, adminCookieOptions())

    return NextResponse.json({
      ok: true,
      user: {
        id: data.user.id,
        email: userEmail,
        name,
      },
    })
  } catch (err) {
    console.error('admin login error:', err)
    return NextResponse.json(
      {
        error: 'Unable to sign in right now. Please try again later.',
      },
      { status: 500 }
    )
  }
}
