import { prisma } from '@/lib/prisma'

export async function DashboardStats() {
  const [newCount, savedCount] = await Promise.all([
    prisma.job.count({
      where: { OR: [{ userStatus: null }, { userStatus: { status: 'NEW' } }] },
    }),
    prisma.userJobStatus.count({ where: { status: 'SAVED' } }),
  ])

  return (
    <div className="flex items-center gap-4">
      {newCount > 0 && (
        <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 text-xs font-medium px-2.5 py-1 rounded-full">
          <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
          {newCount} nouvelle{newCount > 1 ? 's' : ''}
        </span>
      )}
      {savedCount > 0 && (
        <span className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 text-xs font-medium px-2.5 py-1 rounded-full">
          ★ {savedCount} sauvegardée{savedCount > 1 ? 's' : ''}
        </span>
      )}
    </div>
  )
}
