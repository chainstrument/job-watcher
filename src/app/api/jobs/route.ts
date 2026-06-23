import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const page = Math.max(1, Number(searchParams.get('page') ?? 1))
  const limit = 20

  const [jobs, total] = await Promise.all([
    prisma.job.findMany({
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        source: { select: { name: true } },
        userStatus: { select: { status: true } },
      },
    }),
    prisma.job.count(),
  ])

  return NextResponse.json({ jobs, total, page, pages: Math.ceil(total / limit) })
}
