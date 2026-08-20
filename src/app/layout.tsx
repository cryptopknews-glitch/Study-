import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '10MinStudy - Personal AI Study Assistant',
  description: 'Your personal ICS study assistant for Class 11 & 12',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}