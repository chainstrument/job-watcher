'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Source, CollectLog } from '@/generated/prisma/client'

type SourceWithMeta = Source & {
  _count: { jobs: number }
  collectLogs: CollectLog[]
}

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (seconds < 3600) return `${Math.floor(seconds / 60)}min`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`
  return `${Math.floor(seconds / 86400)}j`
}

export function SourceList({ sources }: { sources: SourceWithMeta[] }) {
  const router = useRouter()
  const [expanded, setExpanded] = useState<string | null>(null)

  async function toggle(source: Source) {
    await fetch(`/api/sources/${source.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enabled: !source.enabled }),
    })
    router.refresh()
  }

  async function remove(id: string) {
    if (!confirm('Supprimer cette source et toutes ses offres ?')) return
    await fetch(`/api/sources/${id}`, { method: 'DELETE' })
    router.refresh()
  }

  if (sources.length === 0) {
    return <p className="text-sm text-gray-500 py-4">Aucune source configurée.</p>
  }

  return (
    <ul className="space-y-3">
      {sources.map((source) => {
        const lastLog = source.collectLogs[0]
        const isExpanded = expanded === source.id

        return (
          <li key={source.id}
            className={`bg-white border border-gray-200 rounded-lg overflow-hidden ${!source.enabled ? 'opacity-50' : ''}`}>
            <div className="px-5 py-4 flex items-start justify-between gap-4">
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${lastLog?.status === 'success' ? 'bg-green-400' : lastLog?.status === 'error' ? 'bg-red-400' : 'bg-gray-300'}`} />
                  <span className="font-medium text-gray-900">{source.name}</span>
                  <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded">{source.type}</span>
                  {!source.enabled && <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Désactivée</span>}
                </div>
                <p className="text-xs text-gray-400 truncate">{source.url}</p>
                <div className="flex gap-3 text-xs text-gray-500">
                  <span>{source._count.jobs} offre{source._count.jobs > 1 ? 's' : ''}</span>
                  {lastLog && (
                    <span className={lastLog.status === 'error' ? 'text-red-500' : ''}>
                      Il y a {timeAgo(lastLog.createdAt)} — {lastLog.status === 'success' ? `${lastLog.jobsFound} trouvées` : `erreur`}
                    </span>
                  )}
                  {source.collectLogs.length > 0 && (
                    <button onClick={() => setExpanded(isExpanded ? null : source.id)}
                      className="text-blue-500 hover:underline">
                      {isExpanded ? 'Masquer historique' : 'Voir historique'}
                    </button>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => toggle(source)}
                  className="text-xs px-3 py-1 border border-gray-200 rounded-full hover:border-gray-400 transition-colors">
                  {source.enabled ? 'Désactiver' : 'Activer'}
                </button>
                <button onClick={() => remove(source.id)}
                  className="text-xs px-3 py-1 border border-red-200 text-red-500 rounded-full hover:bg-red-50 transition-colors">
                  Supprimer
                </button>
              </div>
            </div>

            {isExpanded && source.collectLogs.length > 0 && (
              <div className="border-t border-gray-100 bg-gray-50 px-5 py-3">
                <p className="text-xs font-medium text-gray-500 mb-2">Historique des collectes</p>
                <ul className="space-y-1">
                  {source.collectLogs.map((log) => (
                    <li key={log.id} className="flex items-center gap-3 text-xs">
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${log.status === 'success' ? 'bg-green-400' : 'bg-red-400'}`} />
                      <span className="text-gray-400 w-12 shrink-0">{timeAgo(log.createdAt)}</span>
                      {log.status === 'success'
                        ? <span className="text-gray-600">{log.jobsFound} offres trouvées</span>
                        : <span className="text-red-500 truncate">{log.error ?? 'Erreur inconnue'}</span>
                      }
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </li>
        )
      })}
    </ul>
  )
}
