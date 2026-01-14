import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const userId = searchParams.get('userId') || ''
    const source = searchParams.get('source') || ''
    const date = searchParams.get('date') || ''
    const search = searchParams.get('search') || ''

    const where: Record<string, unknown> = {}

    if (userId) {
      where.userId = userId
    }

    if (source) {
      where.source = source
    }

    if (date) {
      where.date = date
    }

    if (search) {
      where.description = { contains: search, mode: 'insensitive' }
    }

    const [foodLogs, total] = await Promise.all([
      prisma.foodLog.findMany({
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
      prisma.foodLog.count({ where }),
    ])

    return NextResponse.json({
      foodLogs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching food logs:', error)
    return NextResponse.json({ error: 'Failed to fetch food logs' }, { status: 500 })
  }
}
