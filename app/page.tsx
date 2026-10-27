import FeedbackForm from '@/components/feedback/FeedbackForm'

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col px-4 py-10 sm:px-6 sm:py-14">
      <header className="mb-8 sm:mb-10">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-600">
          Store feedback
        </p>
        <h1 className="mt-3 font-display text-4xl font-semibold leading-tight text-ink-900 sm:text-5xl">
          We value your visit
        </h1>
        <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-ink-700 sm:text-base">
          Please take a minute to share your experience. Your answers are saved securely and help
          us serve you better on your next visit.
        </p>
      </header>

      <FeedbackForm />

      <footer className="mt-10 text-center text-xs text-brand-500">
        One response per visit · Thank you for your time
      </footer>
    </main>
  )
}
