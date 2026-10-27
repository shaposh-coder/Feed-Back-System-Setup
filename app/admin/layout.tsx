import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Admin · Feedback System',
  description: 'Manage customer store-visit feedback submissions.',
}

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return children
}
