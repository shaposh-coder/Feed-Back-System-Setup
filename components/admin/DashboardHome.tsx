'use client'

import { useEffect, useState, type ReactNode } from 'react'
import Link from 'next/link'
import { ClipboardList, Star } from 'lucide-react'
import type { DashboardStats } from '@/lib/dashboardStats'
import {
  AgeGroupBarChart,
  CategoriesBarChart,
  ChallengesBarChart,
  GenderPieChart,
  SatisfactionBarChart,
} from '@/components/admin/DashboardCharts'

function StatCard({
  label,
  value,
  hint,
  href,
}: {
  label: string
  value: string | number
  hint?: ReactNode
  href?: string
}) {
  const content = (
    <>
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-600">{label}</p>
      <p className="mt-2 font-display text-3xl font-semibold text-ink-900">{value}</p>
      {hint ? <div className="mt-1 text-xs text-brand-500">{hint}</div> : null}
    </>
  )

  const className =
    'rounded-[22px] border border-brand-200 bg-[var(--card)] p-4 shadow-soft sm:p-5'

  if (href) {
    return (
      <Link
        href={href}
        className={`${className} block transition-colors hover:border-brand-400 hover:bg-brand-50/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600`}
      >
        {content}
      </Link>
    )
  }

  return <div className={className}>{content}</div>
}

export default function DashboardHome() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch('/api/admin/dashboard')
        const data = (await res.json()) as { stats?: DashboardStats; error?: string }
        if (!res.ok) {
          if (!cancelled) setError(data.error || 'Unable to load dashboard.')
          return
        }
        if (!cancelled) setStats(data.stats || null)
      } catch {
        if (!cancelled) setError('Network error while loading dashboard.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [])

  if (loading) {
    return <p className="text-sm text-ink-700">Loading dashboard…</p>
  }

  if (error || !stats) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
        {error || 'Unable to load dashboard.'}
      </div>
    )
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink-900 sm:text-3xl">Dashboard</h1>
          <p className="mt-1 text-sm text-ink-700">
            Insights from customer store-visit feedback responses.
          </p>
        </div>
        <Link
          href="/admin/entries"
          className="btn-secondary inline-flex w-full items-center justify-center gap-2 sm:w-auto"
        >
          <ClipboardList className="h-4 w-4" />
          View entries
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        <StatCard
          label="Total responses"
          value={stats.total}
          hint="All submissions"
          href="/admin/entries"
        />
        <StatCard
          label="New"
          value={stats.newCount}
          hint="Not opened yet"
          href="/admin/entries?status=new"
        />
        <StatCard
          label="Reviewed"
          value={stats.reviewedCount}
          hint="Already viewed"
          href="/admin/entries?status=reviewed"
        />
        <StatCard
          label="Avg. rating"
          value={stats.averageStars == null ? '—' : stats.averageStars}
          hint={
            stats.averageStars == null ? (
              'No ratings yet'
            ) : (
              <span className="inline-flex items-center gap-1">
                <Star className="h-3 w-3 fill-brand-600 text-brand-600" /> out of 5
              </span>
            )
          }
        />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <SatisfactionBarChart data={stats.satisfaction} />
        <GenderPieChart data={stats.gender} />
        <AgeGroupBarChart data={stats.ageGroup} />
        <ChallengesBarChart data={stats.challenges} />
        <CategoriesBarChart data={stats.purchaseCategories} />
      </div>
    </div>
  )
}
