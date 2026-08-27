import type { Metadata, Viewport } from 'next'
import './globals.css'
import Navbar from '@/components/Navbar'
import SecurityBanner from '@/components/SecurityBanner'

export const metadata: Metadata = {
  title: '10MinStudy - Personal AI Study Assistant',
  description: 'Your personal ICS study assistant for Class 11 & 12',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: '10MinStudy',
  },
  icons: {
    icon: '/icon-192.png',
    apple: '/icon-192.png',
  },
  // Ye zaati app hai — search engines is ka login page bhi index na karein.
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false },
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#4f46e5',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <SecurityBanner />
        <Navbar />
        <main className="max-w-4xl mx-auto">{children}</main>
      </body>
    </html>
  )
}
