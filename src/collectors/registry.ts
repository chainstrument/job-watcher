import type { SourceType } from '@/generated/prisma/client'
import { RSSCollector } from './rss-collector'
import type { Collector } from './types'

const registry: Partial<Record<SourceType, Collector>> = {
  RSS: new RSSCollector(),
}

export function getCollector(type: SourceType): Collector | null {
  return registry[type] ?? null
}
