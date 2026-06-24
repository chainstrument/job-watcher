import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { JobStatus } from '@/generated/prisma/client'

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await request.json()

  const status: JobStatus | undefined = body.status
  const note: string | undefined = body.note

  if (status && !Object.values(JobStatus).includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
  }

  const updated = await prisma.userJobStatus.upsert({
    where: { jobId: id },
    create: { jobId: id, status: status ?? 'SEEN', note },
    update: { ...(status && { status }), ...(note !== undefined && { note }) },
  })

  return NextResponse.json(updated)
}
