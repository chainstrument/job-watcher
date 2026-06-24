'use client'

import { useState } from 'react'

export function NoteEditor({ jobId, initial }: { jobId: string; initial: string | null }) {
  const [note, setNote] = useState(initial ?? '')
  const [saved, setSaved] = useState(false)

  async function save() {
    await fetch(`/api/jobs/${jobId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ note }),
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700">Note personnelle</label>
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        onBlur={save}
        rows={3}
        placeholder="Ajouter une note..."
        className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 resize-none focus:outline-none focus:border-gray-400"
      />
      {saved && <p className="text-xs text-green-600">Sauvegardée</p>}
    </div>
  )
}
