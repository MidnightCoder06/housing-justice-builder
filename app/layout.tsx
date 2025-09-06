import React from 'react'
import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Equity Works - AI-Powered Legal Technology for Housing Justice',
  description: 'Equity Works levels the playing field in eviction court with AI-powered legal technology. Empowering tenants and attorneys to defend against housing displacement.',
  authors: [{ name: 'Equity Works' }],
  openGraph: {
    title: 'Equity Works - Housing Justice Through Technology',
    description: 'AI-powered legal technology addressing the 3.6M annual eviction cases in the US. Leveling the playing field for housing justice.',
    type: 'website',
    images: ['/equity-works-logo.png'],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@EquityWorks',
    images: ['/equity-works-logo.png'],
  },
  icons: {
    icon: '/equity-works-logo.png',
  },
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