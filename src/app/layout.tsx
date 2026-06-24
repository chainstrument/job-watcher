import type { Metadata } from 'next'
import { Suspense } from 'react'
import { Geist } from 'next/font/google'
import { DashboardStats } from '@/components/DashboardStats'
import './globals.css'

const geist = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Job Watcher',
  description: 'Agrégateur d\'offres d\'emploi web developer',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${geist.variable} h-full antialiased`}>
      <body className="min-h-full bg-gray-50 text-gray-900">
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <h1 className="text-lg font-semibold tracking-tight">Job Watcher</h1>
            <Suspense fallback={null}>
              <DashboardStats />
            </Suspense>
          </div>
        </header>
        <main className="max-w-5xl mx-auto px-6 py-8">{children}</main>
      </body>
    </html>
  )
}
