import { notFound } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { StatusButtons } from '@/components/StatusButtons'
import { NoteEditor } from '@/components/NoteEditor'

export default async function JobPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const job = await prisma.job.findUnique({
    where: { id },
    include: {
      source: { select: { name: true } },
      userStatus: true,
    },
  })

  if (!job) notFound()

  // Mark as SEEN on first visit
  if (!job.userStatus) {
    await prisma.userJobStatus.create({ data: { jobId: id, status: 'SEEN' } })
  }

  const currentStatus = job.userStatus?.status ?? 'SEEN'

  return (
    <div className="max-w-2xl">
      <Link href="/" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 mb-6">
        ← Retour aux offres
      </Link>

      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-5">
        <div>
          <p className="text-sm text-gray-500 mb-1">{job.source.name}</p>
          <h2 className="text-xl font-semibold text-gray-900">{job.title}</h2>

          <div className="flex flex-wrap gap-3 text-sm text-gray-500 mt-2">
            {job.company && <span>{job.company}</span>}
            {job.location && <><span>·</span><span>{job.location}</span></>}
            {job.contractType && <><span>·</span><span>{job.contractType}</span></>}
            {job.publishedAt && (
              <><span>·</span><span>{new Date(job.publishedAt).toLocaleDateString('fr-FR')}</span></>
            )}
          </div>
        </div>

        {job.stack.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {job.stack.map((tech) => (
              <span key={tech} className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
                {tech}
              </span>
            ))}
          </div>
        )}

        {job.description && (
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
            {job.description}
          </p>
        )}

        <a
          href={job.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-gray-900 text-white text-sm px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
        >
          Voir l&apos;offre →
        </a>

        <hr className="border-gray-100" />

        <StatusButtons jobId={job.id} initial={currentStatus} />

        <NoteEditor jobId={job.id} initial={job.userStatus?.note ?? null} />
      </div>
    </div>
  )
}
