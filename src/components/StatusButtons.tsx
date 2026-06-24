'use client'

import { useState } from 'react'
import type { JobStatus } from '@/generated/prisma/client'

const labels: Record<JobStatus, string> = {
  NEW: 'Nouvelle',
  SEEN: 'Vue',
  SAVED: 'Sauvegardée',
  IGNORED: 'Ignorée',
}

const styles: Record<JobStatus, string> = {
  NEW: 'bg-blue-100 text-blue-700',
  SEEN: 'bg-gray-100 text-gray-600',
  SAVED: 'bg-green-100 text-green-700',
  IGNORED: 'bg-red-100 text-red-600',
}

export function StatusButtons({ jobId, initial }: { jobId: string; initial: JobStatus }) {
  const [status, setStatus] = useState<JobStatus>(initial)
  const [saving, setSaving] = useState(false)

  async function updateStatus(next: JobStatus) {
    if (next === status) return
    setSaving(true)
    await fetch(`/api/jobs/${jobId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: next }),
    })
    setStatus(next)
    setSaving(false)
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-sm text-gray-500">Statut :</span>
      {(['SEEN', 'SAVED', 'IGNORED'] as JobStatus[]).map((s) => (
        <button
          key={s}
          onClick={() => updateStatus(s)}
          disabled={saving}
          className={`text-sm px-3 py-1 rounded-full font-medium transition-all border ${
            status === s
              ? `${styles[s]} border-transparent`
              : 'border-gray-200 text-gray-500 hover:border-gray-400 bg-white'
          } disabled:opacity-50`}
        >
          {labels[s]}
        </button>
      ))}
    </div>
  )
}
