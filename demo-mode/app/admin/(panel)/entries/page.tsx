import { Suspense } from 'react'
import FeedbackEntriesPanel from '@/components/admin/FeedbackEntriesPanel'

export default function AdminEntriesPage() {
  return (
    <Suspense fallback={<p className="text-sm text-ink-700">Loading entries…</p>}>
      <FeedbackEntriesPanel />
    </Suspense>
  )
}
