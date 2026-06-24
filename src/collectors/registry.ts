import type { SourceType } from '@/generated/prisma/client'
import { RSSCollector } from './rss-collector'
import { RemoteOKCollector } from './remoteok-collector'
import type { Collector } from './types'

const registry: Partial<Record<SourceType, Collector>> = {
  RSS: new RSSCollector(),
  API_JSON: new RemoteOKCollector(),
}

export function getCollector(type: SourceType): Collector | null {
  return registry[type] ?? null
}
