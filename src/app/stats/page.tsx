import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export default async function StatsPage() {
  const [total, byStatus, bySources, recentActivity] = await Promise.all([
    prisma.job.count(),

    prisma.userJobStatus.groupBy({
      by: ['status'],
      _count: { status: true },
    }),

    prisma.source.findMany({
      include: { _count: { select: { jobs: true } } },
      orderBy: { createdAt: 'asc' },
    }),

    // Offres collectées par jour sur les 7 derniers jours
    prisma.$queryRaw<{ day: string; count: bigint }[]>`
      SELECT DATE_TRUNC('day', "createdAt") AS day, COUNT(*) AS count
      FROM "Job"
      WHERE "createdAt" > NOW() - INTERVAL '7 days'
      GROUP BY day
      ORDER BY day ASC
    `,
  ])

  const newCount = total - byStatus.reduce((sum, s) => sum + s._count.status, 0)
  const statusMap = Object.fromEntries(byStatus.map((s) => [s.status, s._count.status]))

  const stats = [
    { label: 'Total offres', value: total },
    { label: 'Nouvelles', value: newCount + (statusMap['NEW'] ?? 0) },
    { label: 'Sauvegardées', value: statusMap['SAVED'] ?? 0 },
    { label: 'Vues', value: statusMap['SEEN'] ?? 0 },
    { label: 'Ignorées', value: statusMap['IGNORED'] ?? 0 },
  ]

  const maxDay = Math.max(...recentActivity.map((d) => Number(d.count)), 1)

  return (
    <div className="max-w-2xl space-y-8">
      <h2 className="text-xl font-semibold">Statistiques</h2>

      {/* Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {stats.map(({ label, value }) => (
          <div key={label} className="bg-white border border-gray-200 rounded-lg px-4 py-3 text-center">
            <div className="text-2xl font-semibold text-gray-900">{value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Par source */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-3">Offres par source</h3>
        <ul className="space-y-2">
          {bySources.map((source) => {
            const pct = total > 0 ? Math.round((source._count.jobs / total) * 100) : 0
            return (
              <li key={source.id} className="bg-white border border-gray-200 rounded-lg px-4 py-3">
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="font-medium text-gray-800">{source.name}</span>
                  <span className="text-gray-500">{source._count.jobs} ({pct}%)</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-gray-800 rounded-full" style={{ width: `${pct}%` }} />
                </div>
              </li>
            )
          })}
        </ul>
      </div>

      {/* Activité 7 jours */}
      {recentActivity.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">Offres collectées — 7 derniers jours</h3>
          <div className="bg-white border border-gray-200 rounded-lg px-4 py-4">
            <div className="flex items-end gap-1.5 h-24">
              {recentActivity.map((d) => {
                const height = Math.round((Number(d.count) / maxDay) * 100)
                const date = new Date(d.day).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' })
                return (
                  <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-xs text-gray-400">{Number(d.count)}</span>
                    <div className="w-full bg-gray-800 rounded-sm" style={{ height: `${height}%` }} />
                    <span className="text-xs text-gray-400 truncate w-full text-center">{date}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
