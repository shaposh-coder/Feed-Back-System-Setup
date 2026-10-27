'use client'

import { FormEvent, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ProfileSettingsForm() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(true)
  const [savingName, setSavingName] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch('/api/admin/profile')
        const data = (await res.json()) as { name?: string; email?: string; error?: string }
        if (!res.ok) {
          if (!cancelled) setError(data.error || 'Unable to load profile.')
          return
        }
        if (!cancelled) {
          setName(data.name || '')
          setEmail(data.email || '')
        }
      } catch {
        if (!cancelled) setError('Network error while loading profile.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [])

  async function saveName(e: FormEvent) {
    e.preventDefault()
    setSavingName(true)
    setError(null)
    setMessage(null)
    try {
      const res = await fetch('/api/admin/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      })
      const data = (await res.json()) as { name?: string; error?: string }
      if (!res.ok) {
        setError(data.error || 'Unable to update name.')
        return
      }
      setName(data.name || name)
      setMessage('Profile name updated.')
      router.refresh()
    } catch {
      setError('Network error while updating name.')
    } finally {
      setSavingName(false)
    }
  }

  async function savePassword(e: FormEvent) {
    e.preventDefault()
    setSavingPassword(true)
    setError(null)
    setMessage(null)
    try {
      const res = await fetch('/api/admin/profile/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
      })
      const data = (await res.json()) as { error?: string }
      if (!res.ok) {
        setError(data.error || 'Unable to update password.')
        return
      }
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setMessage('Password updated successfully.')
    } catch {
      setError('Network error while updating password.')
    } finally {
      setSavingPassword(false)
    }
  }

  if (loading) {
    return <p className="text-sm text-ink-700">Loading profile…</p>
  }

  return (
    <div className="space-y-5 lg:space-y-6">
      <div className="max-w-3xl">
        <h1 className="font-display text-3xl font-semibold text-ink-900 sm:text-4xl">My Profile</h1>
        <p className="mt-1 text-sm text-ink-700 sm:text-base">
          Update your display name or change your account password.
        </p>
      </div>

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      ) : null}
      {message ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {message}
        </div>
      ) : null}

      <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-2 lg:gap-6">
        <form
          onSubmit={saveName}
          className="flex h-full flex-col space-y-4 rounded-[24px] border border-brand-200 bg-[var(--card)] p-5 shadow-soft sm:p-6 lg:p-7"
        >
          <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-brand-600">
            Profile details
          </h2>
          <div>
            <label htmlFor="profileEmail" className="field-label">
              Email
            </label>
            <input
              id="profileEmail"
              className="field-input bg-brand-50/50"
              value={email}
              readOnly
              disabled
            />
            <p className="mt-1.5 text-xs text-brand-500">
              Your email is used for sign-in and cannot be changed here.
            </p>
          </div>
          <div>
            <label htmlFor="profileName" className="field-label">
              Name
            </label>
            <input
              id="profileName"
              className="field-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your display name"
              maxLength={80}
              required
            />
          </div>
          <div className="pt-2 sm:pt-4 lg:mt-auto">
            <button
              type="submit"
              className="btn-primary w-full sm:w-auto"
              disabled={savingName}
            >
              {savingName ? 'Saving…' : 'Save name'}
            </button>
          </div>
        </form>

        <form
          onSubmit={savePassword}
          className="flex h-full flex-col space-y-4 rounded-[24px] border border-brand-200 bg-[var(--card)] p-5 shadow-soft sm:p-6 lg:p-7"
        >
          <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-brand-600">
            Change password
          </h2>
          <div>
            <label htmlFor="currentPassword" className="field-label">
              Current password
            </label>
            <input
              id="currentPassword"
              type="password"
              autoComplete="current-password"
              className="field-input"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="newPassword" className="field-label">
                New password
              </label>
              <input
                id="newPassword"
                type="password"
                autoComplete="new-password"
                className="field-input"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                minLength={8}
                required
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="field-label">
                Confirm new password
              </label>
              <input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                className="field-input"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                minLength={8}
                required
              />
            </div>
          </div>
          <div className="pt-2 sm:pt-4 lg:mt-auto">
            <button
              type="submit"
              className="btn-primary w-full sm:w-auto"
              disabled={savingPassword}
            >
              {savingPassword ? 'Updating…' : 'Update password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
