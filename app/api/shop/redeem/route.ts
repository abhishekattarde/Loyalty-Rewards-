import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { TransactionType } from '@prisma/client'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { productId } = body

    if (!productId) {
      return NextResponse.json({ error: 'productId is required' }, { status: 400 })
    }

    const [product, user] = await Promise.all([
      prisma.product.findUnique({ where: { id: productId } }),
      prisma.user.findUnique({ where: { id: session.user.id } }),
    ])

    if (!product || !product.isActive) {
      return NextResponse.json({ error: 'Product not found or inactive' }, { status: 404 })
    }

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (user.pointsBalance < product.pricePoints) {
      return NextResponse.json(
        { error: 'Insufficient points', required: product.pricePoints, balance: user.pointsBalance },
        { status: 400 }
      )
    }

    const updatedUser = await prisma.$transaction(async (tx) => {
      const updated = await tx.user.update({
        where: { id: session.user.id },
        data: { pointsBalance: { decrement: product.pricePoints } },
      })

      await tx.pointTransaction.create({
        data: {
          userId: session.user.id,
          points: product.pricePoints,
          type: TransactionType.REDEEMED,
          note: `Redeemed: ${product.name}`,
        },
      })

      return updated
    })

    return NextResponse.json({
      success: true,
      newBalance: updatedUser.pointsBalance,
      product: { name: product.name, pricePoints: product.pricePoints },
    })
  } catch (error) {
    console.error('Redeem error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
