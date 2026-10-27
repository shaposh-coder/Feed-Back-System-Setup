import FeedbackBrandHeader from '@/components/feedback/FeedbackBrandHeader'
import FeedbackForm from '@/components/feedback/FeedbackForm'
import { getBrandSettings } from '@/lib/brandSettings'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const brand = await getBrandSettings()

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col px-4 py-10 sm:px-6 sm:py-14">
      <FeedbackBrandHeader brand={brand} />

      <FeedbackForm />

      <footer className="mt-10 text-center text-xs text-brand-500">
        One response per visit · Thank you for your time
      </footer>
    </main>
  )
}
