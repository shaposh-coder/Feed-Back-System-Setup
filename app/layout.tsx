import type { Metadata } from 'next'
import BrandFavicon from '@/components/BrandFavicon'
import { getBrandSettings } from '@/lib/brandSettings'
import './globals.css'

export async function generateMetadata(): Promise<Metadata> {
  const brand = await getBrandSettings()
  const title = brand.brandName
    ? `${brand.brandName} · Store Visit Feedback`
    : 'Store Visit Feedback'

  const metadata: Metadata = {
    title,
    description: 'Share your experience from today’s store visit.',
  }

  if (brand.faviconUrl) {
    metadata.icons = {
      icon: [{ url: brand.faviconUrl }],
      shortcut: [{ url: brand.faviconUrl }],
      apple: [{ url: brand.faviconUrl }],
    }
  }

  return metadata
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        <BrandFavicon />
        {children}
      </body>
    </html>
  )
}
