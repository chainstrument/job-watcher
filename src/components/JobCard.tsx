import Link from 'next/link'
import type { Job, Source, UserJobStatus } from '@/generated/prisma/client'

type JobWithRelations = Job & {
  source: Pick<Source, 'name'>
  userStatus: Pick<UserJobStatus, 'status'> | null
}

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
  if (seconds < 3600) return `${Math.floor(seconds / 60)}min`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`
  return `${Math.floor(seconds / 86400)}j`
}

const statusStyle: Record<string, string> = {
  SAVED: 'border-l-4 border-l-green-400',
  IGNORED: 'opacity-50',
}

export function JobCard({ job }: { job: JobWithRelations }) {
  const isNew = !job.userStatus || job.userStatus.status === 'NEW'
  const status = job.userStatus?.status ?? 'NEW'

  return (
    <Link
      href={`/jobs/${job.id}`}
      className={`block bg-white rounded-lg border border-gray-200 px-5 py-4 hover:border-gray-400 hover:shadow-sm transition-all ${statusStyle[status] ?? ''}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {isNew && (
              <span className="inline-block bg-blue-100 text-blue-700 text-xs font-medium px-2 py-0.5 rounded-full">
                New
              </span>
            )}
            {status === 'SAVED' && (
              <span className="inline-block bg-green-100 text-green-700 text-xs font-medium px-2 py-0.5 rounded-full">
                Sauvegardée
              </span>
            )}
            <h3 className="font-medium text-gray-900 truncate">{job.title}</h3>
          </div>

          <div className="flex items-center gap-3 text-sm text-gray-500">
            {job.company && <span>{job.company}</span>}
            {job.location && <><span>·</span><span>{job.location}</span></>}
            {job.contractType && <><span>·</span><span>{job.contractType}</span></>}
          </div>

          {job.stack.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {job.stack.slice(0, 6).map((tech) => (
                <span key={tech} className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded">
                  {tech}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="text-right shrink-0 text-xs text-gray-400 space-y-1">
          <div>{job.source.name}</div>
          <div>{timeAgo(job.createdAt)}</div>
        </div>
      </div>
    </Link>
  )
}
