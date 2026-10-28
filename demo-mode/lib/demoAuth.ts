/** localStorage-based demo session (replaces Supabase Auth + signed cookie from production). */

import { findDemoUserById, findDemoUserByLogin, type DemoRole } from '@/lib/demoUsers'
import { ensureSeeded } from '@/lib/demoStore'

export const SESSION_KEY = 'demo:feedback-system:session'
export const SESSION_EVENT = 'demo-session-changed'

export type DemoSession = {
  userId: string
  email: string
  name: string
  role: DemoRole
  roleLabel: string
  signedInAt: string
}

function isBrowser() {
  return typeof window !== 'undefined'
}

function notify() {
  if (isBrowser()) window.dispatchEvent(new Event(SESSION_EVENT))
}

export function getSession(): DemoSession | null {
  if (!isBrowser()) return null
  try {
    const raw = window.localStorage.getItem(SESSION_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<DemoSession>
    if (!parsed.userId || !findDemoUserById(parsed.userId)) return null
    const user = findDemoUserById(parsed.userId)!
    return {
      userId: user.id,
      email: user.email,
      name: typeof parsed.name === 'string' && parsed.name.trim() ? parsed.name : user.name,
      role: user.role,
      roleLabel: user.roleLabel,
      signedInAt: parsed.signedInAt || new Date().toISOString(),
    }
  } catch {
    return null
  }
}

export type SignInResult = { ok: true; session: DemoSession } | { ok: false; error: string }

export function signIn(login: string, password: string): SignInResult {
  const user = findDemoUserByLogin(login)
  if (!user || user.password !== password) {
    return { ok: false, error: 'Invalid email or password.' }
  }

  // First sign-in seeds this user's private sandbox; later sign-ins keep their changes.
  ensureSeeded(user.id)

  const session: DemoSession = {
    userId: user.id,
    email: user.email,
    name: readDisplayName(user.id) || user.name,
    role: user.role,
    roleLabel: user.roleLabel,
    signedInAt: new Date().toISOString(),
  }
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(session))
  notify()
  return { ok: true, session }
}

export function signOut() {
  if (!isBrowser()) return
  window.localStorage.removeItem(SESSION_KEY)
  notify()
}

export function updateSessionName(name: string) {
  const session = getSession()
  if (!session || !isBrowser()) return
  window.localStorage.setItem(SESSION_KEY, JSON.stringify({ ...session, name }))
  notify()
}

/** Verifies the current demo password for the profile screen (passwords are never changed in demo). */
export function verifyCurrentPassword(userId: string, password: string): boolean {
  return findDemoUserById(userId)?.password === password
}

function readDisplayName(userId: string): string {
  try {
    const raw = window.localStorage.getItem(`demo:feedback-system:user:${userId}:profile`)
    if (!raw) return ''
    const parsed = JSON.parse(raw) as { name?: string }
    return typeof parsed.name === 'string' ? parsed.name.trim() : ''
  } catch {
    return ''
  }
}
