import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCollector } from '@/collectors/registry'
import type { NormalizedJob } from '@/collectors/types'

export async function POST(request: Request) {
  const secret = request.headers.get('x-cron-secret')
  if (secret !== process.env.CRON_SECRET) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const sources = await prisma.source.findMany({ where: { enabled: true } })

  let totalJobsFound = 0
  const errors: { source: string; error: string }[] = []

  await Promise.all(
    sources.map(async (source) => {
      const collector = getCollector(source.type)
      if (!collector) return

      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 10_000)

      try {
        const jobs: NormalizedJob[] = await collector.collect(source)
        clearTimeout(timeout)

        await prisma.job.createMany({
          data: jobs.map((job) => ({ ...job, sourceId: source.id })),
          skipDuplicates: true,
        })

        totalJobsFound += jobs.length

        await prisma.collectLog.create({
          data: { sourceId: source.id, status: 'success', jobsFound: jobs.length },
        })
      } catch (err) {
        clearTimeout(timeout)
        const message = err instanceof Error ? err.message : String(err)
        errors.push({ source: source.name, error: message })

        await prisma.collectLog.create({
          data: { sourceId: source.id, status: 'error', jobsFound: 0, error: message },
        })
      }
    })
  )

  return NextResponse.json({
    sources: sources.length,
    jobsFound: totalJobsFound,
    errors,
  })
}
