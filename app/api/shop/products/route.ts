import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const [products, user] = await Promise.all([
      prisma.product.findMany({
        where: { isActive: true },
        orderBy: { pricePoints: 'asc' },
      }),
      prisma.user.findUnique({
        where: { id: session.user.id },
        select: { pointsBalance: true },
      }),
    ])

    return NextResponse.json({
      products,
      userBalance: user?.pointsBalance ?? 0,
    })
  } catch (error) {
    console.error('Shop products error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
