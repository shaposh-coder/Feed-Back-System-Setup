import BrandHomeLink from '@/components/feedback/BrandHomeLink'
import type { BrandSettings } from '@/lib/brandSettings'

export default function FeedbackBrandHeader({ brand }: { brand: BrandSettings }) {
  const hasLogo = Boolean(brand.logoUrl)
  const hasName = Boolean(brand.brandName)

  return (
    <header className="mb-8 sm:mb-10">
      <div className="mb-5 flex justify-center">
        {hasLogo ? (
          <BrandHomeLink className="inline-flex rounded-md outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={brand.logoUrl}
              alt={brand.brandName || 'Brand logo'}
              className="h-12 w-auto max-w-[220px] object-contain sm:h-14"
            />
          </BrandHomeLink>
        ) : hasName ? (
          <BrandHomeLink className="rounded-md outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
            <p className="text-center font-display text-3xl font-semibold tracking-tight text-brand-800 sm:text-4xl">
              {brand.brandName}
            </p>
          </BrandHomeLink>
        ) : (
          <BrandHomeLink className="rounded-md outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
            <p className="text-center text-sm font-semibold uppercase tracking-[0.2em] text-brand-600">
              Store feedback
            </p>
          </BrandHomeLink>
        )}
      </div>

      {(hasLogo || hasName) && (
        <>
          <div className="mx-auto mb-4 h-px w-16 bg-brand-300" aria-hidden />
          <p className="mb-3 text-center text-sm font-semibold uppercase tracking-[0.2em] text-brand-600">
            Store feedback
          </p>
        </>
      )}

      <h1 className="text-center font-display text-2xl font-semibold leading-tight text-ink-900 sm:text-3xl">
        We value your visit
      </h1>
      <p className="mx-auto mt-4 max-w-xl text-center text-[15px] leading-relaxed text-ink-700 sm:text-base">
        Please take a minute to share your experience. Your answers are saved securely and help us
        serve you better on your next visit.
      </p>
    </header>
  )
}
