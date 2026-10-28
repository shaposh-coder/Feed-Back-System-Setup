import DemoBanner from '@/components/demo/DemoBanner'
import PublicBrandHeader from '@/components/demo/PublicBrandHeader'
import FeedbackForm from '@/components/feedback/FeedbackForm'
import FeedbackSiteFooter from '@/components/feedback/FeedbackSiteFooter'

export default function HomePage() {
  return (
    <>
      <DemoBanner link="admin" />
      <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col px-4 py-10 sm:px-6 sm:py-14">
        <PublicBrandHeader />

        <FeedbackForm />

        <FeedbackSiteFooter />
      </main>
    </>
  )
}
