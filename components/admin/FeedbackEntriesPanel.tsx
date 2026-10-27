'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight, Eye, Search, Star } from 'lucide-react'
import type { FeedbackEntry, FeedbackStatus } from '@/lib/feedbackTypes'
import { SATISFACTION_STARS } from '@/lib/feedbackOptions'

type ListResponse = {
  entries: FeedbackEntry[]
  page: number
  pageSize: number
  total: number
  totalPages: number
  error?: string
}

function starsFor(label: string) {
  return SATISFACTION_STARS.find((item) => item.value === label)?.stars ?? 0
}

function formatDate(value: string) {
  try {
    return new Date(value).toLocaleString()
  } catch {
    return value
  }
}

function StatusBadge({ status }: { status: FeedbackStatus }) {
  const styles =
    status === 'new'
      ? 'bg-amber-50 text-amber-800 border-amber-200'
      : status === 'reviewed'
        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
        : 'bg-stone-100 text-stone-600 border-stone-200'
  return (
    <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize ${styles}`}>
      {status}
    </span>
  )
}

export default function FeedbackEntriesPanel() {
  const router = useRouter()
  const [entries, setEntries] = useState<FeedbackEntry[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [status, setStatus] = useState<'all' | FeedbackStatus>('all')
  const [q, setQ] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({
        page: String(page),
        status,
        ...(q ? { q } : {}),
      })
      const res = await fetch(`/api/admin/feedback?${params.toString()}`)
      const data = (await res.json()) as ListResponse
      if (!res.ok) {
        setError(data.error || 'Unable to load entries.')
        setEntries([])
        return
      }
      setEntries(data.entries)
      setTotalPages(data.totalPages)
      setTotal(data.total)
    } catch {
      setError('Network error while loading entries.')
    } finally {
      setLoading(false)
    }
  }, [page, status, q])

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    const t = setTimeout(() => {
      setPage(1)
      setQ(searchInput.trim())
    }, 350)
    return () => clearTimeout(t)
  }, [searchInput])

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold text-ink-900">Feedback entries</h1>
          <p className="mt-1 text-sm text-ink-700">
            {total} submission{total === 1 ? '' : 's'} total
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <label className="relative block sm:w-64">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-400" />
            <input
              className="field-input !py-2.5 pl-9"
              placeholder="Search name, email, phone…"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </label>
          <select
            className="field-select !py-2.5 sm:w-40"
            value={status}
            onChange={(e) => {
              setPage(1)
              setStatus(e.target.value as 'all' | FeedbackStatus)
            }}
          >
            <option value="all">All statuses</option>
            <option value="new">New</option>
            <option value="reviewed">Reviewed</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      ) : null}

      <div className="overflow-hidden rounded-[24px] border border-brand-200 bg-[var(--card)] shadow-soft">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-brand-100 bg-brand-50/60 text-xs uppercase tracking-wide text-brand-700">
              <tr>
                <th className="px-4 py-3 font-semibold">Customer</th>
                <th className="px-4 py-3 font-semibold">Visit</th>
                <th className="px-4 py-3 font-semibold">Rating</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Submitted</th>
                <th className="px-4 py-3 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-ink-700">
                    Loading entries…
                  </td>
                </tr>
              ) : entries.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-ink-700">
                    No feedback entries yet.
                  </td>
                </tr>
              ) : (
                entries.map((entry) => {
                  const stars = starsFor(entry.overall_satisfaction)
                  const href = `/admin/entries/${entry.id}`
                  return (
                    <tr
                      key={entry.id}
                      role="link"
                      tabIndex={0}
                      onClick={() => router.push(href)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          router.push(href)
                        }
                      }}
                      className="cursor-pointer border-b border-brand-100/80 last:border-0 transition hover:bg-brand-50/70 focus-visible:bg-brand-50 focus-visible:outline-none"
                    >
                      <td className="px-4 py-3">
                        <p className="font-medium text-brand-800">{entry.full_name}</p>
                        <a
                          href={`mailto:${entry.email}`}
                          onClick={(e) => e.stopPropagation()}
                          className="block text-xs text-ink-700 hover:text-brand-700 hover:underline"
                        >
                          {entry.email}
                        </a>
                        <a
                          href={`tel:${entry.phone.replace(/\s+/g, '')}`}
                          onClick={(e) => e.stopPropagation()}
                          className="block text-xs text-brand-500 hover:text-brand-700 hover:underline"
                        >
                          {entry.phone}
                        </a>
                      </td>
                      <td className="px-4 py-3 text-ink-800">
                        <p>{entry.date_of_visit}</p>
                        <p className="text-xs text-brand-500">{entry.location}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-0.5 text-brand-600">
                          {Array.from({ length: 5 }, (_, i) => (
                            <Star
                              key={i}
                              className={`h-3.5 w-3.5 ${
                                i < stars
                                  ? 'fill-brand-600 text-brand-600'
                                  : 'fill-transparent text-brand-200'
                              }`}
                            />
                          ))}
                        </span>
                        <p className="mt-1 text-xs text-ink-700">{entry.overall_satisfaction}</p>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={entry.status} />
                      </td>
                      <td className="px-4 py-3 text-xs text-ink-700">
                        {formatDate(entry.created_at)}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            router.push(href)
                          }}
                          className="inline-flex items-center gap-1.5 rounded-full border border-brand-300 bg-white px-3 py-1.5 text-xs font-semibold text-brand-800 transition hover:bg-brand-50"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          View
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-brand-100 px-4 py-3">
          <p className="text-xs text-brand-500">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              className="btn-secondary !px-3 !py-2"
              disabled={page <= 1 || loading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft className="h-4 w-4" />
              Prev
            </button>
            <button
              type="button"
              className="btn-secondary !px-3 !py-2"
              disabled={page >= totalPages || loading}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
