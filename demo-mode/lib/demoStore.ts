/**
 * Client-side demo data layer (replaces Supabase tables + /api routes).
 * Everything is namespaced per demo user:
 *   demo:feedback-system:user:{userId}:{resource}
 * Resources: entries, brand, profile, seeded
 */

import type { FeedbackFormData } from '@/lib/feedbackOptions'
import { FEEDBACK_LIST_PAGE_SIZE } from '@/lib/feedbackPaging'
import { buildDashboardStats, type DashboardStats } from '@/lib/dashboardStats'
import type { FeedbackEntry, FeedbackStatus } from '@/lib/feedbackTypes'
import { DEFAULT_BRAND, buildSeedBrand, buildSeedEntries, buildSeedProfile } from '@/lib/demoSeed'

export type DemoStoreBranch = {
  id: string
  name: string
}

export type DemoStoreLocation = {
  id: string
  name: string
  branches: DemoStoreBranch[]
}

export type BrandSettings = {
  brandName: string
  logoUrl: string
  faviconUrl: string
  locationId: string
  selectedBranchIds: string[]
}

export type DemoProfile = {
  name: string
}

/**
 * The public customer form (`/`) has no signed-in user, so submissions land in this
 * well-known sandbox. Sign in as the matching demo account to see them on the dashboard.
 */
export const PUBLIC_SANDBOX_USER_ID = 'admin'

export const STORE_CHANGED_EVENT = 'demo-store-changed'

const PREFIX = 'demo:feedback-system:user'

function key(userId: string, resource: string) {
  return `${PREFIX}:${userId}:${resource}`
}

function isBrowser() {
  return typeof window !== 'undefined'
}

function readJson<T>(storageKey: string): T | null {
  if (!isBrowser()) return null
  try {
    const raw = window.localStorage.getItem(storageKey)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

function writeJson(storageKey: string, value: unknown): boolean {
  if (!isBrowser()) return false
  try {
    window.localStorage.setItem(storageKey, JSON.stringify(value))
    return true
  } catch {
    return false
  }
}

function notifyChanged(userId: string) {
  if (isBrowser()) {
    window.dispatchEvent(new CustomEvent(STORE_CHANGED_EVENT, { detail: { userId } }))
  }
}

/** Seeds a user's sandbox on first use only. */
export function ensureSeeded(userId: string) {
  if (!isBrowser()) return
  if (window.localStorage.getItem(key(userId, 'seeded'))) return
  writeJson(key(userId, 'entries'), buildSeedEntries(userId))
  writeJson(key(userId, 'brand'), buildSeedBrand())
  writeJson(key(userId, 'profile'), buildSeedProfile(userId))
  window.localStorage.setItem(key(userId, 'seeded'), new Date().toISOString())
}

/** Restores a user's sandbox to the original seed data. */
export function resetUserData(userId: string) {
  if (!isBrowser()) return
  for (const resource of ['entries', 'brand', 'profile', 'seeded']) {
    window.localStorage.removeItem(key(userId, resource))
  }
  ensureSeeded(userId)
  notifyChanged(userId)
}

function loadEntries(userId: string): FeedbackEntry[] {
  ensureSeeded(userId)
  const entries = readJson<FeedbackEntry[]>(key(userId, 'entries'))
  return Array.isArray(entries) ? entries : []
}

function saveEntries(userId: string, entries: FeedbackEntry[]) {
  writeJson(key(userId, 'entries'), entries)
  notifyChanged(userId)
}

function newId() {
  if (isBrowser() && typeof window.crypto?.randomUUID === 'function') {
    return window.crypto.randomUUID()
  }
  return `entry-${Date.now()}-${Math.floor(Math.random() * 100000)}`
}

/* ------------------------------ Feedback entries ------------------------------ */

export type EntryListParams = {
  page?: number
  status?: 'all' | FeedbackStatus
  q?: string
}

export type EntryListResult = {
  entries: FeedbackEntry[]
  page: number
  pageSize: number
  total: number
  totalPages: number
}

export function listEntries(userId: string, params: EntryListParams = {}): EntryListResult {
  const pageSize = FEEDBACK_LIST_PAGE_SIZE
  const status = params.status ?? 'all'
  const q = (params.q ?? '').trim().toLowerCase()

  let rows = loadEntries(userId)
  if (status !== 'all') rows = rows.filter((row) => row.status === status)
  if (q) {
    rows = rows.filter((row) =>
      [row.full_name, row.email, row.phone, row.location].some((field) =>
        field.toLowerCase().includes(q)
      )
    )
  }
  rows = [...rows].sort((a, b) => b.created_at.localeCompare(a.created_at))

  const total = rows.length
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const page = Math.min(Math.max(1, params.page ?? 1), totalPages)
  const start = (page - 1) * pageSize

  return { entries: rows.slice(start, start + pageSize), page, pageSize, total, totalPages }
}

export function getEntry(userId: string, id: string): FeedbackEntry | null {
  return loadEntries(userId).find((entry) => entry.id === id) ?? null
}

export function updateEntryStatus(
  userId: string,
  id: string,
  status: FeedbackStatus
): FeedbackEntry | null {
  const entries = loadEntries(userId)
  const index = entries.findIndex((entry) => entry.id === id)
  if (index < 0) return null
  const updated = { ...entries[index], status }
  entries[index] = updated
  saveEntries(userId, entries)
  return updated
}

/** Appends a validated customer submission to a sandbox (defaults to the public demo sandbox). */
export function addEntry(
  data: FeedbackFormData,
  userId: string = PUBLIC_SANDBOX_USER_ID
): FeedbackEntry {
  const entries = loadEntries(userId)
  const entry: FeedbackEntry = {
    id: newId(),
    created_at: new Date().toISOString(),
    full_name: data.fullName,
    phone: data.phone,
    email: data.email,
    location: data.location,
    gender: data.gender,
    age_group: data.ageGroup,
    date_of_visit: data.dateOfVisit,
    challenges: [...data.challenges],
    challenge_other: data.challengeOther ? data.challengeOther : null,
    purchase_categories: [...data.purchaseCategories],
    overall_satisfaction: data.overallSatisfaction,
    categories_feedback: data.categoriesFeedback ? data.categoriesFeedback : null,
    status: 'new',
  }
  saveEntries(userId, [entry, ...entries])
  return entry
}

export function getDashboardStats(userId: string): DashboardStats {
  return buildDashboardStats(loadEntries(userId))
}

/* ----------------------------------- Brand ------------------------------------ */

export function getBrand(userId: string = PUBLIC_SANDBOX_USER_ID): BrandSettings {
  ensureSeeded(userId)
  const stored = readJson<Partial<BrandSettings>>(key(userId, 'brand'))
  return {
    brandName: (stored?.brandName ?? DEFAULT_BRAND.brandName).trim(),
    logoUrl: (stored?.logoUrl ?? '').trim(),
    faviconUrl: (stored?.faviconUrl ?? '').trim(),
    locationId: (stored?.locationId ?? DEFAULT_BRAND.locationId ?? '').trim(),
    selectedBranchIds: Array.isArray(stored?.selectedBranchIds)
      ? stored!.selectedBranchIds.filter(Boolean)
      : [...(DEFAULT_BRAND.selectedBranchIds ?? [])],
  }
}

export function saveBrand(userId: string, brand: BrandSettings): { ok: boolean; error?: string } {
  const ok = writeJson(key(userId, 'brand'), brand)
  if (!ok) {
    return {
      ok: false,
      error: 'Browser storage is full. Try a smaller image or reset the demo data.',
    }
  }
  notifyChanged(userId)
  return { ok: true }
}

/* ---------------------------------- Profile ----------------------------------- */

export function getProfile(userId: string): DemoProfile {
  ensureSeeded(userId)
  const stored = readJson<Partial<DemoProfile>>(key(userId, 'profile'))
  return { name: (stored?.name ?? buildSeedProfile(userId).name).trim() }
}

export function saveProfile(userId: string, profile: DemoProfile) {
  writeJson(key(userId, 'profile'), profile)
  notifyChanged(userId)
}
