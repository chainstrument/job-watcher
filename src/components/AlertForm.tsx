'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function AlertForm() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [keywords, setKeywords] = useState('')
  const [stack, setStack] = useState('')
  const [location, setLocation] = useState('')
  const [saving, setSaving] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setSaving(true)
    await fetch('/api/alerts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: name.trim(),
        keywords: keywords.split(',').map((s) => s.trim()).filter(Boolean),
        stack: stack.split(',').map((s) => s.trim()).filter(Boolean),
        location: location.trim() || null,
      }),
    })
    setName(''); setKeywords(''); setStack(''); setLocation('')
    setSaving(false)
    router.refresh()
  }

  return (
    <form onSubmit={submit} className="bg-white border border-gray-200 rounded-lg p-5 space-y-4">
      <h3 className="font-medium text-gray-900">Nouvelle alerte</h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium text-gray-600">Nom *</label>
          <input value={name} onChange={(e) => setName(e.target.value)} required
            placeholder="ex: React remote"
            className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-400" />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-600">Localisation</label>
          <input value={location} onChange={(e) => setLocation(e.target.value)}
            placeholder="ex: Paris, remote"
            className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-400" />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-600">Mots-clés (séparés par virgule)</label>
          <input value={keywords} onChange={(e) => setKeywords(e.target.value)}
            placeholder="ex: React, frontend, Next.js"
            className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-400" />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-600">Stack (séparés par virgule)</label>
          <input value={stack} onChange={(e) => setStack(e.target.value)}
            placeholder="ex: TypeScript, React"
            className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-400" />
        </div>
      </div>

      <button type="submit" disabled={saving || !name.trim()}
        className="bg-gray-900 text-white text-sm px-4 py-2 rounded-lg hover:bg-gray-700 disabled:opacity-40 transition-colors">
        {saving ? 'Création…' : 'Créer l\'alerte'}
      </button>
    </form>
  )
}
