'use client'

import { FormEvent, useEffect, useMemo, useState } from 'react'
import { Pencil, Plus, Trash2, X } from 'lucide-react'
import { useAdminSession } from '@/components/admin/AdminGuard'
import {
  addBranch,
  addLocation,
  deleteBranch,
  deleteLocation,
  getLocations,
  updateBranch,
  updateLocation,
} from '@/lib/demoLocations'
import type { DemoStoreLocation } from '@/lib/demoStore'
import { canEdit } from '@/lib/demoUsers'

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
  | { kind: 'shop'; mode: 'edit'; id: string }
  | null

type DeleteState =
  | { kind: 'location'; id: string; name: string }
  | { kind: 'shop'; id: string; locationId: string; name: string }
  | null

export default function LocationsBranchesPanel() {
  const { userId, role } = useAdminSession()
  const editable = canEdit(role)
  const [locations, setLocations] = useState<DemoStoreLocation[]>([])
  const [locationName, setLocationName] = useState('')
  const [shopName, setShopName] = useState('')
  const [shopLocationId, setShopLocationId] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
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

  function refresh() {
    const next = getLocations(userId)
    setLocations(next)
    setShopLocationId((prev) => {
      if (prev && next.some((loc) => loc.id === prev)) return prev
      return next[0]?.id || ''
    })
  }

  useEffect(() => {
    refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId])

  useEffect(() => {
    if (!modal && !deleteConfirm) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
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
  }, [modal, deleteConfirm])

  function closeModal() {
    setModal(null)
    setModalError(null)
  }

  function openAddLocation() {
    if (!editable) return
    setLocationName('')
    setModalError(null)
    setModal({ kind: 'location', mode: 'add' })
  }

  function openEditLocation(loc: DemoStoreLocation) {
    if (!editable) return
    setLocationName(loc.name)
    setModalError(null)
    setModal({ kind: 'location', mode: 'edit', id: loc.id })
  }

  function openAddShop() {
    if (!editable) return
    setShopName('')
    setModalError(null)
    setShopLocationId((prev) => prev || locations[0]?.id || '')
    setModal({ kind: 'shop', mode: 'add' })
  }

  function openEditShop(shop: FlatShop) {
    if (!editable) return
    setShopName(shop.name)
    setShopLocationId(shop.locationId)
    setModalError(null)
    setModal({ kind: 'shop', mode: 'edit', id: shop.id })
  }

  function onSaveLocation(e: FormEvent) {
    e.preventDefault()
    if (!editable || !modal || modal.kind !== 'location') return
    if (modal.mode === 'add') {
      const result = addLocation(userId, locationName)
      if (!result.ok) {
        setModalError(result.error || 'Unable to add location.')
        return
      }
      setMessage('Location added.')
    } else {
      const result = updateLocation(userId, modal.id, locationName)
      if (!result.ok) {
        setModalError(result.error || 'Unable to update location.')
        return
      }
      setMessage('Location updated.')
    }
    setError(null)
    setModal(null)
    setModalError(null)
    refresh()
  }

  function onSaveShop(e: FormEvent) {
    e.preventDefault()
    if (!editable || !modal || modal.kind !== 'shop') return
    if (!shopLocationId) {
      setModalError('Select a location for the shop.')
      return
    }
    if (modal.mode === 'add') {
      const result = addBranch(userId, shopLocationId, shopName)
      if (!result.ok) {
        setModalError(result.error || 'Unable to add shop.')
        return
      }
      setMessage('Shop added.')
    } else {
      const result = updateBranch(userId, modal.id, shopName, shopLocationId)
      if (!result.ok) {
        setModalError(result.error || 'Unable to update shop.')
        return
      }
      setMessage('Shop updated.')
    }
    setError(null)
    setModal(null)
    setModalError(null)
    refresh()
  }

  function confirmDelete() {
    if (!editable || !deleteConfirm) return
    if (deleteConfirm.kind === 'location') {
      deleteLocation(userId, deleteConfirm.id)
      setMessage('Location deleted.')
    } else {
      deleteBranch(userId, deleteConfirm.locationId, deleteConfirm.id)
      setMessage('Shop deleted.')
    }
    setError(null)
    setDeleteConfirm(null)
    refresh()
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
    if (!editable) return <span className="text-xs text-brand-400">—</span>
    return (
      <div className="flex shrink-0 items-center justify-end gap-1">
        <button
          type="button"
          className="rounded-md p-2 text-brand-700 hover:bg-brand-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
          onClick={onEdit}
          aria-label={editLabel}
          title="Edit"
        >
          <Pencil className="h-4 w-4" />
        </button>
        <button
          type="button"
          className="rounded-md p-2 text-red-600 hover:bg-red-50 hover:text-red-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
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
          disabled={addDisabled || !editable}
          className="shrink-0 rounded-md bg-brand-700 p-2.5 text-white hover:bg-brand-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 disabled:cursor-not-allowed disabled:opacity-50 lg:hidden"
          aria-label={addLabel}
        >
          <Plus className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={onAdd}
          disabled={addDisabled || !editable}
          className="hidden shrink-0 items-center gap-2 rounded-md bg-brand-700 px-4 py-2 text-sm font-medium text-white hover:bg-brand-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 lg:inline-flex"
        >
          <Plus className="h-4 w-4" />
          {addLabel}
        </button>
      </div>
    )
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

      {!editable ? (
        <div className="rounded-md border border-brand-200 bg-brand-50/70 px-4 py-3 text-sm text-ink-700">
          This demo account has read-only access. Sign in as the Administrator or Store Manager to
          edit locations.
        </div>
      ) : null}
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

          {/* Mobile cards */}
          <div className="space-y-3 lg:hidden">
            {locations.length === 0 ? (
              <div className="rounded-xl border border-brand-100 bg-[var(--card)] px-4 py-8 text-center text-sm text-brand-500 shadow-md">
                {editable ? 'No locations yet. Tap + to add one.' : 'No locations yet.'}
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

          {/* Desktop table */}
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
                        {editable
                          ? 'No locations yet. Click “Add location” to add one.'
                          : 'No locations yet.'}
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

          <div className="space-y-3 lg:hidden">
            {shops.length === 0 ? (
              <div className="rounded-xl border border-brand-100 bg-[var(--card)] px-4 py-8 text-center text-sm text-brand-500 shadow-md">
                {locations.length === 0
                  ? 'Add a location first, then add shops.'
                  : editable
                    ? 'No shops yet. Tap + to add one.'
                    : 'No shops yet.'}
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
                          : editable
                            ? 'No shops yet. Click “Add shop” to add one.'
                            : 'No shops yet.'}
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

      {/* Add / Edit modal */}
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
                <h3
                  id="locations-modal-title"
                  className="truncate text-lg font-semibold text-white sm:text-xl"
                >
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
                className="shrink-0 rounded-full p-2 text-white/90 hover:bg-white/15 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
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
                <form id="location-form" onSubmit={onSaveLocation} className="space-y-4">
                  <div>
                    <label
                      htmlFor="modalLocationName"
                      className="mb-1 block text-sm font-medium text-ink-800"
                    >
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
                <form id="shop-form" onSubmit={onSaveShop} className="space-y-4">
                  <div>
                    <label
                      htmlFor="modalShopLocation"
                      className="mb-1 block text-sm font-medium text-ink-800"
                    >
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
                    <label
                      htmlFor="modalShopName"
                      className="mb-1 block text-sm font-medium text-ink-800"
                    >
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
                className="flex-1 rounded-md bg-white px-4 py-2.5 font-medium text-brand-700 hover:bg-brand-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50 sm:flex-none"
              >
                {modal.mode === 'add' ? 'Add' : 'Save'}
              </button>
              <button
                type="button"
                onClick={closeModal}
                className="flex-1 rounded-md border border-white/30 bg-white/15 px-4 py-2.5 font-medium text-white hover:bg-white/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50 sm:flex-none"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Delete confirm */}
      {deleteConfirm ? (
        <div
          className="fixed inset-0 z-[60] flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-title"
          onClick={() => setDeleteConfirm(null)}
        >
          <div
            className="flex w-full max-w-sm flex-col overflow-hidden rounded-t-2xl border border-brand-200 bg-[var(--card)] shadow-xl sm:rounded-lg"
            onClick={(e) => e.stopPropagation()}
          >
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
                onClick={() => setDeleteConfirm(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="rounded-md bg-red-500 px-4 py-2.5 font-medium text-white hover:bg-red-400"
                onClick={confirmDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
