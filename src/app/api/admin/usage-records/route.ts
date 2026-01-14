import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const userId = searchParams.get('userId') || ''
    const date = searchParams.get('date') || ''

    const where: Record<string, unknown> = {}

    if (userId) {
      where.userId = userId
    }

    if (date) {
      where.date = date
    }

    const [usageRecords, total] = await Promise.all([
      prisma.usageRecord.findMany({
        where,
        orderBy: { date: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              displayName: true,
              subscriptionTier: true,
            },
          },
        },
      }),
      prisma.usageRecord.count({ where }),
    ])

    return NextResponse.json({
      usageRecords,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching usage records:', error)
    return NextResponse.json({ error: 'Failed to fetch usage records' }, { status: 500 })
  }
}
