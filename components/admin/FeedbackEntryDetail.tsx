'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { ArrowLeft, Star } from 'lucide-react'
import type { FeedbackEntry, FeedbackStatus } from '@/lib/feedbackTypes'
import { SATISFACTION_STARS } from '@/lib/feedbackOptions'

function starsFor(label: string) {
  return SATISFACTION_STARS.find((item) => item.value === label)?.stars ?? 0
}

export default function FeedbackEntryDetail({ id }: { id: string }) {
  const [entry, setEntry] = useState<FeedbackEntry | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`/api/admin/feedback/${id}?markReviewed=1`)
        const data = (await res.json()) as { entry?: FeedbackEntry; error?: string }
        if (!res.ok) {
          if (!cancelled) setError(data.error || 'Unable to load entry.')
          return
        }

        if (!cancelled) setEntry(data.entry || null)
      } catch {
        if (!cancelled) setError('Network error while loading entry.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [id])

  async function updateStatus(status: FeedbackStatus) {
    if (!entry) return
    setSaving(true)
    setMessage(null)
    setError(null)
    try {
      const res = await fetch(`/api/admin/feedback/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      const data = (await res.json()) as { entry?: FeedbackEntry; error?: string }
      if (!res.ok) {
        setError(data.error || 'Unable to update status.')
        return
      }
      setEntry(data.entry || null)
      setMessage('Status updated.')
    } catch {
      setError('Network error while updating status.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <p className="text-sm text-ink-700">Loading entry…</p>
  }

  if (error && !entry) {
    return (
      <div className="space-y-4">
        <Link href="/admin/entries" className="inline-flex items-center gap-2 text-sm text-brand-700">
          <ArrowLeft className="h-4 w-4" /> Back to entries
        </Link>
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      </div>
    )
  }

  if (!entry) return null

  const stars = starsFor(entry.overall_satisfaction)

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link
            href="/admin/entries"
            className="inline-flex items-center gap-2 text-sm text-brand-700"
          >
            <ArrowLeft className="h-4 w-4" /> Back to entries
          </Link>
          <h1 className="mt-3 font-display text-3xl font-semibold text-ink-900">{entry.full_name}</h1>
          <p className="mt-1 text-sm text-ink-700">
            Submitted {new Date(entry.created_at).toLocaleString()}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {(['new', 'reviewed', 'archived'] as FeedbackStatus[]).map((status) => (
            <button
              key={status}
              type="button"
              disabled={saving || entry.status === status}
              onClick={() => void updateStatus(status)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold capitalize transition ${
                entry.status === status
                  ? 'bg-brand-700 text-white'
                  : 'border border-brand-300 bg-white/80 text-brand-800 hover:bg-white'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
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

      <div className="grid gap-4 md:grid-cols-2">
        <section className="rounded-[24px] border border-brand-200 bg-[var(--card)] p-5 shadow-soft">
          <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-brand-600">
            Customer
          </h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div>
              <dt className="text-brand-500">Email</dt>
              <dd>
                <a
                  href={`mailto:${entry.email}`}
                  className="text-ink-800 hover:text-brand-700 hover:underline"
                >
                  {entry.email}
                </a>
              </dd>
            </div>
            <div>
              <dt className="text-brand-500">Phone</dt>
              <dd>
                <a
                  href={`tel:${entry.phone.replace(/\s+/g, '')}`}
                  className="text-ink-800 hover:text-brand-700 hover:underline"
                >
                  {entry.phone}
                </a>
              </dd>
            </div>
            <div>
              <dt className="text-brand-500">Location</dt>
              <dd className="text-ink-800">{entry.location}</dd>
            </div>
            <div>
              <dt className="text-brand-500">Branch</dt>
              <dd className="text-ink-800">{entry.branch || '—'}</dd>
            </div>
            <div>
              <dt className="text-brand-500">Gender</dt>
              <dd className="text-ink-800">{entry.gender}</dd>
            </div>
            <div>
              <dt className="text-brand-500">Age group</dt>
              <dd className="text-ink-800">{entry.age_group}</dd>
            </div>
          </dl>
        </section>

        <section className="rounded-[24px] border border-brand-200 bg-[var(--card)] p-5 shadow-soft">
          <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-brand-600">
            Visit feedback
          </h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div>
              <dt className="text-brand-500">Date of visit</dt>
              <dd className="text-ink-800">{entry.date_of_visit}</dd>
            </div>
            <div>
              <dt className="text-brand-500">Satisfaction</dt>
              <dd className="mt-1">
                <span className="inline-flex items-center gap-0.5 text-brand-600">
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < stars
                          ? 'fill-brand-600 text-brand-600'
                          : 'fill-transparent text-brand-200'
                      }`}
                    />
                  ))}
                </span>
                <p className="mt-1 text-ink-800">{entry.overall_satisfaction}</p>
              </dd>
            </div>
            <div>
              <dt className="text-brand-500">Challenges</dt>
              <dd className="text-ink-800">
                {entry.challenges.join(', ') || '—'}
                {entry.challenge_other ? (
                  <span className="block text-brand-700">Other: {entry.challenge_other}</span>
                ) : null}
              </dd>
            </div>
            <div>
              <dt className="text-brand-500">Purchase categories</dt>
              <dd className="text-ink-800">{entry.purchase_categories.join(', ') || '—'}</dd>
            </div>
            <div>
              <dt className="text-brand-500">Notes / suggestions</dt>
              <dd className="whitespace-pre-wrap text-ink-800">
                {entry.categories_feedback || '—'}
              </dd>
            </div>
          </dl>
        </section>
      </div>
    </div>
  )
}
