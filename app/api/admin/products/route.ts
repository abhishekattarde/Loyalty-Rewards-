export const runtime = 'nodejs'

export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Role } from '@prisma/client'

async function requireAdmin(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user || (session.user as any).role !== Role.ADMIN) {
    return null
  }
  return session
}

export async function GET(req: NextRequest) {
  try {
    const session = await requireAdmin(req)
    if (!session) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ products })
  } catch (error) {
    console.error('Admin products GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAdmin(req)
    if (!session) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const { name, description, pricePoints, imageUrl } = body

    if (!name || !pricePoints || isNaN(Number(pricePoints))) {
      return NextResponse.json({ error: 'name and pricePoints are required' }, { status: 400 })
    }

    const product = await prisma.product.create({
      data: {
        name: String(name),
        description: description ? String(description) : null,
        pricePoints: Number(pricePoints),
        imageUrl: imageUrl ? String(imageUrl) : null,
      },
    })

    return NextResponse.json({ product }, { status: 201 })
  } catch (error) {
    console.error('Admin products POST error:', error)
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
    const { id, isActive } = body

    if (!id || isActive === undefined) {
      return NextResponse.json({ error: 'id and isActive are required' }, { status: 400 })
    }

    const product = await prisma.product.update({
      where: { id: String(id) },
      data: { isActive: Boolean(isActive) },
    })

    return NextResponse.json({ product })
  } catch (error) {
    console.error('Admin products PATCH error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
