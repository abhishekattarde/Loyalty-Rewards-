import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { TransactionType } from '@prisma/client'

export async function POST(
  req: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { code } = params

    // Find the QR code with its batch
    const qrCode = await prisma.qrCode.findUnique({
      where: { uniqueCode: code },
      include: {
        batch: {
          include: { product: true },
        },
        usedBy: true,
      },
    })

    if (!qrCode) {
      return NextResponse.json({ error: 'not_found' }, { status: 404 })
    }

    // Check if batch is active
    if (!qrCode.batch.isActive) {
      return NextResponse.json({ error: 'batch_deactivated' }, { status: 403 })
    }

    // Check if already used
    if (qrCode.isUsed) {
      const usedByYou = qrCode.usedById === session.user.id
      return NextResponse.json(
        {
          error: 'already_used',
          usedByYou,
          usedAt: qrCode.usedAt?.toISOString(),
        },
        { status: 409 }
      )
    }

    // Atomically mark code as used and add points
    const pointsToAdd = qrCode.batch.pointsPerCode

    const [, updatedUser] = await prisma.$transaction([
      prisma.qrCode.update({
        where: { id: qrCode.id },
        data: {
          isUsed: true,
          usedById: session.user.id,
          usedAt: new Date(),
        },
      }),
      prisma.user.update({
        where: { id: session.user.id },
        data: {
          pointsBalance: { increment: pointsToAdd },
        },
      }),
      prisma.pointTransaction.create({
        data: {
          userId: session.user.id,
          qrCodeId: qrCode.id,
          points: pointsToAdd,
          type: TransactionType.EARNED,
          note: `Scanned code from ${qrCode.batch.product.name}`,
        },
      }),
    ])

    return NextResponse.json({
      success: true,
      pointsEarned: pointsToAdd,
      newBalance: updatedUser.pointsBalance,
    })
  } catch (error) {
    console.error('Scan error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
