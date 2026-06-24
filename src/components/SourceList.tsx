'use client'

import { useRouter } from 'next/navigation'
import type { Source, CollectLog } from '@/generated/prisma/client'

type SourceWithMeta = Source & {
  _count: { jobs: number }
  collectLogs: CollectLog[]
}

export function SourceList({ sources }: { sources: SourceWithMeta[] }) {
  const router = useRouter()

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

  async function collectNow(id: string) {
    await fetch('/api/collect', {
      method: 'POST',
      headers: { 'x-cron-secret': '' },
    })
    router.refresh()
  }

  if (sources.length === 0) {
    return <p className="text-sm text-gray-500 py-4">Aucune source configurée.</p>
  }

  return (
    <ul className="space-y-3">
      {sources.map((source) => {
        const lastLog = source.collectLogs[0]
        return (
          <li key={source.id}
            className={`bg-white border border-gray-200 rounded-lg px-5 py-4 ${!source.enabled ? 'opacity-50' : ''}`}>
            <div className="flex items-start justify-between gap-4">
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
                      Dernière collecte : {lastLog.status === 'success' ? `${lastLog.jobsFound} trouvées` : `Erreur — ${lastLog.error}`}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => collectNow(source.id)}
                  className="text-xs px-3 py-1 border border-gray-200 rounded-full hover:border-gray-400 transition-colors">
                  Collecter
                </button>
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
          </li>
        )
      })}
    </ul>
  )
}
