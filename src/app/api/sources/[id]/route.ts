import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await request.json()

  const source = await prisma.source.update({
    where: { id },
    data: {
      ...(body.name !== undefined && { name: body.name }),
      ...(body.enabled !== undefined && { enabled: body.enabled }),
    },
  })
  return NextResponse.json(source)
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await prisma.collectLog.deleteMany({ where: { sourceId: id } })
  await prisma.job.deleteMany({ where: { sourceId: id } })
  await prisma.source.delete({ where: { id } })
  return new Response(null, { status: 204 })
}
