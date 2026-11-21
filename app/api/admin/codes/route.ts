import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Role } from '@prisma/client'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || (session.user as any).role !== Role.ADMIN) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const batchId = searchParams.get('batchId')
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') ?? '25')))
    const skip = (page - 1) * limit

    const where = batchId ? { batchId } : {}

    const [codes, total] = await Promise.all([
      prisma.qrCode.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          usedBy: { select: { email: true, name: true } },
          batch: {
            include: {
              product: { select: { name: true } },
            },
          },
        },
      }),
      prisma.qrCode.count({ where }),
    ])

    return NextResponse.json({ codes, total, page, limit })
  } catch (error) {
    console.error('Admin codes GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
