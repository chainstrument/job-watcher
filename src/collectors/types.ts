import type { Source } from '@/generated/prisma/client'

export interface NormalizedJob {
  externalId: string
  title: string
  company?: string
  location?: string
  contractType?: string
  stack: string[]
  description?: string
  url: string
  publishedAt?: Date
}

export interface Collector {
  collect(source: Source): Promise<NormalizedJob[]>
}
