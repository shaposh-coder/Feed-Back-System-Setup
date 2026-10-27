import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import {
  ADMIN_COOKIE,
  adminCookieOptions,
  displayNameFromAuthUser,
  signAdminSession,
} from '@/lib/adminAuth'
import { getAdminSessionFromCookies } from '@/lib/adminSession'
import { getSupabaseAdmin } from '@/lib/supabase-server'

export const runtime = 'nodejs'

export async function GET() {
  const session = await getAdminSessionFromCookies()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const admin = getSupabaseAdmin()
    const { data, error } = await admin.auth.admin.getUserById(session.userId)
    if (error || !data.user) {
      return NextResponse.json({
        id: session.userId,
        email: session.email,
        name: session.name,
      })
    }

    const name = displayNameFromAuthUser(data.user)
    return NextResponse.json({
      id: data.user.id,
      email: data.user.email || session.email,
      name,
    })
  } catch (err) {
    console.error('profile get:', err)
    return NextResponse.json({
      id: session.userId,
      email: session.email,
      name: session.name,
    })
  }
}

export async function PATCH(request: Request) {
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
    return NextResponse.json({ error: 'Name is required.' }, { status: 400 })
  }
  if (name.length > 80) {
    return NextResponse.json({ error: 'Name is too long (max 80 characters).' }, { status: 400 })
  }

  try {
    const admin = getSupabaseAdmin()
    const { data, error } = await admin.auth.admin.updateUserById(session.userId, {
      user_metadata: {
        full_name: name,
        name,
      },
    })

    if (error || !data.user) {
      console.error('profile patch:', error?.message)
      return NextResponse.json({ error: 'Unable to update profile name.' }, { status: 500 })
    }

    const nextName = displayNameFromAuthUser(data.user) || name
    const email = (data.user.email || session.email).toLowerCase()
    const token = await signAdminSession({
      userId: data.user.id,
      email,
      name: nextName,
    })
    cookies().set(ADMIN_COOKIE, token, adminCookieOptions())

    return NextResponse.json({ id: data.user.id, email, name: nextName })
  } catch (err) {
    console.error('profile patch route:', err)
    return NextResponse.json({ error: 'Server configuration error.' }, { status: 500 })
  }
}
