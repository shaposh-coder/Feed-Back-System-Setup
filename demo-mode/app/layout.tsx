import type { Metadata } from 'next'
import BrandIdentity from '@/components/demo/BrandIdentity'
import ScrollToTopButton from '@/components/ScrollToTopButton'
import './globals.css'

export const metadata: Metadata = {
  title: 'Store Visit Feedback · Demo Mode',
  description: 'Demo Mode of the Store Feedback System — sample data only, stored in your browser.',
  icons: {
    icon: '/favicon.png',
    shortcut: '/favicon.png',
    apple: '/favicon.png',
  },
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
        <BrandIdentity />
        {children}
        <ScrollToTopButton />
      </body>
    </html>
  )
}
