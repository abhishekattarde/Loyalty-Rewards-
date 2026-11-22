export const runtime = 'nodejs'

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

    const [totalCodes, usedCodes, totalCustomers, pointsAgg, recentScans] =
      await Promise.all([
        prisma.qrCode.count(),
        prisma.qrCode.count({ where: { isUsed: true } }),
        prisma.user.count({ where: { role: Role.CUSTOMER } }),
        prisma.pointTransaction.aggregate({
          _sum: { points: true },
          where: { type: 'EARNED' },
        }),
        prisma.qrCode.findMany({
          where: { isUsed: true },
          orderBy: { usedAt: 'desc' },
          take: 10,
          include: {
            usedBy: { select: { email: true, name: true } },
            batch: {
              include: { product: { select: { name: true } } },
            },
            transactions: {
              where: { type: 'EARNED' },
              select: { points: true },
              take: 1,
            },
          },
        }),
      ])

    const formatted = recentScans.map((code) => ({
      id: code.id,
      uniqueCode: code.uniqueCode,
      usedAt: code.usedAt?.toISOString(),
      pointsEarned: code.transactions[0]?.points ?? code.batch.pointsPerCode,
      user: code.usedBy ?? { email: 'Unknown', name: null },
      batch: code.batch,
    }))

    return NextResponse.json({
      totalCodes,
      usedCodes,
      totalCustomers,
      totalPointsIssued: pointsAgg._sum.points ?? 0,
      recentScans: formatted,
    })
  } catch (error) {
    console.error('Stats error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
