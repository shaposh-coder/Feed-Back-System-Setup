'use client'

import { FormEvent, useEffect, useState } from 'react'
import { useAdminSession } from '@/components/admin/AdminGuard'
import { updateSessionName, verifyCurrentPassword } from '@/lib/demoAuth'
import { getProfile, saveProfile } from '@/lib/demoStore'

export default function ProfileSettingsForm() {
  const session = useAdminSession()
  const { userId } = session
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(true)
  const [savingName, setSavingName] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const email = session.email
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  useEffect(() => {
    setName(getProfile(userId).name)
    setLoading(false)
  }, [userId])

  function saveName(e: FormEvent) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) {
      setError('Please enter a display name.')
      setMessage(null)
      return
    }
    setSavingName(true)
    setError(null)
    setMessage(null)
    saveProfile(userId, { name: trimmed })
    updateSessionName(trimmed)
    setName(trimmed)
    setMessage('Profile name updated.')
    setSavingName(false)
  }

  function savePassword(e: FormEvent) {
    e.preventDefault()
    setSavingPassword(true)
    setError(null)
    setMessage(null)
    if (!verifyCurrentPassword(userId, currentPassword)) {
      setError('Your current password is incorrect.')
    } else if (newPassword.length < 8) {
      setError('New password must be at least 8 characters.')
    } else if (newPassword !== confirmPassword) {
      setError('New password and confirmation do not match.')
    } else {
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      // Demo accounts keep their fixed credentials so every visitor can still sign in.
      setMessage('Password change confirmed. In Demo Mode the sign-in password stays the same.')
    }
    setSavingPassword(false)
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
