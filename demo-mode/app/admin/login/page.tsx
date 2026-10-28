'use client'

import { FormEvent, Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Eye, Shield, UserRound, type LucideIcon } from 'lucide-react'
import DemoBanner from '@/components/demo/DemoBanner'
import { getSession, signIn } from '@/lib/demoAuth'
import { DEMO_USERS, type DemoRole } from '@/lib/demoUsers'

const ROLE_ICONS: Record<DemoRole, LucideIcon> = {
  admin: Shield,
  editor: UserRound,
  viewer: Eye,
}

function AdminLoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectParam = searchParams.get('redirect') || '/admin'
  const nextPath = redirectParam.startsWith('/admin') && !redirectParam.startsWith('/admin/login')
    ? redirectParam
    : '/admin'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (getSession()) router.replace(nextPath)
  }, [router, nextPath])

  function attemptSignIn(login: string, pass: string) {
    setLoading(true)
    setError(null)
    const result = signIn(login, pass)
    if (!result.ok) {
      setError(result.error)
      setLoading(false)
      return
    }
    router.replace(nextPath)
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    attemptSignIn(email, password)
  }

  return (
    <>
      <DemoBanner link="form" />
      <main className="mx-auto flex min-h-[calc(100vh-2.25rem)] w-full max-w-md flex-col justify-center px-4 py-10">
        <div className="rounded-[28px] border border-brand-200 bg-[var(--card)] p-6 shadow-soft sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand-600">
            Admin access
          </p>
          <h1 className="mt-2 font-display text-3xl font-semibold text-ink-900">Sign in</h1>
          <p className="mt-2 text-sm text-ink-700">
            Choose a demo account below, or sign in with your email and password.
          </p>

          <div className="mt-5 space-y-2.5" aria-label="Demo accounts">
            {DEMO_USERS.map((user) => {
              const Icon = ROLE_ICONS[user.role]
              return (
                <button
                  key={user.id}
                  type="button"
                  disabled={loading}
                  onClick={() => {
                    setEmail(user.email)
                    setPassword(user.password)
                    attemptSignIn(user.email, user.password)
                  }}
                  className="flex w-full items-start gap-3 rounded-2xl border border-brand-200 bg-white/80 p-3.5 text-left transition hover:border-brand-400 hover:bg-white hover:shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-700 text-white">
                    <Icon className="h-4 w-4" aria-hidden />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-x-2">
                      <span className="text-sm font-semibold text-ink-900">{user.roleLabel}</span>
                      <span className="rounded-full bg-brand-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-brand-700">
                        {user.role}
                      </span>
                    </span>
                    <span className="mt-0.5 block truncate text-xs text-ink-700">{user.email}</span>
                    <span className="mt-0.5 block text-xs text-brand-500">
                      Password: {user.password}
                    </span>
                    <span className="mt-1 block text-xs text-ink-700">{user.description}</span>
                  </span>
                </button>
              )
            })}
          </div>

          <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-[0.14em] text-brand-400">
            <span className="h-px flex-1 bg-brand-200" />
            or sign in manually
            <span className="h-px flex-1 bg-brand-200" />
          </div>

          {error ? (
            <div
              role="alert"
              className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
            >
              {error}
            </div>
          ) : null}

          <form onSubmit={onSubmit} className="space-y-4" autoComplete="on">
            <div>
              <label htmlFor="adminEmail" className="field-label">
                Email
              </label>
              <input
                id="adminEmail"
                name="email"
                type="text"
                autoComplete="username"
                className="field-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="adminPassword" className="field-label">
                Password
              </label>
              <input
                id="adminPassword"
                name="password"
                type="password"
                autoComplete="current-password"
                className="field-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign in to admin'}
            </button>
          </form>
        </div>
      </main>
    </>
  )
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<main className="p-10 text-center text-sm text-ink-700">Loading…</main>}>
      <AdminLoginForm />
    </Suspense>
  )
}
