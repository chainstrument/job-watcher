import { prisma } from '@/lib/prisma'
import { SourceForm } from '@/components/SourceForm'
import { SourceList } from '@/components/SourceList'

export const dynamic = 'force-dynamic'

export default async function SourcesPage() {
  const sources = await prisma.source.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: { select: { jobs: true } },
      collectLogs: { orderBy: { createdAt: 'desc' }, take: 1 },
    },
  })

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Sources</h2>
        <p className="text-sm text-gray-500 mt-1">
          Gère les sources RSS et API collectées automatiquement.
        </p>
      </div>
      <SourceForm />
      <SourceList sources={sources} />
    </div>
  )
}
