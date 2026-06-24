import crypto from 'crypto'
import type { Source } from '@/generated/prisma/client'
import type { Collector, NormalizedJob } from './types'

type RemoteOKJob = {
  id: string
  url: string
  title: string
  company: string
  location: string
  tags: string[]
  date: string
}

function stableId(id: string): string {
  return crypto.createHash('sha1').update(id).digest('hex')
}

export class RemoteOKCollector implements Collector {
  async collect(_source: Source): Promise<NormalizedJob[]> {
    const res = await fetch('https://remoteok.com/api', {
      headers: { 'User-Agent': 'job-watcher/1.0' },
    })
    const data: (RemoteOKJob | { legal: string })[] = await res.json()

    return data
      .filter((item): item is RemoteOKJob => 'id' in item && 'title' in item)
      .map((job) => ({
        externalId: stableId(job.id),
        title: job.title,
        company: job.company || undefined,
        location: job.location || 'Remote',
        contractType: 'Remote',
        stack: job.tags ?? [],
        url: job.url.startsWith('http') ? job.url : `https://remoteok.com${job.url}`,
        publishedAt: job.date ? new Date(job.date) : undefined,
      }))
  }
}
