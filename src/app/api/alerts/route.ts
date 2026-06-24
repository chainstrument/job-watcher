import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const alerts = await prisma.alert.findMany({ orderBy: { createdAt: 'desc' } })
  return NextResponse.json(alerts)
}

export async function POST(request: Request) {
  const body = await request.json()
  const { name, keywords = [], stack = [], location } = body

  if (!name?.trim()) {
    return NextResponse.json({ error: 'name is required' }, { status: 400 })
  }

  const alert = await prisma.alert.create({
    data: { name: name.trim(), keywords, stack, location: location ?? null },
  })

  return NextResponse.json(alert, { status: 201 })
}
