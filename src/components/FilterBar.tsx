'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useState, useTransition } from 'react'

const CONTRACT_TYPES = ['CDI', 'CDD', 'Freelance', 'Remote']

export function FilterBar() {
  const router = useRouter()
  const params = useSearchParams()
  const [, startTransition] = useTransition()

  const [q, setQ] = useState(params.get('q') ?? '')

  const push = useCallback(
    (updates: Record<string, string | null>) => {
      const next = new URLSearchParams(params.toString())
      for (const [k, v] of Object.entries(updates)) {
        if (v) next.set(k, v)
        else next.delete(k)
      }
      next.delete('page')
      startTransition(() => router.push(`/?${next.toString()}`))
    },
    [params, router]
  )

  const active = (key: string, val: string) => params.get(key) === val

  return (
    <div className="space-y-3 mb-6">
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && push({ q: q || null })}
        onBlur={() => push({ q: q || null })}
        placeholder="Rechercher (titre, description)…"
        className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-gray-400"
      />

      <div className="flex flex-wrap gap-2">
        {CONTRACT_TYPES.map((type) => (
          <button
            key={type}
            onClick={() => push({ contract: active('contract', type) ? null : type })}
            className={`text-xs px-3 py-1 rounded-full border transition-colors ${
              active('contract', type)
                ? 'bg-gray-900 text-white border-gray-900'
                : 'border-gray-200 text-gray-600 hover:border-gray-400'
            }`}
          >
            {type}
          </button>
        ))}

        {params.size > 0 && (
          <button
            onClick={() => { setQ(''); router.push('/') }}
            className="text-xs px-3 py-1 rounded-full border border-red-200 text-red-500 hover:bg-red-50 transition-colors"
          >
            ✕ Effacer
          </button>
        )}
      </div>
    </div>
  )
}
