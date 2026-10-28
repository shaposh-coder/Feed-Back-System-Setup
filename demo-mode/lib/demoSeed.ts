/**
 * Professional fictional seed data for Demo Mode.
 * All names, emails (example.com) and phone numbers are invented — no real PII.
 * Generated deterministically per demo user so every sandbox looks populated on first sign-in.
 */

import {
  AGE_GROUP_OPTIONS,
  CHALLENGE_OPTIONS,
  PURCHASE_CATEGORY_OPTIONS,
} from '@/lib/feedbackOptions'
import type { FeedbackEntry, FeedbackStatus } from '@/lib/feedbackTypes'
import type { BrandSettings, DemoProfile, DemoStoreLocation } from '@/lib/demoStore'
import { findDemoUserById } from '@/lib/demoUsers'

export const DEMO_STORE_LOCATIONS: DemoStoreLocation[] = [
  {
    id: 'loc-karachi',
    name: 'Karachi',
    branches: [
      { id: 'br-khi-clifton', name: 'Clifton' },
      { id: 'br-khi-dha', name: 'DHA Phase 6' },
      { id: 'br-khi-gulshan', name: 'Gulshan-e-Iqbal' },
      { id: 'br-khi-saddar', name: 'Saddar' },
    ],
  },
  {
    id: 'loc-lahore',
    name: 'Lahore',
    branches: [
      { id: 'br-lhr-gulberg', name: 'Gulberg' },
      { id: 'br-lhr-dha', name: 'DHA Phase 5' },
      { id: 'br-lhr-johar', name: 'Johar Town' },
    ],
  },
  {
    id: 'loc-islamabad',
    name: 'Islamabad',
    branches: [
      { id: 'br-isb-f6', name: 'F-6 Markaz' },
      { id: 'br-isb-blue', name: 'Blue Area' },
      { id: 'br-isb-g9', name: 'G-9 Markaz' },
    ],
  },
]

export const DEFAULT_BRAND: BrandSettings = {
  brandName: 'Northwind Retail',
  logoUrl: '',
  faviconUrl: '/favicon.png',
  locationId: 'loc-karachi',
  selectedBranchIds: ['br-khi-clifton', 'br-khi-dha'],
}

const DAY_MS = 24 * 60 * 60 * 1000

const FEMALE_FIRST = [
  'Ayesha', 'Sana', 'Hira', 'Maryam', 'Zainab', 'Fatima', 'Noor', 'Amna', 'Laiba', 'Rabia',
  'Emily', 'Sophia', 'Olivia', 'Hannah', 'Grace', 'Priya', 'Meera', 'Isabella',
]
const MALE_FIRST = [
  'Ahmed', 'Hamza', 'Bilal', 'Usman', 'Omar', 'Faisal', 'Imran', 'Saad', 'Daniyal', 'Kamran',
  'James', 'Daniel', 'Lucas', 'Ethan', 'Arjun', 'Noah',
]
const NEUTRAL_FIRST = ['Alex', 'Jordan', 'Taylor', 'Morgan', 'Casey']
const LAST_NAMES = [
  'Khan', 'Malik', 'Siddiqui', 'Qureshi', 'Ansari', 'Sheikh', 'Butt', 'Chaudhry', 'Raza', 'Hashmi',
  'Farooq', 'Mirza', 'Bukhari', 'Iqbal', 'Hussain', 'Rehman', 'Carter', 'Bennett', 'Foster',
  'Hughes', 'Patel', 'Nair', 'Sharma', 'Fischer',
]
const LOCATIONS = [
  'Lahore', 'Karachi', 'Islamabad', 'Rawalpindi', 'Faisalabad', 'Multan', 'Sialkot', 'Peshawar',
  'Gujranwala', 'Hyderabad',
]

const GENDER_WEIGHTS: [string, number][] = [
  ['Female', 58],
  ['Male', 34],
  ['Prefer not to say', 6],
  ['Other', 2],
]

const AGE_WEIGHTS: [string, number][] = [
  [AGE_GROUP_OPTIONS[0], 8],
  [AGE_GROUP_OPTIONS[1], 18],
  [AGE_GROUP_OPTIONS[2], 24],
  [AGE_GROUP_OPTIONS[3], 20],
  [AGE_GROUP_OPTIONS[4], 14],
  [AGE_GROUP_OPTIONS[5], 11],
  [AGE_GROUP_OPTIONS[6], 5],
]

const SATISFACTION_WEIGHTS: [string, number][] = [
  ['Very satisfied', 34],
  ['Satisfied', 36],
  ['Neutral', 16],
  ['Dissatisfied', 9],
  ['Very dissatisfied', 5],
]

const CATEGORY_WEIGHTS: [string, number][] = [
  [PURCHASE_CATEGORY_OPTIONS[0], 26], // Women Formal
  [PURCHASE_CATEGORY_OPTIONS[1], 30], // Women Casual
  [PURCHASE_CATEGORY_OPTIONS[2], 16], // Kids Casual
  [PURCHASE_CATEGORY_OPTIONS[3], 9], // Kids Formal
  [PURCHASE_CATEGORY_OPTIONS[4], 14], // Accessories
  [PURCHASE_CATEGORY_OPTIONS[5], 5], // Others
]

const MINOR_CHALLENGES = [
  CHALLENGE_OPTIONS[2], // Product unavailability
  CHALLENGE_OPTIONS[4], // Checkout experience
  CHALLENGE_OPTIONS[5], // Fitting room experience
]
const MAJOR_CHALLENGES = [
  CHALLENGE_OPTIONS[1], // Customer service
  CHALLENGE_OPTIONS[2], // Product unavailability
  CHALLENGE_OPTIONS[3], // Product quality
  CHALLENGE_OPTIONS[4], // Checkout experience
  CHALLENGE_OPTIONS[6], // Refund policy
  CHALLENGE_OPTIONS[7], // Exchange policy
  CHALLENGE_OPTIONS[8], // Claim
]

const OTHER_CHALLENGE_NOTES = [
  'Parking near the entrance was limited on the weekend.',
  'The in-store fragrance was a little strong in the fitting area.',
  'Could not find the size chart for kids’ wear.',
  'Store music was louder than expected.',
]

const POSITIVE_NOTES = [
  'Lovely collection this season. The staff helped me find the right size quickly.',
  'Great experience overall. Please add more colour options in women’s casual wear.',
  'Clean store, friendly team, and a smooth checkout. Will visit again.',
  'Would love to see a wider range of formal kidswear for events.',
  'The new accessories section is excellent. A few more belts and scarves would be great.',
  'Very helpful associate at the fitting rooms. Thank you.',
  'Good quality fabrics for the price. Looking forward to the winter range.',
  'Easy to navigate and well organised. More seating near the fitting rooms would help.',
]
const NEUTRAL_NOTES = [
  'Decent selection, but some popular sizes were already sold out.',
  'Prices are fair. Checkout queue was a bit long during the evening.',
  'Nice store. I would like to see more variety in formal wear for men.',
  'Average visit. More staff on the floor at peak hours would improve things.',
]
const NEGATIVE_NOTES = [
  'I waited a long time at the counter and nobody was available to assist.',
  'The item I purchased last week had a stitching defect. I would like an exchange.',
  'Size availability was disappointing, and the fitting rooms were crowded.',
  'Refund process was unclear. Please share the policy more visibly in store.',
  'Staff were polite but could not locate my size in the stockroom.',
]

function mulberry32(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

type Rng = () => number

function pick<T>(rng: Rng, items: readonly T[]): T {
  return items[Math.floor(rng() * items.length)]
}

function weighted(rng: Rng, items: [string, number][]): string {
  const total = items.reduce((sum, [, w]) => sum + w, 0)
  let roll = rng() * total
  for (const [value, weight] of items) {
    roll -= weight
    if (roll <= 0) return value
  }
  return items[0][0]
}

function toDateOnly(date: Date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function slug(value: string) {
  return value.toLowerCase().replace(/[^a-z]/g, '')
}

const SEED_CONFIG: Record<string, { seed: number; count: number }> = {
  admin: { seed: 1042, count: 64 },
  editor: { seed: 2087, count: 48 },
  viewer: { seed: 3159, count: 42 },
}

export function buildSeedEntries(userId: string, now = new Date()): FeedbackEntry[] {
  const config = SEED_CONFIG[userId] ?? { seed: 4001, count: 40 }
  const rng = mulberry32(config.seed)
  const entries: FeedbackEntry[] = []
  const usedEmails = new Set<string>()

  for (let i = 0; i < config.count; i += 1) {
    const gender = weighted(rng, GENDER_WEIGHTS)
    const firstPool =
      gender === 'Female'
        ? FEMALE_FIRST
        : gender === 'Male'
          ? MALE_FIRST
          : NEUTRAL_FIRST
    const first = pick(rng, firstPool)
    const last = pick(rng, LAST_NAMES)
    let email = `${slug(first)}.${slug(last)}@example.com`
    let suffix = 2
    while (usedEmails.has(email)) {
      email = `${slug(first)}.${slug(last)}${suffix}@example.com`
      suffix += 1
    }
    usedEmails.add(email)

    // Newer entries are denser so the dashboard looks active.
    const daysAgo = Math.floor(Math.pow(rng(), 1.5) * 75)
    const visit = new Date(now.getTime() - daysAgo * DAY_MS)
    const hour = 10 + Math.floor(rng() * 11)
    const minute = Math.floor(rng() * 60)
    const created = new Date(visit)
    created.setHours(hour, minute, 0, 0)
    if (created.getTime() > now.getTime()) {
      created.setTime(now.getTime() - Math.floor(rng() * 6 + 1) * 60 * 60 * 1000)
    }

    const satisfaction = weighted(rng, SATISFACTION_WEIGHTS)
    const isHigh = satisfaction === 'Very satisfied' || satisfaction === 'Satisfied'
    const isLow = satisfaction === 'Dissatisfied' || satisfaction === 'Very dissatisfied'

    let challenges: string[]
    let challengeOther: string | null = null
    if (isHigh) {
      challenges = rng() < 0.68 ? ['No issue'] : [pick(rng, MINOR_CHALLENGES)]
    } else if (isLow) {
      const first = pick(rng, MAJOR_CHALLENGES)
      challenges = [first]
      if (rng() < 0.45) {
        const second = pick(rng, MAJOR_CHALLENGES)
        if (second !== first) challenges.push(second)
      }
    } else {
      challenges = rng() < 0.3 ? ['No issue'] : [pick(rng, [...MINOR_CHALLENGES, ...MAJOR_CHALLENGES])]
    }
    if (!challenges.includes('No issue') && rng() < 0.12) {
      challenges.push('Other')
      challengeOther = pick(rng, OTHER_CHALLENGE_NOTES)
    }

    const categoryCount = 1 + (rng() < 0.45 ? 1 : 0) + (rng() < 0.12 ? 1 : 0)
    const categories: string[] = []
    while (categories.length < categoryCount) {
      const next = weighted(rng, CATEGORY_WEIGHTS)
      if (!categories.includes(next)) categories.push(next)
    }
    categories.sort(
      (a, b) =>
        PURCHASE_CATEGORY_OPTIONS.indexOf(a as (typeof PURCHASE_CATEGORY_OPTIONS)[number]) -
        PURCHASE_CATEGORY_OPTIONS.indexOf(b as (typeof PURCHASE_CATEGORY_OPTIONS)[number])
    )

    const notePool = isHigh ? POSITIVE_NOTES : isLow ? NEGATIVE_NOTES : NEUTRAL_NOTES
    const note = rng() < 0.72 ? pick(rng, notePool) : null

    let status: FeedbackStatus
    const statusRoll = rng()
    if (daysAgo <= 2) status = statusRoll < 0.85 ? 'new' : 'reviewed'
    else if (daysAgo <= 14) status = statusRoll < 0.2 ? 'new' : 'reviewed'
    else status = statusRoll < 0.4 ? 'archived' : 'reviewed'

    const phoneTail = String(100 + Math.floor(rng() * 899))

    entries.push({
      id: `entry-${userId}-${String(i + 1).padStart(3, '0')}`,
      created_at: created.toISOString(),
      full_name: `${first} ${last}`,
      phone: `0300 555 0${phoneTail}`,
      email,
      location: pick(rng, LOCATIONS),
      gender,
      age_group: weighted(rng, AGE_WEIGHTS),
      date_of_visit: toDateOnly(visit),
      challenges,
      challenge_other: challengeOther,
      purchase_categories: categories,
      overall_satisfaction: satisfaction,
      categories_feedback: note,
      status,
    })
  }

  return entries.sort((a, b) => b.created_at.localeCompare(a.created_at))
}

export function buildSeedBrand(): BrandSettings {
  return {
    ...DEFAULT_BRAND,
    selectedBranchIds: [...DEFAULT_BRAND.selectedBranchIds],
  }
}

export function buildSeedProfile(userId: string): DemoProfile {
  const user = findDemoUserById(userId)
  return { name: user?.name ?? 'Demo User' }
}
