import crypto from 'crypto'
import Parser from 'rss-parser'
import type { Source } from '@/generated/prisma/client'
import type { Collector, NormalizedJob } from './types'

const parser = new Parser({
  customFields: {
    item: ['author', 'dc:creator'],
  },
})

function stableId(url: string): string {
  return crypto.createHash('sha1').update(url).digest('hex')
}

function extractStack(text: string): string[] {
  const known = [
    'React', 'Vue', 'Angular', 'Next.js', 'Nuxt', 'TypeScript', 'JavaScript',
    'Node.js', 'Python', 'Django', 'FastAPI', 'Go', 'Rust', 'PHP', 'Laravel',
    'Ruby', 'Rails', 'Java', 'Spring', 'Kotlin', 'Swift', 'Docker', 'Kubernetes',
    'AWS', 'GCP', 'Azure', 'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'GraphQL',
    'REST', 'Tailwind', 'Svelte', 'Remix', 'Astro',
  ]
  const lower = text.toLowerCase()
  return known.filter((tech) => lower.includes(tech.toLowerCase()))
}

export class RSSCollector implements Collector {
  async collect(source: Source): Promise<NormalizedJob[]> {
    const feed = await parser.parseURL(source.url)

    return feed.items.map((item) => {
      const url = item.link ?? item.guid ?? ''
      const rawText = [item.title, item.contentSnippet, item.content].join(' ')

      return {
        externalId: stableId(url || item.guid || item.title || ''),
        title: item.title ?? 'Sans titre',
        company: (item as unknown as Record<string, string>)['author'] ?? (item as unknown as Record<string, string>)['dc:creator'] ?? undefined,
        location: undefined,
        contractType: undefined,
        stack: extractStack(rawText),
        description: item.contentSnippet?.slice(0, 1000),
        url,
        publishedAt: item.pubDate ? new Date(item.pubDate) : undefined,
      }
    })
  }
}
