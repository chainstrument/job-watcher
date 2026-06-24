'use client'

import { useRouter } from 'next/navigation'
import type { Alert } from '@/generated/prisma/client'

export function AlertList({ alerts }: { alerts: Alert[] }) {
  const router = useRouter()

  async function toggle(alert: Alert) {
    await fetch(`/api/alerts/${alert.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enabled: !alert.enabled }),
    })
    router.refresh()
  }

  async function remove(id: string) {
    if (!confirm('Supprimer cette alerte ?')) return
    await fetch(`/api/alerts/${id}`, { method: 'DELETE' })
    router.refresh()
  }

  if (alerts.length === 0) {
    return <p className="text-sm text-gray-500 py-4">Aucune alerte configurée.</p>
  }

  return (
    <ul className="space-y-3">
      {alerts.map((alert) => (
        <li key={alert.id}
          className={`bg-white border border-gray-200 rounded-lg px-5 py-4 flex items-start justify-between gap-4 ${!alert.enabled ? 'opacity-50' : ''}`}>
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-900">{alert.name}</span>
              {!alert.enabled && (
                <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Désactivée</span>
              )}
            </div>
            <div className="flex flex-wrap gap-3 text-xs text-gray-500">
              {alert.keywords.length > 0 && <span>Mots-clés : {alert.keywords.join(', ')}</span>}
              {alert.stack.length > 0 && <span>Stack : {alert.stack.join(', ')}</span>}
              {alert.location && <span>Localisation : {alert.location}</span>}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button onClick={() => toggle(alert)}
              className="text-xs px-3 py-1 border border-gray-200 rounded-full hover:border-gray-400 transition-colors">
              {alert.enabled ? 'Désactiver' : 'Activer'}
            </button>
            <button onClick={() => remove(alert.id)}
              className="text-xs px-3 py-1 border border-red-200 text-red-500 rounded-full hover:bg-red-50 transition-colors">
              Supprimer
            </button>
          </div>
        </li>
      ))}
    </ul>
  )
}
