import { SignJWT, jwtVerify } from 'jose'
import type { NextRequest } from 'next/server'

export const ADMIN_COOKIE = 'feedback_admin_session'

export type AdminSession = {
  userId: string
  email: string
  name: string
  role: 'admin'
}

function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET
  if (!secret || secret.length < 16) {
    throw new Error('JWT_SECRET is missing or too short (min 16 chars)')
  }
  return new TextEncoder().encode(secret)
}

export function displayNameFromAuthUser(user: {
  email?: string | null
  user_metadata?: Record<string, unknown> | null
}): string {
  const meta = user.user_metadata ?? {}
  const fromMeta =
    (typeof meta.full_name === 'string' && meta.full_name.trim()) ||
    (typeof meta.name === 'string' && meta.name.trim()) ||
    (typeof meta.display_name === 'string' && meta.display_name.trim()) ||
    ''
  if (fromMeta) return fromMeta
  const email = (user.email || '').trim()
  if (email.includes('@')) return email.split('@')[0] || email
  return email || 'Admin'
}

export async function signAdminSession(session: Omit<AdminSession, 'role'>): Promise<string> {
  return new SignJWT({
    userId: session.userId,
    email: session.email,
    name: session.name,
    role: 'admin',
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(session.userId)
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(getJwtSecret())
}

export async function verifyAdminToken(token: string): Promise<AdminSession | null> {
  try {
    if (!hasJwtSecret()) return null
    const { payload } = await jwtVerify(token, getJwtSecret())
    const email = typeof payload.email === 'string' ? payload.email : ''
    const userId =
      typeof payload.userId === 'string'
        ? payload.userId
        : typeof payload.sub === 'string'
          ? payload.sub
          : ''
    const name = typeof payload.name === 'string' ? payload.name : ''
    if (!email || !userId || payload.role !== 'admin') return null
    return { userId, email, name: name || email, role: 'admin' }
  } catch {
    return null
  }
}

export async function getAdminSessionFromRequest(
  request: NextRequest
): Promise<AdminSession | null> {
  const token = request.cookies.get(ADMIN_COOKIE)?.value
  if (!token) return null
  return verifyAdminToken(token)
}

export function adminCookieOptions(maxAgeSeconds = 60 * 60 * 24 * 7) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: maxAgeSeconds,
  }
}

/** Edge-safe: never throw from middleware verify path for missing secret. */
export function hasJwtSecret(): boolean {
  const secret = process.env.JWT_SECRET
  return Boolean(secret && secret.length >= 16)
}
