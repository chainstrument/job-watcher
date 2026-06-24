'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function SourceForm() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [url, setUrl] = useState('')
  const [type, setType] = useState<'RSS' | 'API_JSON'>('RSS')
  const [saving, setSaving] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !url.trim()) return
    setSaving(true)
    await fetch('/api/sources', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name.trim(), url: url.trim(), type }),
    })
    setName(''); setUrl('')
    setSaving(false)
    router.refresh()
  }

  return (
    <form onSubmit={submit} className="bg-white border border-gray-200 rounded-lg p-5 space-y-4">
      <h3 className="font-medium text-gray-900">Ajouter une source</h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium text-gray-600">Nom *</label>
          <input value={name} onChange={(e) => setName(e.target.value)} required
            placeholder="ex: We Work Remotely"
            className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-400" />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-600">Type</label>
          <select value={type} onChange={(e) => setType(e.target.value as 'RSS' | 'API_JSON')}
            className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-400">
            <option value="RSS">RSS</option>
            <option value="API_JSON">API JSON (RemoteOK)</option>
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className="text-xs font-medium text-gray-600">URL *</label>
          <input value={url} onChange={(e) => setUrl(e.target.value)} required
            placeholder="https://..."
            className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-400" />
        </div>
      </div>

      <button type="submit" disabled={saving || !name.trim() || !url.trim()}
        className="bg-gray-900 text-white text-sm px-4 py-2 rounded-lg hover:bg-gray-700 disabled:opacity-40 transition-colors">
        {saving ? 'Ajout…' : 'Ajouter'}
      </button>
    </form>
  )
}
