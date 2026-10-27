import type { Metadata } from 'next'
import { getBrandSettings } from '@/lib/brandSettings'

export async function generateMetadata(): Promise<Metadata> {
  const brand = await getBrandSettings()
  const title = brand.brandName
    ? `Admin · ${brand.brandName}`
    : 'Admin · Feedback System'

  const metadata: Metadata = {
    title,
    description: 'Manage customer store-visit feedback submissions.',
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

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return children
}
