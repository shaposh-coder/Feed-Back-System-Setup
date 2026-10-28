'use client'

import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react'
import { Pencil, Plus, Trash2, X } from 'lucide-react'
import type { StoreLocation } from '@/lib/storeLocations'

type FlatShop = {
  id: string
  name: string
  locationId: string
  locationName: string
}

type ModalState =
  | { kind: 'location'; mode: 'add' }
  | { kind: 'location'; mode: 'edit'; id: string }
  | { kind: 'shop'; mode: 'add' }
  | { kind: 'shop'; mode: 'edit'; id: string; locationId: string }
  | null

type DeleteState =
  | { kind: 'location'; id: string; name: string }
  | { kind: 'shop'; id: string; locationId: string; name: string }
  | null

export default function LocationsBranchesPanel() {
  const [locations, setLocations] = useState<StoreLocation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [locationName, setLocationName] = useState('')
  const [shopName, setShopName] = useState('')
  const [shopLocationId, setShopLocationId] = useState('')
  const [busy, setBusy] = useState(false)
  const [modal, setModal] = useState<ModalState>(null)
  const [modalError, setModalError] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<DeleteState>(null)

  const shops = useMemo<FlatShop[]>(() => {
    return locations.flatMap((loc) =>
      loc.branches.map((br) => ({
        id: br.id,
        name: br.name,
        locationId: loc.id,
        locationName: loc.name,
      }))
    )
  }, [locations])

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/locations')
      const data = (await res.json()) as { locations?: StoreLocation[]; error?: string }
      if (!res.ok) {
        setError(data.error || 'Unable to load locations.')
        setLocations([])
        return
      }
      const next = data.locations || []
      setLocations(next)
      setShopLocationId((prev) => {
        if (prev && next.some((loc) => loc.id === prev)) return prev
        return next[0]?.id || ''
      })
    } catch {
      setError('Network error while loading locations.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    if (!modal && !deleteConfirm) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !busy) {
        setModal(null)
        setDeleteConfirm(null)
        setModalError(null)
      }
    }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [modal, deleteConfirm, busy])

  function openAddLocation() {
    setLocationName('')
    setModalError(null)
    setModal({ kind: 'location', mode: 'add' })
  }

  function openEditLocation(loc: StoreLocation) {
    setLocationName(loc.name)
    setModalError(null)
    setModal({ kind: 'location', mode: 'edit', id: loc.id })
  }

  function openAddShop() {
    setShopName('')
    setModalError(null)
    setShopLocationId((prev) => prev || locations[0]?.id || '')
    setModal({ kind: 'shop', mode: 'add' })
  }

  function openEditShop(shop: FlatShop) {
    setShopName(shop.name)
    setShopLocationId(shop.locationId)
    setModalError(null)
    setModal({ kind: 'shop', mode: 'edit', id: shop.id, locationId: shop.locationId })
  }

  function closeModal() {
    if (busy) return
    setModal(null)
    setModalError(null)
  }

  async function saveLocation(e: FormEvent) {
    e.preventDefault()
    if (!modal || modal.kind !== 'location') return
    const name = locationName.trim()
    if (!name) {
      setModalError('Location name is required.')
      return
    }
    setBusy(true)
    setModalError(null)
    setError(null)
    setMessage(null)
    try {
      if (modal.mode === 'add') {
        const res = await fetch('/api/admin/locations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name }),
        })
        const data = (await res.json()) as { location?: StoreLocation; error?: string }
        if (!res.ok) {
          setModalError(data.error || 'Unable to add location.')
          return
        }
        if (data.location) {
          setLocations((prev) => [...prev, data.location!])
          setShopLocationId((prev) => prev || data.location!.id)
        }
        setMessage('Location added.')
      } else {
        const res = await fetch(`/api/admin/locations/${modal.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name }),
        })
        const data = (await res.json()) as {
          location?: { id: string; name: string }
          error?: string
        }
        if (!res.ok) {
          setModalError(data.error || 'Unable to update location.')
          return
        }
        if (data.location) {
          setLocations((prev) =>
            prev.map((loc) =>
              loc.id === data.location!.id ? { ...loc, name: data.location!.name } : loc
            )
          )
        }
        setMessage('Location updated.')
      }
      setModal(null)
    } catch {
      setModalError('Network error while saving location.')
    } finally {
      setBusy(false)
    }
  }

  async function saveShop(e: FormEvent) {
    e.preventDefault()
    if (!modal || modal.kind !== 'shop') return
    const name = shopName.trim()
    if (!shopLocationId) {
      setModalError('Select a location for the shop.')
      return
    }
    if (!name) {
      setModalError('Shop name is required.')
      return
    }
    setBusy(true)
    setModalError(null)
    setError(null)
    setMessage(null)
    try {
      if (modal.mode === 'add') {
        const res = await fetch(`/api/admin/locations/${shopLocationId}/branches`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name }),
        })
        const data = (await res.json()) as {
          branch?: { id: string; name: string; sortOrder: number; isActive: boolean }
          error?: string
        }
        if (!res.ok) {
          setModalError(data.error || 'Unable to add shop.')
          return
        }
        if (data.branch) {
          setLocations((prev) =>
            prev.map((loc) =>
              loc.id === shopLocationId
                ? {
                    ...loc,
                    branches: [
                      ...loc.branches,
                      {
                        id: data.branch!.id,
                        name: data.branch!.name,
                        sortOrder: data.branch!.sortOrder,
                        isActive: data.branch!.isActive,
                      },
                    ],
                  }
                : loc
            )
          )
        }
        setMessage('Shop added.')
      } else {
        const res = await fetch(`/api/admin/branches/${modal.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, locationId: shopLocationId }),
        })
        const data = (await res.json()) as {
          branch?: {
            id: string
            locationId: string
            name: string
            sortOrder: number
            isActive: boolean
          }
          error?: string
        }
        if (!res.ok) {
          setModalError(data.error || 'Unable to update shop.')
          return
        }
        if (data.branch) {
          const updated = data.branch
          setLocations((prev) =>
            prev.map((loc) => ({
              ...loc,
              branches:
                loc.id === updated.locationId
                  ? [
                      ...loc.branches.filter((br) => br.id !== updated.id),
                      {
                        id: updated.id,
                        name: updated.name,
                        sortOrder: updated.sortOrder,
                        isActive: updated.isActive,
                      },
                    ]
                  : loc.branches.filter((br) => br.id !== updated.id),
            }))
          )
        }
        setMessage('Shop updated.')
      }
      setModal(null)
    } catch {
      setModalError('Network error while saving shop.')
    } finally {
      setBusy(false)
    }
  }

  async function confirmDelete() {
    if (!deleteConfirm) return
    setBusy(true)
    setError(null)
    setMessage(null)
    try {
      if (deleteConfirm.kind === 'location') {
        const res = await fetch(`/api/admin/locations/${deleteConfirm.id}`, { method: 'DELETE' })
        const data = (await res.json()) as { error?: string }
        if (!res.ok) {
          setError(data.error || 'Unable to delete location.')
          return
        }
        setLocations((prev) => {
          const next = prev.filter((loc) => loc.id !== deleteConfirm.id)
          setShopLocationId((current) =>
            current === deleteConfirm.id ? next[0]?.id || '' : current
          )
          return next
        })
        setMessage('Location deleted.')
      } else {
        const res = await fetch(`/api/admin/branches/${deleteConfirm.id}`, { method: 'DELETE' })
        const data = (await res.json()) as { error?: string }
        if (!res.ok) {
          setError(data.error || 'Unable to delete shop.')
          return
        }
        setLocations((prev) =>
          prev.map((loc) =>
            loc.id === deleteConfirm.locationId
              ? { ...loc, branches: loc.branches.filter((br) => br.id !== deleteConfirm.id) }
              : loc
          )
        )
        setMessage('Shop deleted.')
      }
      setDeleteConfirm(null)
    } catch {
      setError('Network error while deleting.')
    } finally {
      setBusy(false)
    }
  }

  function ActionButtons({
    onEdit,
    onDelete,
    editLabel,
    deleteLabel,
  }: {
    onEdit: () => void
    onDelete: () => void
    editLabel: string
    deleteLabel: string
  }) {
    return (
      <div className="flex items-center justify-end gap-1 shrink-0">
        <button
          type="button"
          className="rounded-md p-2 text-brand-700 hover:bg-brand-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
          disabled={busy}
          onClick={onEdit}
          aria-label={editLabel}
          title="Edit"
        >
          <Pencil className="h-4 w-4" />
        </button>
        <button
          type="button"
          className="rounded-md p-2 text-red-600 hover:bg-red-50 hover:text-red-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
          disabled={busy}
          onClick={onDelete}
          aria-label={deleteLabel}
          title="Delete"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    )
  }

  function SectionHeader({
    title,
    subtitle,
    onAdd,
    addDisabled,
    addLabel,
  }: {
    title: string
    subtitle: string
    onAdd: () => void
    addDisabled?: boolean
    addLabel: string
  }) {
    return (
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h2 className="truncate text-lg font-bold text-ink-900 sm:text-xl">{title}</h2>
          <p className="mt-0.5 text-xs text-brand-500 sm:text-sm">{subtitle}</p>
        </div>
        <button
          type="button"
          onClick={onAdd}
          disabled={addDisabled || busy}
          className="shrink-0 rounded-md bg-brand-700 p-2.5 text-white hover:bg-brand-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 disabled:cursor-not-allowed disabled:opacity-50 lg:hidden"
          aria-label={addLabel}
        >
          <Plus className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={onAdd}
          disabled={addDisabled || busy}
          className="hidden shrink-0 items-center gap-2 rounded-md bg-brand-700 px-4 py-2 text-sm font-medium text-white hover:bg-brand-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 lg:inline-flex"
        >
          <Plus className="h-4 w-4" />
          {addLabel}
        </button>
      </div>
    )
  }

  if (loading) {
    return <p className="text-sm text-ink-700">Loading locations…</p>
  }

  const modalTitle =
    modal?.kind === 'location'
      ? modal.mode === 'add'
        ? 'Add location'
        : 'Edit location'
      : modal?.kind === 'shop'
        ? modal.mode === 'add'
          ? 'Add shop'
          : 'Edit shop'
        : ''

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink-900 sm:text-3xl">
          Locations & Branches
        </h1>
        <p className="mt-1 text-sm text-ink-700">
          Manage store locations and shops. Add from the header buttons; edit or delete from Actions.
        </p>
      </div>

      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      ) : null}
      {message ? (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {message}
        </div>
      ) : null}

      {/* Profile-style: stacked mobile, side-by-side desktop */}
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2 lg:gap-6">
        {/* ---------- Locations ---------- */}
        <section className="min-w-0">
          <SectionHeader
            title="Locations"
            subtitle="Cities or regions only"
            onAdd={openAddLocation}
            addLabel="Add location"
          />

          {/* Mobile cards — Courier pattern */}
          <div className={`space-y-3 lg:hidden ${busy ? 'pointer-events-none opacity-70' : ''}`}>
            {locations.length === 0 ? (
              <div className="rounded-xl border border-brand-100 bg-[var(--card)] px-4 py-8 text-center text-sm text-brand-500 shadow-md">
                No locations yet. Tap + to add one.
              </div>
            ) : (
              locations.map((loc) => (
                <div
                  key={loc.id}
                  className="rounded-xl border border-brand-100 bg-[var(--card)] p-4 shadow-md"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-base font-semibold text-ink-900">{loc.name}</p>
                      <p className="mt-0.5 text-xs text-brand-500">
                        {loc.branches.length} shop{loc.branches.length === 1 ? '' : 's'}
                      </p>
                    </div>
                    <ActionButtons
                      editLabel={`Edit ${loc.name}`}
                      deleteLabel={`Delete ${loc.name}`}
                      onEdit={() => openEditLocation(loc)}
                      onDelete={() =>
                        setDeleteConfirm({ kind: 'location', id: loc.id, name: loc.name })
                      }
                    />
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Desktop table — Courier pattern */}
          <div className="hidden overflow-hidden rounded-lg border border-brand-200 bg-[var(--card)] shadow lg:block">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[28rem] table-fixed divide-y divide-brand-100">
                <colgroup>
                  <col className="w-12" />
                  <col />
                  <col className="w-20" />
                  <col className="w-24" />
                </colgroup>
                <thead className="bg-brand-50">
                  <tr>
                    <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-brand-600">
                      #
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-brand-600">
                      Location
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-brand-600">
                      Shops
                    </th>
                    <th className="px-3 py-3 text-right text-xs font-medium uppercase tracking-wider text-brand-600">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-100 bg-[var(--card)]">
                  {locations.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-sm text-brand-500">
                        No locations yet. Click &quot;Add location&quot; to add one.
                      </td>
                    </tr>
                  ) : (
                    locations.map((loc, index) => (
                      <tr key={loc.id} className="hover:bg-brand-50/50">
                        <td className="whitespace-nowrap px-3 py-3 text-sm text-brand-500">
                          {index + 1}
                        </td>
                        <td className="truncate px-3 py-3 text-sm font-medium text-ink-900" title={loc.name}>
                          {loc.name}
                        </td>
                        <td className="whitespace-nowrap px-3 py-3 text-sm text-ink-700">
                          {loc.branches.length}
                        </td>
                        <td className="px-2 py-3 text-right">
                          <ActionButtons
                            editLabel={`Edit ${loc.name}`}
                            deleteLabel={`Delete ${loc.name}`}
                            onEdit={() => openEditLocation(loc)}
                            onDelete={() =>
                              setDeleteConfirm({ kind: 'location', id: loc.id, name: loc.name })
                            }
                          />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ---------- Shops ---------- */}
        <section className="min-w-0">
          <SectionHeader
            title="Shops"
            subtitle="Shop name with location"
            onAdd={openAddShop}
            addDisabled={locations.length === 0}
            addLabel="Add shop"
          />

          <div className={`space-y-3 lg:hidden ${busy ? 'pointer-events-none opacity-70' : ''}`}>
            {shops.length === 0 ? (
              <div className="rounded-xl border border-brand-100 bg-[var(--card)] px-4 py-8 text-center text-sm text-brand-500 shadow-md">
                {locations.length === 0
                  ? 'Add a location first, then add shops.'
                  : 'No shops yet. Tap + to add one.'}
              </div>
            ) : (
              shops.map((shop) => (
                <div
                  key={shop.id}
                  className="rounded-xl border border-brand-100 bg-[var(--card)] p-4 shadow-md"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-base font-semibold text-ink-900">{shop.name}</p>
                      <p className="mt-0.5 truncate text-xs text-brand-500">{shop.locationName}</p>
                    </div>
                    <ActionButtons
                      editLabel={`Edit ${shop.name}`}
                      deleteLabel={`Delete ${shop.name}`}
                      onEdit={() => openEditShop(shop)}
                      onDelete={() =>
                        setDeleteConfirm({
                          kind: 'shop',
                          id: shop.id,
                          locationId: shop.locationId,
                          name: shop.name,
                        })
                      }
                    />
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="hidden overflow-hidden rounded-lg border border-brand-200 bg-[var(--card)] shadow lg:block">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[28rem] table-fixed divide-y divide-brand-100">
                <colgroup>
                  <col className="w-12" />
                  <col />
                  <col className="w-28" />
                  <col className="w-24" />
                </colgroup>
                <thead className="bg-brand-50">
                  <tr>
                    <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-brand-600">
                      #
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-brand-600">
                      Shop name
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-brand-600">
                      Location
                    </th>
                    <th className="px-3 py-3 text-right text-xs font-medium uppercase tracking-wider text-brand-600">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-100 bg-[var(--card)]">
                  {shops.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-sm text-brand-500">
                        {locations.length === 0
                          ? 'Add a location first, then add shops.'
                          : 'No shops yet. Click “Add shop” to add one.'}
                      </td>
                    </tr>
                  ) : (
                    shops.map((shop, index) => (
                      <tr key={shop.id} className="hover:bg-brand-50/50">
                        <td className="whitespace-nowrap px-3 py-3 text-sm text-brand-500">
                          {index + 1}
                        </td>
                        <td className="truncate px-3 py-3 text-sm font-medium text-ink-900" title={shop.name}>
                          {shop.name}
                        </td>
                        <td className="truncate px-3 py-3 text-sm text-ink-700" title={shop.locationName}>
                          {shop.locationName}
                        </td>
                        <td className="px-2 py-3 text-right">
                          <ActionButtons
                            editLabel={`Edit ${shop.name}`}
                            deleteLabel={`Delete ${shop.name}`}
                            onEdit={() => openEditShop(shop)}
                            onDelete={() =>
                              setDeleteConfirm({
                                kind: 'shop',
                                id: shop.id,
                                locationId: shop.locationId,
                                name: shop.name,
                              })
                            }
                          />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>

      {/* Add / Edit modal — Courier FormModal pattern */}
      {modal ? (
        <div
          className="fixed inset-0 z-[60] flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="locations-modal-title"
          onClick={closeModal}
        >
          <div
            className="flex max-h-[92dvh] w-full max-w-md flex-col overflow-hidden rounded-t-2xl border border-brand-200 bg-[var(--card)] shadow-xl sm:my-8 sm:max-h-[90vh] sm:rounded-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex shrink-0 items-center justify-between gap-3 bg-brand-700 px-4 pb-3 pt-4 sm:px-6 sm:pb-4 sm:pt-6">
              <div className="min-w-0">
                <h3 id="locations-modal-title" className="truncate text-lg font-semibold text-white sm:text-xl">
                  {modalTitle}
                </h3>
                <p className="mt-0.5 text-sm text-white/80">
                  {modal.kind === 'location'
                    ? 'Enter a city or region name.'
                    : 'Choose a location, then enter the shop name.'}
                </p>
              </div>
              <button
                type="button"
                className="shrink-0 rounded-full p-2 text-white/90 hover:bg-white/15 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50 disabled:opacity-50"
                disabled={busy}
                onClick={closeModal}
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-6">
              {modalError ? (
                <div className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-800">
                  {modalError}
                </div>
              ) : null}

              {modal.kind === 'location' ? (
                <form id="location-form" onSubmit={saveLocation} className="space-y-4">
                  <div>
                    <label htmlFor="modalLocationName" className="mb-1 block text-sm font-medium text-ink-800">
                      Location name
                    </label>
                    <input
                      id="modalLocationName"
                      className="field-input"
                      value={locationName}
                      onChange={(e) => setLocationName(e.target.value)}
                      placeholder="e.g. Karachi"
                      maxLength={120}
                      autoFocus
                      required
                    />
                  </div>
                </form>
              ) : (
                <form id="shop-form" onSubmit={saveShop} className="space-y-4">
                  <div>
                    <label htmlFor="modalShopLocation" className="mb-1 block text-sm font-medium text-ink-800">
                      Location
                    </label>
                    <select
                      id="modalShopLocation"
                      className="field-select"
                      value={shopLocationId}
                      onChange={(e) => setShopLocationId(e.target.value)}
                      required
                    >
                      {locations.map((loc) => (
                        <option key={loc.id} value={loc.id}>
                          {loc.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="modalShopName" className="mb-1 block text-sm font-medium text-ink-800">
                      Shop name
                    </label>
                    <input
                      id="modalShopName"
                      className="field-input"
                      value={shopName}
                      onChange={(e) => setShopName(e.target.value)}
                      placeholder="e.g. Clifton"
                      maxLength={120}
                      autoFocus
                      required
                    />
                  </div>
                </form>
              )}
            </div>

            <div className="flex shrink-0 flex-wrap gap-2 bg-brand-700 px-4 py-3 sm:px-6 sm:py-4">
              <button
                type="submit"
                form={modal.kind === 'location' ? 'location-form' : 'shop-form'}
                disabled={busy}
                className="flex-1 rounded-md bg-white px-4 py-2.5 font-medium text-brand-700 hover:bg-brand-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50 disabled:opacity-50 sm:flex-none"
              >
                {busy
                  ? 'Saving…'
                  : modal.mode === 'add'
                    ? modal.kind === 'location'
                      ? 'Add'
                      : 'Add'
                    : 'Save'}
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={closeModal}
                className="flex-1 rounded-md border border-white/30 bg-white/15 px-4 py-2.5 font-medium text-white hover:bg-white/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50 disabled:opacity-50 sm:flex-none"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Delete confirm — Courier pattern */}
      {deleteConfirm ? (
        <div
          className="fixed inset-0 z-[60] flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-title"
        >
          <div className="flex w-full max-w-sm flex-col overflow-hidden rounded-t-2xl border border-brand-200 bg-[var(--card)] shadow-xl sm:rounded-lg">
            <div className="flex items-center justify-between gap-3 bg-brand-700 px-4 py-4 sm:px-6">
              <h3 id="delete-title" className="text-lg font-semibold text-white">
                {deleteConfirm.kind === 'location' ? 'Delete location?' : 'Delete shop?'}
              </h3>
              <button
                type="button"
                className="rounded-full p-2 text-white/90 hover:bg-white/15"
                onClick={() => setDeleteConfirm(null)}
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="px-4 py-4 text-sm text-ink-700 sm:px-6">
              {deleteConfirm.kind === 'location'
                ? `Delete “${deleteConfirm.name}” and all of its shops? This cannot be undone.`
                : `Delete “${deleteConfirm.name}”? This cannot be undone.`}
            </div>
            <div className="flex justify-end gap-2 bg-brand-700 px-4 py-3 sm:px-6">
              <button
                type="button"
                className="rounded-md border border-white/30 bg-white/15 px-4 py-2.5 font-medium text-white hover:bg-white/25"
                disabled={busy}
                onClick={() => setDeleteConfirm(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="rounded-md bg-red-500 px-4 py-2.5 font-medium text-white hover:bg-red-400 disabled:opacity-50"
                disabled={busy}
                onClick={() => void confirmDelete()}
              >
                {busy ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
