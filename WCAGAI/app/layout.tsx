import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'WCAGAI - Web Content Accessibility Guideline AI',
  description: 'Analyze and improve website accessibility with AI-powered WCAG compliance testing',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  )
}
