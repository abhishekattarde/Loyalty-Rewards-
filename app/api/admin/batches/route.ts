import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Role } from '@prisma/client'
import { generateUniqueCode, generateQrDataUrl } from '@/lib/generateQr'
import { generateQrBatchPdf } from '@/lib/generatePdf'

async function requireAdmin(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user || (session.user as any).role !== Role.ADMIN) {
    return null
  }
  return session
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAdmin(req)
    if (!session) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const { productId, quantity, pointsPerCode, greetingMsg } = body

    if (!productId || !quantity || !pointsPerCode) {
      return NextResponse.json(
        { error: 'productId, quantity, and pointsPerCode are required' },
        { status: 400 }
      )
    }

    const qty = Number(quantity)
    const pts = Number(pointsPerCode)

    if (isNaN(qty) || qty < 1 || qty > 1000) {
      return NextResponse.json({ error: 'quantity must be between 1 and 1000' }, { status: 400 })
    }

    // Verify product exists
    const product = await prisma.product.findUnique({ where: { id: productId } })
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Generate unique codes with collision prevention
    const existingCodes = new Set(
      (await prisma.qrCode.findMany({ select: { uniqueCode: true } })).map((c) => c.uniqueCode)
    )

    const newCodes: string[] = []
    let attempts = 0
    const maxAttempts = qty * 10

    while (newCodes.length < qty && attempts < maxAttempts) {
      const code = generateUniqueCode(15)
      if (!existingCodes.has(code) && !newCodes.includes(code)) {
        newCodes.push(code)
      }
      attempts++
    }

    if (newCodes.length < qty) {
      return NextResponse.json({ error: 'Failed to generate enough unique codes' }, { status: 500 })
    }

    // Save batch and codes to DB atomically
    const batch = await prisma.$transaction(async (tx) => {
      const createdBatch = await tx.qrBatch.create({
        data: {
          productId,
          pointsPerCode: pts,
          totalCodes: qty,
          greetingMsg: greetingMsg ?? 'Thanks for your purchase. Earn these points for further shopping.',
        },
      })

      await tx.qrCode.createMany({
        data: newCodes.map((code) => ({
          batchId: createdBatch.id,
          uniqueCode: code,
        })),
      })

      return createdBatch
    })

    // Generate QR data URLs
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

    const codesWithDataUrls = await Promise.all(
      newCodes.map(async (code) => ({
        uniqueCode: code,
        dataUrl: await generateQrDataUrl(code, appUrl),
      }))
    )

    // Generate PDF
    const pdfBytes = await generateQrBatchPdf({
      codes: codesWithDataUrls,
      pointsPerCode: pts,
      greetingMsg: greetingMsg ?? 'Thanks for your purchase. Earn these points for further shopping.',
      appUrl,
    })

    return new NextResponse(Buffer.from(pdfBytes) as unknown as BodyInit, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="qr-batch-${batch.id}.pdf"`,
        'Content-Length': String(pdfBytes.length),
      },
    })
  } catch (error) {
    console.error('Admin batches POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await requireAdmin(req)
    if (!session) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const batches = await prisma.qrBatch.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        product: { select: { name: true } },
        _count: { select: { codes: true } },
      },
    })

    return NextResponse.json({ batches })
  } catch (error) {
    console.error('Admin batches GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await requireAdmin(req)
    if (!session) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const { batchId, isActive } = body

    if (!batchId || isActive === undefined) {
      return NextResponse.json({ error: 'batchId and isActive are required' }, { status: 400 })
    }

    const batch = await prisma.qrBatch.update({
      where: { id: String(batchId) },
      data: { isActive: Boolean(isActive) },
    })

    return NextResponse.json({ batch })
  } catch (error) {
    console.error('Admin batches PATCH error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
