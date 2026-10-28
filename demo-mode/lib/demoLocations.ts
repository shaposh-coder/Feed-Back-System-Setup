/**
 * Demo Mode catalog for store locations + branches (localStorage).
 * Keyed per user: demo:feedback-system:user:{userId}:locations
 */

import { DEMO_STORE_LOCATIONS } from '@/lib/demoSeed'
import type { DemoStoreLocation } from '@/lib/demoStore'
import { PUBLIC_SANDBOX_USER_ID, STORE_CHANGED_EVENT } from '@/lib/demoStore'

const PREFIX = 'demo:feedback-system:user'

function key(userId: string) {
  return `${PREFIX}:${userId}:locations`
}

function isBrowser() {
  return typeof window !== 'undefined'
}

function read(userId: string): DemoStoreLocation[] | null {
  if (!isBrowser()) return null
  try {
    const raw = window.localStorage.getItem(key(userId))
    return raw ? (JSON.parse(raw) as DemoStoreLocation[]) : null
  } catch {
    return null
  }
}

function write(userId: string, locations: DemoStoreLocation[]) {
  if (!isBrowser()) return false
  try {
    window.localStorage.setItem(key(userId), JSON.stringify(locations))
    window.dispatchEvent(new Event(STORE_CHANGED_EVENT))
    return true
  } catch {
    return false
  }
}

function cloneSeed(): DemoStoreLocation[] {
  return DEMO_STORE_LOCATIONS.map((loc) => ({
    ...loc,
    branches: loc.branches.map((br) => ({ ...br })),
  }))
}

export function getLocations(userId: string = PUBLIC_SANDBOX_USER_ID): DemoStoreLocation[] {
  const stored = read(userId)
  if (stored && Array.isArray(stored)) return stored
  const seed = cloneSeed()
  write(userId, seed)
  return seed
}

export function addLocation(userId: string, name: string): { ok: boolean; location?: DemoStoreLocation; error?: string } {
  const trimmed = name.trim()
  if (!trimmed) return { ok: false, error: 'Location name is required.' }
  const locations = getLocations(userId)
  if (locations.some((loc) => loc.name.toLowerCase() === trimmed.toLowerCase())) {
    return { ok: false, error: 'A location with this name already exists.' }
  }
  const location: DemoStoreLocation = {
    id: `loc-${Date.now()}`,
    name: trimmed,
    branches: [],
  }
  write(userId, [...locations, location])
  return { ok: true, location }
}

export function deleteLocation(userId: string, locationId: string): { ok: boolean; error?: string } {
  const locations = getLocations(userId).filter((loc) => loc.id !== locationId)
  write(userId, locations)
  return { ok: true }
}

export function addBranch(
  userId: string,
  locationId: string,
  name: string
): { ok: boolean; branch?: { id: string; name: string }; error?: string } {
  const trimmed = name.trim()
  if (!trimmed) return { ok: false, error: 'Branch name is required.' }
  const locations = getLocations(userId)
  const loc = locations.find((item) => item.id === locationId)
  if (!loc) return { ok: false, error: 'Location not found.' }
  if (loc.branches.some((br) => br.name.toLowerCase() === trimmed.toLowerCase())) {
    return { ok: false, error: 'A branch with this name already exists in this location.' }
  }
  const branch = { id: `br-${Date.now()}`, name: trimmed }
  const next = locations.map((item) =>
    item.id === locationId ? { ...item, branches: [...item.branches, branch] } : item
  )
  write(userId, next)
  return { ok: true, branch }
}

export function deleteBranch(
  userId: string,
  locationId: string,
  branchId: string
): { ok: boolean; error?: string } {
  const next = getLocations(userId).map((loc) =>
    loc.id === locationId
      ? { ...loc, branches: loc.branches.filter((br) => br.id !== branchId) }
      : loc
  )
  write(userId, next)
  return { ok: true }
}

export function updateLocation(
  userId: string,
  locationId: string,
  name: string
): { ok: boolean; error?: string } {
  const trimmed = name.trim()
  if (!trimmed) return { ok: false, error: 'Location name is required.' }
  const locations = getLocations(userId)
  if (
    locations.some(
      (loc) => loc.id !== locationId && loc.name.toLowerCase() === trimmed.toLowerCase()
    )
  ) {
    return { ok: false, error: 'A location with this name already exists.' }
  }
  if (!locations.some((loc) => loc.id === locationId)) {
    return { ok: false, error: 'Location not found.' }
  }
  write(
    userId,
    locations.map((loc) => (loc.id === locationId ? { ...loc, name: trimmed } : loc))
  )
  return { ok: true }
}

export function updateBranch(
  userId: string,
  branchId: string,
  name: string,
  locationId: string
): { ok: boolean; error?: string } {
  const trimmed = name.trim()
  if (!trimmed) return { ok: false, error: 'Branch name is required.' }
  const locations = getLocations(userId)
  const targetLoc = locations.find((loc) => loc.id === locationId)
  if (!targetLoc) return { ok: false, error: 'Location not found.' }

  let found = false
  let branch: { id: string; name: string } | null = null
  for (const loc of locations) {
    const hit = loc.branches.find((br) => br.id === branchId)
    if (hit) {
      found = true
      branch = hit
      break
    }
  }
  if (!found || !branch) return { ok: false, error: 'Shop not found.' }

  if (
    targetLoc.branches.some(
      (br) => br.id !== branchId && br.name.toLowerCase() === trimmed.toLowerCase()
    )
  ) {
    return { ok: false, error: 'A branch with this name already exists in this location.' }
  }

  const next = locations.map((loc) => ({
    ...loc,
    branches: loc.branches.filter((br) => br.id !== branchId),
  }))
  const withBranch = next.map((loc) =>
    loc.id === locationId
      ? { ...loc, branches: [...loc.branches, { id: branchId, name: trimmed }] }
      : loc
  )
  write(userId, withBranch)
  return { ok: true }
}
