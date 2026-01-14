import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const userId = searchParams.get('userId') || ''
    const status = searchParams.get('status') || ''

    const where: Record<string, unknown> = {}

    if (userId) {
      where.userId = userId
    }

    if (status === 'active') {
      where.expiresAt = { gt: new Date() }
    } else if (status === 'expired') {
      where.expiresAt = { lte: new Date() }
    }

    const [refreshTokens, total] = await Promise.all([
      prisma.refreshToken.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              displayName: true,
            },
          },
        },
      }),
      prisma.refreshToken.count({ where }),
    ])

    return NextResponse.json({
      refreshTokens,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching refresh tokens:', error)
    return NextResponse.json({ error: 'Failed to fetch refresh tokens' }, { status: 500 })
  }
}

// Bulk delete expired tokens
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    if (action === 'cleanup-expired') {
      const result = await prisma.refreshToken.deleteMany({
        where: {
          expiresAt: { lte: new Date() },
        },
      })

      return NextResponse.json({
        success: true,
        deleted: result.count,
      })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Error in bulk delete:', error)
    return NextResponse.json({ error: 'Failed to perform bulk delete' }, { status: 500 })
  }
}
