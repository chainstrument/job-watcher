import type { Alert, Job } from '@/generated/prisma/client'

export function matchesAlert(job: Job, alert: Alert): boolean {
  const haystack = [job.title, job.description, job.company]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()

  if (alert.keywords.length > 0) {
    const hasKeyword = alert.keywords.some((kw) => haystack.includes(kw.toLowerCase()))
    if (!hasKeyword) return false
  }

  if (alert.stack.length > 0) {
    const jobStack = job.stack.map((s) => s.toLowerCase())
    const hasStack = alert.stack.every((s) => jobStack.includes(s.toLowerCase()))
    if (!hasStack) return false
  }

  if (alert.location) {
    const loc = job.location?.toLowerCase() ?? ''
    if (!loc.includes(alert.location.toLowerCase())) return false
  }

  return true
}
