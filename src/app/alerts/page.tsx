import { prisma } from '@/lib/prisma'
import { AlertForm } from '@/components/AlertForm'
import { AlertList } from '@/components/AlertList'

export const dynamic = 'force-dynamic'

export default async function AlertsPage() {
  const alerts = await prisma.alert.findMany({ orderBy: { createdAt: 'desc' } })

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Alertes</h2>
        <p className="text-sm text-gray-500 mt-1">
          Reçois un email quand une nouvelle offre correspond à tes critères.
        </p>
      </div>
      <AlertForm />
      <AlertList alerts={alerts} />
    </div>
  )
}
