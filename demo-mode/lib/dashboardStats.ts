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
  '#6f5348', // mocha
  '#8a735f', // warm taupe
  '#5e6f66', // muted sage
  '#7a6b5d', // clay
  '#5c6b78', // slate blue-gray
  '#9a7d68', // soft caramel
  '#6a5f58', // stone
  '#7d8a7a', // olive mist
  '#8b6a5c', // dusty terracotta
  '#5a6570', // cool charcoal
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

type FeedbackRow = {
  gender: string | null
  age_group: string | null
  challenges: string[] | null
  purchase_categories: string[] | null
  overall_satisfaction: string | null
  status: string | null
}

function countByLabel(
  rows: string[],
  preferredOrder: readonly string[] = [],
  colorByLabel?: Record<string, string>
): ChartDatum[] {
  const map = new Map<string, number>()
  for (const label of rows) {
    const key = label.trim()
    if (!key) continue
    map.set(key, (map.get(key) || 0) + 1)
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

export function buildDashboardStats(rows: FeedbackRow[]): DashboardStats {
  const total = rows.length
  let newCount = 0
  let reviewedCount = 0
  let archivedCount = 0
  let starSum = 0
  let starCount = 0

  const genders: string[] = []
  const ages: string[] = []
  const challenges: string[] = []
  const categories: string[] = []
  const satisfaction: string[] = []

  for (const row of rows) {
    if (row.status === 'new') newCount += 1
    else if (row.status === 'reviewed') reviewedCount += 1
    else if (row.status === 'archived') archivedCount += 1

    if (row.gender) genders.push(row.gender)
    if (row.age_group) ages.push(row.age_group)
    if (row.overall_satisfaction) {
      satisfaction.push(row.overall_satisfaction)
      const stars = SATISFACTION_STARS.find((s) => s.value === row.overall_satisfaction)?.stars
      if (stars) {
        starSum += stars
        starCount += 1
      }
    }
    if (Array.isArray(row.challenges)) {
      for (const item of row.challenges) challenges.push(item)
    }
    if (Array.isArray(row.purchase_categories)) {
      for (const item of row.purchase_categories) categories.push(item)
    }
  }

  return {
    total,
    newCount,
    reviewedCount,
    archivedCount,
    averageStars: starCount > 0 ? Math.round((starSum / starCount) * 10) / 10 : null,
    gender: countByLabel(genders, GENDER_OPTIONS, GENDER_COLORS),
    ageGroup: countByLabel(ages, AGE_GROUP_OPTIONS),
    challenges: countByLabel(challenges, CHALLENGE_OPTIONS),
    purchaseCategories: countByLabel(categories, PURCHASE_CATEGORY_OPTIONS),
    satisfaction: countByLabel(
      satisfaction,
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
