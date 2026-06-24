import { Suspense } from 'react'
import { prisma } from '@/lib/prisma'
import { JobCard } from '@/components/JobCard'
import { FilterBar } from '@/components/FilterBar'
import type { Prisma } from '@/generated/prisma/client'

export const dynamic = 'force-dynamic'

type SearchParams = Promise<{ q?: string; contract?: string; page?: string }>

export default async function HomePage({ searchParams }: { searchParams: SearchParams }) {
  const { q, contract, page: pageParam } = await searchParams
  const page = Math.max(1, Number(pageParam ?? 1))
  const limit = 20

  const where: Prisma.JobWhereInput = {
    ...(q && {
      OR: [
        { title: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
      ],
    }),
    ...(contract && { contractType: { contains: contract, mode: 'insensitive' } }),
  }

  const [jobs, total] = await Promise.all([
    prisma.job.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        source: { select: { name: true } },
        userStatus: { select: { status: true } },
      },
    }),
    prisma.job.count({ where }),
  ])

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold">Offres récentes</h2>
        <span className="text-sm text-gray-500">
          {total} offre{total > 1 ? 's' : ''}
        </span>
      </div>

      <Suspense>
        <FilterBar />
      </Suspense>

      {jobs.length === 0 ? (
        <p className="text-center py-16 text-gray-500">Aucune offre ne correspond à ces critères.</p>
      ) : (
        <>
          <ul className="space-y-3">
            {jobs.map((job) => (
              <li key={job.id}>
                <JobCard job={job} />
              </li>
            ))}
          </ul>

          {total > limit && (
            <div className="flex justify-center gap-4 mt-8 text-sm">
              {page > 1 && (
                <a href={`?page=${page - 1}${q ? `&q=${q}` : ''}${contract ? `&contract=${contract}` : ''}`}
                  className="px-4 py-2 border border-gray-200 rounded-lg hover:border-gray-400">
                  ← Précédent
                </a>
              )}
              {page * limit < total && (
                <a href={`?page=${page + 1}${q ? `&q=${q}` : ''}${contract ? `&contract=${contract}` : ''}`}
                  className="px-4 py-2 border border-gray-200 rounded-lg hover:border-gray-400">
                  Suivant →
                </a>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}
