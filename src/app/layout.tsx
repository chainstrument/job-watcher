import type { Metadata } from 'next'
import { Suspense } from 'react'
import Link from 'next/link'
import { Geist } from 'next/font/google'
import { DashboardStats } from '@/components/DashboardStats'
import { auth, signOut } from '@/auth'
import './globals.css'

const geist = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Job Watcher',
  description: 'Agrégateur d\'offres d\'emploi web developer',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()

  return (
    <html lang="fr" className={`${geist.variable} h-full antialiased`}>
      <body className="min-h-full bg-gray-50 text-gray-900">
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Link href="/" className="text-lg font-semibold tracking-tight hover:text-gray-600">
                Job Watcher
              </Link>
              <Link href="/alerts" className="text-sm text-gray-500 hover:text-gray-800">
                Alertes
              </Link>
              <Link href="/sources" className="text-sm text-gray-500 hover:text-gray-800">
                Sources
              </Link>
              <Link href="/stats" className="text-sm text-gray-500 hover:text-gray-800">
                Stats
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <Suspense fallback={null}>
                <DashboardStats />
              </Suspense>
              {session && (
                <form
                  action={async () => {
                    'use server'
                    await signOut({ redirectTo: '/login' })
                  }}
                >
                  <button
                    type="submit"
                    className="text-xs text-gray-400 hover:text-gray-700 transition-colors cursor-pointer"
                  >
                    Déconnexion
                  </button>
                </form>
              )}
            </div>
          </div>
        </header>
        <main className="max-w-5xl mx-auto px-6 py-8">{children}</main>
      </body>
    </html>
  )
}
