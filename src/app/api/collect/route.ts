import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCollector } from '@/collectors/registry'
import { matchesAlert } from '@/lib/match-alert'
import { sendAlertEmail } from '@/lib/send-alert-email'
import { computeContentHash } from '@/lib/content-hash'
import type { NormalizedJob } from '@/collectors/types'
import type { Job } from '@/generated/prisma/client'

export async function POST(request: Request) {
  const secret = request.headers.get('x-cron-secret')
  if (secret !== process.env.CRON_SECRET) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const sources = await prisma.source.findMany({ where: { enabled: true } })

  let totalJobsFound = 0
  const newJobs: Job[] = []
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

        const existingIds = new Set(
          (
            await prisma.job.findMany({
              where: { externalId: { in: jobs.map((j) => j.externalId) }, sourceId: source.id },
              select: { externalId: true },
            })
          ).map((j) => j.externalId)
        )

        // Skip cross-source duplicates via contentHash
        const existingHashes = new Set(
          (
            await prisma.job.findMany({
              where: { contentHash: { in: jobs.map(computeContentHash).filter(Boolean) } },
              select: { contentHash: true },
            })
          ).map((j) => j.contentHash!)
        )

        const toInsert = jobs.filter(
          (j) => !existingIds.has(j.externalId) && !existingHashes.has(computeContentHash(j))
        )

        await prisma.job.createMany({
          data: toInsert.map((job) => ({
            ...job,
            sourceId: source.id,
            contentHash: computeContentHash(job),
          })),
          skipDuplicates: true,
        })

        const inserted = await prisma.job.findMany({
          where: {
            externalId: { in: toInsert.map((j) => j.externalId) },
            sourceId: source.id,
          },
        })
        newJobs.push(...inserted)

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

  if (newJobs.length > 0) {
    const alerts = await prisma.alert.findMany({ where: { enabled: true } })
    const matches = alerts
      .map((alert) => ({ alert, jobs: newJobs.filter((job) => matchesAlert(job, alert)) }))
      .filter((m) => m.jobs.length > 0)

    if (matches.length > 0) {
      try {
        await sendAlertEmail(matches)
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err)
        errors.push({ source: 'email', error: message })
      }
    }
  }

  return NextResponse.json({
    sources: sources.length,
    jobsFound: totalJobsFound,
    newJobs: newJobs.length,
    errors,
  })
}
