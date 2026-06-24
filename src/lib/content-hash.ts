import crypto from 'crypto'
import type { NormalizedJob } from '@/collectors/types'

export function computeContentHash(job: NormalizedJob): string {
  const normalized = [
    job.title.toLowerCase().trim().replace(/[^a-z0-9\s]/g, ''),
    (job.company ?? '').toLowerCase().trim(),
    job.publishedAt ? job.publishedAt.toISOString().slice(0, 10) : '',
  ].join('|')

  return crypto.createHash('sha1').update(normalized).digest('hex')
}
