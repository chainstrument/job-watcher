import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { SourceType } from '@/generated/prisma/client'

export async function GET() {
  const sources = await prisma.source.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: { select: { jobs: true } },
      collectLogs: { orderBy: { createdAt: 'desc' }, take: 1 },
    },
  })
  return NextResponse.json(sources)
}

export async function POST(request: Request) {
  const body = await request.json()
  const { name, url, type, tags = [] } = body

  if (!name?.trim() || !url?.trim()) {
    return NextResponse.json({ error: 'name and url are required' }, { status: 400 })
  }
  if (!Object.values(SourceType).includes(type)) {
    return NextResponse.json({ error: 'invalid type' }, { status: 400 })
  }

  const source = await prisma.source.create({
    data: { name: name.trim(), url: url.trim(), type, tags },
  })
  return NextResponse.json(source, { status: 201 })
}
