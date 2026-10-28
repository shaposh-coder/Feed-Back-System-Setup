import {
  AGE_GROUP_OPTIONS,
  CHALLENGE_OPTIONS,
  GENDER_OPTIONS,
  PURCHASE_CATEGORY_OPTIONS,
  SATISFACTION_STARS,
} from '@/lib/feedbackOptions'

export type ChartDatum = {
  label: string
  value: number
  fill?: string
}

export type DashboardStats = {
  total: number
  newCount: number
  reviewedCount: number
  archivedCount: number
  averageStars: number | null
  gender: ChartDatum[]
  ageGroup: ChartDatum[]
  challenges: ChartDatum[]
  purchaseCategories: ChartDatum[]
  satisfaction: ChartDatum[]
}

/** Soft, professional hues — no neon; readable against warm brand UI */
const CHART_COLORS = [
  '#6f5348',
  '#8a735f',
  '#5e6f66',
  '#7a6b5d',
  '#5c6b78',
  '#9a7d68',
  '#6a5f58',
  '#7d8a7a',
  '#8b6a5c',
  '#5a6570',
]

const GENDER_COLORS: Record<string, string> = {
  Female: '#8a6b5c',
  Male: '#5c6b78',
  'Prefer not to say': '#7a736c',
  Other: '#6a7a6e',
}

const SATISFACTION_COLORS: Record<string, string> = {
  'Very dissatisfied': '#9a5f55',
  Dissatisfied: '#b07d5c',
  Neutral: '#b39a6e',
  Satisfied: '#7d9470',
  'Very satisfied': '#5f8a74',
}

type RpcBucket = { label?: string; value?: number }

type RpcDashboardPayload = {
  total?: number
  newCount?: number
  reviewedCount?: number
  archivedCount?: number
  averageStars?: number | null
  gender?: RpcBucket[]
  ageGroup?: RpcBucket[]
  challenges?: RpcBucket[]
  purchaseCategories?: RpcBucket[]
  satisfaction?: RpcBucket[]
}

function orderAndColor(
  buckets: RpcBucket[] | undefined,
  preferredOrder: readonly string[] = [],
  colorByLabel?: Record<string, string>
): ChartDatum[] {
  const map = new Map<string, number>()
  for (const item of buckets ?? []) {
    const label = String(item.label ?? '').trim()
    const value = Number(item.value ?? 0)
    if (!label || !Number.isFinite(value) || value <= 0) continue
    map.set(label, (map.get(label) || 0) + value)
  }

  const ordered: ChartDatum[] = []
  const seen = new Set<string>()

  for (const label of preferredOrder) {
    if (!map.has(label)) continue
    ordered.push({ label, value: map.get(label) || 0 })
    seen.add(label)
  }

  const rest = [...map.entries()]
    .filter(([label]) => !seen.has(label))
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([label, value]) => ({ label, value }))

  return [...ordered, ...rest].map((item, index) => ({
    ...item,
    fill: colorByLabel?.[item.label] ?? CHART_COLORS[index % CHART_COLORS.length],
  }))
}

/** Shape RPC JSON from `rpc_admin_dashboard_stats` (ordering + chart colors only). */
export function shapeDashboardStats(payload: RpcDashboardPayload | null | undefined): DashboardStats {
  const raw = payload ?? {}
  const averageStars =
    raw.averageStars == null || !Number.isFinite(Number(raw.averageStars))
      ? null
      : Number(raw.averageStars)

  return {
    total: Number(raw.total ?? 0),
    newCount: Number(raw.newCount ?? 0),
    reviewedCount: Number(raw.reviewedCount ?? 0),
    archivedCount: Number(raw.archivedCount ?? 0),
    averageStars,
    gender: orderAndColor(raw.gender, GENDER_OPTIONS, GENDER_COLORS),
    ageGroup: orderAndColor(raw.ageGroup, AGE_GROUP_OPTIONS),
    challenges: orderAndColor(raw.challenges, CHALLENGE_OPTIONS),
    purchaseCategories: orderAndColor(raw.purchaseCategories, PURCHASE_CATEGORY_OPTIONS),
    satisfaction: orderAndColor(
      raw.satisfaction,
      SATISFACTION_STARS.map((s) => s.value),
      SATISFACTION_COLORS
    ).map((item) => {
      const stars = SATISFACTION_STARS.find((s) => s.value === item.label)?.stars
      return {
        ...item,
        label: stars ? `${stars}★ ${item.label}` : item.label,
      }
    }),
  }
}
