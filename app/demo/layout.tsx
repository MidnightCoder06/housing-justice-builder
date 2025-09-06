import React from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function DemoLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      {children}
    </div>
  )
}
