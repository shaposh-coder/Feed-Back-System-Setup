'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ChevronLeft, ChevronRight, Eye, Search, Star } from 'lucide-react'
import type { FeedbackEntry, FeedbackStatus } from '@/lib/feedbackTypes'
import { FEEDBACK_LIST_PAGE_SIZE } from '@/lib/feedbackPaging'
import { SATISFACTION_STARS } from '@/lib/feedbackOptions'
import { useAdminSession } from '@/components/admin/AdminGuard'
import { listEntries } from '@/lib/demoStore'

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

function parseStatusFilter(raw: string | null): 'all' | FeedbackStatus {
  if (raw === 'new' || raw === 'reviewed' || raw === 'archived') return raw
  return 'all'
}

function StatusBadge({ status }: { status: FeedbackStatus }) {
  const styles =
    status === 'new'
      ? 'bg-amber-50 text-amber-800 border-amber-200'
      : status === 'reviewed'
        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
        : 'bg-stone-100 text-stone-600 border-stone-200'
  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize ${styles}`}
    >
      {status}
    </span>
  )
}

function RatingStars({ label }: { label: string }) {
  const stars = starsFor(label)
  return (
    <span className="inline-flex items-center gap-0.5 text-brand-600">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={`h-3.5 w-3.5 ${
            i < stars ? 'fill-brand-600 text-brand-600' : 'fill-transparent text-brand-200'
          }`}
        />
      ))}
    </span>
  )
}

function EntryMobileCard({
  entry,
  onView,
}: {
  entry: FeedbackEntry
  onView: () => void
}) {
  return (
    <article
      role="button"
      tabIndex={0}
      onClick={onView}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onView()
        }
      }}
      className="rounded-2xl border border-brand-200 bg-[var(--card)] p-4 shadow-soft transition active:bg-brand-50/60"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-semibold text-brand-800">{entry.full_name}</p>
          <a
            href={`mailto:${entry.email}`}
            onClick={(e) => e.stopPropagation()}
            className="mt-0.5 block truncate text-xs text-ink-700 hover:text-brand-700 hover:underline"
          >
            {entry.email}
          </a>
          <a
            href={`tel:${entry.phone.replace(/\s+/g, '')}`}
            onClick={(e) => e.stopPropagation()}
            className="mt-0.5 block text-xs text-brand-500 hover:text-brand-700 hover:underline"
          >
            {entry.phone}
          </a>
        </div>
        <StatusBadge status={entry.status} />
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-brand-500">Visit</p>
          <p className="mt-0.5 text-ink-800">{entry.date_of_visit}</p>
          <p className="text-xs text-brand-500">{entry.location}</p>
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-brand-500">Rating</p>
          <div className="mt-0.5">
            <RatingStars label={entry.overall_satisfaction} />
          </div>
          <p className="mt-0.5 text-xs text-ink-700">{entry.overall_satisfaction}</p>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between gap-3 border-t border-brand-100 pt-3">
        <p className="text-xs text-ink-700">{formatDate(entry.created_at)}</p>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onView()
          }}
          className="inline-flex items-center gap-1.5 rounded-full border border-brand-300 bg-white px-3 py-1.5 text-xs font-semibold text-brand-800"
        >
          <Eye className="h-3.5 w-3.5" />
          View
        </button>
      </div>
    </article>
  )
}

export default function FeedbackEntriesPanel() {
  const { userId } = useAdminSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [entries, setEntries] = useState<FeedbackEntry[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [status, setStatus] = useState<'all' | FeedbackStatus>(() =>
    parseStatusFilter(searchParams.get('status')),
  )
  const [q, setQ] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setStatus(parseStatusFilter(searchParams.get('status')))
    setPage(1)
  }, [searchParams])

  const load = useCallback(() => {
    // Demo Mode: query this user's localStorage sandbox instead of GET /api/admin/feedback.
    const data = listEntries(userId, { page, status, q })
    setEntries(data.entries)
    setTotalPages(data.totalPages)
    setTotal(data.total)
    if (data.page !== page) setPage(data.page)
    setLoading(false)
  }, [userId, page, status, q])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    const t = setTimeout(() => {
      setPage(1)
      setQ(searchInput.trim())
    }, 350)
    return () => clearTimeout(t)
  }, [searchInput])

  const pagination = (
    <div className="flex flex-col gap-3 border-t border-brand-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-center text-xs text-brand-500 sm:text-left">
        Page {page} of {totalPages}
        <span className="mx-1.5 text-brand-300">·</span>
        {FEEDBACK_LIST_PAGE_SIZE} per page
        {total > 0 ? (
          <>
            <span className="mx-1.5 text-brand-300">·</span>
            {total} total
          </>
        ) : null}
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          className="btn-secondary flex-1 !px-3 !py-2 sm:flex-none"
          disabled={page <= 1 || loading}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
        >
          <ChevronLeft className="h-4 w-4" />
          Prev
        </button>
        <button
          type="button"
          className="btn-secondary flex-1 !px-3 !py-2 sm:flex-none"
          disabled={page >= totalPages || loading}
          onClick={() => setPage((p) => p + 1)}
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink-900 sm:text-3xl">
            Feedback entries
          </h1>
          <p className="mt-1 text-sm text-ink-700">
            {total} submission{total === 1 ? '' : 's'} total
          </p>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          <label className="relative block w-full sm:w-64">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-400" />
            <input
              className="field-input !py-2.5 pl-9"
              placeholder="Search name, email, phone…"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </label>
          <select
            className="field-select w-full !py-2.5 sm:w-40"
            value={status}
            onChange={(e) => {
              const next = e.target.value as 'all' | FeedbackStatus
              setPage(1)
              setStatus(next)
              const params = new URLSearchParams(searchParams.toString())
              if (next === 'all') params.delete('status')
              else params.set('status', next)
              const qs = params.toString()
              router.replace(qs ? `/admin/entries?${qs}` : '/admin/entries')
            }}
          >
            <option value="all">All statuses</option>
            <option value="new">New</option>
            <option value="reviewed">Reviewed</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      {/* Mobile cards */}
      <div className="space-y-3 md:hidden">
        {loading ? (
          <div className="rounded-2xl border border-brand-200 bg-[var(--card)] px-4 py-10 text-center text-sm text-ink-700 shadow-soft">
            Loading entries…
          </div>
        ) : entries.length === 0 ? (
          <div className="rounded-2xl border border-brand-200 bg-[var(--card)] px-4 py-10 text-center text-sm text-ink-700 shadow-soft">
            No feedback entries yet.
          </div>
        ) : (
          entries.map((entry) => (
            <EntryMobileCard
              key={entry.id}
              entry={entry}
              onView={() => router.push(`/admin/entries/${entry.id}`)}
            />
          ))
        )}
        <div className="overflow-hidden rounded-2xl border border-brand-200 bg-[var(--card)] shadow-soft">
          {pagination}
        </div>
      </div>

      {/* Desktop table */}
      <div className="hidden overflow-hidden rounded-[24px] border border-brand-200 bg-[var(--card)] shadow-soft md:block">
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
                        <RatingStars label={entry.overall_satisfaction} />
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
        {pagination}
      </div>
    </div>
  )
}
