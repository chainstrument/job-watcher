import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await request.json()

  const alert = await prisma.alert.update({
    where: { id },
    data: {
      ...(body.name !== undefined && { name: body.name }),
      ...(body.keywords !== undefined && { keywords: body.keywords }),
      ...(body.stack !== undefined && { stack: body.stack }),
      ...(body.location !== undefined && { location: body.location }),
      ...(body.enabled !== undefined && { enabled: body.enabled }),
    },
  })

  return NextResponse.json(alert)
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await prisma.alert.delete({ where: { id } })
  return new Response(null, { status: 204 })
}
