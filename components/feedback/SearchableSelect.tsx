'use client'

import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react'
import { ChevronDown, Search } from 'lucide-react'

export type SearchableOption = {
  value: string
  label: string
}

type Props = {
  id: string
  name?: string
  value: string
  options: SearchableOption[]
  placeholder?: string
  disabled?: boolean
  invalid?: boolean
  emptyMessage?: string
  onChange: (value: string) => void
}

export default function SearchableSelect({
  id,
  name,
  value,
  options,
  placeholder = 'Search…',
  disabled = false,
  invalid = false,
  emptyMessage = 'No matches',
  onChange,
}: Props) {
  const listId = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [highlight, setHighlight] = useState(0)

  const selectedLabel = useMemo(
    () => options.find((opt) => opt.value === value)?.label ?? '',
    [options, value]
  )

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return options
    return options.filter(
      (opt) =>
        opt.label.toLowerCase().includes(q) || opt.value.toLowerCase().includes(q)
    )
  }, [options, query])

  useEffect(() => {
    if (!open) setQuery(selectedLabel)
  }, [selectedLabel, open])

  useEffect(() => {
    if (!open) return
    setHighlight(0)
  }, [query, open])

  useEffect(() => {
    if (!open) return
    function onDocPointer(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) {
        setOpen(false)
        setQuery(selectedLabel)
      }
    }
    document.addEventListener('mousedown', onDocPointer)
    return () => document.removeEventListener('mousedown', onDocPointer)
  }, [open, selectedLabel])

  function commit(next: string) {
    onChange(next)
    const label = options.find((opt) => opt.value === next)?.label ?? next
    setQuery(label)
    setOpen(false)
  }

  function openList() {
    if (disabled) return
    setOpen(true)
    setQuery('')
    setHighlight(0)
    requestAnimationFrame(() => inputRef.current?.select())
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (disabled) return
    if (!open && (e.key === 'ArrowDown' || e.key === 'Enter')) {
      e.preventDefault()
      openList()
      return
    }
    if (!open) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlight((prev) => Math.min(prev + 1, Math.max(filtered.length - 1, 0)))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlight((prev) => Math.max(prev - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const choice = filtered[highlight]
      if (choice) commit(choice.value)
    } else if (e.key === 'Escape') {
      e.preventDefault()
      setOpen(false)
      setQuery(selectedLabel)
    }
  }

  return (
    <div ref={rootRef} className="relative">
      {name ? <input type="hidden" name={name} value={value} /> : null}
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-400"
          aria-hidden
        />
        <input
          ref={inputRef}
          id={id}
          type="text"
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-invalid={invalid}
          autoComplete="off"
          disabled={disabled}
          placeholder={placeholder}
          value={open ? query : selectedLabel}
          onChange={(e) => {
            setQuery(e.target.value)
            if (!open) setOpen(true)
          }}
          onFocus={() => {
            if (!disabled) openList()
          }}
          onKeyDown={onKeyDown}
          className={`field-input pl-10 pr-10${invalid ? ' field-invalid' : ''}${
            disabled ? ' cursor-not-allowed opacity-60' : ''
          }`}
        />
        <ChevronDown
          className={`pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-500 transition ${
            open ? 'rotate-180' : ''
          }`}
          aria-hidden
        />
      </div>

      {open && !disabled ? (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-30 mt-1 max-h-56 w-full overflow-auto rounded-xl border border-brand-200 bg-[var(--card)] py-1 shadow-lg"
        >
          {filtered.length === 0 ? (
            <li className="px-3 py-2.5 text-sm text-brand-500">{emptyMessage}</li>
          ) : (
            filtered.map((opt, index) => {
              const active = index === highlight
              const selected = opt.value === value
              return (
                <li key={opt.value} role="option" aria-selected={selected}>
                  <button
                    type="button"
                    className={`flex w-full px-3 py-2.5 text-left text-sm ${
                      active ? 'bg-brand-50 text-brand-800' : 'text-ink-800 hover:bg-brand-50/70'
                    } ${selected ? 'font-semibold' : ''}`}
                    onMouseEnter={() => setHighlight(index)}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => commit(opt.value)}
                  >
                    {opt.label}
                  </button>
                </li>
              )
            })
          )}
        </ul>
      ) : null}
    </div>
  )
}
