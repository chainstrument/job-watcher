import { prisma } from '@/lib/prisma'
import { JobCard } from '@/components/JobCard'

export const revalidate = 300

export default async function HomePage() {
  const [jobs, total] = await Promise.all([
    prisma.job.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20,
      include: {
        source: { select: { name: true } },
        userStatus: { select: { status: true } },
      },
    }),
    prisma.job.count(),
  ])

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold">Offres récentes</h2>
        <span className="text-sm text-gray-500">
          {total} offre{total > 1 ? 's' : ''} collectée{total > 1 ? 's' : ''}
        </span>
      </div>

      {jobs.length === 0 ? (
        <p className="text-center py-16 text-gray-500">
          Aucune offre pour l&apos;instant — la collecte automatique s&apos;en chargera bientôt.
        </p>
      ) : (
        <ul className="space-y-3">
          {jobs.map((job) => (
            <li key={job.id}>
              <JobCard job={job} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
