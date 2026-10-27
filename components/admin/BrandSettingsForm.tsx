'use client'

import { FormEvent, useEffect, useRef, useState } from 'react'
import { ImagePlus, Trash2 } from 'lucide-react'
import { BRAND_FAVICON_UPDATED_EVENT } from '@/components/BrandFavicon'

type BrandState = {
  brandName: string
  logoUrl: string
  faviconUrl: string
}

export default function BrandSettingsForm() {
  const [brandName, setBrandName] = useState('')
  const [logoUrl, setLogoUrl] = useState('')
  const [faviconUrl, setFaviconUrl] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState<'logo' | 'favicon' | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const logoInputRef = useRef<HTMLInputElement>(null)
  const faviconInputRef = useRef<HTMLInputElement>(null)

  function applyBrand(data: Partial<BrandState>) {
    if (typeof data.brandName === 'string') setBrandName(data.brandName)
    if (typeof data.logoUrl === 'string') setLogoUrl(data.logoUrl)
    if (typeof data.faviconUrl === 'string') setFaviconUrl(data.faviconUrl)
  }

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch('/api/admin/brand')
        const data = (await res.json()) as BrandState & { error?: string }
        if (!res.ok) {
          if (!cancelled) setError(data.error || 'Unable to load brand settings.')
          return
        }
        if (!cancelled) {
          applyBrand({
            brandName: data.brandName || '',
            logoUrl: data.logoUrl || '',
            faviconUrl: data.faviconUrl || '',
          })
        }
      } catch {
        if (!cancelled) setError('Network error while loading brand settings.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [])

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    const trimmedName = brandName.trim()
    if (!trimmedName) {
      setError('Brand name is required.')
      setMessage(null)
      return
    }
    setSaving(true)
    setError(null)
    setMessage(null)
    try {
      const res = await fetch('/api/admin/brand', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brandName: trimmedName, logoUrl, faviconUrl }),
      })
      const data = (await res.json()) as BrandState & { error?: string }
      if (!res.ok) {
        setError(data.error || 'Unable to save brand settings.')
        return
      }
      applyBrand(data)
      setMessage('Brand settings saved.')
    } catch {
      setError('Network error while saving.')
    } finally {
      setSaving(false)
    }
  }

  async function uploadAsset(kind: 'logo' | 'favicon', file: File) {
    setUploading(kind)
    setError(null)
    setMessage(null)
    try {
      const form = new FormData()
      form.set('kind', kind)
      form.set('file', file)
      const res = await fetch('/api/admin/brand/upload', {
        method: 'POST',
        body: form,
      })
      const data = (await res.json()) as BrandState & { error?: string }
      if (!res.ok) {
        setError(data.error || `Unable to upload ${kind}.`)
        return
      }
      applyBrand(data)
      if (kind === 'favicon') {
        window.dispatchEvent(
          new CustomEvent(BRAND_FAVICON_UPDATED_EVENT, {
            detail: { faviconUrl: data.faviconUrl || '' },
          })
        )
      }
      setMessage(kind === 'logo' ? 'Logo uploaded.' : 'Favicon uploaded.')
    } catch {
      setError('Network error while uploading.')
    } finally {
      setUploading(null)
    }
  }

  async function clearAsset(kind: 'logo' | 'favicon') {
    setError(null)
    setMessage(null)
    const nextLogo = kind === 'logo' ? '' : logoUrl
    const nextFavicon = kind === 'favicon' ? '' : faviconUrl
    setSaving(true)
    try {
      const res = await fetch('/api/admin/brand', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brandName,
          logoUrl: nextLogo,
          faviconUrl: nextFavicon,
        }),
      })
      const data = (await res.json()) as BrandState & { error?: string }
      if (!res.ok) {
        setError(data.error || `Unable to remove ${kind}.`)
        return
      }
      applyBrand(data)
      if (kind === 'favicon') {
        window.dispatchEvent(
          new CustomEvent(BRAND_FAVICON_UPDATED_EVENT, {
            detail: { faviconUrl: data.faviconUrl || '' },
          })
        )
      }
      setMessage(kind === 'logo' ? 'Logo removed.' : 'Favicon removed.')
    } catch {
      setError('Network error while saving.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <p className="text-sm text-ink-700">Loading brand settings…</p>
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-3xl font-semibold text-ink-900">Brand Settings</h1>
        <p className="mt-1 text-sm text-ink-700">
          Set your brand name, logo, and favicon for the feedback experience.
        </p>
      </div>

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      ) : null}
      {message ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {message}
        </div>
      ) : null}

      <form
        onSubmit={onSubmit}
        className="w-full max-w-3xl space-y-6 rounded-[24px] border border-brand-200 bg-[var(--card)] p-5 shadow-soft sm:p-6 lg:p-7"
      >
        <div>
          <label htmlFor="brandName" className="field-label">
            Brand name <span className="field-required">*</span>
          </label>
          <input
            id="brandName"
            className="field-input"
            value={brandName}
            onChange={(e) => {
              setBrandName(e.target.value)
              setError(null)
            }}
            placeholder="Your store or brand name"
            maxLength={120}
            required
          />
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div className="rounded-2xl border border-brand-100 bg-white/70 p-4">
            <p className="field-label mb-3">
              Brand logo <span className="font-normal text-brand-400">(optional)</span>
            </p>
            <div className="mb-4 flex h-28 items-center justify-center rounded-xl border border-dashed border-brand-200 bg-brand-50/40">
              {logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logoUrl} alt="Brand logo preview" className="max-h-24 max-w-full object-contain" />
              ) : (
                <span className="text-xs text-brand-400">No logo uploaded</span>
              )}
            </div>
            <input
              ref={logoInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/avif,image/svg+xml,.avif"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                e.target.value = ''
                if (file) void uploadAsset('logo', file)
              }}
            />
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className="btn-secondary !px-3 !py-2 text-xs"
                disabled={uploading !== null || saving}
                onClick={() => logoInputRef.current?.click()}
              >
                <ImagePlus className="h-3.5 w-3.5" />
                {uploading === 'logo' ? 'Uploading…' : 'Upload logo'}
              </button>
              {logoUrl ? (
                <button
                  type="button"
                  className="btn-secondary !px-3 !py-2 text-xs hover:!border-red-300 hover:!text-red-700"
                  disabled={uploading !== null || saving}
                  onClick={() => void clearAsset('logo')}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Remove
                </button>
              ) : null}
            </div>
            <p className="mt-2 text-xs text-brand-500">PNG, JPG, WEBP, AVIF, or SVG · max 2MB</p>
          </div>

          <div className="rounded-2xl border border-brand-100 bg-white/70 p-4">
            <p className="field-label mb-3">
              Favicon <span className="font-normal text-brand-400">(optional)</span>
            </p>
            <div className="mb-4 flex h-28 items-center justify-center rounded-xl border border-dashed border-brand-200 bg-brand-50/40">
              {faviconUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={faviconUrl}
                  alt="Favicon preview"
                  className="h-12 w-12 object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                    const fallback = e.currentTarget.nextElementSibling
                    if (fallback instanceof HTMLElement) fallback.hidden = false
                  }}
                />
              ) : null}
              <span className="text-xs text-brand-400" hidden={Boolean(faviconUrl)}>
                {faviconUrl ? 'Uploaded (preview unavailable)' : 'No favicon uploaded'}
              </span>
            </div>
            <input
              ref={faviconInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/avif,image/svg+xml,image/x-icon,.ico,.avif"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                e.target.value = ''
                if (file) void uploadAsset('favicon', file)
              }}
            />
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className="btn-secondary !px-3 !py-2 text-xs"
                disabled={uploading !== null || saving}
                onClick={() => faviconInputRef.current?.click()}
              >
                <ImagePlus className="h-3.5 w-3.5" />
                {uploading === 'favicon' ? 'Uploading…' : 'Upload favicon'}
              </button>
              {faviconUrl ? (
                <button
                  type="button"
                  className="btn-secondary !px-3 !py-2 text-xs hover:!border-red-300 hover:!text-red-700"
                  disabled={uploading !== null || saving}
                  onClick={() => void clearAsset('favicon')}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Remove
                </button>
              ) : null}
            </div>
            <p className="mt-2 text-xs text-brand-500">PNG, JPG, WEBP, AVIF, SVG, or ICO · max 2MB</p>
          </div>
        </div>

        <button type="submit" className="btn-primary" disabled={saving || uploading !== null}>
          {saving ? 'Saving…' : 'Save brand settings'}
        </button>
      </form>
    </div>
  )
}
